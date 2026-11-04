import React from 'react';
import {spring} from 'remotion';
import {theme} from '../../config/theme';
import {lerp, prog, ease} from '../../engine/motion';
import type {VisualConfig} from '../../engine/types';
import {FPS} from './ui';

type PhoneV = Extract<VisualConfig, {type: 'phone'}>;

const SHADES = ['#E6E6E6', '#B9B9B9', '#8C8C8C', '#CFCFCF', '#A3A3A3'];

/** Lock screen at night: clock + notifications stacking in. */
export const Phone: React.FC<{v: PhoneV; tv: number}> = ({v, tv}) => (
  <div
    style={{
      width: 560,
      height: 1080,
      borderRadius: 86,
      padding: 14,
      boxSizing: 'border-box',
      background: 'linear-gradient(160deg, #2A2A2A, #0C0C0C)',
      boxShadow: '0 60px 140px rgba(0,0,0,0.75), inset 0 0 0 2px rgba(255,255,255,0.08)',
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 74,
        overflow: 'hidden',
        position: 'relative',
        background: 'radial-gradient(120% 60% at 50% 0%, #2B2B2B 0%, #101010 45%, #050505 100%)',
        fontFamily: `"${theme.type.family}"`,
        color: '#F4F4F4',
      }}
    >
      {/* Dynamic island */}
      <div style={{position: 'absolute', top: 22, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 30, background: '#000'}} />
      <div style={{textAlign: 'center', marginTop: 120, fontSize: 30, fontWeight: 500, opacity: 0.7}}>{v.date}</div>
      <div style={{textAlign: 'center', fontSize: 190, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 6, fontVariantNumeric: 'tabular-nums'}}>
        {v.time}
      </div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 470, display: 'flex', flexDirection: 'column', gap: 16}}>
        {v.notifications.map((n, i) => {
          const start = 12 + i * 9;
          const s = spring({frame: tv - start, fps: FPS, config: {damping: 15, stiffness: 160, mass: 0.7}});
          const o = prog(tv, start, 6, ease.linear);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                padding: '22px 22px',
                borderRadius: 30,
                background: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.06)',
                opacity: o,
                transform: `translateY(${lerp(-50, 0, s)}px) scale(${lerp(0.9, 1, s)})`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: SHADES[i % SHADES.length],
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111',
                  fontWeight: 800,
                  fontSize: 26,
                }}
              >
                {n.title.replace(/^Missed · /, '')[0]}
              </div>
              <div style={{minWidth: 0}}>
                <div style={{fontSize: 25, fontWeight: 700}}>{n.title}</div>
                <div style={{fontSize: 23, opacity: 0.62, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
