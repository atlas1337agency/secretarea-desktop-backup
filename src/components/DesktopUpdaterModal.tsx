import {
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  formatByteSize,
  formatTransferSpeed,
  type DesktopUpdateState,
} from '../services/desktopUpdater';

import type { AppThemeMode } from '../services/launcherSettings';

interface DesktopUpdaterUIProps {
  isOpen: boolean;
  activeTheme?: AppThemeMode;
  state: DesktopUpdateState | null;
  onClose: () => void;
  onCheckForUpdates: () => void;
  onDownloadUpdate: () => void;
  onInstallAndRestart: () => void;
  onPostponeUpdate: () => void;
  onOpenModal: () => void;
}

export function DesktopUpdaterModal({
  isOpen,
  activeTheme = 'default',
  state,
  onClose,
  onCheckForUpdates,
  onDownloadUpdate,
  onInstallAndRestart,
  onPostponeUpdate,
  onOpenModal,
}: DesktopUpdaterUIProps) {
  if (!state) return null;
  const isPs5Theme = activeTheme === 'ps5';
  const isXboxTheme = activeTheme === 'xbox';

  const isChecking = state.status === 'checking';
  const isDownloading = state.status === 'downloading';
  const isAvailable = state.status === 'available';
  const isDownloaded = state.status === 'downloaded';
  const isUpToDate = state.status === 'not-available';
  const isError = state.status === 'error';

  const progressPercent = Math.round(state.progress?.percent || 0);
  const transferredText = state.progress ? formatByteSize(state.progress.transferred) : '';
  const totalText = state.progress ? formatByteSize(state.progress.total) : '';
  const speedText = state.progress ? formatTransferSpeed(state.progress.bytesPerSecond) : '';

  const showFloatingNotification =
    !isOpen &&
    !state.postponed &&
    (isAvailable || isDownloading || isDownloaded);

  return (
    <>
      {/* Non-blocking Floating Update Notification */}
      {showFloatingNotification && (
        <div
          role="dialog"
          aria-label="Desktop update notification"
          className={`fixed bottom-4 right-4 z-[96] w-[340px] max-w-[calc(100vw-2rem)] rounded-lg border shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl p-4 transition-all ${
            isPs5Theme
              ? 'bg-[#04183d]/92 border-white/[0.18] text-white'
              : isXboxTheme
              ? 'bg-[#091f0d]/94 border-[#52e042]/35 text-[#ecfdf0]'
              : 'bg-[#171d26]/96 border-white/[0.12] text-[#e5e9f0]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  isDownloaded
                    ? 'bg-[#10b981]/20 text-[#34d399]'
                    : 'bg-[#1a9fff]/20 text-[#66c0f4]'
                }`}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDownloaded ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-white leading-tight truncate">
                  {isDownloaded
                    ? `Update v${state.availableVersion} Ready`
                    : isDownloading
                    ? `Downloading v${state.availableVersion}`
                    : `Update Available · v${state.availableVersion}`}
                </div>
                <div className="text-[11px] text-[#9fb0c7] mt-0.5">
                  {isDownloaded
                    ? 'Restart SecretArea to finish installing.'
                    : isDownloading
                    ? `${progressPercent}%${speedText ? ` · ${speedText}` : ''}`
                    : `Installed version: v${state.currentVersion}`}
                </div>
              </div>
            </div>

            {!isDownloading && (
              <button
                type="button"
                onClick={onPostponeUpdate}
                aria-label="Postpone update notification"
                title="Remind me later"
                className="p-1 rounded text-[#8b9bb4] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isDownloading && (
            <div className="mt-3 space-y-1.5">
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/[0.08]">
                <div
                  className="h-full bg-gradient-to-r from-[#1a9fff] to-[#34d399] transition-all duration-150"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
              {state.progress && state.progress.total > 0 && (
                <div className="flex items-center justify-between text-[10.5px] text-[#8b9bb4] font-mono-tabular">
                  <span>
                    {transferredText} / {totalText}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
              )}
            </div>
          )}

          {!isDownloading && (
            <div className="mt-3.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onOpenModal}
                className="px-2.5 py-1.5 rounded text-[11.5px] font-medium text-[#9fb0c7] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Details
              </button>
              <button
                type="button"
                onClick={onPostponeUpdate}
                className="px-2.5 py-1.5 rounded text-[11.5px] font-medium text-[#b8c7dc] bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
              >
                Later
              </button>
              {isAvailable && (
                <button
                  type="button"
                  onClick={onDownloadUpdate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[11.5px] font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              )}
              {isDownloaded && (
                <button
                  type="button"
                  onClick={onInstallAndRestart}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#10b981] hover:bg-[#34d399] text-[#052e1e] text-[11.5px] font-bold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Install and Restart</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* About & Software Updates Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[98] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="About SecretArea and Software Updates"
        >
          <div
            className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
              isPs5Theme
                ? 'bg-[#031333]/95 border-white/[0.18] text-white'
                : isXboxTheme
                ? 'bg-[#081b0c]/96 border-[#52e042]/35 text-[#ecfdf0]'
                : 'bg-[#151b24] border-white/[0.1] text-[#e5e9f0]'
            }`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#1a9fff]/15 border border-[#1a9fff]/30 flex items-center justify-center text-[#66c0f4]">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-white leading-tight">
                    About &amp; Updates
                  </h2>
                  <p className="text-[11.5px] text-[#8b9bb4]">
                    SecretArea Desktop App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close updates dialog"
                className="p-1.5 rounded-md text-[#8b9bb4] hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Installed Version Row */}
              <div className="rounded-lg bg-black/25 border border-white/[0.07] px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#8b9bb4] font-semibold">
                    Current Installed Version
                  </div>
                  <div className="text-[16px] font-bold text-white font-mono-tabular mt-0.5">
                    v{state.currentVersion}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCheckForUpdates}
                  disabled={isChecking || isDownloading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold border border-white/[0.1] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking...' : 'Check for Updates'}</span>
                </button>
              </div>

              {/* Status Feedback */}
              {isUpToDate && (
                <div className="rounded-lg bg-[#064e3b]/35 border border-[#10b981]/35 px-4 py-3 flex items-center gap-2.5 text-[13px] text-[#a7f3d0]">
                  <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                  <span>You&apos;re using the latest version.</span>
                </div>
              )}

              {isChecking && (
                <div className="rounded-lg bg-[#1a9fff]/10 border border-[#1a9fff]/25 px-4 py-3 flex items-center gap-2.5 text-[13px] text-[#bae6fd]">
                  <Loader2 className="w-4 h-4 text-[#38bdf8] animate-spin shrink-0" />
                  <span>Checking GitHub Releases for a newer version...</span>
                </div>
              )}

              {isAvailable && (
                <div className="rounded-lg bg-[#1a9fff]/12 border border-[#1a9fff]/35 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#66c0f4] shrink-0" />
                      <span className="text-[13.5px] font-bold text-white">
                        New Version Available: v{state.availableVersion}
                      </span>
                    </div>
                  </div>

                  {state.releaseNotes && (
                    <div className="max-h-36 overflow-y-auto rounded bg-black/30 border border-white/[0.06] p-2.5 text-[12px] text-[#c7d5e8] whitespace-pre-line leading-relaxed">
                      {state.releaseNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onPostponeUpdate();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-md text-[12px] font-medium text-[#b8c7dc] bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
                    >
                      Later
                    </button>
                    <button
                      type="button"
                      onClick={onDownloadUpdate}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Update</span>
                    </button>
                  </div>
                </div>
              )}

              {isDownloading && (
                <div className="rounded-lg bg-[#1a9fff]/12 border border-[#1a9fff]/35 p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-white">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#66c0f4] animate-spin" />
                      Downloading v{state.availableVersion}...
                    </span>
                    <span className="font-mono-tabular">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/[0.08]">
                    <div
                      className="h-full bg-gradient-to-r from-[#1a9fff] to-[#34d399] transition-all duration-150"
                      style={{ width: `${Math.max(4, progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9fb0c7] font-mono-tabular">
                    <span>
                      {state.progress && state.progress.total > 0
                        ? `${transferredText} / ${totalText}`
                        : 'Preparing download...'}
                    </span>
                    <span>{speedText}</span>
                  </div>
                </div>
              )}

              {isDownloaded && (
                <div className="rounded-lg bg-[#064e3b]/40 border border-[#10b981]/45 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[13.5px] font-bold text-[#a7f3d0]">
                    <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                    <span>Update v{state.availableVersion} is ready to install</span>
                  </div>
                  <p className="text-[12px] text-[#c7d5e8] leading-relaxed">
                    Click Install and Restart to apply the update now, or postpone to keep using SecretArea and update when you close the app.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onPostponeUpdate();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-md text-[12px] font-medium text-[#c7d5e8] bg-white/[0.08] hover:bg-white/[0.14] transition-colors cursor-pointer"
                    >
                      Postpone
                    </button>
                    <button
                      type="button"
                      onClick={onInstallAndRestart}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#10b981] hover:bg-[#34d399] text-[#052e1e] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Install and Restart</span>
                    </button>
                  </div>
                </div>
              )}

              {isError && (
                <div className="rounded-lg bg-[#7f1d1d]/35 border border-[#ef4444]/40 px-4 py-3 flex items-start gap-2.5 text-[12.5px] text-[#fecaca]">
                  <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {state.error || 'Unable to check for updates right now.'}
                  </span>
                </div>
              )}

              {state.lastCheckedAt && (
                <div className="text-[11px] text-[#7f8ea3] text-center">
                  Last checked: {new Date(state.lastCheckedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
