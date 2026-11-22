import { useEffect, useState } from 'react';
import {
  Clock,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { AppLanguage, AppThemeMode } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface TopUtilityBarProps {
  activeTheme: AppThemeMode;
  soundEnabled: boolean;
  isFullscreen: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  desktopVersion?: string | null;
  updateBadgeStatus?: 'none' | 'checking' | 'available' | 'downloading' | 'downloaded';
  onOpenUpdates?: () => void;
  language?: AppLanguage;
}

export function TopUtilityBar({
  activeTheme,
  soundEnabled,
  isFullscreen,
  onToggleSound,
  onToggleFullscreen,
  desktopVersion = null,
  updateBadgeStatus = 'none',
  onOpenUpdates,
  language = 'en',
}: TopUtilityBarProps) {
  const [now, setNow] = useState<Date>(() => new Date());
  const t = getTranslations(language);

  const isPs5Theme = activeTheme === 'ps5';
  const isXboxTheme = activeTheme === 'xbox';
  const hasConsoleAudio = isPs5Theme || isXboxTheme;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString(t.locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString(t.locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={`sa-topbar relative z-30 h-9 shrink-0 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 text-[11.5px] select-none border-b transition-colors duration-200 ${
        isPs5Theme
          ? 'bg-[#020f2b]/85 border-white/[0.12] text-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,6,20,0.45)]'
          : isXboxTheme
          ? 'bg-[#071509]/88 border-[#52e042]/22 text-[#e8f8ea] backdrop-blur-md shadow-[0_4px_20px_rgba(2,14,4,0.5)]'
          : 'bg-[#101318] border-white/[0.06] text-[#9fb0c7]'
      }`}
    >
      {/* Left Zone: Live Date & Time */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 font-mono-tabular">
        <Clock
          className={`w-3.5 h-3.5 shrink-0 ${
            isPs5Theme
              ? 'text-[#7cc4ff]'
              : isXboxTheme
              ? 'text-[#6ee755]'
              : 'text-[#66c0f4]'
          }`}
        />
        <span
          className={`hidden sm:inline truncate ${
            isPs5Theme
              ? 'text-white/75 font-light'
              : isXboxTheme
              ? 'text-[#b7dab9] font-normal'
              : 'text-[#b8c7dc]'
          }`}
        >
          {formattedDate}
        </span>
        <span className="hidden sm:inline text-white/25" aria-hidden="true">
          ·
        </span>
        <span
          className={`whitespace-nowrap ${
            isPs5Theme
              ? 'text-white font-light tracking-wider text-[12.5px]'
              : isXboxTheme
              ? 'text-white font-semibold tracking-wider text-[12px]'
              : 'text-white/90 font-medium'
          }`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Center Zone: Clickable SecretArea Web Version Link */}
      <div className="flex items-center justify-center shrink-0">
        <a
          href="https://www.secretarea.site"
          target="_blank"
          rel="noopener noreferrer"
          title="Open https://www.secretarea.site"
          className={`inline-flex items-center gap-1.5 font-semibold tracking-[0.02em] whitespace-nowrap transition-colors ${
            isPs5Theme
              ? 'text-white/90 hover:text-white drop-shadow-[0_1px_6px_rgba(0,118,255,0.45)]'
              : isXboxTheme
              ? 'text-[#dcfce0] hover:text-[#6ee755] drop-shadow-[0_1px_6px_rgba(82,224,66,0.35)]'
              : 'text-[#d4e2f4] hover:text-[#1a9fff]'
          }`}
        >
          <span>{t.topbar.webVersion}</span>
          <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
        </a>
      </div>

      {/* Right Zone: Desktop Version / Updates + Sound + Fullscreen Icon */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 min-w-0">
        {desktopVersion && onOpenUpdates && (
          <button
            type="button"
            onClick={onOpenUpdates}
            title={t.topbar.updatesTitle}
            aria-label={t.topbar.updatesTitle}
            className={`relative inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold font-mono-tabular transition-all cursor-pointer shrink-0 ${
              isPs5Theme
                ? 'rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white/90 border border-white/[0.16]'
                : isXboxTheme
                ? 'rounded-md bg-[#122b15] hover:bg-[#183b1c] text-[#e7fce9] border border-[#52e042]/30 hover:border-[#6ee755]/75'
                : 'bg-[#1a222d] hover:bg-[#243040] text-[#c7d5e8] hover:text-white border border-white/[0.08]'
            }`}
          >
            {updateBadgeStatus === 'checking' || updateBadgeStatus === 'downloading' ? (
              <Loader2
                className={`w-3 h-3 animate-spin shrink-0 ${
                  isXboxTheme ? 'text-[#6ee755]' : 'text-[#66c0f4]'
                }`}
              />
            ) : updateBadgeStatus === 'available' || updateBadgeStatus === 'downloaded' ? (
              <Download
                className={`w-3 h-3 shrink-0 ${
                  updateBadgeStatus === 'downloaded'
                    ? 'text-[#34d399]'
                    : isXboxTheme
                    ? 'text-[#6ee755]'
                    : 'text-[#66c0f4]'
                }`}
              />
            ) : null}
            <span dir="ltr">v{desktopVersion}</span>
            {(updateBadgeStatus === 'available' || updateBadgeStatus === 'downloaded') && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  updateBadgeStatus === 'downloaded'
                    ? 'bg-[#34d399]'
                    : isXboxTheme
                    ? 'bg-[#6ee755]'
                    : 'bg-[#1a9fff]'
                }`}
              />
            )}
          </button>
        )}

        {hasConsoleAudio && (
          <button
            type="button"
            onClick={onToggleSound}
            title={
              isXboxTheme
                ? soundEnabled
                  ? t.topbar.muteXboxSounds
                  : t.topbar.enableXboxSounds
                : soundEnabled
                ? t.topbar.muteSounds
                : t.topbar.enableSounds
            }
            aria-label={
              isXboxTheme
                ? soundEnabled
                  ? t.topbar.muteXboxSounds
                  : t.topbar.enableXboxSounds
                : soundEnabled
                ? t.topbar.muteSounds
                : t.topbar.enableSounds
            }
            className={`inline-flex items-center gap-1.5 px-2 py-1 transition-all cursor-pointer shrink-0 border ${
              isXboxTheme
                ? 'rounded-md bg-[#112914] hover:bg-[#193d1d] text-[#e8fcef] border-[#52e042]/35 hover:border-[#6ee755]/80'
                : 'rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white/90 hover:text-white border-white/[0.18]'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    isXboxTheme ? 'text-[#6ee755]' : 'text-[#7cc4ff]'
                  }`}
                />
                <span className="inline-flex items-end gap-[2px] h-2.5" aria-hidden="true">
                  <span
                    className={`w-[2px] h-full rounded-full sa-ps5-eq-bar-1 ${
                      isXboxTheme ? 'bg-[#6ee755]' : 'bg-[#7cc4ff]'
                    }`}
                  />
                  <span className="w-[2px] h-full rounded-full bg-white sa-ps5-eq-bar-2" />
                  <span
                    className={`w-[2px] h-full rounded-full sa-ps5-eq-bar-3 ${
                      isXboxTheme ? 'bg-[#6ee755]' : 'bg-[#7cc4ff]'
                    }`}
                  />
                </span>
              </>
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-65" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? t.topbar.exitFullscreen : t.topbar.enterFullscreen}
          aria-label={isFullscreen ? t.topbar.exitFullscreen : t.topbar.enterFullscreen}
          className={`p-1.5 rounded transition-all cursor-pointer shrink-0 ${
            isPs5Theme
              ? 'rounded-full bg-white/[0.12] hover:bg-white/[0.24] text-white ring-1 ring-white/40 hover:ring-white/80 shadow-[0_0_14px_rgba(0,118,255,0.4)]'
              : isXboxTheme
              ? 'rounded-md bg-[#122b15] hover:bg-[#183c1d] text-[#e7fce9] border border-[#52e042]/40 hover:border-[#6ee755] shadow-[0_0_12px_rgba(82,224,66,0.22)]'
              : 'bg-[#1a222d] hover:bg-[#243040] text-[#c7d5e8] hover:text-white border border-white/[0.08]'
          }`}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
