import React from 'react';
import {spring} from 'remotion';
import {theme} from '../../config/theme';
import {ease, lerp, prog} from '../../engine/motion';
import type {VisualConfig} from '../../engine/types';
import {MotionBlur} from '../MotionBlur';
import {usePalette} from '../palette';
import {Avatar, Check, FPS, Logo, sec} from './ui';

type ToggleV = Extract<VisualConfig, {type: 'toggle'}>;
type PillV = Extract<VisualConfig, {type: 'pill'}>;
type ChipsV = Extract<VisualConfig, {type: 'chips'}>;
type AvatarsV = Extract<VisualConfig, {type: 'avatars'}>;
type LogoV = Extract<VisualConfig, {type: 'logo'}>;

const font = {fontFamily: `"${theme.type.family}"`};

/** iOS-style switch that flips on. */
export const Toggle: React.FC<{v: ToggleV; t: number}> = ({v, t}) => {
  const pal = usePalette();
  const size = v.size ?? 110;
  const on = sec(v.onAt ?? (v.at ?? 0) + 0.5);
  const p = spring({frame: t - on, fps: FPS, config: {damping: 14, stiffness: 200, mass: 0.6}});
  const w = size * 1.85;
  const knob = size - 16;
  const trackOff = pal.isLight ? '#BDBDBD' : '#2E2E2E';
  const trackOn = pal.isLight ? '#0E0E0E' : '#F2F2F2';
  const knobOn = pal.isLight ? '#F2F2F2' : '#0E0E0E';
  return (
    <div style={{...font, display: 'flex', alignItems: 'center', gap: size * 0.32}}>
      <div
        style={{
          width: w,
          height: size,
          borderRadius: size,
          background: p > 0.5 ? trackOn : trackOff,
          transition: 'none',
          position: 'relative',
          boxShadow: p > 0.5 ? `0 0 ${size * 0.6}px ${pal.isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)'}` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8 + lerp(0, w - knob - 16, Math.min(1.05, p)),
            width: knob * (1 + 0.18 * Math.sin(Math.min(1, p) * Math.PI)),
            height: knob,
            borderRadius: knob,
            background: p > 0.5 ? knobOn : '#E9E9E9',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          }}
        />
      </div>
      {v.label ? (
        <div style={{color: pal.text}}>
          <div style={{fontSize: size * 0.4, fontWeight: 700, letterSpacing: '-0.02em'}}>{v.label}</div>
          <div style={{fontSize: size * 0.26, color: pal.muted, fontWeight: 600, marginTop: 2}}>{p > 0.5 ? 'ON · replying 24/7' : 'OFF'}</div>
        </div>
      ) : null}
    </div>
  );
};

