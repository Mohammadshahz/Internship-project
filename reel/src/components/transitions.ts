import type React from 'react';
import {theme} from '../config/theme';
import {ease, lerp, prog} from '../engine/motion';
import type {TransitionType} from '../engine/types';

const W = theme.width;
const H = theme.height;

/** What a transition does to one side (outgoing or incoming scene) at progress p. */
export interface Side {
  style: React.CSSProperties;
  /** velocity (px/frame) for directional motion blur */
  vx?: number;
  vy?: number;
  blur?: number;
  /** content parallax inside a clip */
  inner?: string;
  /** 0–1 dark wash over the scene (depth during push/panel) */
  shade?: number;
  /** drawn above the other scene? */
  z: number;
}

const v = (fn: (x: number) => number, p: number, T: number, dist: number) => (fn(Math.min(1, p + 1 / T)) - fn(p)) * dist;

/**
 * Transition presentations. p = 0 → 1 across the transition window (centered on the cut).
 * Returns [outgoing, incoming].
 */
export function transitionSides(type: TransitionType, p: number, T: number): [Side, Side] {
  const e = ease.inOut(p);
  switch (type) {
    case 'whip':
    case 'whipLeft':
    case 'whipRight': {
      const s = type === 'whipRight' ? 1 : -1;
      const vx = v(ease.inOut, p, T, W);
      return [
        {style: {transform: `translateX(${s * e * W}px)`}, vx, z: 0},
        {style: {transform: `translateX(${-s * (1 - e) * W}px)`}, vx, z: 1},
      ];
    }
    case 'whipUp':
    case 'whipDown': {
      const s = type === 'whipDown' ? 1 : -1;
      const vy = v(ease.inOut, p, T, H);
      return [
        {style: {transform: `translateY(${s * e * H}px)`}, vy, z: 0},
        {style: {transform: `translateY(${-s * (1 - e) * H}px)`}, vy, z: 1},
      ];
    }
    case 'push': {
      const vx = v(ease.inOut, p, T, W);
      return [
        {style: {transform: `translateX(${-e * W * 0.32}px) scale(${lerp(1, 0.96, e)})`}, vx: vx * 0.32, shade: e * 0.45, z: 0},
        {style: {transform: `translateX(${(1 - e) * W}px)`}, vx, z: 1},
      ];
    }
    case 'panel':
    case 'panelUp':
    case 'panelDown':
    case 'panelLeft':
    case 'panelRight': {
      const dir = type === 'panel' ? 'panelUp' : type;
      const vertical = dir === 'panelUp' || dir === 'panelDown';
      const sign = dir === 'panelUp' || dir === 'panelLeft' ? 1 : -1; // incoming comes from +side
      const dist = vertical ? H : W;
      const clip =
        dir === 'panelUp'
          ? `inset(${(1 - e) * 100}% 0 0 0)`
          : dir === 'panelDown'
            ? `inset(0 0 ${(1 - e) * 100}% 0)`
            : dir === 'panelLeft'
              ? `inset(0 0 0 ${(1 - e) * 100}%)`
              : `inset(0 ${(1 - e) * 100}% 0 0)`;
      const axis = vertical ? 'Y' : 'X';
      return [
        {style: {transform: `translate${axis}(${-sign * e * dist * 0.28}px)`}, shade: e * 0.35, z: 0},
        {style: {clipPath: clip}, inner: `translate${axis}(${sign * (1 - e) * dist * 0.28}px)`, z: 1},
      ];
    }
    case 'zoom': {
      const pin = ease.in(p);
      const pout = prog(p, 0, 1, ease.out);
      return [
        {style: {transform: `scale(${1 + pin * pin * 3.2})`, opacity: 1 - prog(p, 0.45, 0.4, ease.linear)}, blur: pin * 22, z: 1},
        {style: {transform: `scale(${lerp(0.62, 1, pout)})`, opacity: prog(p, 0.2, 0.5, ease.linear)}, blur: (1 - pout) * 14, z: 0},
      ];
    }
    case 'iris': {
      const R = Math.hypot(W, H) * 0.62;
      return [
        {style: {transform: `scale(${lerp(1, 0.94, e)})`}, shade: e * 0.3, z: 0},
        {style: {clipPath: `circle(${e * R}px at 50% ${theme.safe.centerY * 100}%)`}, inner: `scale(${lerp(1.12, 1, e)})`, z: 1},
      ];
    }
    case 'dissolve':
      return [
        {style: {}, blur: e * 14, z: 0},
        {style: {opacity: e}, blur: (1 - e) * 14, z: 1},
      ];
    case 'cut':
    default:
      return [
        {style: {}, z: 0},
        {style: {}, z: 1},
      ];
  }
}

/** Little scale "kick" on hard cuts so they feel cut to the beat, not just switched. */
export const cutKick = (t: number) => (t >= 0 && t < 12 ? `scale(${lerp(1.065, 1, prog(t, 0, 12, ease.out))})` : '');
