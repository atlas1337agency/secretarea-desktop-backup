import { useEffect, useRef, useState } from 'react';
import type { AppThemeMode } from '../services/launcherSettings';

export type CustomCursorKind =
  | 'default'
  | 'pointer'
  | 'text'
  | 'wait'
  | 'progress'
  | 'move'
  | 'ns-resize'
  | 'ew-resize'
  | 'nesw-resize'
  | 'nwse-resize'
  | 'zoom-in'
  | 'zoom-out'
  | 'not-allowed'
  | 'help';

interface ClickBurst {
  id: number;
  x: number;
  y: number;
  kind: CustomCursorKind;
}

interface CustomCursorOverlayProps {
  enabled: boolean;
  activeTheme?: AppThemeMode;
}

function resolveCursorKind(target: EventTarget | null): CustomCursorKind {
  if (!(target instanceof Element)) return 'default';

  const disabledEl = target.closest('[disabled], [aria-disabled="true"], .cursor-not-allowed');
  if (disabledEl) {
    return 'not-allowed';
  }

  // Check explicit computed CSS cursor on target and immediate ancestor chain
  let node: Element | null = target;
  for (let depth = 0; depth < 4 && node; depth += 1) {
    const computed = window.getComputedStyle(node).cursor;
    if (computed && computed !== 'auto' && computed !== 'none') {
      if (computed.includes('not-allowed') || computed.includes('no-drop')) return 'not-allowed';
      if (computed === 'wait') return 'wait';
      if (computed === 'progress') return 'progress';
      if (computed === 'zoom-in') return 'zoom-in';
      if (computed === 'zoom-out') return 'zoom-out';
      if (computed === 'help') return 'help';
      if (computed === 'text' || computed === 'vertical-text') return 'text';
      if (computed === 'move' || computed === 'grab' || computed === 'grabbing' || computed === 'all-scroll') {
        return 'move';
      }
      if (computed === 'ns-resize' || computed === 'n-resize' || computed === 's-resize' || computed === 'row-resize') {
        return 'ns-resize';
      }
      if (computed === 'ew-resize' || computed === 'e-resize' || computed === 'w-resize' || computed === 'col-resize') {
        return 'ew-resize';
      }
      if (computed === 'nesw-resize' || computed === 'ne-resize' || computed === 'sw-resize') {
        return 'nesw-resize';
      }
      if (computed === 'nwse-resize' || computed === 'nw-resize' || computed === 'se-resize') {
        return 'nwse-resize';
      }
      if (computed === 'pointer') return 'pointer';
    }
    node = node.parentElement;
  }

  const textControl = target.closest(
    'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]), textarea, [contenteditable="true"]'
  );
  if (textControl) return 'text';

  const interactive = target.closest(
    'button, a[href], [role="button"], [role="tab"], [role="menuitem"], [role="option"], select, summary, label[for], input[type="range"], input[type="checkbox"], input[type="radio"], input[type="color"]'
  );
  if (interactive) return 'pointer';

  return 'default';
}

function getHotspotOffset(kind: CustomCursorKind): { x: number; y: number } {
  switch (kind) {
    case 'default':
      return { x: 4, y: 4 };
    case 'pointer':
      return { x: 7, y: 5 };
    case 'text':
      return { x: 14, y: 14 };
    case 'wait':
    case 'progress':
    case 'move':
    case 'ns-resize':
    case 'ew-resize':
    case 'nesw-resize':
    case 'nwse-resize':
    case 'zoom-in':
    case 'zoom-out':
    case 'not-allowed':
    case 'help':
      return { x: 14, y: 14 };
  }
}

