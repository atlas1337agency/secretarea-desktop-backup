import { memo, useEffect, useState } from 'react';
import { GameController } from '@phosphor-icons/react';

interface GameCoverProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  compact?: boolean;
}

export const GameCover = memo(function GameCover({
  src,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  priority = false,
  compact = false,
}: GameCoverProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  useEffect(() => {
    if (!failed) return;
    const handleOnline = () => setFailed(false);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [failed]);

  if (!src || failed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-[#1f2937] dark:via-[#16202d] dark:to-[#0e141b] text-center select-none ${className}`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#1a9fff,transparent_60%)]" />
        <GameController
          className={compact ? 'w-3.5 h-3.5 text-slate-400 dark:text-[#677487]' : 'w-8 h-8 text-slate-400 dark:text-[#4b5c73] mb-2'}
          aria-hidden="true"
        />
        {!compact && (
          <span className="px-3 text-[11px] font-medium leading-tight tracking-wide text-slate-600 dark:text-[#8b9bb4] line-clamp-3">
            {alt}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${imgClassName} ${className}`}
    />
  );
});
