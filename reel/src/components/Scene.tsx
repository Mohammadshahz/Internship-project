import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {theme} from '../config/theme';
import {fontSizeFor} from '../engine/measure';
import {clamp01, ease, prog} from '../engine/motion';
import type {TScene} from '../engine/types';
import {SceneBackground} from './Background';
import {TextLine} from './TextLine';
import {PaletteContext, paletteFor} from './palette';
import {Visual} from './visuals/Visual';

const W = theme.width;
const H = theme.height;

/**
 * One scene: background + camera + a laid-out stack of kinetic lines.
 * `t` is the frame relative to this scene's cut (negative during the incoming transition).
 */
export const Scene: React.FC<{scene: TScene; t: number}> = ({scene, t}) => {
  // Resolve sizes once per scene (fonts are loaded before we render).
  const metrics = useMemo(
    () =>
      scene.lines.map((l) => {
        const maxTracking = l.tracking + Math.max(0, l.drift.tracking ?? 0);
        const fs = l.enter === 'marquee' ? (typeof l.size === 'number' ? l.size : 300) : fontSizeFor(l.words, l.size, maxTracking);
        return {fs, h: fs * theme.type.lineHeight};
      }),
    [scene],
  );

  // Vertical layout (absolute, so lines can re-flow smoothly while the stack builds).
  const n = scene.lines.length;
  const reveal = scene.lines.map((l) => (scene.reflow ? prog(t, l.start, 20, ease.out) : 1));
  const tops: number[] = [];
  const top0 = theme.safe.top;
  const bottom0 = H - theme.safe.bottom;
  if (scene.layout === 'spread' && n > 1) {
    const first = top0 + metrics[0].h / 2;
    const last = bottom0 - metrics[n - 1].h / 2;
    metrics.forEach((m, i) => tops.push(first + ((last - first) * i) / (n - 1) - m.h / 2));
  } else {
    const heights = metrics.map((m, i) => m.h * reveal[i]);
    const total = heights.reduce((a, b) => a + b, 0);
    const fullTotal = metrics.reduce((a, m) => a + m.h, 0);
    let y =
      scene.layout === 'top'
        ? top0
        : scene.layout === 'bottom'
          ? bottom0 - fullTotal
          : H * scene.textY - (scene.reflow ? total : fullTotal) / 2;
    metrics.forEach((m, i) => {
      tops.push(y);
      y += scene.reflow ? heights[i] : m.h;
    });
  }

  // Camera
  const d = clamp01(t / Math.max(1, scene.dur));
  let camera = '';
  switch (scene.camera) {
    case 'push':
      camera = `scale(${1 + 0.045 * d})`;
      break;
    case 'pull':
      camera = `scale(${1.06 - 0.06 * d})`;
      break;
    case 'drift':
      camera = `translateY(${24 - 48 * d}px) scale(1.02)`;
      break;
    default:
      camera = '';
  }

  return (
    <PaletteContext.Provider value={paletteFor(scene.background, t)}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <SceneBackground bg={scene.background} t={t} glow={scene.glow} />
        <AbsoluteFill style={{transform: camera, transformOrigin: `50% ${scene.textY * 100}%`, fontFamily: `"${theme.type.family}"`}}>
          {scene.visuals.map((v, i) => (
            <Visual key={`v${i}`} v={v} t={t} scene={scene} />
          ))}
          {scene.lines.map((line, i) => (
            <TextLine key={i} line={line} t={t} fontSize={metrics[i].fs} top={tops[i]} height={metrics[i].h} sceneDur={scene.dur} />
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
    </PaletteContext.Provider>
  );
};

export {W, H};
