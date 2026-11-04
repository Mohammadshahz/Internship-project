import {theme} from '../config/theme';
import type {Part, Style, Word} from './types';

let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

const REF = 100; // measure at 100px, scale linearly

/** Default letter-spacing (em) for a weight: heavier = tighter, like a typesetter would. */
export const trackingFor = (weight: number) =>
  weight >= 800 ? -0.045 : weight >= 600 ? -0.035 : weight >= 400 ? -0.025 : -0.012;

/** Width of a run of text in em (1em = font size). */
export const textEm = (text: string, style: Pick<Style, 'weight' | 'italic'>, extraTracking = 0) => {
  const key = `${style.weight}|${style.italic}|${extraTracking}|${text}`;
  const serif = style.italic;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = serif ? `italic 400 ${REF}px "${theme.type.serif}"` : `${style.weight} ${REF}px "${theme.type.family}"`;
  const scale = serif ? theme.type.serifScale : 1;
  const w = (ctx!.measureText(text).width / REF + [...text].length * ((serif ? -0.01 : trackingFor(style.weight)) + extraTracking)) * scale;
  cache.set(key, w);
  return w;
};

const counterText = (p: Extract<Part, {kind: 'counter'}>, v: number) => v.toFixed(p.decimals);

/** Width (em) of the widest value a counter shows: digits rendered tabular so '0' is representative. */
export const counterEm = (p: Extract<Part, {kind: 'counter'}>, tracking = 0) => {
  const longest = [counterText(p, p.from), counterText(p, p.to)].sort((a, b) => b.length - a.length)[0];
  return textEm(longest.replace(/\d/g, '0'), p, tracking);
};

export const wordsEm = (words: Word[], tracking = 0, slotOption?: (opts: Word[][]) => Word[]): number =>
  words.reduce((acc, w, i) => acc + wordEm(w, tracking, slotOption) + (i ? theme.type.wordGap : 0), 0);

/** Width of a word in em. Slots use `slotOption` (default: widest option). */
export function wordEm(w: Word, tracking = 0, slotOption?: (opts: Word[][]) => Word[]): number {
  return w.parts.reduce((acc, p) => {
    if (p.kind === 'text') return acc + textEm(p.text, p, tracking);
    if (p.kind === 'counter') return acc + counterEm(p, tracking);
    if (slotOption) return acc + wordsEm(slotOption(p.options), tracking);
    return acc + Math.max(...p.options.map((o) => wordsEm(o, tracking)));
  }, 0);
}

/** Resolve a line's font size: 'fit' fills the safe width, numbers are capped so nothing overflows. */
export const fontSizeFor = (words: Word[], size: number | 'fit', tracking: number) => {
  const avail = theme.width - theme.type.paddingX * 2;
  const em = wordsEm(words, tracking);
  const fit = em > 0 ? avail / em : theme.type.maxFitSize;
  return size === 'fit' ? Math.min(theme.type.maxFitSize, fit) : Math.min(size, fit);
};
