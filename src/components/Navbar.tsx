import { useState, type ComponentType } from 'react';
import { Home, Layers, Library, MessageSquarePlus, MonitorDown, Shield } from 'lucide-react';
import type { PrimarySection } from '../types';
import { isRunningInDesktopApp } from '../services/desktopDownload';

interface NavbarProps {
  activeSection: PrimarySection;
  onSelectSection: (section: PrimarySection) => void;
  onOpenDesktopApp: () => void;
  isPs5Theme?: boolean;
}

const NAV_ITEMS: {
  id: PrimarySection;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'store', label: 'HOME', icon: Home },
  { id: 'library', label: 'LIBRARY', icon: Library },
  { id: 'extras', label: 'EXTRAS', icon: Layers },
  { id: 'requests', label: 'REQUESTS', icon: MessageSquarePlus },
];

export function Navbar({
  activeSection,
  onSelectSection,
  onOpenDesktopApp,
  isPs5Theme = false,
}: NavbarProps) {
  const [logoError, setLogoError] = useState(false);
  const isDesktopRuntime = isRunningInDesktopApp();

  return (
    <header
      className={`h-14 shrink-0 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none border-b transition-colors duration-200 ${
        isPs5Theme
          ? 'bg-[#020f29]/55 border-white/[0.08] backdrop-blur-xl shadow-[0_8px_28px_rgba(0,6,20,0.35)]'
          : 'bg-[#171a21] border-white/[0.06]'
      }`}
    >
      {/* Left Zone: Brand Logo + Wordmark */}
      <button
        type="button"
        onClick={() => onSelectSection('store')}
        className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none cursor-pointer shrink-0"
      >
        {!logoError ? (
          <img
            src="./img/logo01.png"
            alt="SecretArea"
            onError={() => setLogoError(true)}
            className="h-7 sm:h-8 w-auto max-w-[110px] sm:max-w-[140px] object-contain shrink-0"
          />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-[#1a9fff] to-[#1256a0] flex items-center justify-center shadow-sm">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.2} />
          </div>
        )}
        <span
          className={`hidden xs:inline sm:inline font-display text-[15px] sm:text-[17px] tracking-[0.04em] transition-colors ${
            isPs5Theme
              ? 'font-semibold text-white'
              : 'font-bold text-[#e5e9f0] group-hover:text-white'
          }`}
        >
          SecretArea
        </span>
      </button>

      {/* Center Zone: Primary Icon + Text Navigation */}
      <nav
        aria-label="Primary navigation"
        className="no-scrollbar flex items-center gap-3.5 sm:gap-6 lg:gap-8 overflow-x-auto"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`relative py-4 inline-flex items-center gap-1.5 text-[11.5px] sm:text-[13px] tracking-[0.06em] sm:tracking-[0.08em] whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isPs5Theme
                  ? isActive
                    ? 'font-bold text-white'
                    : 'font-medium text-white/60 hover:text-white'
                  : isActive
                  ? 'font-semibold text-[#1a9fff]'
                  : 'font-semibold text-[#b8b6b4] hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <span
                  className={`absolute inset-x-0 bottom-0 h-[2.5px] rounded-t ${
                    isPs5Theme
                      ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]'
                      : 'bg-[#1a9fff]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Zone: Desktop App Installer Button (Web Only) */}
      <div className="flex items-center justify-end gap-2.5 shrink-0">
        {isPs5Theme && (
          <div
            aria-hidden="true"
            className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-[#8ec5ff]/75"
          >
            <span>△</span>
            <span>○</span>
            <span>×</span>
            <span>□</span>
          </div>
        )}

        {!isDesktopRuntime && (
          <button
            type="button"
            aria-label="Desktop App"
            onClick={onOpenDesktopApp}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-[11.5px] sm:text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              isPs5Theme
                ? 'rounded-full bg-white/[0.14] hover:bg-white/[0.24] text-white border border-white/[0.25]'
                : 'bg-[#1a9fff] hover:bg-[#38adff] text-white'
            }`}
          >
            <MonitorDown className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Desktop</span>
            <span className="hidden sm:inline">Desktop App</span>
          </button>
        )}
      </div>
    </header>
  );
}
