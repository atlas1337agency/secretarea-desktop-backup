import { useState, useEffect, type FormEvent } from 'react';
import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  CheckCircle,
  Database,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { DEFAULT_GAS_URL } from '../services/sheetsApi';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  lastSyncedAt: string | null;
  totalGames: number;
  extrasCount: number;
  isSyncing: boolean;
  syncError: string | null;
  onSyncUrl: (url: string) => Promise<void>;
  onResetBuiltin: () => void;
}

export function SyncModal({
  isOpen,
  onClose,
  currentUrl,
  lastSyncedAt,
  totalGames,
  extrasCount,
  isSyncing,
  syncError,
  onSyncUrl,
  onResetBuiltin,
}: SyncModalProps) {
  const [urlInput, setUrlInput] = useState(currentUrl || DEFAULT_GAS_URL);

  useEffect(() => {
    if (isOpen) {
      setUrlInput(currentUrl || DEFAULT_GAS_URL);
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    await onSyncUrl(urlInput.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded bg-white border border-slate-200 dark:bg-[#1b2838] dark:border-white/[0.1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200 dark:bg-[#171a21] dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#0284c7] dark:text-[#1a9fff]" />
            <h2 className="font-display text-[16px] font-semibold text-slate-900 dark:text-white">
              Google Sheet &amp; Apps Script Sync
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 dark:text-[#8b9bb4] dark:hover:text-white dark:hover:bg-white/[0.06] cursor-pointer"
            aria-label="Close sync dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="gas-url-input"
              className="block text-[12px] font-semibold uppercase tracking-wider text-slate-700 dark:text-[#b8c6db] mb-1.5"
            >
              Apps Script Web App URL
            </label>
            <input
              id="gas-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2.5 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-[#0e141b] dark:border-white/[0.12] dark:text-white dark:placeholder-[#566376] text-[13px] focus:outline-none focus:border-[#1a9fff]"
              required
            />
            <p className="mt-1.5 text-[12px] text-slate-600 dark:text-[#8b9bb4] leading-relaxed">
              Connected to your Google Sheet &lsquo;doGet&rsquo; / &lsquo;doPost&rsquo; Web App
              for live catalog sync across all 17 tabs, community comments, and game requests.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-100 border border-slate-200 dark:border-transparent dark:bg-[#141d29] rounded p-3 text-[12px]">
            <div>
              <div className="text-slate-500 dark:text-[#8b9bb4]">Games Loaded</div>
              <div className="font-mono-tabular text-[15px] font-semibold text-slate-900 dark:text-white mt-0.5">
                {totalGames}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-[#8b9bb4]">Extras &amp; Tabs</div>
              <div className="font-mono-tabular text-[15px] font-semibold text-slate-900 dark:text-white mt-0.5">
                {extrasCount}
              </div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-[#8b9bb4]">Source</div>
              <div className="text-[13px] font-medium text-[#0284c7] dark:text-[#66c0f4] mt-0.5 truncate">
                {currentUrl ? 'Live Google Sheet' : 'Offline Snapshot'}
              </div>
            </div>
          </div>

          {lastSyncedAt && !syncError && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-800 bg-emerald-50 border border-emerald-200 dark:text-[#5ba32b] dark:bg-[#5ba32b]/10 dark:border-[#5ba32b]/25 rounded px-3 py-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Last synced: {new Date(lastSyncedAt).toLocaleString()}</span>
            </div>
          )}

          {syncError && (
            <div className="flex items-start gap-2 text-[12px] text-rose-800 bg-rose-50 border border-rose-200 dark:text-[#ef4444] dark:bg-[#ef4444]/10 dark:border-[#ef4444]/25 rounded px-3 py-2">
              <WarningCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{syncError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-white/[0.07]">
            <button
              type="button"
              onClick={onResetBuiltin}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#232b36] dark:hover:bg-[#2c3644] dark:text-[#c6d4df] text-[12px] font-medium cursor-pointer"
            >
              <ArrowCounterClockwise className="w-3.5 h-3.5" />
              Use Offline Snapshot
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-[#8b9bb4] dark:hover:text-white dark:hover:bg-white/[0.06] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSyncing || !urlInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#1a9fff] hover:bg-[#38adff] disabled:opacity-50 text-white text-[12px] font-semibold cursor-pointer"
              >
                <ArrowsClockwise className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Save & Sync Sheet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