export function CustomCursorOverlay({
  enabled,
  activeTheme = 'default',
}: CustomCursorOverlayProps) {
  const [isFinePointer, setIsFinePointer] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [cursorKind, setCursorKind] = useState<CustomCursorKind>('default');
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const kindRef = useRef<CustomCursorKind>('default');
  const visibleRef = useRef(false);
  const burstIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const effectiveEnabled = enabled && isFinePointer;

  // Watch pointer capability changes (e.g. tablet detach/attach)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const handleChange = () => setIsFinePointer(mq.matches);
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Toggle global CSS native-cursor hiding class only when custom cursor is active
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (effectiveEnabled && isVisible) {
      html.classList.add('sa-custom-cursor');
    } else {
      html.classList.remove('sa-custom-cursor');
    }
    return () => {
      html.classList.remove('sa-custom-cursor');
    };
  }, [effectiveEnabled, isVisible]);

  // High-frequency 120fps pointer tracking without React re-renders per pixel
  useEffect(() => {
    if (!effectiveEnabled) {
      setIsVisible(false);
      visibleRef.current = false;
      return;
    }

    const syncDomPosition = () => {
      rafRef.current = null;
      const el = cursorRef.current;
      if (!el) return;
      const { x, y } = posRef.current;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const schedulePositionSync = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(syncDomPosition);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (visibleRef.current) {
          visibleRef.current = false;
          setIsVisible(false);
        }
        return;
      }

      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      schedulePositionSync();

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const nextKind = resolveCursorKind(e.target);
      if (nextKind !== kindRef.current) {
        kindRef.current = nextKind;
        setCursorKind(nextKind);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      schedulePositionSync();

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const nextKind = resolveCursorKind(e.target);
      if (nextKind !== kindRef.current) {
        kindRef.current = nextKind;
        setCursorKind(nextKind);
      }

      setIsPressed(true);
      const id = ++burstIdRef.current;
      setBursts((prev) => [...prev.slice(-5), { id, x: e.clientX, y: e.clientY, kind: nextKind }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 480);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
      setIsPressed(false);
    };

    const handleBlur = () => {
      visibleRef.current = false;
      setIsVisible(false);
      setIsPressed(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleBlur);
    };
  }, [effectiveEnabled]);

  if (!effectiveEnabled) return null;

  const hotspot = getHotspotOffset(cursorKind);
  // Subtle theme-aware sky-blue accent palette matching the custom cursor pack
  const accentBlue = activeTheme === 'xbox' ? '#60e650' : '#6cb6ff';
  const ringBlue = activeTheme === 'xbox' ? '#84f553' : '#7ec2ff';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
    >
      {/* Click Ripple & Radial Burst Effects at exact hotspot */}
      {bursts.map((burst) => {
        const isBlocked = burst.kind === 'not-allowed';
        const burstColor = isBlocked ? '#f87171' : ringBlue;
        return (
          <div
            key={burst.id}
            style={{ transform: `translate3d(${burst.x}px, ${burst.y}px, 0)` }}
            className="fixed left-0 top-0 pointer-events-none"
          >
            {/* Concentric Ripple Rings (Row 1 Col 2 / Row 2 Col 2) */}
            <svg
              width="52"
              height="52"
              viewBox="0 0 52 52"
              className="-translate-x-1/2 -translate-y-1/2 overflow-visible"
            >
              <circle
                cx="26"
                cy="26"
                r="8"
                fill="none"
                stroke={burstColor}
                strokeWidth="2.2"
                className="sa-cursor-ripple-outer"
              />
              <circle
                cx="26"
                cy="26"
                r="5"
                fill="none"
                stroke={burstColor}
                strokeWidth="1.8"
                className="sa-cursor-ripple-inner"
              />

              {/* Radial Click Burst Rays (Row 1 Col 4 / Row 2 Col 4) */}
              {!isBlocked && (
                <g
                  stroke={burstColor}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  className="sa-cursor-burst-rays"
                >
                  <line x1="26" y1="15" x2="26" y2="9" />
                  <line x1="18" y1="18" x2="13.5" y2="13.5" />
                  <line x1="34" y1="18" x2="38.5" y2="13.5" />
                  <line x1="15" y1="26" x2="9" y2="26" />
                  <line x1="37" y1="26" x2="43" y2="26" />
                </g>
              )}
            </svg>
          </div>
        );
      })}

      {/* Floating Cursor Sprite */}
      <div
        ref={cursorRef}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 110ms ease',
        }}
        className="fixed left-0 top-0 will-change-transform"
      >
        <div
          style={{
            transform: `translate3d(${-hotspot.x}px, ${-hotspot.y}px, 0)`,
          }}
        >
          {/* Dashed Interactive Hover Ring at Tip (Row 1 Col 3 / Row 2 Col 3) */}
          {cursorKind === 'pointer' && (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              style={{
                left: `${hotspot.x}px`,
                top: `${hotspot.y}px`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible"
            >
              <circle
                cx="14"
                cy="14"
                r="10"
                fill="none"
                stroke={ringBlue}
                strokeWidth="2"
                strokeDasharray="3.2 4.2"
                strokeLinecap="round"
                className="sa-cursor-dashed-orbit"
              />
            </svg>
          )}

          {/* Main Vector Cursor Body with snappy press feedback */}
          <div
            className={`transition-transform duration-120 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-left drop-shadow-[0_2px_5px_rgba(0,0,0,0.42)] ${
              isPressed ? 'scale-[0.84]' : cursorKind === 'pointer' ? 'scale-[1.03]' : 'scale-100'
            }`}
          >
            {renderCursorSvg(cursorKind, accentBlue)}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCursorSvg(kind: CustomCursorKind, accentBlue: string) {
  const ink = '#181c22';

  switch (kind) {
    case 'default':
      // Rounded geometric arrow with sky-blue lower chevron accent (Row 1 Col 1)
      return (
        <svg width="30" height="32" viewBox="0 0 30 32" fill="none">
          {/* Subtle outer light halo for dark mode legibility */}
          <path
            d="M4.2 3.2C3.7 2.9 3.1 3.3 3.2 3.9L7.4 25.4C7.6 26.2 8.6 26.5 9.2 25.9L14.2 20.8C14.7 20.3 15.3 20 16 19.8L24.7 17.7C25.5 17.5 25.7 16.4 25 15.9L4.2 3.2Z"
            stroke="rgba(255,255,255,0.48)"
            strokeWidth="4.2"
            strokeLinejoin="round"
          />
          {/* White body */}
          <path
            d="M4.2 3.2C3.7 2.9 3.1 3.3 3.2 3.9L7.4 25.4C7.6 26.2 8.6 26.5 9.2 25.9L14.2 20.8C14.7 20.3 15.3 20 16 19.8L24.7 17.7C25.5 17.5 25.7 16.4 25 15.9L4.2 3.2Z"
            fill="#FFFFFF"
          />
          {/* Sky-blue lower-right diagonal chevron shading */}
          <path
            d="M7.6 18.8L8.1 25.2C8.2 25.9 8.9 26.1 9.4 25.6L14.2 20.8C14.7 20.3 15.3 20 16 19.8L24.5 17.7C25.2 17.5 25.4 16.7 24.9 16.1L19.6 13L13.1 14.9L7.6 18.8Z"
            fill={accentBlue}
          />
          {/* Crisp thick rounded dark outline */}
          <path
            d="M4.2 3.2C3.7 2.9 3.1 3.3 3.2 3.9L7.4 25.4C7.6 26.2 8.6 26.5 9.2 25.9L14.2 20.8C14.7 20.3 15.3 20 16 19.8L24.7 17.7C25.5 17.5 25.7 16.4 25 15.9L4.2 3.2Z"
            stroke={ink}
            strokeWidth="2.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'pointer':
      // Rounded pointing hand with sky-blue wrist/heel accent (Row 2 Col 1)
      return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M8.5 5.2C7.4 5.2 6.6 6 6.6 7.1C6.6 7.6 6.8 8.1 7.1 8.5L13.3 15.2L10.8 16.2C9.5 16.7 8.9 18.1 9.5 19.4C9.9 20.3 10.8 20.9 11.7 21.1L14.7 24.4C17.2 27.1 21.3 27.4 24.2 25C27.1 22.6 27.5 18.3 25 15.4L22.2 12.1C21.5 11.3 20.3 11.1 19.4 11.7C19.3 10.6 18.3 9.7 17.1 9.9C16.7 9.9 16.4 10.1 16.1 10.3C15.9 9.2 14.9 8.4 13.7 8.6C13.3 8.6 12.9 8.8 12.6 9.1L10 6C9.6 5.5 9.1 5.2 8.5 5.2Z"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 5.2C7.4 5.2 6.6 6 6.6 7.1C6.6 7.6 6.8 8.1 7.1 8.5L13.3 15.2L10.8 16.2C9.5 16.7 8.9 18.1 9.5 19.4C9.9 20.3 10.8 20.9 11.7 21.1L14.7 24.4C17.2 27.1 21.3 27.4 24.2 25C27.1 22.6 27.5 18.3 25 15.4L22.2 12.1C21.5 11.3 20.3 11.1 19.4 11.7C19.3 10.6 18.3 9.7 17.1 9.9C16.7 9.9 16.4 10.1 16.1 10.3C15.9 9.2 14.9 8.4 13.7 8.6C13.3 8.6 12.9 8.8 12.6 9.1L10 6C9.6 5.5 9.1 5.2 8.5 5.2Z"
            fill="#FFFFFF"
          />
          {/* Sky-blue wrist/heel shading */}
          <path
            d="M15.8 23.2C18.6 22.8 22.1 20.1 24.2 16.3L25.4 17.7C26.9 20.1 26.4 23.2 24.2 25C21.8 27 18.2 27 15.8 24.8L14.6 23.5L15.8 23.2Z"
            fill={accentBlue}
          />
          {/* Hand outline & finger creases */}
          <path
            d="M8.5 5.2C7.4 5.2 6.6 6 6.6 7.1C6.6 7.6 6.8 8.1 7.1 8.5L13.3 15.2L10.8 16.2C9.5 16.7 8.9 18.1 9.5 19.4C9.9 20.3 10.8 20.9 11.7 21.1L14.7 24.4C17.2 27.1 21.3 27.4 24.2 25C27.1 22.6 27.5 18.3 25 15.4L22.2 12.1C21.5 11.3 20.3 11.1 19.4 11.7C19.3 10.6 18.3 9.7 17.1 9.9C16.7 9.9 16.4 10.1 16.1 10.3C15.9 9.2 14.9 8.4 13.7 8.6C13.3 8.6 12.9 8.8 12.6 9.1L10 6C9.6 5.5 9.1 5.2 8.5 5.2Z"
            stroke={ink}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.6 9.1L15.5 12.5M16.1 10.3L18.5 13.1M19.4 11.7L21.3 13.9"
            stroke={ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'text':
      // Crisp rounded I-beam with light halo for dark & light theme contrast (Row 5 Col 1)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M10.5 6.5H17.5M10.5 21.5H17.5M14 6.5V21.5"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="4.4"
            strokeLinecap="round"
          />
          <path
            d="M10.5 6.5H17.5M10.5 21.5H17.5M14 6.5V21.5"
            stroke={ink}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line x1="12" y1="14" x2="16" y2="14" stroke={accentBlue} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'progress':
      // Animated 12-tick blue radial spinner (Row 5 Col 2)
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className="sa-cursor-spinner-rotate"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const opacity = 0.18 + (i / 11) * 0.82;
            return (
              <line
                key={angle}
                x1="14"
                y1="4.2"
                x2="14"
                y2="8.2"
                stroke={accentBlue}
                strokeWidth="2.3"
                strokeLinecap="round"
                opacity={opacity}
                transform={`rotate(${angle} 14 14)`}
              />
            );
          })}
        </svg>
      );

    case 'wait':
      // Animated hourglass with sky-blue sand (Row 3 Cols 3-4)
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          className="sa-cursor-hourglass-flip"
        >
          <path
            d="M8.5 5.5H19.5V8.4C19.5 10.6 17.8 12.5 15.8 14C17.8 15.5 19.5 17.4 19.5 19.6V22.5H8.5V19.6C8.5 17.4 10.2 15.5 12.2 14C10.2 12.5 8.5 10.6 8.5 8.4V5.5Z"
            fill="#FFFFFF"
          />
          <path
            d="M10.2 21.8C10.4 19.8 12.1 18.4 14 17.2C15.9 18.4 17.6 19.8 17.8 21.8H10.2Z"
            fill={accentBlue}
          />
          <path
            d="M11 8.5H17C16.7 10.2 15.5 11.4 14 12.4C12.5 11.4 11.3 10.2 11 8.5Z"
            fill={accentBlue}
          />
          <path
            d="M7.5 5.5H20.5M7.5 22.5H20.5M9 5.5V8.4C9 10.7 10.7 12.6 12.8 14C10.7 15.4 9 17.3 9 19.6V22.5M19 5.5V8.4C19 10.7 17.3 12.6 15.2 14C17.3 15.4 19 17.3 19 19.6V22.5"
            stroke={ink}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'zoom-in':
      // Magnifying glass with sky-blue + (Row 3 Col 1)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="12.5" cy="12.5" r="7" fill="#FFFFFF" stroke={ink} strokeWidth="2.2" />
          <path d="M17.8 17.8L23 23" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M12.5 9.6V15.4M9.6 12.5H15.4" stroke={accentBlue} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'zoom-out':
      // Magnifying glass with sky-blue - (Row 3 Col 2)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="12.5" cy="12.5" r="7" fill="#FFFFFF" stroke={ink} strokeWidth="2.2" />
          <path d="M17.8 17.8L23 23" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M9.6 12.5H15.4" stroke={accentBlue} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'move':
      // 4-way rounded arrows (Row 4 Col 1)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 5V23M5 14H23"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path d="M14 5V23M5 14H23" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M14 3.5L11.5 7H16.5L14 3.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 24.5L11.5 21H16.5L14 24.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3.5 14L7 11.5V16.5L3.5 14Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M24.5 14L21 11.5V16.5L24.5 14Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'ns-resize':
      // Vertical double arrow (Row 4 Col 2)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 5.5V22.5" stroke="rgba(255,255,255,0.65)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M14 5.5V22.5" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M14 3.5L11 7.5H17L14 3.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 24.5L11 20.5H17L14 24.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'ew-resize':
      // Horizontal double arrow (Row 4 Col 3)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5.5 14H22.5" stroke="rgba(255,255,255,0.65)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M5.5 14H22.5" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M3.5 14L7.5 11V17L3.5 14Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M24.5 14L20.5 11V17L24.5 14Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'nesw-resize':
      // Diagonal double arrow NE-SW (Row 4 Col 4)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M7.5 20.5L20.5 7.5" stroke="rgba(255,255,255,0.65)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M7.5 20.5L20.5 7.5" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M22.5 5.5L17 6.8L21.2 11L22.5 5.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M5.5 22.5L6.8 17L11 21.2L5.5 22.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'nwse-resize':
      // Diagonal double arrow NW-SE
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M7.5 7.5L20.5 20.5" stroke="rgba(255,255,255,0.65)" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M7.5 7.5L20.5 20.5" stroke={ink} strokeWidth="2.1" strokeLinecap="round" />
          <path d="M5.5 5.5L11 6.8L6.8 11L5.5 5.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M22.5 22.5L17 21.2L21.2 17L22.5 22.5Z" fill="#FFFFFF" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'not-allowed':
      // Circle with sky-blue diagonal slash (Row 5 Col 3)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="8" fill="#FFFFFF" stroke={ink} strokeWidth="2.2" />
          <line x1="8.6" y1="8.6" x2="19.4" y2="19.4" stroke={accentBlue} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 'help':
      // Rounded question mark (Row 5 Col 4)
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M10.8 10.2C10.8 8.3 12.2 6.8 14.1 6.8C16 6.8 17.4 8.2 17.4 10C17.4 11.4 16.4 12.3 15.1 13.1C14.2 13.7 14 14.3 14 15.5V16.4"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <path
            d="M10.8 10.2C10.8 8.3 12.2 6.8 14.1 6.8C16 6.8 17.4 8.2 17.4 10C17.4 11.4 16.4 12.3 15.1 13.1C14.2 13.7 14 14.3 14 15.5V16.4"
            stroke={ink}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="14" cy="20.2" r="1.6" fill={accentBlue} stroke={ink} strokeWidth="1.2" />
        </svg>
      );
  }
}
