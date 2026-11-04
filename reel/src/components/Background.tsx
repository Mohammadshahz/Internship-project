import React from 'react';
import {AbsoluteFill, interpolateColors, random, staticFile, useCurrentFrame} from 'remotion';
import {theme} from '../config/theme';
import type {Background as Bg} from '../engine/types';

export const bgColorAt = (bg: Bg, t: number) => {
  if (typeof bg === 'string') return theme.colors[bg];
  const a = (bg.at ?? 0) * theme.fps;
  const b = a + (bg.over ?? 0.5) * theme.fps;
  return interpolateColors(t, [a, b], [theme.colors[bg.from], theme.colors[bg.to]]);
};

/** Flat brand colour with an optional, very soft light falloff (reads as "lit", not "gradient"). */
export const SceneBackground: React.FC<{bg: Bg; t: number}> = ({bg, t}) => {
  const d = theme.background.depth;
  return (
    <AbsoluteFill style={{backgroundColor: bgColorAt(bg, t)}}>
      {d > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 85% 55% at 50% 40%, rgba(255,255,255,${d * 0.9}) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 130% 90% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,10,${d * 2.2}) 100%)`,
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
