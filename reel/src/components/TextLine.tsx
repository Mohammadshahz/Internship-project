import React from 'react';
import {spring} from 'remotion';
import {theme} from '../config/theme';
import {trackingFor, counterEm, textEm, wordsEm} from '../engine/measure';
import {clamp01, ease, lerp, prog} from '../engine/motion';
import type {CounterPart, Part, SlotPart, TLine, Word} from '../engine/types';
import {Accent} from './Accent';
import {MotionBlur} from './MotionBlur';

const W = theme.width;
const H = theme.height;

/** Overflow mask with breathing room so ascenders/descenders/italics never clip. */
const MASK: React.CSSProperties = {
  display: 'inline-block',
  overflow: 'hidden',
  padding: '0.14em 0.08em 0.24em',
  margin: '-0.14em -0.08em -0.24em',
  verticalAlign: 'top',
};

const MASKED_ENTERS = new Set(['rise', 'mask', 'chars']);
const MASKED_EXITS = new Set(['up', 'down']);

interface Ctx {
  t: number;
  fs: number;
  tracking: number;
  line: TLine;
}

// ─── Parts ──────────────────────────────────────────────────────────────────

const textStyle = (p: Part, tracking: number): React.CSSProperties => ({
  fontWeight: p.weight,
  fontStyle: p.italic ? 'italic' : 'normal',
  letterSpacing: `${trackingFor(p.weight) + tracking}em`,
});

const WordsInline: React.FC<{words: Word[]; ctx: Ctx; ghost?: boolean}> = ({words, ctx, ghost}) => (
  <span style={{display: 'inline-flex', columnGap: `${theme.type.wordGap}em`}}>
    {words.map((w, i) => (
      <span key={i} style={{display: 'inline-block', position: 'relative'}}>
        {w.parts.map((p, j) => (
          <PartView key={j} part={p} ctx={ctx} wordStart={ctx.line.start} ghost={ghost} />
        ))}
      </span>
    ))}
  </span>
);

/** {a|b|c} — options roll vertically through a mask while the width morphs. */
const Slot: React.FC<{part: SlotPart; ctx: Ctx; ghost?: boolean}> = ({part, ctx, ghost}) => {
  const {t, fs, tracking, line} = ctx;
  const changes = line.slotChanges;
  let cur = 0;
  while (cur < changes.length && t >= changes[cur]) cur++;
  const ROLL = 13;
  const p = cur === 0 ? 1 : prog(t, changes[cur - 1], ROLL, ease.inOut);
  const pPrev = cur === 0 ? 1 : prog(t - 1, changes[cur - 1], ROLL, ease.inOut);
  const widths = part.options.map((o) => wordsEm(o, tracking) * fs);
  const prev = Math.max(0, cur - 1);
  const width = cur === 0 ? widths[0] : lerp(widths[prev], widths[cur], p);
  const travel = fs * 1.2;
  const vy = (p - pPrev) * travel;
  return (
    <span style={{...MASK, width, position: 'relative', textAlign: 'left'}}>
      {cur > 0 && p < 1 ? (
        <MotionBlur vy={vy} style={{position: 'absolute', left: '0.08em', top: '0.14em', transform: `translateY(${-p * travel}px)`}}>
          <WordsInline words={part.options[prev]} ctx={ctx} ghost={ghost} />
        </MotionBlur>
      ) : null}
      <MotionBlur vy={cur > 0 ? vy : 0} style={{display: 'inline-block', transform: `translateY(${(1 - p) * travel}px)`}}>
        <WordsInline words={part.options[Math.min(cur, part.options.length - 1)]} ctx={ctx} ghost={ghost} />
      </MotionBlur>
    </span>
  );
};

