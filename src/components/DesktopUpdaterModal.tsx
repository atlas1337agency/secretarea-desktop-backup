import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  CheckCircle,
  DownloadSimple,
  Info,
  Sparkle,
  SpinnerGap,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
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
          className={`fixed bottom-4 right-4 z-[96] w-[340px] max-w-[calc(100vw-2rem)] rounded-lg border shadow-[0_18px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl p-4 transition-all ${
            isPs5Theme
              ? 'bg-[#04183d]/92 border-white/[0.18] text-white'
              : isXboxTheme
              ? 'bg-[#091f0d]/94 border-[#52e042]/35 text-[#ecfdf0]'
              : 'bg-white/95 border-slate-200 text-slate-800 dark:bg-[#171d26]/96 dark:border-white/[0.12] dark:text-[#e5e9f0]'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  isDownloaded
                    ? 'bg-emerald-500/15 text-emerald-600 dark:bg-[#10b981]/20 dark:text-[#34d399]'
                    : 'bg-[#1a9fff]/15 text-[#0284c7] dark:bg-[#1a9fff]/20 dark:text-[#66c0f4]'
                }`}
              >
                {isDownloading ? (
                  <SpinnerGap className="w-4 h-4 animate-spin" />
                ) : isDownloaded ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Sparkle className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-[13px] font-bold leading-tight truncate ${
                    isPs5Theme || isXboxTheme
                      ? 'text-white'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {isDownloaded
                    ? `Update v${state.availableVersion} Ready`
                    : isDownloading
                    ? `Downloading v${state.availableVersion}`
                    : `Update Available · v${state.availableVersion}`}
                </div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    isPs5Theme || isXboxTheme
                      ? 'text-[#9fb0c7]'
                      : 'text-slate-500 dark:text-[#9fb0c7]'
                  }`}
                >
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
                className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                  isPs5Theme || isXboxTheme
                    ? 'text-[#8b9bb4] hover:text-white hover:bg-white/[0.08]'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-[#8b9bb4] dark:hover:text-white dark:hover:bg-white/[0.08]'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isDownloading && (
            <div className="mt-3 space-y-1.5">
              <div
                className={`w-full h-2 rounded-full overflow-hidden border ${
                  isPs5Theme || isXboxTheme
                    ? 'bg-black/40 border-white/[0.08]'
                    : 'bg-slate-200 border-slate-300 dark:bg-black/40 dark:border-white/[0.08]'
                }`}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#1a9fff] to-[#34d399] transition-all duration-150"
                  style={{ width: `${Math.max(4, progressPercent)}%` }}
                />
              </div>
              {state.progress && state.progress.total > 0 && (
                <div
                  className={`flex items-center justify-between text-[10.5px] font-mono-tabular ${
                    isPs5Theme || isXboxTheme
                      ? 'text-[#8b9bb4]'
                      : 'text-slate-500 dark:text-[#8b9bb4]'
                  }`}
                >
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
                className={`px-2.5 py-1.5 rounded text-[11.5px] font-medium transition-colors cursor-pointer ${
                  isPs5Theme || isXboxTheme
                    ? 'text-[#9fb0c7] hover:text-white hover:bg-white/[0.06]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#9fb0c7] dark:hover:text-white dark:hover:bg-white/[0.06]'
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={onPostponeUpdate}
                className={`px-2.5 py-1.5 rounded text-[11.5px] font-medium transition-colors cursor-pointer ${
                  isPs5Theme || isXboxTheme
                    ? 'text-[#b8c7dc] bg-white/[0.06] hover:bg-white/[0.12]'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-[#b8c7dc] dark:bg-white/[0.06] dark:hover:bg-white/[0.12]'
                }`}
              >
                Later
              </button>
              {isAvailable && (
                <button
                  type="button"
                  onClick={onDownloadUpdate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[11.5px] font-semibold transition-colors cursor-pointer"
                >
                  <DownloadSimple className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              )}
              {isDownloaded && (
                <button
                  type="button"
                  onClick={onInstallAndRestart}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#10b981] hover:bg-[#34d399] text-[#052e1e] text-[11.5px] font-bold transition-colors cursor-pointer"
                >
                  <ArrowCounterClockwise className="w-3.5 h-3.5" />
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
          className="fixed inset-0 z-[98] bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
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
                : 'bg-white border-slate-200 text-slate-800 dark:bg-[#151b24] dark:border-white/[0.1] dark:text-[#e5e9f0]'
            }`}
          >
            {/* Header */}
            <div
              className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${
                isPs5Theme || isXboxTheme
                  ? 'border-white/[0.08]'
                  : 'bg-slate-50 border-slate-200 dark:bg-transparent dark:border-white/[0.08]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#1a9fff]/15 border border-[#1a9fff]/30 flex items-center justify-center text-[#0284c7] dark:text-[#66c0f4]">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    className={`text-[15px] font-bold leading-tight ${
                      isPs5Theme || isXboxTheme
                        ? 'text-white'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    About &amp; Updates
                  </h2>
                  <p
                    className={`text-[11.5px] ${
                      isPs5Theme || isXboxTheme
                        ? 'text-[#8b9bb4]'
                        : 'text-slate-500 dark:text-[#8b9bb4]'
                    }`}
                  >
                    SecretArea Desktop App
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close updates dialog"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isPs5Theme || isXboxTheme
                    ? 'text-[#8b9bb4] hover:text-white hover:bg-white/[0.08]'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-[#8b9bb4] dark:hover:text-white dark:hover:bg-white/[0.08]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Installed Version Row */}
              <div
                className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-3 ${
                  isPs5Theme || isXboxTheme
                    ? 'bg-black/25 border-white/[0.07]'
                    : 'bg-slate-50 border-slate-200 dark:bg-black/25 dark:border-white/[0.07]'
                }`}
              >
                <div>
                  <div
                    className={`text-[11px] uppercase tracking-wider font-semibold ${
                      isPs5Theme || isXboxTheme
                        ? 'text-[#8b9bb4]'
                        : 'text-slate-500 dark:text-[#8b9bb4]'
                    }`}
                  >
                    Current Installed Version
                  </div>
                  <div
                    className={`text-[16px] font-bold font-mono-tabular mt-0.5 ${
                      isPs5Theme || isXboxTheme
                        ? 'text-white'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    v{state.currentVersion}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCheckForUpdates}
                  disabled={isChecking || isDownloading}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-[12px] font-semibold border transition-colors cursor-pointer ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white border-white/[0.1]'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] dark:text-white dark:border-white/[0.1]'
                  }`}
                >
                  <ArrowsClockwise className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Checking...' : 'Check for Updates'}</span>
                </button>
              </div>

              {/* Status Feedback */}
              {isUpToDate && (
                <div
                  className={`rounded-lg border px-4 py-3 flex items-center gap-2.5 text-[13px] ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-[#064e3b]/35 border-[#10b981]/35 text-[#a7f3d0]'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-[#064e3b]/35 dark:border-[#10b981]/35 dark:text-[#a7f3d0]'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#34d399] shrink-0" />
                  <span>You&apos;re using the latest version.</span>
                </div>
              )}

              {isChecking && (
                <div
                  className={`rounded-lg border px-4 py-3 flex items-center gap-2.5 text-[13px] ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-[#1a9fff]/10 border-[#1a9fff]/25 text-[#bae6fd]'
                      : 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-[#1a9fff]/10 dark:border-[#1a9fff]/25 dark:text-[#bae6fd]'
                  }`}
                >
                  <SpinnerGap className="w-4 h-4 text-[#0284c7] dark:text-[#38bdf8] animate-spin shrink-0" />
                  <span>Checking GitHub Releases for a newer version...</span>
                </div>
              )}

              {isAvailable && (
                <div
                  className={`rounded-lg border p-4 space-y-3 ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-[#1a9fff]/12 border-[#1a9fff]/35'
                      : 'bg-sky-50 border-sky-200 dark:bg-[#1a9fff]/12 dark:border-[#1a9fff]/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
                      <span
                        className={`text-[13.5px] font-bold ${
                          isPs5Theme || isXboxTheme
                            ? 'text-white'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        New Version Available: v{state.availableVersion}
                      </span>
                    </div>
                  </div>

                  {state.releaseNotes && (
                    <div
                      className={`max-h-36 overflow-y-auto rounded border p-2.5 text-[12px] whitespace-pre-line leading-relaxed ${
                        isPs5Theme || isXboxTheme
                          ? 'bg-black/30 border-white/[0.06] text-[#c7d5e8]'
                          : 'bg-white border-slate-200 text-slate-700 dark:bg-black/30 dark:border-white/[0.06] dark:text-[#c7d5e8]'
                      }`}
                    >
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
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                        isPs5Theme || isXboxTheme
                          ? 'text-[#b8c7dc] bg-white/[0.06] hover:bg-white/[0.12]'
                          : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 dark:border-transparent dark:text-[#b8c7dc] dark:bg-white/[0.06] dark:hover:bg-white/[0.12]'
                      }`}
                    >
                      Later
                    </button>
                    <button
                      type="button"
                      onClick={onDownloadUpdate}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12px] font-semibold transition-colors cursor-pointer"
                    >
                      <DownloadSimple className="w-3.5 h-3.5" />
                      <span>Download Update</span>
                    </button>
                  </div>
                </div>
              )}

              {isDownloading && (
                <div
                  className={`rounded-lg border p-4 space-y-2.5 ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-[#1a9fff]/12 border-[#1a9fff]/35'
                      : 'bg-sky-50 border-sky-200 dark:bg-[#1a9fff]/12 dark:border-[#1a9fff]/35'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-2 text-[13px] font-semibold ${
                      isPs5Theme || isXboxTheme
                        ? 'text-white'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <SpinnerGap className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] animate-spin" />
                      Downloading v{state.availableVersion}...
                    </span>
                    <span className="font-mono-tabular">{progressPercent}%</span>
                  </div>
                  <div
                    className={`w-full h-2.5 rounded-full overflow-hidden border ${
                      isPs5Theme || isXboxTheme
                        ? 'bg-black/40 border-white/[0.08]'
                        : 'bg-slate-200 border-slate-300 dark:bg-black/40 dark:border-white/[0.08]'
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#1a9fff] to-[#34d399] transition-all duration-150"
                      style={{ width: `${Math.max(4, progressPercent)}%` }}
                    />
                  </div>
                  <div
                    className={`flex items-center justify-between text-[11px] font-mono-tabular ${
                      isPs5Theme || isXboxTheme
                        ? 'text-[#9fb0c7]'
                        : 'text-slate-600 dark:text-[#9fb0c7]'
                    }`}
                  >
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
                <div
                  className={`rounded-lg border p-4 space-y-3 ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-[#064e3b]/40 border-[#10b981]/45'
                      : 'bg-emerald-50 border-emerald-300 dark:bg-[#064e3b]/40 dark:border-[#10b981]/45'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 text-[13.5px] font-bold ${
                      isPs5Theme || isXboxTheme
                        ? 'text-[#a7f3d0]'
                        : 'text-emerald-800 dark:text-[#a7f3d0]'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-[#34d399] shrink-0" />
                    <span>Update v{state.availableVersion} is ready to install</span>
                  </div>
                  <p
                    className={`text-[12px] leading-relaxed ${
                      isPs5Theme || isXboxTheme
                        ? 'text-[#c7d5e8]'
                        : 'text-slate-700 dark:text-[#c7d5e8]'
                    }`}
                  >
                    Click Install and Restart to apply the update now, or postpone to keep using SecretArea and update when you close the app.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onPostponeUpdate();
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                        isPs5Theme || isXboxTheme
                          ? 'text-[#c7d5e8] bg-white/[0.08] hover:bg-white/[0.14]'
                          : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 dark:border-transparent dark:text-[#c7d5e8] dark:bg-white/[0.08] dark:hover:bg-white/[0.14]'
                      }`}
                    >
                      Postpone
                    </button>
                    <button
                      type="button"
                      onClick={onInstallAndRestart}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#10b981] hover:bg-[#34d399] text-[#052e1e] text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      <ArrowCounterClockwise className="w-3.5 h-3.5" />
                      <span>Install and Restart</span>
                    </button>
                  </div>
                </div>
              )}

              {isError && (
                <div
                  className={`rounded-lg border px-4 py-3 flex items-start gap-2.5 text-[12.5px] ${
                    isPs5Theme || isXboxTheme
                      ? 'bg-[#7f1d1d]/35 border-[#ef4444]/40 text-[#fecaca]'
                      : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-[#7f1d1d]/35 dark:border-[#ef4444]/40 dark:text-[#fecaca]'
                  }`}
                >
                  <WarningCircle className="w-4 h-4 text-rose-600 dark:text-[#f87171] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {state.error || 'Unable to check for updates right now.'}
                  </span>
                </div>
              )}

              {state.lastCheckedAt && (
                <div
                  className={`text-[11px] text-center ${
                    isPs5Theme || isXboxTheme
                      ? 'text-[#7f8ea3]'
                      : 'text-slate-500 dark:text-[#7f8ea3]'
                  }`}
                >
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
