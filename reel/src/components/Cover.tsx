import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {cover} from '../config/script';
import {useFontsReady} from '../engine/fonts';
import {computeTimeline} from '../engine/timeline';
import {Grain} from './Background';
import {Scene} from './Scene';

/** Static cover frame (Instagram thumbnail): the `cover` scene, fully revealed. */
export const Cover: React.FC = () => {
  const ready = useFontsReady();
  const scene = useMemo(() => computeTimeline([{...cover, beats: 40, camera: 'none', exit: 'none'}]).scenes[0], []);
  return (
    <AbsoluteFill>
      {ready ? <Scene scene={scene} t={600} /> : null}
      <Grain />
    </AbsoluteFill>
  );
};
