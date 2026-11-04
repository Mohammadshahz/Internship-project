import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {audio} from '../config/audio';
import {script} from '../config/script';
import {theme} from '../config/theme';
import {useFontsReady} from '../engine/fonts';
import {computeTimeline} from '../engine/timeline';
import type {Timeline, TranscriptWord} from '../engine/types';
import {Grain} from './Background';
import {MotionBlur} from './MotionBlur';
import {Scene} from './Scene';
import {cutKick, transitionSides, type Side} from './transitions';

export type ReelProps = {
  /** Filled automatically from audio.voiceover.transcript by calculateMetadata. */
  transcript: TranscriptWord[] | null;
  /** Overlay Instagram UI-safe guides (Studio only — leave off for export). */
  showSafeZone: boolean;
};

export const Reel: React.FC<ReelProps> = ({transcript, showSafeZone}) => {
  const frame = useCurrentFrame();
  const ready = useFontsReady();
  const timeline = useMemo(() => computeTimeline(script, transcript), [transcript]);

  const visible = useMemo(() => {
    const out: Array<{index: number; t: number; side: Side; kick: string}> = [];
    const {scenes} = timeline;
    scenes.forEach((s, i) => {
      const pre = Math.ceil(s.transitionFrames / 2);
      const next = scenes[i + 1];
      const nextPre = next ? Math.ceil(next.transitionFrames / 2) : 0;
      const start = s.cut - pre;
      const end = next ? next.cut + (next.transitionFrames - nextPre) : s.cut + s.dur;
      if (frame < start || frame >= end) return;
      let side: Side = {style: {}, z: 0};
      if (s.transitionFrames > 0 && frame < start + s.transitionFrames) {
        side = transitionSides(s.transition, (frame - start) / s.transitionFrames, s.transitionFrames)[1];
      } else if (next && next.transitionFrames > 0 && frame >= next.cut - nextPre) {
        side = transitionSides(next.transition, (frame - (next.cut - nextPre)) / next.transitionFrames, next.transitionFrames)[0];
      }
      const kick = i > 0 && s.transition === 'cut' ? cutKick(frame - s.cut) : '';
      out.push({index: i, t: frame - s.cut, side, kick});
    });
    return out.sort((a, b) => a.side.z - b.side.z);
  }, [frame, timeline]);

  return (
    <AbsoluteFill style={{backgroundColor: theme.colors.black, overflow: 'hidden'}}>
      {ready
        ? visible.map(({index, t, side, kick}) => (
            <AbsoluteFill key={index}>
              <MotionBlur vx={side.vx} vy={side.vy} blur={side.blur} style={{position: 'absolute', inset: 0, ...side.style}}>
                <AbsoluteFill style={{transform: [side.inner, kick].filter(Boolean).join(' ') || undefined}}>
                  <Scene scene={timeline.scenes[index]} t={t} />
                </AbsoluteFill>
                {side.shade ? <AbsoluteFill style={{backgroundColor: '#000000', opacity: side.shade}} /> : null}
              </MotionBlur>
            </AbsoluteFill>
          ))
        : null}
      <Grain />
      <AudioLayer timeline={timeline} />
      {showSafeZone ? <SafeZone /> : null}
    </AbsoluteFill>
  );
};

// ─── Audio ──────────────────────────────────────────────────────────────────

const src = (path: string) => (/^https?:\/\//.test(path) ? path : staticFile(path));

const AudioLayer: React.FC<{timeline: Timeline}> = ({timeline}) => {
  const {fps, totalFrames} = timeline;
  const music = audio.music;
  const vo = audio.voiceover;
  return (
    <>
      {music ? (
        <Audio
          src={src(music.src)}
          loop={music.loop}
          trimBefore={Math.round(music.startFrom * fps) || undefined}
          volume={(f) =>
            (vo ? music.duckedVolume : music.volume) *
            interpolate(f, [0, music.fadeIn * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
            interpolate(f, [totalFrames - music.fadeOut * fps, totalFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          }
        />
      ) : null}
      {vo ? (
        <Sequence from={Math.round((vo.offset ?? 0) * fps)} layout="none">
          <Audio src={src(vo.src)} volume={vo.volume ?? 1} />
        </Sequence>
      ) : null}
      {timeline.sfx.map((s, i) => {
        const file = audio.sfx.library[s.name] ?? (s.name.includes('/') ? s.name : null);
        if (!file) return null;
        return (
          <Sequence key={i} from={s.frame} durationInFrames={fps * 2} layout="none">
            <Audio src={src(file)} volume={audio.sfx.volume * s.volume} />
          </Sequence>
        );
      })}
    </>
  );
};

const SafeZone: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: theme.safe.top, background: 'rgba(255,0,80,0.18)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: theme.safe.bottom, background: 'rgba(255,0,80,0.18)'}} />
    <div style={{position: 'absolute', right: 0, bottom: theme.safe.bottom, width: 130, height: 520, background: 'rgba(255,0,80,0.12)'}} />
    <div style={{position: 'absolute', left: theme.type.paddingX, right: theme.type.paddingX, top: 0, bottom: 0, outline: '2px dashed rgba(255,255,255,0.35)'}} />
  </AbsoluteFill>
);
