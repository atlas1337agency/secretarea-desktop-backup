import type { ComponentType } from 'react';
import { Gamepad2, HardDriveDownload, ShieldAlert, Wrench } from 'lucide-react';
import type { SheetTabKey } from '../types';

export function SteamIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M11.98 2a10 10 0 0 0-9.8 8.04l5.37 2.22a2.84 2.84 0 0 1 1.6-.49c.1 0 .2.01.3.02l2.39-3.47v-.05a3.79 3.79 0 1 1 3.79 3.79h-.09l-3.41 2.43c.01.08.01.16.01.24a2.85 2.85 0 0 1-5.64.59L2.24 13.56A10 10 0 1 0 11.98 2Zm-3.6 15.63-1.24-.51a2.14 2.14 0 0 0 3.92-.22 2.13 2.13 0 0 0-1.15-2.79 2.1 2.1 0 0 0-1.45-.04l1.28.53a1.57 1.57 0 1 1-1.36 2.84Zm9.27-9.36a2.52 2.52 0 1 0-5.05 0 2.52 2.52 0 0 0 5.05 0Zm-4.42 0a1.89 1.89 0 1 1 3.79 0 1.89 1.89 0 0 1-3.79 0Z" />
    </svg>
  );
}

export function Ps5Icon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M9.5 4.2v14.1l2.7.9V7.5c0-.9.4-1.3 1-1.1.7.2.9.8.9 1.7v3.3c2.1 1 3.7-.1 3.7-2.6 0-2.5-.9-3.7-3.4-4.5-1.5-.5-3.4-.5-4.9-.1ZM2.2 17c-1 .4-1.2 1.2-.2 1.7 1.2.6 2.8.8 4.4.4l2.2-.7v-1.9l-2.3.8c-.7.2-1.4.2-1.8 0-.4-.2-.2-.6.4-.8l5.9-2.1v-1.9L2.2 17Zm19.7.3c-1-.6-2.8-.7-4.5-.2l-4.2 1.5v1.9l4-1.4c.7-.2 1.4-.2 1.8 0 .5.2.3.6-.4.8l-5.4 1.9v.9l6.7-2.4c1.6-.6 2.8-1.9 2-3Z" />
    </svg>
  );
}

interface SectionVisualMeta {
  shortBadge: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  iconColorClass: string;
  badgeClass: string;
}

const DEFAULT_META: SectionVisualMeta = {
  shortBadge: 'GAME',
  label: 'Games',
  icon: Gamepad2,
  iconColorClass: 'text-[#66c0f4]',
  badgeClass: 'bg-[#0f172a]/90 border-white/25 text-[#e2e8f0]',
};

export const SECTION_VISUAL_META: Partial<Record<SheetTabKey, SectionVisualMeta>> = {
  game: DEFAULT_META,
  hypervisor: {
    shortBadge: 'HV',
    label: 'Hypervisor',
    icon: ShieldAlert,
    iconColorClass: 'text-[#f87171]',
    badgeClass: 'bg-[#dc2626] border-[#fca5a5]/70 text-white shadow-[0_2px_8px_rgba(220,38,38,0.65)]',
  },
  steamtools: {
    shortBadge: 'STEAM',
    label: 'SteamTools',
    icon: SteamIcon,
    iconColorClass: 'text-[#66c0f4]',
    badgeClass: 'bg-[#171a21]/95 border-[#66c0f4]/60 text-[#66c0f4]',
  },
  ps5: {
    shortBadge: 'PS5',
    label: 'PS5',
    icon: Ps5Icon,
    iconColorClass: 'text-[#60a5fa]',
    badgeClass: 'bg-[#006fcd]/95 border-[#93c5fd]/65 text-white',
  },
  architect: {
    shortBadge: 'TOOLS',
    label: 'Tools',
    icon: Wrench,
    iconColorClass: 'text-[#fbbf24]',
    badgeClass: 'bg-[#b45309]/95 border-[#fcd34d]/60 text-white',
  },
  extra: {
    shortBadge: 'SAVE',
    label: 'Savegame',
    icon: HardDriveDownload,
    iconColorClass: 'text-[#34d399]',
    badgeClass: 'bg-[#059669]/95 border-[#6ee7b7]/60 text-white',
  },
};

export function getSectionVisualMeta(tab: SheetTabKey): SectionVisualMeta {
  return SECTION_VISUAL_META[tab] || DEFAULT_META;
}

interface SectionSourceBadgeProps {
  tab: SheetTabKey;
  hasTopRibbon?: boolean;
  className?: string;
}

export function SectionSourceBadge({
  tab,
  hasTopRibbon = false,
  className = '',
}: SectionSourceBadgeProps) {
  const meta = getSectionVisualMeta(tab);
  const Icon = meta.icon;

  return (
    <span
      title={`From ${meta.label}`}
      className={`inline-flex items-center gap-1 px-1.5 py-[2px] rounded-[3px] border backdrop-blur-sm text-[9.5px] font-extrabold tracking-[0.06em] uppercase leading-none shadow-md pointer-events-none select-none ${
        meta.badgeClass
      } ${hasTopRibbon ? 'top-7' : 'top-1.5'} ${className}`}
    >
      {tab !== 'hypervisor' && <Icon className="w-3 h-3 shrink-0" />}
      <span>{meta.shortBadge}</span>
    </span>
  );
}
