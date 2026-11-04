import React from 'react';
import {spring} from 'remotion';
import {theme} from '../../config/theme';
import {ease, lerp, prog} from '../../engine/motion';
import type {TScene, VisualConfig} from '../../engine/types';
import {MotionBlur} from '../MotionBlur';
import {Avatars, Chips, Logo3D, Pill, Toggle} from './Bits';
import {Chat, Prompt} from './Chat';
import {Input, Knowledge, LeadList, Programs} from './Cards';
import {LeadWall} from './LeadWall';
import {Phone} from './Phone';
import {FPS, sec} from './ui';

const W = theme.width;
const H = theme.height;

/** Positions a visual, runs its entrance / exit, and renders the right mock-up. */
export const Visual: React.FC<{v: VisualConfig; t: number; scene: TScene}> = ({v, t, scene}) => {
  if (v.type === 'leadWall') return <LeadWall t={t} />;

  const start = sec(v.at ?? 0);
  const tv = t - start;
  if (tv < 0) return null;

  // Entrance
  const enter = v.enter ?? 'card';
  const p = prog(tv, 0, 26, ease.out);
  const pPrev = prog(tv - 1, 0, 26, ease.out);
  let transform = '';
  let opacity = prog(tv, 0, 10, ease.linear);
  let blur = 0;
  let vx = 0;
  let vy = 0;
  switch (enter) {
    case 'card':
      transform = `translateY(${(1 - p) * 170}px) rotateX(${(1 - p) * 26}deg) scale(${0.88 + 0.12 * p})`;
      vy = (p - pPrev) * 170;
      blur = (1 - p) * 12;
      break;
    case 'fromRight':
    case 'fromLeft': {
      const s = enter === 'fromRight' ? 1 : -1;
      transform = `translateX(${s * (1 - p) * 760}px) rotateY(${-s * (1 - p) * 28}deg)`;
      vx = (p - pPrev) * 760;
      break;
    }
    case 'pop': {
      const sp = spring({frame: tv, fps: FPS, config: {damping: 13, stiffness: 170, mass: 0.8}});
      transform = `scale(${lerp(0.5, 1, sp)})`;
      opacity = prog(tv, 0, 5, ease.linear);
      blur = (1 - Math.min(1, sp)) * 10;
      break;
    }
    case 'fade':
      opacity = prog(tv, 0, 14, ease.outSoft);
      blur = (1 - opacity) * 10;
      break;
    default:
      opacity = 1;
  }

  // Gentle hover once settled
  const float = Math.sin((t / FPS) * 1.3) * 5;

  // Exit
  if (v.out !== undefined) {
    const pe = prog(t, sec(v.out), 12, ease.in);
    opacity *= 1 - pe;
    blur += pe * 18;
    transform += ` scale(${1 - pe * 0.06})`;
  }
  if (opacity <= 0.001) return null;

  const x = (v.x ?? 0.5) * W;
  const y = (v.y ?? 0.62) * H;
  const anchorY = v.anchor === 'top' ? '0%' : '-50%';

  let body: React.ReactNode = null;
  switch (v.type) {
    case 'phone':
      body = <Phone v={v} tv={tv} />;
      break;
    case 'input':
      body = <Input v={v} tv={tv} />;
      break;
    case 'prompt':
      body = <Prompt v={v} tv={tv} />;
      break;
    case 'knowledge':
      body = <Knowledge v={v} tv={tv} />;
      break;
    case 'chat':
      body = <Chat v={v} t={t} />;
      break;
    case 'toggle':
      body = <Toggle v={v} t={t} />;
      break;
    case 'pill':
      body = <Pill v={v} t={t} tv={tv} />;
      break;
    case 'leadList':
      body = <LeadList v={v} tv={tv} />;
      break;
    case 'chips':
      body = <Chips v={v} t={t} tv={tv} />;
      break;
    case 'avatars':
      body = <Avatars v={v} tv={tv} />;
      break;
    case 'programs':
      body = <Programs v={v} t={t} changes={scene.slotChanges} />;
      break;
    case 'logo':
      body = <Logo3D v={v} tv={tv} />;
      break;
  }

  return (
    <div style={{position: 'absolute', left: x, top: y, width: 'max-content', transform: `translate(-50%, ${anchorY}) scale(${v.scale ?? 1})`, perspective: 1800}}>
      <MotionBlur vx={vx} vy={vy} blur={blur} style={{transform: `${transform} translateY(${float}px)`, opacity, transformOrigin: '50% 50%'}}>
        {body}
      </MotionBlur>
    </div>
  );
};
