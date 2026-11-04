import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {theme} from '../../config/theme';
import {ease, prog} from '../../engine/motion';
import {Avatar, card} from './ui';

// A wall of incoming DMs drifting in perspective behind the hook text.

const NAMES = ['Maya R.', 'Leo K.', 'Aisha B.', 'Tom W.', 'Nina S.', 'Ravi P.', 'Elle M.', 'Sam D.', 'Zoe H.', 'Kian A.'];
const MSGS = [
  'how much is coaching?',
  'is this for beginners?',
  'do you offer payment plans?',
  'saw your reel, how do I join?',
  'still taking clients?',
  'can I start Monday?',
  "what's included?",
  '1:1 or group?',
  'link please!',
  'price?',
];

const COLS = 5;
const ROWS = 14;
const CW = 340;
const CH = 168;
const GAP = 22;

export const LeadWall: React.FC<{t: number}> = ({t}) => {
  const c = card('dark');
  const drift = t * 0.9;
  return (
    <AbsoluteFill style={{perspective: 1600, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: COLS * (CW + GAP),
          transform: `translate(-50%, calc(-50% - ${drift}px)) rotateX(24deg) rotateZ(-7deg) scale(1.15)`,
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CW}px)`,
          gap: GAP,
        }}
      >
        {Array.from({length: COLS * ROWS}).map((_, i) => {
          const delay = Math.floor(random(`w${i}`) * 26);
          const p = prog(t, delay, 18, ease.out);
          const name = NAMES[(i * 7) % NAMES.length];
          const msg = MSGS[(i * 3) % MSGS.length];
          const hot = random(`h${i}`) > 0.72;
          const pulse = hot ? 0.55 + 0.45 * Math.sin(t / 6 + i) : 0.35;
          return (
            <div
              key={i}
              style={{
                height: CH,
                boxSizing: 'border-box',
                padding: '24px 26px',
                borderRadius: 26,
                background: c.bg,
                border: `1.5px solid ${c.border}`,
                opacity: p * (hot ? 1 : 0.75),
                transform: `scale(${0.9 + 0.1 * p})`,
                fontFamily: `"${theme.type.family}"`,
                position: 'relative',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <Avatar letter={name[0]} size={40} i={i} />
                <span style={{color: c.text, fontSize: 25, fontWeight: 600}}>{name}</span>
              </div>
              <div style={{color: c.muted, fontSize: 23, marginTop: 16, whiteSpace: 'nowrap'}}>{msg}</div>
              <div
                style={{
                  position: 'absolute',
                  right: 24,
                  top: 30,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#EDEDED',
                  opacity: pulse,
                  boxShadow: hot ? `0 0 ${14 * pulse}px rgba(255,255,255,0.8)` : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Darken the middle so the hook text always reads */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 32% at 50% ${theme.safe.centerY * 100}%, rgba(6,6,6,0.94) 0%, rgba(6,6,6,0.55) 60%, rgba(6,6,6,0.35) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
