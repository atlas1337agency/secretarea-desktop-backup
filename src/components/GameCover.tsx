import { useState, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameCoverProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  compact?: boolean;
}

export function GameCover({
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
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1f2937] via-[#16202d] to-[#0e141b] text-center select-none ${className}`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#1a9fff,transparent_60%)]" />
        <Gamepad2
          className={compact ? 'w-3.5 h-3.5 text-[#677487]' : 'w-8 h-8 text-[#4b5c73] mb-2'}
          aria-hidden="true"
        />
        {!compact && (
          <span className="px-3 text-[11px] font-medium leading-tight tracking-wide text-[#8b9bb4] line-clamp-3">
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
}
