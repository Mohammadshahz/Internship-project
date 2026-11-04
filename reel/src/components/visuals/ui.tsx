import React from 'react';
import {theme} from '../../config/theme';
import {ease, prog} from '../../engine/motion';

// Shared building blocks for the UI mock-ups. Monochrome, soft, product-like.

export const FPS = theme.fps;
export const sec = (s: number) => Math.round(s * FPS);

export type Tone = 'dark' | 'light';
export const card = (tone: Tone) => theme.cards[tone];

/** Text typed out at `cps` characters per second, starting at frame `start`. */
export const typed = (text: string, t: number, start: number, cps = 26) => {
  const n = Math.max(0, Math.floor(((t - start) / FPS) * cps));
  return {shown: text.slice(0, n), done: n >= text.length};
};

/** Blinking text caret. */
export const Caret: React.FC<{t: number; color: string; height: number; solid?: boolean}> = ({t, color, height, solid}) => (
  <span
    style={{
      display: 'inline-block',
      width: Math.max(3, height * 0.07),
      height,
      marginLeft: height * 0.06,
      background: color,
      verticalAlign: 'middle',
      opacity: solid || Math.floor(t / 15) % 2 === 0 ? 1 : 0,
      borderRadius: 2,
    }}
  />
);

export const Card: React.FC<{tone: Tone; width: number; padding?: number; radius?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  tone,
  width,
  padding = 44,
  radius = 40,
  style,
  children,
}) => {
  const c = card(tone);
  return (
    <div
      style={{
        width,
        padding,
        boxSizing: 'border-box',
        borderRadius: radius,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.text,
        boxShadow:
          tone === 'light'
            ? '0 50px 120px rgba(0,0,0,0.45), 0 10px 30px rgba(0,0,0,0.18)'
            : '0 50px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Original brand mark: rounded tile with a four-point spark. */
export const Logo: React.FC<{size: number; tone?: Tone}> = ({size, tone = 'dark'}) => {
  const bg = tone === 'dark' ? '#F2F2F2' : '#0B0B0B';
  const fg = tone === 'dark' ? '#0B0B0B' : '#F2F2F2';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{flexShrink: 0, display: 'block'}}>
      <rect x="0" y="0" width="100" height="100" rx="28" fill={bg} />
      <path d="M50 16 C53 40 60 47 84 50 C60 53 53 60 50 84 C47 60 40 53 16 50 C40 47 47 40 50 16 Z" fill={fg} />
      <circle cx="76" cy="24" r="6.5" fill={fg} />
    </svg>
  );
};

const AVATAR_SHADES = ['#D9D9D9', '#A8A8A8', '#7A7A7A', '#C4C4C4', '#8F8F8F', '#B6B6B6'];
export const Avatar: React.FC<{letter: string; size: number; i?: number; ring?: string}> = ({letter, size, i = 0, ring}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: AVATAR_SHADES[i % AVATAR_SHADES.length],
      color: '#111',
      fontWeight: 700,
      fontSize: size * 0.42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 ${size * 0.08}px ${ring}` : undefined,
    }}
  >
    {letter}
  </div>
);

export const Chip: React.FC<{children: React.ReactNode; tone: Tone; filled?: boolean; size?: number; style?: React.CSSProperties}> = ({
  children,
  tone,
  filled,
  size = 24,
  style,
}) => {
  const c = card(tone);
  const fill = filled ? (tone === 'light' ? '#0E0E0E' : '#F2F2F2') : c.chip;
  const color = filled ? (tone === 'light' ? '#F2F2F2' : '#0E0E0E') : c.text;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.35,
        padding: `${size * 0.36}px ${size * 0.8}px`,
        borderRadius: 999,
        background: fill,
        color,
        fontSize: size,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        letterSpacing: '-0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Check mark that draws itself. */
export const Check: React.FC<{size: number; color: string; p: number; stroke?: number}> = ({size, color, p, stroke = 0.14}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', overflow: 'visible'}}>
    <path
      d="M5 12.5 L10 17 L19 7.5"
      fill="none"
      stroke={color}
      strokeWidth={24 * stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
    />
  </svg>
);

/** Small "pop in" for list items: returns style for an item entering at frame `start`. */
export const itemIn = (t: number, start: number, dist = 30): React.CSSProperties => {
  const p = prog(t, start, 16, ease.out);
  return {
    opacity: prog(t, start, 8, ease.linear),
    transform: `translateY(${(1 - p) * dist}px) scale(${0.96 + 0.04 * p})`,
    filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined,
  };
};
