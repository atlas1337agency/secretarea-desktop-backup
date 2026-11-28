import { useEffect, useState } from 'react';
import {
  ArrowSquareOut,
  CheckCircle,
  Clock,
  Handshake,
  PaperPlaneRight,
  ShieldCheck,
  Tray,
  UsersThree,
} from '@phosphor-icons/react';
import type { ItemRequestPayload } from '../types';
import {
  fetchRequestsFromGas,
  loadLocalRequests,
  submitItemRequest,
} from '../services/sheetsApi';
import type { AppLanguage, AppThemeMode } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface RequestsViewProps {
  gasUrl: string;
  language?: AppLanguage;
  activeTheme?: AppThemeMode;
  lightMode?: boolean;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const REQUEST_CATEGORIES = [
  'PC Game',
  'Update / DLC',
  'Online Fix / Multiplayer',
  'Emulator / Tool',
  'Broken Link Report',
];

const TROCADOR_DONATION_BASE =
  'https://trocador.app/anonpay/?ticker_to=xmr&network_to=Mainnet&address=48UqVGkdrErEXVUKWZ9dCkRFxG4qFyzorS2h77K96nG8fdHShgv95k4cPPYWGMoM267PdajjEoLUwG1kyvgSd8vX8VK8RkS&donation=True&simple_mode=False&name=SecretArea&description=Support+our+mission+and+help+us+grow.+Every+contribution+makes+a+difference.&email=secretarea1337@gmail.com&direct=True';

function buildTrocadorDonationUrl(activeTheme: AppThemeMode, lightMode: boolean): string {
  if (activeTheme === 'ps5') {
    return `${TROCADOR_DONATION_BASE}&bgcolor=020e2aff&buttonbgcolor=0284c7`;
  }
  if (activeTheme === 'xbox') {
    return `${TROCADOR_DONATION_BASE}&bgcolor=061409ff&buttonbgcolor=107c10`;
  }
  if (lightMode) {
    return `${TROCADOR_DONATION_BASE}&bgcolor=f8fafcff&buttonbgcolor=0284c7`;
  }
  return `${TROCADOR_DONATION_BASE}&bgcolor=0e141dff&buttonbgcolor=1a9fff`;
}

const TELEGRAM_URL = 'https://t.me/secretarea1337';
const DISCORD_URL = 'https://discord.com/invite/pygmDWFAHK';

export function RequestsView({
  gasUrl,
  language = 'en',
  activeTheme = 'default',
  lightMode = false,
  onNotify,
}: RequestsViewProps) {
  const tr = getTranslations(language);
  const t = tr.requests;
  const trocadorUrl = buildTrocadorDonationUrl(activeTheme, lightMode);
  const isLightSurface = activeTheme === 'default' && lightMode;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(REQUEST_CATEGORIES[0]);
  const [image, setImage] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [requests, setRequests] = useState<ItemRequestPayload[]>(() => loadLocalRequests());

  useEffect(() => {
    let cancelled = false;
    void fetchRequestsFromGas(gasUrl).then((loaded) => {
      if (!cancelled) {
        setRequests(loaded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [gasUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusNotice(null);

    try {
      const result = await submitItemRequest(
        {
          title: title.trim(),
          category,
          image: image.trim() || undefined,
          message: message.trim(),
        },
        gasUrl
      );

      setRequests(result.requests);
      setTitle('');
      setImage('');
      setMessage('');

      const notice = result.syncedToSheet ? t.syncedNotice : t.localNotice;
      setStatusNotice(notice);
      onNotify(
        result.syncedToSheet ? t.syncedNotice : t.localNotice,
        'success'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-[#f4f6f9] to-slate-100 dark:from-[#1d2633] dark:via-[#171d26] dark:to-[#12161d]">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-7">
        {/* Page Heading */}
        <div className="sa-section-header flex items-center gap-3">
          <span className="sa-icon-badge w-7 h-7 flex items-center justify-center shrink-0">
            <PaperPlaneRight className="w-4 h-4 shrink-0" />
          </span>
          <h1 className="font-display text-[15px] font-bold tracking-[0.08em] uppercase text-slate-900 dark:text-[#e5e9f0] shrink-0">
            {t.pageTitle}
          </h1>
          <div className="sa-section-line flex-1" />
        </div>

        {/* Request Form + Recent Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6">
          {/* Submission Form */}
          <form
            onSubmit={handleSubmit}
            className="sa-ps5-panel lg:col-span-3 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm dark:shadow-lg"
          >
            <div className="space-y-1">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">{t.formTitle}</h2>
              <p className="text-[12.5px] text-slate-500 dark:text-[#8b9bb4]">{t.formSubtitle}</p>
            </div>

            {statusNotice && (
              <div
                role="status"
                className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-400/40 dark:text-emerald-200 flex items-start gap-2.5 text-[12.5px] font-medium"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{statusNotice}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="req-title"
                className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-600 dark:text-[#8b9bb4]"
              >
                {t.titleLabel}
              </label>
              <input
                id="req-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="sa-search-input w-full px-3 py-2 border text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#566376] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="req-category"
                  className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-600 dark:text-[#8b9bb4]"
                >
                  {t.categoryLabel}
                </label>
                <select
                  id="req-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="sa-search-input w-full px-3 py-2 border text-[13px] text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {REQUEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-slate-900 dark:bg-[#0e1319] dark:text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="req-image"
                  className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-600 dark:text-[#8b9bb4]"
                >
                  {t.coverUrlLabel}
                </label>
                <input
                  id="req-image"
                  type="url"
                  dir="ltr"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="sa-search-input w-full px-3 py-2 border text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#566376] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="req-message"
                className="block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-600 dark:text-[#8b9bb4]"
              >
                {t.detailsLabel}
              </label>
              <textarea
                id="req-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.detailsPlaceholder}
                className="sa-search-input w-full px-3 py-2 border text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#566376] focus:outline-none"
              />
            </div>

            <div className="pt-1 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim()}
                className="sa-btn-primary inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50 text-[13px] font-semibold cursor-pointer"
              >
                <PaperPlaneRight className="w-3.5 h-3.5" />
                <span>{isSubmitting ? t.sending : t.submitRequest}</span>
              </button>
            </div>
          </form>

          {/* Submitted History */}
          <div className="sa-ps5-panel lg:col-span-2 p-4 sm:p-5 rounded-xl bg-white dark:bg-[#171d25] border border-slate-200 dark:border-white/[0.08] flex flex-col max-h-[540px] shadow-sm dark:shadow-lg">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/[0.06]">
              <h2 className="text-[13px] font-bold tracking-[0.06em] uppercase text-slate-900 dark:text-[#e5e9f0]">
                {t.recentRequests}{' '}
                <span className="text-slate-500 dark:text-[#8b9bb4] font-mono-tabular">({requests.length})</span>
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5">
              {requests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-[#677487] space-y-2">
                  <Tray className="w-7 h-7 mx-auto opacity-60" />
                  <p className="text-[12.5px]">{t.noRequestsYet}</p>
                </div>
              ) : (
                requests.map((req, idx) => (
                  <div
                    key={req.id || idx}
                    className="sa-ps5-subpanel p-3 rounded bg-slate-50 dark:bg-[#12171f] border border-slate-200 dark:border-white/[0.06] flex items-start gap-3"
                  >
                    {req.image && (
                      <img
                        src={req.image}
                        alt={req.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 object-cover rounded-[2px] shrink-0 bg-slate-200 dark:bg-[#0b0e14]"
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                          {req.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#0284c7] dark:text-[#66c0f4]">
                        <span>{req.category}</span>
                        {req.timestamp && (
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-[#6b788b] font-mono-tabular">
                            · <Clock className="w-3 h-3" />
                            {new Date(req.timestamp).toLocaleDateString(tr.locale)}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-600 dark:text-[#aeb9c7] line-clamp-2">{req.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Community & Support Us Section */}
        <section aria-label={t.communitySupportTitle} className="space-y-4">
          <div className="sa-section-header flex items-center gap-3">
            <h2 className="font-display text-[14px] font-bold tracking-[0.08em] uppercase text-slate-900 dark:text-[#e5e9f0] shrink-0">
              {t.communitySupportTitle}
            </h2>
            <div className="sa-section-line flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Community Links: Telegram & Discord */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="sa-ps5-panel p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100/80 dark:from-[#17202c] dark:via-[#141b25] dark:to-[#11161f] border border-slate-200 dark:border-white/[0.08] space-y-4 flex-1 flex flex-col justify-between shadow-sm dark:shadow-lg">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#0284c7] dark:text-[#66c0f4]">
                    <UsersThree className="w-4 h-4" />
                    <span>{t.joinCommunityTitle}</span>
                  </div>
                  <p className="text-[12.5px] text-slate-600 dark:text-[#9fb0c7] leading-relaxed">
                    {t.joinCommunityDesc}
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Telegram Community Card */}
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sa-ps5-community-card sa-ps5-community-tg group flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl bg-sky-50 hover:bg-sky-100 border border-[#24a1de]/40 hover:border-[#24a1de]/75 dark:bg-[#0e1926] dark:hover:bg-[#122234] dark:border-[#24a1de]/35 dark:hover:border-[#24a1de]/75 transition-all duration-200 hover:-translate-y-0.5 shadow-sm dark:shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-11 h-11 rounded-xl bg-[#24a1de]/15 border border-[#24a1de]/45 text-[#0284c7] dark:bg-[#24a1de]/20 dark:text-[#38bdf8] group-hover:bg-[#24a1de] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="w-5 h-5 -translate-x-[1px]"
                        >
                          <path d="M21.93 3.29a1.5 1.5 0 0 0-1.56-.21L2.74 10.1a1.45 1.45 0 0 0 .08 2.71l4.41 1.48 1.66 5.26a1.15 1.15 0 0 0 1.91.47l2.54-2.5 4.4 3.24a1.45 1.45 0 0 0 2.27-.87l3.01-14.92a1.5 1.5 0 0 0-.09-1.68ZM9.65 13.79l8.22-6.66-6.37 7.6-.47 3.1-1.38-4.04Z" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#0284c7] dark:text-[#7dd3fc]">
                          {t.telegramLabel}
                        </div>
                        <div dir="ltr" className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white truncate">
                          t.me/secretarea1337
                        </div>
                        <div className="text-[11.5px] text-slate-600 dark:text-[#8b9bb4] truncate">
                          {t.telegramSub}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#24a1de]/15 text-[#0284c7] dark:text-[#38bdf8] group-hover:bg-[#24a1de] group-hover:text-white text-[11.5px] font-semibold shrink-0 transition-colors">
                      <span className="hidden sm:inline">{t.joinBtn}</span>
                      <ArrowSquareOut className="w-3.5 h-3.5" />
                    </span>
                  </a>

                  {/* Discord Community Card */}
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sa-ps5-community-card sa-ps5-community-discord group flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-[#5865F2]/35 hover:border-[#5865F2]/80 dark:bg-[#13162b] dark:hover:bg-[#191d38] dark:border-[#5865F2]/35 dark:hover:border-[#5865F2]/80 transition-all duration-200 hover:-translate-y-0.5 shadow-sm dark:shadow-md"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-11 h-11 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/45 text-[#4f46e5] dark:bg-[#5865F2]/20 dark:text-[#818cf8] group-hover:bg-[#5865F2] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="w-5 h-5"
                        >
                          <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.62-1.26.08.08 0 0 0-.08-.04A19.74 19.74 0 0 0 3.67 4.37a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.29a.08.08 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.08.08 0 0 1 .08.01c.12.1.24.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.11c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03 19.83 19.83 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4f46e5] dark:text-[#a5b4fc]">
                          {t.discordLabel}
                        </div>
                        <div className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white truncate">
                          SecretArea Server
                        </div>
                        <div className="text-[11.5px] text-slate-600 dark:text-[#8b9bb4] truncate">
                          {t.discordSub}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#5865F2]/15 text-[#4f46e5] dark:bg-[#5865F2]/20 dark:text-[#a5b4fc] group-hover:bg-[#5865F2] group-hover:text-white text-[11.5px] font-semibold shrink-0 transition-colors">
                      <span className="hidden sm:inline">{t.joinBtn}</span>
                      <ArrowSquareOut className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Support Us Card with Trocador AnonPay XMR Donation Widget */}
            <div className="sa-ps5-panel lg:col-span-7 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white via-slate-50 to-slate-100/80 dark:from-[#171f2b] dark:via-[#131922] dark:to-[#0f131b] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
              <div className="flex-1 min-w-0 space-y-3.5 text-center sm:text-start">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 dark:bg-amber-500/15 dark:border-amber-400/35 dark:text-amber-300 text-[11px] font-bold uppercase tracking-[0.07em]">
                  <Handshake className="w-3.5 h-3.5" />
                  <span>{t.supportBadge}</span>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.supportHeadline}
                </h3>

                <p className="text-[12.5px] sm:text-[13px] text-slate-600 dark:text-[#aeb9c7] leading-relaxed">
                  {t.supportDesc}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11.5px] text-slate-600 dark:text-[#8b9bb4]">
                  <span className="sa-ps5-subpanel inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 dark:bg-[#0e131b] dark:border-white/[0.07] dark:text-[#c6d4df]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.anonMonero}</span>
                  </span>
                  <a
                    href={trocadorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sa-link inline-flex items-center gap-1 font-medium underline underline-offset-4 transition-colors"
                  >
                    <span>{t.openInBrowser}</span>
                    <ArrowSquareOut className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Embedded Trocador AnonPay Iframe */}
              <div
                className={`sa-ps5-subpanel shrink-0 w-full max-w-[310px] rounded-xl border p-1.5 flex items-center justify-center overflow-hidden transition-colors ${
                  isLightSurface
                    ? 'bg-[#f8fafc] border-slate-200 shadow-sm'
                    : 'bg-[#0e141d] border-white/[0.1] shadow-2xl'
                }`}
              >
                <iframe
                  key={trocadorUrl}
                  src={trocadorUrl}
                  title="Support SecretArea via Trocador AnonPay"
                  width="310"
                  height="350"
                  scrolling="no"
                  className="border-0 w-[310px] max-w-full h-[350px] block rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
