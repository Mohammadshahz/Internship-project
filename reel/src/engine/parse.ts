// Inline markup parser.  "Your **best idea** is _still_ [here]."  →  Word[]
//
//   **heavy**      _light_      *italic*      [underline]      ~~strike~~
//   ((circle))     {one|two|three} rolling swap     {#0..365} counter     \* escape

import {theme} from '../config/theme';
import type {Part, Style, Word} from './types';

interface State {
  heavy: boolean;
  light: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  circle: boolean;
}

const styleOf = (s: State, baseWeight: number): Style => ({
  weight: s.heavy ? theme.type.heavyWeight : s.light ? theme.type.lightWeight : baseWeight,
  italic: s.italic,
  underline: s.underline,
  strike: s.strike,
  circle: s.circle,
});

const sameStyle = (a: Style, b: Style) =>
  a.weight === b.weight &&
  a.italic === b.italic &&
  a.underline === b.underline &&
  a.strike === b.strike &&
  a.circle === b.circle;

const findClose = (src: string, from: number): number => {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    if (src[i] === '\\') {
      i++;
      continue;
    }
    if (src[i] === '{') depth++;
    if (src[i] === '}') {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
};

const splitOptions = (inner: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '\\') {
      cur += c + (inner[i + 1] ?? '');
      i++;
      continue;
    }
    if (c === '{') depth++;
    if (c === '}') depth--;
    if (c === '|' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
};

export const parseLine = (src: string, baseWeight: number = theme.type.baseWeight): Word[] =>
  parseWith(src, baseWeight, {
    heavy: false,
    light: false,
    italic: false,
    underline: false,
    strike: false,
    circle: false,
  });

function parseWith(src: string, baseWeight: number, initial: State): Word[] {
  const s: State = {...initial};
  const words: Word[] = [];
  let parts: Part[] = [];

  const pushText = (ch: string) => {
    const st = styleOf(s, baseWeight);
    const last = parts[parts.length - 1];
    if (last && last.kind === 'text' && sameStyle(last, st)) last.text += ch;
    else parts.push({kind: 'text', text: ch, ...st});
  };
  const endWord = () => {
    if (parts.length) words.push({parts});
    parts = [];
  };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const two = src.slice(i, i + 2);
    if (c === '\\') {
      pushText(src[i + 1] ?? '');
      i++;
    } else if (two === '**') {
      s.heavy = !s.heavy;
      i++;
    } else if (two === '~~') {
      s.strike = !s.strike;
      i++;
    } else if (two === '((') {
      s.circle = true;
      i++;
    } else if (two === '))') {
      s.circle = false;
      i++;
    } else if (c === '*') {
      s.italic = !s.italic;
    } else if (c === '_') {
      s.light = !s.light;
    } else if (c === '[') {
      s.underline = true;
    } else if (c === ']') {
      s.underline = false;
    } else if (c === '{') {
      const close = findClose(src, i + 1);
      if (close < 0) {
        pushText(c);
        continue;
      }
      const inner = src.slice(i + 1, close);
      const st = styleOf(s, baseWeight);
      const counter = inner.match(/^#\s*(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)\s*$/);
      if (counter) {
        const decimals = Math.max(
          (counter[1].split('.')[1] ?? '').length,
          (counter[2].split('.')[1] ?? '').length,
        );
        parts.push({kind: 'counter', from: Number(counter[1]), to: Number(counter[2]), decimals, ...st});
      } else {
        const options = splitOptions(inner).map((o) => parseWith(o.trim(), baseWeight, s));
        parts.push({kind: 'slot', options, ...st});
      }
      i = close;
    } else if (/\s/.test(c)) {
      endWord();
    } else {
      pushText(c);
    }
  }
  endWord();
  return words;
}

/** Plain text of a word (slots → first option, counters → final value). */
export const wordText = (w: Word): string =>
  w.parts
    .map((p) =>
      p.kind === 'text'
        ? p.text
        : p.kind === 'counter'
          ? p.to.toFixed(p.decimals)
          : p.options[0].map(wordText).join(' '),
    )
    .join('');

export const lineHasSlot = (words: Word[]) => words.some((w) => w.parts.some((p) => p.kind === 'slot'));
export const lineHasCounter = (words: Word[]) => words.some((w) => w.parts.some((p) => p.kind === 'counter'));
export const slotOptionCount = (words: Word[]) => {
  for (const w of words) for (const p of w.parts) if (p.kind === 'slot') return p.options.length;
  return 0;
};
