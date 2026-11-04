import React from 'react';
import {theme} from '../../config/theme';
import {ease, lerp, prog} from '../../engine/motion';
import type {VisualConfig} from '../../engine/types';
import {MotionBlur} from '../MotionBlur';
import {Avatar, Card, Caret, Check, Chip, Logo, card, itemIn, sec, typed} from './ui';

type InputV = Extract<VisualConfig, {type: 'input'}>;
type KnowledgeV = Extract<VisualConfig, {type: 'knowledge'}>;
type LeadListV = Extract<VisualConfig, {type: 'leadList'}>;
type ProgramsV = Extract<VisualConfig, {type: 'programs'}>;

const font = {fontFamily: `"${theme.type.family}"`};

/** Command bar: logo + typed text. */
export const Input: React.FC<{v: InputV; tv: number}> = ({v, tv}) => {
  const {shown, done} = typed(v.text, tv, 12, v.cps ?? 18);
  return (
    <div
      style={{
        ...font,
        width: 900,
        height: 140,
        borderRadius: 70,
        background: 'linear-gradient(180deg, #161616, #0C0C0C)',
        border: '1.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 120px rgba(255,255,255,0.08), 0 40px 90px rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '0 44px',
        boxSizing: 'border-box',
        color: '#F2F2F2',
      }}
    >
      <Logo size={64} />
      <span style={{fontSize: 54, fontWeight: 500, letterSpacing: '-0.03em', whiteSpace: 'nowrap'}}>
        {shown}
        <Caret t={tv} color="#F2F2F2" height={56} solid={!done} />
      </span>
    </div>
  );
};

/** Progress ring that fills to 100% while a counter counts up. */
const Ring: React.FC<{p: number; size: number}> = ({p, size}) => {
  const r = 42;
  const C = 2 * Math.PI * r;
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: 'rotate(-90deg)'}}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E2E2" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.24,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(p * 100)}%
      </div>
    </div>
  );
};

/** "Learns your business": programmes, pricing, FAQs, voice — each row checks off. */
export const Knowledge: React.FC<{v: KnowledgeV; tv: number}> = ({v, tv}) => {
  const c = card('light');
  const rowStart = (i: number) => 14 + i * 8;
  const ring = prog(tv, 10, rowStart(v.rows.length) + 10, ease.inOutSoft);
  return (
    <Card tone="light" width={940} padding={44} style={font}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <Logo size={44} tone="light" />
        <span style={{fontSize: 30, fontWeight: 700}}>{v.title}</span>
        <span style={{flex: 1}} />
        {v.tag ? (
          <Chip tone="light" size={20}>
            {v.tag}
          </Chip>
        ) : null}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, margin: '34px 0 26px'}}>
        <Ring p={ring} size={150} />
        <div>
          <div style={{fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em'}}>{ring >= 1 ? 'Ready.' : 'Learning…'}</div>
          <div style={{fontSize: 25, color: c.muted, marginTop: 6}}>{v.ringLabel}</div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {v.rows.map((r, i) => {
          const s = rowStart(i);
          const chip = prog(tv, s + 8, 12, ease.out);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 0', borderTop: `1.5px solid ${c.border}`, ...itemIn(tv, s, 20)}}>
              <span style={{width: 150, fontSize: 21, fontWeight: 600, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.06em'}}>{r.label}</span>
              <span style={{flex: 1, fontSize: 29, fontWeight: 600, letterSpacing: '-0.015em', whiteSpace: 'nowrap'}}>{r.value}</span>
              <span style={{opacity: chip, transform: `scale(${0.7 + 0.3 * chip})`}}>
                <Chip tone="light" filled size={20}>
                  <Check size={20} color="#F2F2F2" p={chip} stroke={0.16} />
                  {r.chip}
                </Chip>
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/** "Which leads should I call today?" — query types, ranked leads slide in. */
export const LeadList: React.FC<{v: LeadListV; tv: number}> = ({v, tv}) => {
  const c = card('light');
  const {shown, done} = typed(v.query, tv, 14, 34);
  const listStart = 14 + sec(v.query.length / 34) + 4;
  return (
    <Card tone="light" width={920} padding={46} style={{...font, textAlign: 'center'}}>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Logo size={76} tone="light" />
      </div>
      <div style={{fontSize: 46, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 18}}>{v.title}</div>
      <div style={{fontSize: 24, color: c.muted, marginTop: 4}}>{v.subtitle}</div>
      <div
        style={{
          marginTop: 30,
          padding: '22px 30px',
          borderRadius: 999,
          background: '#FFFFFF',
          border: `1.5px solid ${c.border}`,
          textAlign: 'left',
          fontSize: 30,
          fontWeight: 500,
          boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        }}
      >
        {shown}
        <Caret t={tv} color="#111" height={32} solid={!done} />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 22}}>
        {v.leads.map((l, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '18px 22px',
              borderRadius: 26,
              background: '#FFFFFF',
              border: `1.5px solid ${c.border}`,
              textAlign: 'left',
              ...itemIn(tv, listStart + i * 6, 26),
            }}
          >
            <Avatar letter={l.name[0]} size={56} i={i} />
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 29, fontWeight: 700}}>{l.name}</div>
              <div style={{fontSize: 22, color: c.muted, marginTop: 2, whiteSpace: 'nowrap'}}>
                <b style={{color: c.text}}>{l.score}</b> · {l.note}
              </div>
            </div>
            <Chip tone="light" filled size={22}>
              Call
            </Chip>
          </div>
        ))}
      </div>
    </Card>
  );
};

/** Program card that swaps in sync with the scene's {a|b|c} word swap. */
export const Programs: React.FC<{v: ProgramsV; t: number; changes: number[]}> = ({v, t, changes}) => {
  let cur = 0;
  while (cur < changes.length && t >= changes[cur]) cur++;
  cur = Math.min(cur, v.cards.length - 1);
  const p = cur === 0 ? 1 : prog(t, changes[cur - 1], 16, ease.inOut);
  const pPrev = cur === 0 ? 1 : prog(t - 1, changes[cur - 1], 16, ease.inOut);
  const vx = (p - pPrev) * 900;
  const render = (i: number, style: React.CSSProperties) => {
    const k = v.cards[i];
    const c = card('light');
    return (
      <MotionBlur vx={vx} style={{position: i === cur ? 'relative' : 'absolute', top: 0, left: 0, ...style}}>
        <Card tone="light" width={720} padding={44} style={font}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Logo size={46} tone="light" />
            <span style={{flex: 1}} />
            <Chip tone="light" size={19}>
              ● Live
            </Chip>
          </div>
          <div style={{fontSize: 50, fontWeight: 800, letterSpacing: '-0.035em', marginTop: 30}}>{k.title}</div>
          <div style={{fontSize: 26, color: c.muted, marginTop: 6}}>{k.meta}</div>
          <div style={{display: 'flex', gap: 12, marginTop: 28}}>
            {k.chips.map((ch, j) => (
              <Chip key={j} tone="light" filled={j === 0} size={21}>
                {ch}
              </Chip>
            ))}
          </div>
        </Card>
      </MotionBlur>
    );
  };
  return (
    <div style={{position: 'relative'}}>
      {cur > 0 && p < 1
        ? render(cur - 1, {transform: `translateX(${-p * 900}px) rotateY(${p * 30}deg)`, opacity: 1 - p})
        : null}
      {render(cur, {transform: `translateX(${(1 - p) * 900}px) rotateY(${-(1 - p) * 30}deg)`, opacity: lerp(0, 1, Math.min(1, p * 1.6))})}
    </div>
  );
};
