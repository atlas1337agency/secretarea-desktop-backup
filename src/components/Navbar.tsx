import { useState, type ComponentType } from 'react';
import {
  Home,
  Layers,
  Library,
  MessageSquarePlus,
  Settings,
  Shield,
} from 'lucide-react';
import type { PrimarySection } from '../types';
import type { AppLanguage, AppThemeMode } from '../services/launcherSettings';
import { getTranslations } from '../i18n/translations';

interface NavbarProps {
  activeSection: PrimarySection;
  onSelectSection: (section: PrimarySection) => void;
  activeTheme?: AppThemeMode;
  compactNavbar?: boolean;
  language?: AppLanguage;
}

export function Navbar({
  activeSection,
  onSelectSection,
  activeTheme = 'default',
  compactNavbar = false,
  language = 'en',
}: NavbarProps) {
  const [logoError, setLogoError] = useState(false);
  const t = getTranslations(language);
  const isPs5Theme = activeTheme === 'ps5';
  const isXboxTheme = activeTheme === 'xbox';

  const navItems: {
    id: PrimarySection;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }[] = [
    { id: 'store', label: t.nav.home, icon: Home },
    { id: 'library', label: t.nav.library, icon: Library },
    { id: 'extras', label: t.nav.extras, icon: Layers },
    { id: 'requests', label: t.nav.requests, icon: MessageSquarePlus },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <header
      className={`relative z-30 h-14 shrink-0 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none border-b transition-colors duration-200 ${
        isPs5Theme
          ? 'bg-[#021233]/80 border-white/[0.12] backdrop-blur-md shadow-[0_8px_28px_rgba(0,6,20,0.42)]'
          : isXboxTheme
          ? 'bg-[#081a0b]/84 border-[#52e042]/20 backdrop-blur-md shadow-[0_8px_28px_rgba(2,14,4,0.48)]'
          : 'bg-[#171a21] border-white/[0.06]'
      }`}
    >
      {/* Left / Start Zone: Brand Logo + Wordmark */}
      <button
        type="button"
        onClick={() => onSelectSection('store')}
        className="flex items-center gap-2 sm:gap-2.5 text-start group focus:outline-none cursor-pointer shrink-0"
      >
        {!logoError ? (
          <img
            src="./img/logo01.png"
            alt="SecretArea"
            onError={() => setLogoError(true)}
            className="h-7 sm:h-8 w-auto max-w-[110px] sm:max-w-[140px] object-contain shrink-0"
          />
        ) : (
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center shadow-sm ${
              isXboxTheme
                ? 'bg-gradient-to-br from-[#107C10] to-[#0a520a]'
                : 'bg-gradient-to-br from-[#1a9fff] to-[#1256a0]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.2} />
          </div>
        )}
        {!compactNavbar && (
          <span
            className={`hidden xs:inline sm:inline font-display text-[15px] sm:text-[17px] tracking-[0.04em] transition-colors ${
              isPs5Theme
                ? 'font-semibold text-white'
                : isXboxTheme
                ? 'font-bold text-[#ecfdf0]'
                : 'font-bold text-[#e5e9f0] group-hover:text-white'
            }`}
          >
            SecretArea
          </span>
        )}
      </button>

      {/* Center Zone: Primary Icon + Text Navigation (or Icon-Only in Compact Navbar mode) */}
      <nav
        aria-label="Primary navigation"
        className={`no-scrollbar flex items-center overflow-x-auto ${
          compactNavbar
            ? 'gap-2 sm:gap-3 lg:gap-4'
            : 'gap-3 sm:gap-5 lg:gap-7'
        }`}
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectSection(item.id)}
              className={`relative inline-flex items-center justify-center gap-1.5 text-[11.5px] sm:text-[13px] tracking-[0.06em] sm:tracking-[0.08em] whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isPs5Theme
                  ? isActive
                    ? compactNavbar
                      ? 'my-2 p-2.5 rounded-full bg-white/[0.16] border border-white/[0.34] font-bold text-white shadow-[0_0_18px_rgba(96,178,255,0.38)]'
                      : 'my-2 px-3.5 py-2 rounded-full bg-white/[0.15] border border-white/[0.3] font-bold text-white shadow-[0_0_18px_rgba(96,178,255,0.35)]'
                    : compactNavbar
                    ? 'my-2 p-2.5 rounded-full font-medium text-white/65 hover:text-white hover:bg-white/[0.08]'
                    : 'my-2 px-3 py-2 rounded-full font-medium text-white/65 hover:text-white hover:bg-white/[0.08]'
                  : isXboxTheme
                  ? isActive
                    ? compactNavbar
                      ? 'my-2 p-2.5 rounded-lg bg-[#107C10]/85 border border-[#6ee755]/85 font-bold text-white shadow-[0_0_16px_rgba(82,224,66,0.35)]'
                      : 'my-2 px-3.5 py-2 rounded-lg bg-[#107C10]/85 border border-[#6ee755]/85 font-bold text-white shadow-[0_0_16px_rgba(82,224,66,0.32)]'
                    : compactNavbar
                    ? 'my-2 p-2.5 rounded-lg font-medium text-[#b5d6b8] hover:text-white hover:bg-[#107C10]/30'
                    : 'my-2 px-3 py-2 rounded-lg font-medium text-[#b5d6b8] hover:text-white hover:bg-[#107C10]/30'
                  : isActive
                  ? compactNavbar
                    ? 'py-4 px-2.5 font-semibold text-[#1a9fff]'
                    : 'py-4 font-semibold text-[#1a9fff]'
                  : compactNavbar
                  ? 'py-4 px-2.5 font-semibold text-[#b8b6b4] hover:text-white'
                  : 'py-4 font-semibold text-[#b8b6b4] hover:text-white'
              }`}
            >
              <Icon className={compactNavbar ? 'w-4.5 h-4.5 shrink-0' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0'} />
              {!compactNavbar && <span>{item.label}</span>}
              {isActive && !isPs5Theme && !isXboxTheme && (
                <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-t bg-[#1a9fff]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* End Zone: Balanced Spacer / Console Glyphs */}
      <div className="hidden md:flex items-center justify-end w-[120px] shrink-0">
        {isPs5Theme && (
          <div
            aria-hidden="true"
            dir="ltr"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-[#8ec5ff]/75"
          >
            <span>△</span>
            <span>○</span>
            <span>×</span>
            <span>□</span>
          </div>
        )}
        {isXboxTheme && (
          <div
            aria-hidden="true"
            dir="ltr"
            className="inline-flex items-center gap-1 text-[10px] font-bold"
          >
            <span className="w-4.5 h-4.5 rounded-full bg-[#107C10]/35 border border-[#4ade80]/70 text-[#4ade80] flex items-center justify-center">
              A
            </span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#7f1d1d]/35 border border-[#f87171]/70 text-[#f87171] flex items-center justify-center">
              B
            </span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#1e3a8a]/35 border border-[#60a5fa]/70 text-[#60a5fa] flex items-center justify-center">
              X
            </span>
            <span className="w-4.5 h-4.5 rounded-full bg-[#78350f]/35 border border-[#facc15]/70 text-[#facc15] flex items-center justify-center">
              Y
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
