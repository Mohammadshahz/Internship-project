import {Easing, interpolate} from 'remotion';

// Cinematic easing curves.
export const ease = {
  /** Fast attack, long silky settle — the default for anything arriving. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Softer settle. */
  outSoft: Easing.bezier(0.22, 1, 0.36, 1),
  /** Accelerating exit. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Whip-pan / camera move. */
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  inOutSoft: Easing.bezier(0.65, 0, 0.35, 1),
  linear: (t: number) => t,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Progress 0→1 of an animation that starts at `start` and lasts `dur` frames. */
export const prog = (t: number, start: number, dur: number, fn: (x: number) => number = ease.out) =>
  dur <= 0 ? (t >= start ? 1 : 0) : fn(clamp01((t - start) / dur));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const mix = (from: number[], to: number[], p: number) => from.map((f, i) => lerp(f, to[i], p));

export {interpolate};
