import React from 'react';
import {usePalette} from './palette';

// SVG accents that draw themselves on (stroke-dashoffset with pathLength=1).
// Drawn in real pixel coordinates so stroke weight stays even on any word shape.

/** Hand-drawn loop in a 0–100 box; the end overshoots the start like a marker would. */
const CIRCLE: Array<[string, number[]]> = [
  ['M', [56, 7]],
  ['C', [84, 6, 99, 24, 98, 50]],
  ['C', [97, 79, 75, 95, 48, 94]],
  ['C', [20, 93, 2, 76, 3, 49]],
  ['C', [4, 23, 24, 5, 61, 10]],
];

const scalePath = (cmds: Array<[string, number[]]>, w: number, h: number) =>
  cmds
    .map(([c, n]) => `${c} ${n.map((v, i) => ((i % 2 === 0 ? v * w : v * h) / 100).toFixed(1)).join(' ')}`)
    .join(' ');

export type AccentKind = 'underline' | 'strike' | 'circle';

export const Accent: React.FC<{
  kind: AccentKind;
  /** draw progress 0→1 */
  p: number;
  fontSize: number;
  /** width of the accented text in px */
  width: number;
  /** extend to the right (em) to join the next word's accent */
  extendRight?: number;
}> = ({kind, p, fontSize, width, extendRight = 0}) => {
  const pal = usePalette();
  if (p <= 0 || width <= 0) return null;
  const common = {
    fill: 'none',
    stroke: pal.text,
    strokeLinecap: 'round' as const,
    pathLength: 1,
    strokeDasharray: '1 1',
    strokeDashoffset: 1 - p,
  };

  if (kind === 'circle') {
    const padX = fontSize * 0.24;
    const w = width + padX * 2;
    const h = fontSize * 1.16;
    const sw = Math.max(3, fontSize * 0.035);
    return (
      <svg width={w} height={h} style={{position: 'absolute', left: -padX, top: -fontSize * 0.04, overflow: 'visible'}}>
        <path d={scalePath(CIRCLE, w, h)} {...common} strokeWidth={sw} />
      </svg>
    );
  }

  const sw = Math.max(3, fontSize * (kind === 'strike' ? 0.065 : 0.05));
  const over = kind === 'strike' ? fontSize * 0.06 : 0;
  const w = width + extendRight * fontSize + over * 2;
  const top = fontSize * (kind === 'underline' ? 1.06 : 0.56);
  return (
    <svg width={w} height={sw} style={{position: 'absolute', left: -over, top: top - sw / 2, overflow: 'visible'}}>
      <path d={`M ${sw / 2} ${sw / 2} L ${w - sw / 2} ${sw / 2}`} {...common} strokeWidth={sw} />
    </svg>
  );
};
