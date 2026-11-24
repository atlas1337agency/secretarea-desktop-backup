import type { ComponentType } from 'react';
import {
  GameController,
  HardDrives,
  ShieldWarning,
  Wrench,
} from '@phosphor-icons/react';
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
  icon: GameController,
  iconColorClass: 'text-[#0284c7] dark:text-[#38bdf8]',
  badgeClass:
    'bg-[#0b111a]/80 border-white/20 text-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
};

export const SECTION_VISUAL_META: Partial<Record<SheetTabKey, SectionVisualMeta>> = {
  game: DEFAULT_META,
  hypervisor: {
    shortBadge: 'HV',
    label: 'Hypervisor',
    icon: ShieldWarning,
    iconColorClass: 'text-rose-500 dark:text-[#fb7185]',
    badgeClass:
      'bg-rose-600/90 border-rose-300/45 text-white shadow-[0_4px_14px_rgba(225,29,72,0.5)]',
  },
  steamtools: {
    shortBadge: 'STEAM',
    label: 'SteamTools',
    icon: SteamIcon,
    iconColorClass: 'text-[#0284c7] dark:text-[#7dd3fc]',
    badgeClass:
      'bg-[#101824]/88 border-sky-400/45 text-[#7dd3fc] shadow-[0_4px_12px_rgba(14,165,233,0.28)]',
  },
  ps5: {
    shortBadge: 'PS5',
    label: 'PS5',
    icon: Ps5Icon,
    iconColorClass: 'text-blue-600 dark:text-[#60a5fa]',
    badgeClass:
      'bg-[#0057b8]/90 border-blue-300/45 text-white shadow-[0_4px_12px_rgba(0,87,184,0.45)]',
  },
  architect: {
    shortBadge: 'TOOLS',
    label: 'Tools',
    icon: Wrench,
    iconColorClass: 'text-amber-600 dark:text-[#fbbf24]',
    badgeClass:
      'bg-amber-600/90 border-amber-300/45 text-white shadow-[0_4px_12px_rgba(217,119,6,0.45)]',
  },
  extra: {
    shortBadge: 'SAVE',
    label: 'Savegame',
    icon: HardDrives,
    iconColorClass: 'text-emerald-600 dark:text-[#34d399]',
    badgeClass:
      'bg-emerald-600/90 border-emerald-300/45 text-white shadow-[0_4px_12px_rgba(5,150,105,0.45)]',
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
      className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full border backdrop-blur-md text-[9.5px] font-bold tracking-[0.07em] uppercase leading-none pointer-events-none select-none ${
        meta.badgeClass
      } ${hasTopRibbon ? 'top-7' : 'top-2'} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{meta.shortBadge}</span>
    </span>
  );
}