/** Big glossy status pill ("Call booked" → "Enrolled") with a drawn check. */
export const Pill: React.FC<{v: PillV; t: number; tv: number}> = ({v, t, tv}) => {
  const swaps = (v.swapAt ?? []).map(sec);
  let cur = 0;
  while (cur < swaps.length && t >= swaps[cur]) cur++;
  cur = Math.min(cur, v.texts.length - 1);
  const p = cur === 0 ? 1 : prog(t, swaps[cur - 1], 12, ease.inOut);
  const checkStart = cur === 0 ? 10 : swaps[cur - 1] - sec(v.at ?? 0) + 4;
  const check = prog(tv, checkStart, 14, ease.out);
  const shine = ((tv % 70) / 70) * 1.6 - 0.3;
  const lineH = 110;
  const row = (i: number, y: number) => (
    <div style={{position: 'absolute', left: 0, top: 0, height: lineH, display: 'flex', alignItems: 'center', transform: `translateY(${y}px)`, whiteSpace: 'nowrap'}}>
      {v.texts[i]}
    </div>
  );
  return (
    <div
      style={{
        ...font,
        height: 190,
        padding: '0 70px 0 44px',
        borderRadius: 999,
        background: 'linear-gradient(100deg, #FFFFFF 0%, #DADADA 55%, #9E9E9E 100%)',
        boxShadow: '0 30px 90px rgba(0,0,0,0.35), 0 0 160px rgba(255,255,255,0.55), inset 0 2px 0 rgba(255,255,255,0.9)',
        display: 'flex',
        alignItems: 'center',
        gap: 34,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, rgba(255,255,255,0) ${shine * 100 - 12}%, rgba(255,255,255,0.75) ${shine * 100}%, rgba(255,255,255,0) ${shine * 100 + 12}%)`,
        }}
      />
      <div style={{width: 104, height: 104, borderRadius: '50%', background: '#0B0B0B', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
        <Check size={56} color="#F2F2F2" p={check} stroke={0.15} />
      </div>
      <div style={{position: 'relative', height: lineH, overflow: 'hidden', fontSize: 92, fontWeight: 800, letterSpacing: '-0.045em', color: '#0B0B0B', minWidth: 470}}>
        {cur > 0 && p < 1 ? row(cur - 1, -p * lineH) : null}
        {row(cur, (1 - p) * lineH)}
      </div>
    </div>
  );
};

/** Mode chips: one turns active. */
export const Chips: React.FC<{v: ChipsV; t: number; tv: number}> = ({v, t, tv}) => {
  const pal = usePalette();
  const act = sec(v.activeAt ?? (v.at ?? 0) + 0.6);
  return (
    <div style={{...font, display: 'flex', gap: 22}}>
      {v.items.map((item, i) => {
        const s = spring({frame: tv - i * 5, fps: FPS, config: {damping: 14, stiffness: 180}});
        const active = i === 0 && t >= act;
        const pulse = active ? prog(t, act, 14, ease.out) : 0;
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '22px 36px',
              borderRadius: 999,
              fontSize: 36,
              fontWeight: 650,
              letterSpacing: '-0.015em',
              background: active ? (pal.isLight ? '#0E0E0E' : '#F2F2F2') : pal.isLight ? '#D0D0D0' : '#232323',
              color: active ? (pal.isLight ? '#F2F2F2' : '#0E0E0E') : pal.text,
              transform: `scale(${lerp(0.6, 1, s) * (1 + 0.06 * Math.sin(pulse * Math.PI))})`,
              opacity: Math.min(1, s * 1.5),
              boxShadow: active ? '0 0 60px rgba(255,255,255,0.3)' : undefined,
            }}
          >
            {i === 0 ? <span style={{width: 14, height: 14, borderRadius: '50%', background: active ? (pal.isLight ? '#F2F2F2' : '#0E0E0E') : pal.muted}} /> : null}
            {item}
          </div>
        );
      })}
    </div>
  );
};

/** Overlapping lead avatars popping in. */
export const Avatars: React.FC<{v: AvatarsV; tv: number}> = ({v, tv}) => {
  const pal = usePalette();
  return (
    <div style={{...font, display: 'flex'}}>
      {v.letters.map((l, i) => {
        const s = spring({frame: tv - i * 4, fps: FPS, config: {damping: 11, stiffness: 190, mass: 0.6}});
        return (
          <div key={i} style={{marginLeft: i ? -14 : 0, transform: `scale(${s})`, opacity: Math.min(1, s * 2)}}>
            <Avatar letter={l} size={110} i={i} ring={pal.isLight ? '#E6E6E6' : '#060606'} />
          </div>
        );
      })}
    </div>
  );
};

/** Logo tile with a glow, for the CTA. */
export const Logo3D: React.FC<{v: LogoV; tv: number}> = ({v, tv}) => {
  const size = v.size ?? 220;
  const glow = 0.5 + 0.5 * Math.sin(tv / 12);
  return (
    <MotionBlur style={{filter: `drop-shadow(0 0 ${40 + glow * 40}px rgba(255,255,255,${0.25 + glow * 0.15}))`}}>
      <Logo size={size} />
    </MotionBlur>
  );
};
