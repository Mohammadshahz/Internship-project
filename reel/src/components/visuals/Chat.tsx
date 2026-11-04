import React from 'react';
import {theme} from '../../config/theme';
import {clamp01, ease, prog} from '../../engine/motion';
import type {VisualConfig} from '../../engine/types';
import {Avatar, Card, Caret, Chip, FPS, Logo, card, itemIn, sec, typed} from './ui';

type ChatV = Extract<VisualConfig, {type: 'chat'}>;
type PromptV = Extract<VisualConfig, {type: 'prompt'}>;

const TYPING = 0.45; // seconds of "…" before an AI reply appears

const Dots: React.FC<{t: number; color: string}> = ({t, color}) => (
  <span style={{display: 'inline-flex', gap: 8, alignItems: 'center', height: 36}}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: color,
          opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t / 3.2 - i * 0.9)),
          transform: `translateY(${-4 * Math.max(0, Math.sin(t / 3.2 - i * 0.9))}px)`,
        }}
      />
    ))}
  </span>
);

/** Words fade up one by one (how an AI reply "streams"). */
const Stream: React.FC<{text: string; t: number; start: number}> = ({text, t, start}) => {
  const words = text.split(' ');
  const per = Math.max(1, Math.min(3, Math.round(sec(0.65) / words.length)));
  return (
    <>
      {words.map((w, i) => {
        const p = prog(t, start + i * per, 8, ease.out);
        return (
          <span key={i} style={{opacity: p, filter: p < 0.95 ? `blur(${(1 - p) * 5}px)` : undefined}}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

/** A DM conversation: lead question → AI typing → AI reply. */
export const Chat: React.FC<{v: ChatV; t: number}> = ({v, t}) => {
  const tone = v.light === false ? 'dark' : 'light';
  const c = card(tone);
  const aiBg = tone === 'light' ? '#0E0E0E' : '#F2F2F2';
  const aiFg = tone === 'light' ? '#F4F4F4' : '#0E0E0E';
  return (
    <Card tone={tone} width={900} padding={40} style={{fontFamily: `"${theme.type.family}"`}}>
      {v.header ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30}}>
          <Avatar letter={v.header.name[0]} size={52} />
          <span style={{fontSize: 30, fontWeight: 700}}>{v.header.name}</span>
          <span style={{flex: 1}} />
          {v.header.tag ? (
            <Chip tone={tone} size={20}>
              {v.header.tag}
            </Chip>
          ) : null}
        </div>
      ) : null}
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        {v.messages.map((m, i) => {
          const start = sec(m.at);
          if (t < start) return null;
          if (m.from === 'note') {
            return (
              <div key={i} style={{...itemIn(t, start, 16), fontSize: 24, color: c.muted, fontWeight: 600, letterSpacing: '0.01em'}}>
                {m.text}
              </div>
            );
          }
          const isAi = m.from === 'ai';
          const typingEnd = start + (isAi ? sec(TYPING) : 0);
          return (
            <div key={i} style={{display: 'flex', justifyContent: isAi ? 'flex-end' : 'flex-start', ...itemIn(t, start, 24)}}>
              <div
                style={{
                  maxWidth: 680,
                  padding: '20px 28px',
                  borderRadius: 30,
                  borderBottomRightRadius: isAi ? 8 : 30,
                  borderBottomLeftRadius: isAi ? 30 : 8,
                  background: isAi ? aiBg : c.chip,
                  color: isAi ? aiFg : c.text,
                  fontSize: 31,
                  lineHeight: 1.3,
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {isAi && t < typingEnd ? <Dots t={t} color={aiFg} /> : isAi ? <Stream text={m.text} t={t} start={typingEnd} /> : m.text}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/** Instruction box: "Reply like me…" typed out, send button lights up when done. */
export const Prompt: React.FC<{v: PromptV; tv: number}> = ({v, tv}) => {
  const {shown, done} = typed(v.text, tv, 10, v.cps ?? 30);
  const send = prog(tv, 10 + sec(v.text.length / (v.cps ?? 30)), 8, ease.out);
  return (
    <Card tone="dark" width={880} padding={46} radius={44} style={{fontFamily: `"${theme.type.family}"`, minHeight: 380, position: 'relative'}}>
      <Logo size={50} />
      <div style={{fontSize: 52, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.15, marginTop: 30, color: '#F2F2F2'}}>
        {shown}
        <Caret t={tv} color="#F2F2F2" height={54} solid={!done} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 40,
          bottom: 40,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: done ? '#F2F2F2' : '#2A2A2A',
          transform: `scale(${1 + 0.15 * Math.sin(clamp01(send) * Math.PI)})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={34} height={34} viewBox="0 0 24 24">
          <path d="M12 19 V5 M6 11 L12 5 L18 11" fill="none" stroke={done ? '#0E0E0E' : '#777'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Card>
  );
};

export {FPS};
