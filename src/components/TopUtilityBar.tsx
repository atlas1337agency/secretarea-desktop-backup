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

interface TopUtilityBarProps {
  isPs5Theme: boolean;
  soundEnabled: boolean;
  isFullscreen: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  desktopVersion?: string | null;
  updateBadgeStatus?: 'none' | 'checking' | 'available' | 'downloading' | 'downloaded';
  onOpenUpdates?: () => void;
}

export function TopUtilityBar({
  isPs5Theme,
  soundEnabled,
  isFullscreen,
  onToggleSound,
  onToggleFullscreen,
  desktopVersion = null,
  updateBadgeStatus = 'none',
  onOpenUpdates,
}: TopUtilityBarProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={`sa-topbar h-9 shrink-0 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 text-[11.5px] select-none border-b transition-colors duration-200 ${
        isPs5Theme
          ? 'bg-[#020d24]/60 border-white/[0.08] text-white/85 backdrop-blur-xl'
          : 'bg-[#101318] border-white/[0.06] text-[#9fb0c7]'
      }`}
    >
      {/* Left Zone: Live Date & Time */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1 font-mono-tabular">
        <Clock
          className={`w-3.5 h-3.5 shrink-0 ${
            isPs5Theme ? 'text-[#7cc4ff]' : 'text-[#66c0f4]'
          }`}
        />
        <span
          className={`hidden sm:inline truncate ${
            isPs5Theme ? 'text-white/75 font-light' : 'text-[#b8c7dc]'
          }`}
        >
          {formattedDate}
        </span>
        <span className="hidden sm:inline text-white/25" aria-hidden="true">
          ·
        </span>
        <span
          className={`whitespace-nowrap ${
            isPs5Theme ? 'text-white font-light tracking-wider text-[12.5px]' : 'text-white/90 font-medium'
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
              : 'text-[#d4e2f4] hover:text-[#1a9fff]'
          }`}
        >
          <span>SecretArea web version</span>
          <ExternalLink className="w-3 h-3 opacity-75 shrink-0" />
        </a>
      </div>

      {/* Right Zone: Desktop Version / Updates + Sound + Fullscreen Icon */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1 min-w-0">
        {desktopVersion && onOpenUpdates && (
          <button
            type="button"
            onClick={onOpenUpdates}
            title="About SecretArea & Check for Updates"
            aria-label="About SecretArea and Check for Updates"
            className={`relative inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold font-mono-tabular transition-all cursor-pointer shrink-0 ${
              isPs5Theme
                ? 'rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white/90 border border-white/[0.16]'
                : 'bg-[#1a222d] hover:bg-[#243040] text-[#c7d5e8] hover:text-white border border-white/[0.08]'
            }`}
          >
            {updateBadgeStatus === 'checking' || updateBadgeStatus === 'downloading' ? (
              <Loader2 className="w-3 h-3 text-[#66c0f4] animate-spin shrink-0" />
            ) : updateBadgeStatus === 'available' || updateBadgeStatus === 'downloaded' ? (
              <Download
                className={`w-3 h-3 shrink-0 ${
                  updateBadgeStatus === 'downloaded' ? 'text-[#34d399]' : 'text-[#66c0f4]'
                }`}
              />
            ) : null}
            <span>v{desktopVersion}</span>
            {(updateBadgeStatus === 'available' || updateBadgeStatus === 'downloaded') && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  updateBadgeStatus === 'downloaded' ? 'bg-[#34d399]' : 'bg-[#1a9fff]'
                }`}
              />
            )}
          </button>
        )}

        {isPs5Theme && (
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute PS5 Background & UI Sounds' : 'Enable PS5 Background & UI Sounds'}
            aria-label={soundEnabled ? 'Mute PS5 Sounds' : 'Enable PS5 Sounds'}
            className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white/85 hover:text-white border border-white/[0.14] transition-all cursor-pointer shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-65" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={
            isFullscreen
              ? 'Exit Fullscreen & Return to Default Theme'
              : 'Enter Fullscreen (PS5 Mode)'
          }
          aria-label={
            isFullscreen
              ? 'Exit Fullscreen & Return to Default Theme'
              : 'Enter Fullscreen (PS5 Mode)'
          }
          className={`p-1.5 rounded transition-all cursor-pointer shrink-0 ${
            isPs5Theme
              ? 'rounded-full bg-white/[0.12] hover:bg-white/[0.24] text-white ring-1 ring-white/40 hover:ring-white/80 shadow-[0_0_14px_rgba(0,118,255,0.4)]'
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
