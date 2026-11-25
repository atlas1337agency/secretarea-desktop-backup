import { useEffect, useState } from 'react';
import {
  CheckCircle,
  Key,
  LockKey,
  ShieldCheck,
  Trash,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import {
  getDealsCredentialStatus,
  getDesktopDealsBridge,
  removeDealsProviderCredential,
  saveDealsProviderCredential,
} from '../../deals/httpClient';
import type {
  DealsCredentialsStatus,
  OptionalCredentialProviderId,
} from '../../deals/types';
import type { AppThemeMode } from '../../services/launcherSettings';

interface ApiCredentialsModalProps {
  isOpen: boolean;
  activeTheme: AppThemeMode;
  labels: {
    apiKeysTitle: string;
    apiKeysSubtitle: string;
    apiKeysFreeLabel: string;
    apiKeysOptionalLabel: string;
    apiKeysSaveBtn: string;
    apiKeysClearBtn: string;
    apiKeysConfiguredBadge: string;
    apiKeysNotSetBadge: string;
    apiKeysSafeStorageNote: string;
    detailCloseBtn: string;
  };
  onClose: () => void;
  onCredentialsChanged: () => void;
}

const OPTIONAL_PROVIDER_DOCS: Array<{
  id: OptionalCredentialProviderId;
  title: string;
  tierNote: string;
  signupUrl: string;
  placeholder: string;
}> = [
  {
    id: 'steam_index',
    title: 'Steam Index API (steamidx.com)',
    tierNote: 'Free tier: 1,440 requests/day · Unlocks deep Steam price history & achievement labels',
    signupUrl: 'https://steamidx.com/api-docs',
    placeholder: 'sidx_...',
  },
  {
    id: 'metacritic_apish',
    title: 'API.SH Metacritic API (api.sh)',
    tierNote: 'Free tier: 1,000 credits/month · Unlocks full Metacritic Metascore & User Score cards',
    signupUrl: 'https://api.sh/metacritic-api',
    placeholder: 'x-api-key...',
  },
  {
    id: 'opencritic_rapidapi',
    title: 'OpenCritic API (RapidAPI)',
    tierNote: 'Requires RapidAPI subscription key · Unlocks OpenCritic Top Critic & Recommend %',
    signupUrl: 'https://rapidapi.com/opencritic-opencritic-default/api/opencritic-api',
    placeholder: 'RapidAPI X-RapidAPI-Key...',
  },
];

const FREE_ACTIVE_APIS = [
  'Steam Web API (Live Concurrent Charts, Global Achievements, Steam News & AppDetails)',
  'SteamData (api.steamdata.dev — Top 100 Live Counts, 24h Movers, History & Update Impact)',
  'The Game Census (thegamecensus.com — Game Health Tiers, 400-day CCU & Review Velocity · CC BY 4.0)',
  'CheapShark (PC Store Price Comparisons, Discounts & All-Time Low)',
  'GamerPower · Epic Games Store · FreeToGame (Free Games, Giveaways & DLC)',
  'ExchangeRate-API & Frankfurter FX (Live Multi-Currency Conversion)',
];

export function ApiCredentialsModal({
  isOpen,
  activeTheme,
  labels,
  onClose,
  onCredentialsChanged,
}: ApiCredentialsModalProps) {
  const [status, setStatus] = useState<DealsCredentialsStatus | null>(null);
  const [inputs, setInputs] = useState<Record<OptionalCredentialProviderId, string>>({
    steam_index: '',
    metacritic_apish: '',
    opencritic_rapidapi: '',
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<OptionalCredentialProviderId | null>(null);

  const isElectron = Boolean(getDesktopDealsBridge());
  const isXbox = activeTheme === 'xbox';
  const isPs5 = activeTheme === 'ps5';

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    void getDealsCredentialStatus().then(setStatus);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (providerId: OptionalCredentialProviderId) => {
    const val = inputs[providerId].trim();
    if (!val) return;
    setBusyId(providerId);
    setFeedback(null);
    try {
      const res = await saveDealsProviderCredential(providerId, val);
      if (res.status) setStatus(res.status);
      if (!res.ok) {
        setFeedback(res.error || 'Could not save credential.');
      } else {
        setInputs((prev) => ({ ...prev, [providerId]: '' }));
        setFeedback(res.warning || 'Credential encrypted and stored cleanly.');
        onCredentialsChanged();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async (providerId: OptionalCredentialProviderId) => {
    setBusyId(providerId);
    setFeedback(null);
    try {
      const res = await removeDealsProviderCredential(providerId);
      if (res.status) setStatus(res.status);
      onCredentialsChanged();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`sa-ps5-panel w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isXbox
            ? 'bg-[#081a0b] border-[#52e042]/35 text-white'
            : isPs5
            ? 'bg-[#061533] border-white/[0.16] text-white'
            : 'bg-white dark:bg-[#151c25] border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white'
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-sky-500" />
              <h2 className="font-display text-lg font-bold">{labels.apiKeysTitle}</h2>
            </div>
            <p className="text-[12.5px] text-slate-600 dark:text-[#9cb0c9]">
              {labels.apiKeysSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.detailCloseBtn}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] cursor-pointer"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Active Free Public APIs */}
          <div className="space-y-2">
            <div className="text-[12.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#4ade80]">
              {labels.apiKeysFreeLabel}
            </div>
            <ul className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5 text-[12px] text-slate-700 dark:text-[#c7d7eb]">
              {FREE_ACTIVE_APIS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Note */}
          <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-3 flex items-start gap-2.5 text-[12px] text-slate-700 dark:text-[#b9d6f4]">
            <ShieldCheck weight="fill" className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold">{labels.apiKeysSafeStorageNote}</div>
              {!isElectron && (
                <div className="text-amber-600 dark:text-amber-300">
                  Browser preview mode detected — run SecretArea Desktop (Electron) to encrypt and persist optional API keys in your OS Keychain.
                </div>
              )}
            </div>
          </div>

          {feedback && (
            <div className="rounded-lg border border-slate-200 dark:border-white/[0.12] bg-slate-100 dark:bg-white/[0.05] px-3 py-2 text-[12px] flex items-center gap-2">
              <WarningCircle className="w-4 h-4 text-sky-500 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Optional Authenticated APIs */}
          <div className="space-y-3">
            <div className="text-[12.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8b9bb4]">
              {labels.apiKeysOptionalLabel}
            </div>

            {OPTIONAL_PROVIDER_DOCS.map((spec) => {
              const entry = status?.providers?.[spec.id];
              const configured = Boolean(entry?.configured);
              return (
                <div
                  key={spec.id}
                  className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#10161e] p-3.5 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[13.5px] font-bold">{spec.title}</div>
                      <div className="text-[11.5px] text-slate-500 dark:text-[#8b9bb4]">
                        {spec.tierNote}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${
                        configured
                          ? 'text-emerald-600 dark:text-[#4ade80]'
                          : 'text-slate-500 dark:text-[#8b9bb4]'
                      }`}
                    >
                      <LockKey className="w-3.5 h-3.5" />
                      {configured
                        ? `${labels.apiKeysConfiguredBadge} (${entry?.maskedPreview || '••••'})`
                        : labels.apiKeysNotSetBadge}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="password"
                      value={inputs[spec.id]}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [spec.id]: e.target.value }))
                      }
                      disabled={!isElectron || busyId === spec.id}
                      placeholder={spec.placeholder}
                      className="flex-1 min-h-[36px] px-3 rounded-lg border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161e29] text-[12.5px] font-mono-tabular focus:outline-none focus:ring-2 focus:ring-[#0284c7]"
                    />
                    <button
                      type="button"
                      disabled={!isElectron || !inputs[spec.id].trim() || busyId === spec.id}
                      onClick={() => void handleSave(spec.id)}
                      className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[12px] font-semibold text-white whitespace-nowrap cursor-pointer disabled:opacity-45 ${
                        isXbox
                          ? 'bg-[#107C10] hover:bg-[#159315]'
                          : 'bg-[#0284c7] hover:bg-[#0369a1] dark:bg-[#1a9fff] dark:hover:bg-[#38adff]'
                      }`}
                    >
                      {labels.apiKeysSaveBtn}
                    </button>
                    {configured && (
                      <button
                        type="button"
                        disabled={!isElectron || busyId === spec.id}
                        onClick={() => void handleClear(spec.id)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg border border-rose-500/35 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[12px] font-semibold whitespace-nowrap cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        <span>{labels.apiKeysClearBtn}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
