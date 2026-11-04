import React from 'react';
import {AbsoluteFill, interpolateColors, random, staticFile, useCurrentFrame} from 'remotion';
import {theme} from '../config/theme';
import type {Background as Bg, Glow} from '../engine/types';
import {paletteFor} from './palette';

export const bgColorAt = (bg: Bg, t: number) => {
  if (typeof bg === 'string') return theme.colors[bg];
  const a = (bg.at ?? 0) * theme.fps;
  const b = a + (bg.over ?? 0.5) * theme.fps;
  return interpolateColors(t, [a, b], [theme.colors[bg.from], theme.colors[bg.to]]);
};

/** Soft light pools (x, y in %, size in px) that breathe and drift slowly. */
const GLOWS: Record<Exclude<Glow, 'none'>, Array<[number, number, number]>> = {
  center: [[50, 46, 1300]],
  low: [[22, 88, 1100], [80, 82, 1000]],
  high: [[30, 16, 1000], [78, 22, 900]],
  corners: [[12, 14, 900], [90, 86, 1000]],
  split: [[14, 56, 900], [88, 40, 950]],
};

/** Brand colour + moving light + vignette. Reads as "lit", never as a gradient preset. */
export const SceneBackground: React.FC<{bg: Bg; t: number; glow: Glow}> = ({bg, t, glow}) => {
  const pal = paletteFor(bg, t);
  const d = theme.background.depth;
  const blobs = glow === 'none' ? [] : GLOWS[glow];
  const s = t / theme.fps;
  return (
    <AbsoluteFill style={{backgroundColor: bgColorAt(bg, t), overflow: 'hidden'}}>
      {blobs.map(([x, y, size], i) => {
        const dx = Math.sin(s * 0.45 + i * 2.1) * 60;
        const dy = Math.cos(s * 0.38 + i * 1.3) * 50;
        const breathe = 1 + Math.sin(s * 0.7 + i) * 0.06;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(${x}% - ${size / 2}px)`,
              top: `calc(${y}% - ${size / 2}px)`,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${pal.glow} 0%, rgba(0,0,0,0) 68%)`,
              transform: `translate(${dx}px, ${dy}px) scale(${breathe})`,
            }}
          />
        );
      })}
      {d > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 120% 85% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${pal.isLight ? d * 2.6 : d * 4}) 100%)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Animated film grain over everything (static tile, re-positioned every 2 frames). */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const g = theme.background.grain;
  if (g <= 0) return null;
  const seed = Math.floor(frame / 2);
  const x = Math.floor(random(`gx${seed}`) * 256);
  const y = Math.floor(random(`gy${seed}`) * 256);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('textures/grain.png')})`,
        backgroundPosition: `${x}px ${y}px`,
        backgroundSize: '256px 256px',
        opacity: g * 2,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};
