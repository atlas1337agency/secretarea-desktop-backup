import { useEffect, useState } from 'react';
import {
  CheckCircle,
  DownloadSimple,
  HardDrives,
  Monitor,
  ShieldCheck,
  Sparkle,
  WifiSlash,
  X,
} from '@phosphor-icons/react';
import {
  getConfiguredDesktopExeUrl,
  resolveInstallerUrl,
  saveDesktopExeUrl,
  triggerExeDownload,
} from '../services/desktopDownload';

interface DesktopAppModalProps {
  isOpen: boolean;
  downloadStarted: boolean;
  onClose: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function DesktopAppModal({
  isOpen,
  downloadStarted,
  onClose,
  onNotify,
}: DesktopAppModalProps) {
  const [exeUrl, setExeUrl] = useState<string>(() => getConfiguredDesktopExeUrl());
  const [repoInput, setRepoInput] = useState('');
  const [showConfigEditor, setShowConfigEditor] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const current = getConfiguredDesktopExeUrl();
    setExeUrl(current);
    setShowConfigEditor(!current);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewUrl = resolveInstallerUrl(repoInput);

  const handleSaveRepoAndDownload = (e: React.FormEvent) => {
    e.preventDefault();
    const resolved = saveDesktopExeUrl(repoInput);
    if (!resolved) {
      onNotify('Enter a valid GitHub repo (e.g. username/secretarea) or direct .exe URL.', 'error');
      return;
    }
    setExeUrl(resolved);
    setShowConfigEditor(false);
    triggerExeDownload(resolved);
    onNotify('Starting SecretArea.exe download...', 'success');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download SecretArea Desktop App"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-xl bg-white border border-slate-200 text-slate-800 dark:bg-[#161c26] dark:border-white/[0.12] dark:text-[#e5e9f0] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 dark:bg-[#11161f] dark:border-white/[0.08] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#1a9fff]/15 border border-[#1a9fff]/35 flex items-center justify-center text-[#0284c7] dark:text-[#66c0f4] shrink-0">
              <Monitor className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-[15px] sm:text-[16px] font-bold text-slate-900 dark:text-white truncate">
                SecretArea Desktop App
              </h2>
              <p className="text-[11.5px] text-slate-500 dark:text-[#8b9bb4] font-mono-tabular truncate">
                Windows Installer · SecretArea.exe (64-bit)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close desktop installer modal"
            className="p-1.5 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:text-[#aeb9c7] dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {downloadStarted && exeUrl && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-400/40 dark:text-emerald-200 flex items-start gap-2.5 text-[12.5px]">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Downloading <strong>SecretArea.exe</strong> installer. Run the file once downloaded to install SecretArea on your PC with Desktop &amp; Start Menu shortcuts.
              </span>
            </div>
          )}

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-[#10151d] dark:border-white/[0.06] space-y-1">
              <HardDrives className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4]" />
              <div className="text-[12px] font-semibold text-slate-900 dark:text-white">Real .exe Installer</div>
              <p className="text-[11px] text-slate-600 dark:text-[#8b9bb4]">
                Installs cleanly via SecretArea.exe — no source code required.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-[#10151d] dark:border-white/[0.06] space-y-1">
              <WifiSlash className="w-4 h-4 text-emerald-600 dark:text-[#34d399]" />
              <div className="text-[12px] font-semibold text-slate-900 dark:text-white">Works Offline</div>
              <p className="text-[11px] text-slate-600 dark:text-[#8b9bb4]">
                Caches your synced library locally for browsing without Wi-Fi.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-[#10151d] dark:border-white/[0.06] space-y-1">
              <Sparkle className="w-4 h-4 text-violet-600 dark:text-[#a78bfa]" />
              <div className="text-[12px] font-semibold text-slate-900 dark:text-white">PS5 Fullscreen Mode</div>
              <p className="text-[11px] text-slate-600 dark:text-[#8b9bb4]">
                Native full-screen console theme with ambient audio &amp; SFX.
              </p>
            </div>
          </div>

          {exeUrl && !showConfigEditor ? (
            <div className="space-y-3 pt-1">
              <a
                href={exeUrl}
                download="SecretArea.exe"
                onClick={() => onNotify('Downloading SecretArea.exe...', 'success')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#1a9fff] hover:bg-[#38adff] text-white text-[13.5px] font-semibold transition-colors shadow-lg cursor-pointer"
              >
                <DownloadSimple className="w-4 h-4" />
                <span>Download SecretArea.exe (Windows x64)</span>
              </a>

              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-[#7c8da3]">
                <span className="truncate font-mono-tabular">{exeUrl}</span>
                <button
                  type="button"
                  onClick={() => setShowConfigEditor(true)}
                  className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Change URL
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveRepoAndDownload} className="space-y-3 pt-1">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-[#10151d] dark:border-white/[0.08] space-y-2.5">
                <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4]" />
                  <span>Connect Your GitHub Release Link for SecretArea.exe</span>
                </div>
                <p className="text-[11.5px] text-slate-600 dark:text-[#94a3b8] leading-relaxed">
                  Paste your GitHub repository URL (e.g.{' '}
                  <code className="text-sky-700 dark:text-[#cde3ff]">https://github.com/yourname/secretarea</code>) or a direct{' '}
                  <code className="text-sky-700 dark:text-[#cde3ff]">SecretArea.exe</code> download URL. GitHub Actions automatically builds{' '}
                  <strong className="text-slate-900 dark:text-white">SecretArea.exe</strong> on push.
                </p>

                <input
                  type="text"
                  required
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="https://github.com/username/secretarea  or  username/secretarea"
                  className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-[#0a0e14] dark:border-white/[0.12] dark:text-white dark:placeholder-[#566376] text-[12.5px] focus:outline-none focus:border-[#1a9fff]"
                />

                {previewUrl && (
                  <div className="text-[11px] text-[#0284c7] dark:text-[#66c0f4] font-mono-tabular break-all">
                    Installer target: {previewUrl}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  {exeUrl && (
                    <button
                      type="button"
                      onClick={() => setShowConfigEditor(false)}
                      className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:text-[#cbd5e1] text-[12px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
                  >
                    <DownloadSimple className="w-3.5 h-3.5" />
                    <span>Save &amp; Download SecretArea.exe</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