/** {#0..365} — counts up with an expo settle; tabular digits so nothing jitters. */
const Counter: React.FC<{part: CounterPart; ctx: Ctx; wordStart: number}> = ({part, ctx, wordStart}) => {
  const p = prog(ctx.t, wordStart + 4, ctx.line.countFrames, ease.outSoft);
  const v = lerp(part.from, part.to, p);
  return (
    <span
      style={{
        ...textStyle(part, ctx.tracking),
        display: 'inline-block',
        width: counterEm(part, ctx.tracking) * ctx.fs,
        textAlign: 'center',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {v.toFixed(part.decimals)}
    </span>
  );
};

const PartView: React.FC<{part: Part; ctx: Ctx; wordStart: number; ghost?: boolean; extendRight?: number}> = ({
  part,
  ctx,
  wordStart,
  ghost,
  extendRight,
}) => {
  if (part.kind === 'slot') return <Slot part={part} ctx={ctx} ghost={ghost} />;
  if (part.kind === 'counter') return <Counter part={part} ctx={ctx} wordStart={wordStart} />;

  const style = textStyle(part, ctx.tracking);
  const accentStart = wordStart + 14;
  const accentP = prog(ctx.t, accentStart, 18, ease.out);
  const hasAccent = part.underline || part.strike || part.circle;

  if (ghost) {
    const width = textEm(part.text, part, ctx.tracking) * ctx.fs;
    // Invisible copy that hosts the SVG accents outside the reveal mask.
    return (
      <span style={{...style, position: 'relative', color: 'transparent'}}>
        {part.text}
        {part.underline ? <Accent kind="underline" p={accentP} fontSize={ctx.fs} width={width} extendRight={extendRight} /> : null}
        {part.strike ? <Accent kind="strike" p={accentP} fontSize={ctx.fs} width={width} /> : null}
        {part.circle ? <Accent kind="circle" p={accentP} fontSize={ctx.fs} width={width} /> : null}
      </span>
    );
  }

  if (ctx.line.enter === 'chars') {
    // Letter cascade: each glyph rises out of its own mask.
    return (
      <span style={style}>
        {[...part.text].map((ch, i) => {
          const tc = ctx.t - wordStart - i * 1.3;
          const pc = prog(tc, 0, 16, ease.out);
          const pcPrev = prog(tc - 1, 0, 16, ease.out);
          return (
            <span key={i} style={{...MASK, padding: '0.14em 0.02em 0.24em', margin: '-0.14em -0.02em -0.24em'}}>
              <MotionBlur vy={(pc - pcPrev) * ctx.fs * 1.15} style={{display: 'inline-block', transform: `translateY(${(1 - pc) * 115}%)`}}>
                {ch === ' ' ? ' ' : ch}
              </MotionBlur>
            </span>
          );
        })}
      </span>
    );
  }
  return <span style={{...style, opacity: hasAccent && part.strike ? lerp(1, 0.55, accentP) : 1}}>{part.text}</span>;
};

// ─── Word ───────────────────────────────────────────────────────────────────

const WordView: React.FC<{word: Word; index: number; ctx: Ctx; start: number; joinNext: boolean}> = ({
  word,
  index,
  ctx,
  start,
  joinNext,
}) => {
  const {t, fs, line} = ctx;
  const tw = t - start;
  const masked = MASKED_ENTERS.has(line.enter) || MASKED_EXITS.has(line.exit);

  // Enter
  let y = 0; // px
  let yPrev = 0;
  let rot = 0;
  let scale = 1;
  let opacity = 1;
  let blur = 0;
  const travel = fs * 1.2;

  switch (line.enter) {
    case 'rise':
    case 'mask': {
      const p = prog(tw, 0, 20, ease.out);
      y = (1 - p) * travel;
      yPrev = (1 - prog(tw - 1, 0, 20, ease.out)) * travel;
      rot = line.enter === 'rise' ? (1 - p) * 8 : 0;
      break;
    }
    case 'words': {
      const p = prog(tw, 0, 18, ease.out);
      y = (1 - p) * fs * 0.32;
      scale = lerp(0.94, 1, p);
      opacity = prog(tw, 0, 8, ease.linear);
      blur = (1 - p) * 16;
      break;
    }
    case 'pop': {
      const s = spring({frame: tw, fps: theme.fps, config: {damping: 12, stiffness: 190, mass: 0.7}});
      scale = lerp(0.35, 1, s);
      opacity = prog(tw, 0, 4, ease.linear);
      blur = (1 - clamp01(s)) * 10;
      break;
    }
    default:
      break;
  }

  // Word-level exits
  if (line.exitStart !== null && (line.exit === 'up' || line.exit === 'down')) {
    const te = t - line.exitStart - index * 1.5;
    const pe = prog(te, 0, 11, ease.in);
    const pePrev = prog(te - 1, 0, 11, ease.in);
    const dir = line.exit === 'up' ? -1 : 1;
    y += dir * pe * travel;
    yPrev += dir * pePrev * travel;
  }

  const hasAccent = word.parts.some((p) => p.kind === 'text' && (p.underline || p.strike || p.circle));
  const lastUnderlined = (() => {
    const last = word.parts[word.parts.length - 1];
    return last.kind === 'text' && last.underline;
  })();

  const inner = (
    <MotionBlur
      vy={y - yPrev}
      blur={blur}
      style={{
        display: 'inline-block',
        transform: `translateY(${y}px) rotate(${rot}deg) scale(${scale})`,
        transformOrigin: rot ? '0% 100%' : '50% 60%',
        opacity,
      }}
    >
      {word.parts.map((p, j) => (
        <PartView key={j} part={p} ctx={ctx} wordStart={start} />
      ))}
    </MotionBlur>
  );

  return (
    <span style={{display: 'inline-block', position: 'relative'}}>
      {masked ? <span style={MASK}>{inner}</span> : inner}
      {hasAccent ? (
        <span style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', pointerEvents: 'none'}}>
          {word.parts.map((p, j) => (
            <PartView
              key={j}
              part={p}
              ctx={ctx}
              wordStart={start}
              ghost
              extendRight={joinNext && lastUnderlined && j === word.parts.length - 1 ? theme.type.wordGap : 0}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
};

// ─── Line ───────────────────────────────────────────────────────────────────

/** Line-level transform for enter/exit/drift. Returns position as a function of time for velocity. */
const lineState = (line: TLine, t: number, sceneDur: number) => {
  const tl = t - line.start;
  let x = 0;
  let y = 0;
  let scale = 1;
  let opacity = 1;
  let blur = 0;
  let tracking = line.tracking;

  switch (line.enter) {
    case 'fromLeft':
    case 'fromRight': {
      const p = prog(tl, 0, 22, ease.out);
      x = (line.enter === 'fromLeft' ? -1 : 1) * (1 - p) * W * 1.1;
      break;
    }
    case 'fromTop':
    case 'fromBottom': {
      const p = prog(tl, 0, 22, ease.out);
      y = (line.enter === 'fromTop' ? -1 : 1) * (1 - p) * H * 0.55;
      opacity = prog(tl, 0, 6, ease.linear);
      break;
    }
    case 'punch': {
      const p = prog(tl, 0, 16, ease.out);
      scale = lerp(1.75, 1, p);
      opacity = prog(tl, 0, 4, ease.linear);
      blur = (1 - p) * 22;
      break;
    }
    case 'tracking': {
      const p = prog(tl, 0, 32, ease.out);
      tracking += lerp(0.6, 0, p);
      opacity = prog(tl, 0, 12, ease.linear);
      blur = (1 - p) * 9;
      break;
    }
    case 'fade': {
      const p = prog(tl, 0, 16, ease.outSoft);
      opacity = p;
      y = (1 - p) * 14;
      break;
    }
    default:
      // 'none' and word-level enters are handled per word
      break;
  }

  // Slow drift while on screen
  const d = clamp01(t / Math.max(1, sceneDur));
  x += (line.drift.x ?? 0) * d;
  y += (line.drift.y ?? 0) * d;
  scale *= 1 + (line.drift.scale ?? 0) * d;
  tracking += (line.drift.tracking ?? 0) * d;

  // Line-level exits
  if (line.exitStart !== null) {
    const pe = prog(t, line.exitStart, 12, ease.in);
    switch (line.exit) {
      case 'left':
        x -= pe * W * 1.15;
        break;
      case 'right':
        x += pe * W * 1.15;
        break;
      case 'scale':
        scale *= lerp(1, 0.8, pe);
        opacity *= 1 - pe;
        blur += pe * 14;
        break;
      case 'blur':
        opacity *= 1 - pe;
        blur += pe * 22;
        tracking += pe * 0.25;
        break;
      case 'fade':
        opacity *= 1 - pe;
        break;
      default:
        break;
    }
  }
  return {x, y, scale, opacity, blur, tracking};
};

export const TextLine: React.FC<{
  line: TLine;
  t: number;
  fontSize: number;
  top: number;
  height: number;
  sceneDur: number;
}> = ({line, t, fontSize, top, height, sceneDur}) => {
  if (line.enter === 'marquee') return <MarqueeLine line={line} t={t} fontSize={fontSize} top={top} height={height} />;

  // Nothing to draw before a line-level animation starts.
  const lineLevel = !['rise', 'words', 'chars', 'pop', 'mask', 'none'].includes(line.enter);
  if (lineLevel && t < line.start) return null;

  const s = lineState(line, t, sceneDur);
  const sp = lineState(line, t - 1, sceneDur);
  const ctx: Ctx = {t, fs: fontSize, tracking: s.tracking, line};
  const justify = line.align === 'left' ? 'flex-start' : line.align === 'right' ? 'flex-end' : 'center';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: W,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        padding: `0 ${theme.type.paddingX}px`,
        boxSizing: 'border-box',
      }}
    >
      <MotionBlur
        vx={s.x - sp.x}
        vy={s.y - sp.y}
        blur={s.blur}
        style={{
          transform: `translate(${s.x}px, ${s.y}px) scale(${s.scale})`,
          transformOrigin: line.align === 'left' ? '0% 50%' : line.align === 'right' ? '100% 50%' : '50% 50%',
          opacity: s.opacity,
        }}
      >
        <div
          style={{
            display: 'flex',
            columnGap: `${theme.type.wordGap}em`,
            fontSize,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: theme.colors.text,
          }}
        >
          {line.words.map((w, i) => {
            const next = line.words[i + 1];
            const joinNext = Boolean(next && next.parts[0].kind === 'text' && next.parts[0].underline);
            return <WordView key={i} word={w} index={i} ctx={ctx} start={line.wordStarts[i] ?? line.start} joinNext={joinNext} />;
          })}
        </div>
      </MotionBlur>
    </div>
  );
};

// ─── Marquee ────────────────────────────────────────────────────────────────

const MarqueeLine: React.FC<{line: TLine; t: number; fontSize: number; top: number; height: number}> = ({
  line,
  t,
  fontSize,
  top,
  height,
}) => {
  const tl = t - line.start;
  if (tl < 0) return null;
  const gapEm = 0.55;
  const unit = (wordsEm(line.words, line.tracking) + gapEm) * fontSize;
  const copies = Math.ceil((W + unit * 2) / unit) + 1;
  const v = line.speed / theme.fps;
  const dir = line.direction === 'left' ? -1 : 1;
  const entry = (tt: number) => (1 - prog(tt, 0, 24, ease.out)) * W * 1.3;
  const pos = (tt: number) => {
    const scroll = (v * Math.max(0, tt)) % unit;
    return dir < 0 ? -unit * 0.35 - scroll + entry(tt) : -unit * 1.35 + scroll - entry(tt);
  };
  const x = pos(tl);
  let vx = x - pos(tl - 1);
  if (Math.abs(vx) > unit / 2) vx = dir * v; // loop wrap
  const ctx: Ctx = {t, fs: fontSize, tracking: line.tracking, line};
  let opacity = 1;
  let blur = 0;
  if (line.exitStart !== null) {
    const pe = prog(t, line.exitStart, 12, ease.in);
    opacity = 1 - pe;
    blur = pe * 16;
  }
  // Blur a frame-sized clipped window, not the very wide strip (huge filter regions break in Chrome).
  const pad = height * 0.4;
  return (
    <MotionBlur
      vx={vx}
      blur={blur}
      style={{position: 'absolute', left: 0, top: top - pad, width: W, height: height + pad * 2, overflow: 'hidden', opacity}}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: pad,
          height,
          display: 'flex',
          alignItems: 'center',
          columnGap: `${gapEm}em`,
          fontSize,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: theme.colors.text,
          transform: `translateX(${x}px)`,
        }}
      >
        {Array.from({length: copies}).map((_, c) => (
          <span key={c} style={{display: 'inline-flex', flexShrink: 0, columnGap: `${theme.type.wordGap}em`}}>
            {line.words.map((w, i) => (
              <span key={i} style={{display: 'inline-block'}}>
                {w.parts.map((p, j) => (
                  <PartView key={j} part={p} ctx={ctx} wordStart={line.start} />
                ))}
              </span>
            ))}
          </span>
        ))}
      </div>
    </MotionBlur>
  );
};
