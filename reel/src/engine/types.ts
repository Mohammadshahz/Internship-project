// ─────────────────────────────────────────────────────────────────────────────
// Public types for the script config. Everything in src/config/* is typed
// against these so your editor autocompletes every option.
// ─────────────────────────────────────────────────────────────────────────────

/** Background colour tokens from the theme (see theme.ts → colors). */
export type BgToken = 'blue' | 'navy';

/**
 * Background of a scene. Either a token, or an in-scene colour shift:
 * `{ from: 'blue', to: 'navy', at: 1.2, over: 0.5 }`
 */
export type Background =
  | BgToken
  | { from: BgToken; to: BgToken; at?: number; over?: number };

/** How a line (or each of its words) arrives. */
export type EnterAnimation =
  | 'rise' //      word-by-word, rising out of a mask (signature reveal)
  | 'mask' //      whole line rises out of a mask at once
  | 'words' //     word-by-word soft reveal: blur + lift + fade
  | 'chars' //     letter-by-letter cascade out of a mask
  | 'pop' //       word-by-word scale-in with a little overshoot
  | 'punch' //     whole line slams in from big scale with blur (impact)
  | 'tracking' //  letters converge from wide letter-spacing
  | 'fromLeft' //  line flies in from the left with motion blur
  | 'fromRight'
  | 'fromTop'
  | 'fromBottom'
  | 'marquee' //   line scrolls endlessly across the frame
  | 'fade' //      simple opacity (for small supporting copy)
  | 'none'; //     already on screen

/** How lines leave at the end of the scene (before the next transition). */
export type ExitAnimation =
  | 'none'
  | 'up' //    masked slide up and out, word by word
  | 'down'
  | 'left' //  whole line whips off to the left with motion blur
  | 'right'
  | 'scale' // shrink + blur + fade
  | 'blur' //  dissolve with expanding tracking
  | 'fade';

/** Transition INTO a scene (from the previous one). */
export type TransitionType =
  | 'cut' //       hard cut on the beat with a tiny scale punch
  | 'whip' //      whip-pan left (alias of whipLeft)
  | 'whipLeft'
  | 'whipRight'
  | 'whipUp'
  | 'whipDown'
  | 'push' //      new scene slides over the old one, parallax
  | 'panel' //     reveal from the bottom edge with parallax (alias panelUp)
  | 'panelUp'
  | 'panelDown'
  | 'panelLeft'
  | 'panelRight'
  | 'zoom' //      zoom-through: old scene flies into camera
  | 'iris' //      circular reveal from the centre
  | 'dissolve'; // blur cross-dissolve

export type Layout = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'spread';
export type Align = 'left' | 'center' | 'right';
export type CameraMove = 'push' | 'pull' | 'drift' | 'none';
export type SfxName = string;

export interface SfxCue {
  name: SfxName;
  /** Seconds from the scene's cut. Default 0. */
  at?: number;
  volume?: number;
}

export interface LineConfig {
  /** Text with inline markup — see the cheat-sheet at the top of script.ts. */
  text: string;
  /** Font size in px, or 'fit' to fill the frame width. Default: 'fit'. */
  size?: number | 'fit';
  /** Weight for unmarked words (100–900). Default theme.type.baseWeight. */
  weight?: number;
  enter?: EnterAnimation;
  exit?: ExitAnimation;
  align?: Align;
  /** Extra letter-spacing in em, added to the weight-based default. */
  tracking?: number;
  /** Seconds after the scene cut when this line starts (overrides auto stagger). */
  at?: number;
  /** Slow continuous motion while on screen. */
  drift?: { x?: number; y?: number; tracking?: number; scale?: number };
  /** For lines containing a {a|b|c} slot: seconds between swaps. */
  swapEvery?: number;
  /** For {#from..to} counters: seconds the count takes. */
  countFor?: number;
  /** Marquee speed in px per second (default 260). Direction alternates per line. */
  speed?: number;
  /** Marquee direction override. */
  direction?: 'left' | 'right';
}

export type LineInput = string | LineConfig;

export interface SceneConfig {
  /** Optional label (shows in Studio / logs). */
  id?: string;
  /** Lines of text, top to bottom. */
  lines: LineInput[];
  /** Length in beats (uses theme.bpm). Ignored if `duration` is set. */
  beats?: number;
  /** Length in seconds. */
  duration?: number;
  /** Default enter animation for every line in the scene. */
  enter?: EnterAnimation;
  /** Exit animation for every line at the end of the scene. */
  exit?: ExitAnimation;
  /** Transition INTO this scene. */
  transition?: TransitionType;
  background?: Background;
  layout?: Layout;
  align?: Align;
  camera?: CameraMove;
  /** Seconds before the first line starts (after the cut). */
  delay?: number;
  /** Seconds between words (word-level animations). */
  wordStagger?: number;
  /** Seconds between lines (line-level animations). */
  lineStagger?: number;
  /** Keep the text block centred while lines build up (default true for centred layouts). */
  reflow?: boolean;
  /** Extra sound effects for this scene. */
  sfx?: SfxName | Array<SfxName | SfxCue>;
  /** Turn automatic sfx (transition whooshes, punch hits…) off for this scene. */
  autoSfx?: boolean;
}

// ─── Parsed text model ──────────────────────────────────────────────────────

export interface Style {
  weight: number;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  circle: boolean;
}

export interface TextPart extends Style {
  kind: 'text';
  text: string;
}
export interface SlotPart extends Style {
  kind: 'slot';
  options: Word[][];
}
export interface CounterPart extends Style {
  kind: 'counter';
  from: number;
  to: number;
  decimals: number;
}
export type Part = TextPart | SlotPart | CounterPart;

export interface Word {
  parts: Part[];
}

// ─── Resolved timeline (frames) ─────────────────────────────────────────────

export interface TLine {
  words: Word[];
  enter: EnterAnimation;
  exit: ExitAnimation;
  size: number | 'fit';
  baseWeight: number;
  align: Align;
  tracking: number;
  drift: NonNullable<LineConfig['drift']>;
  /** Frame (relative to the scene cut) the line starts entering. */
  start: number;
  /** Per-word start frames (relative to the cut). */
  wordStarts: number[];
  /** Frame (relative to the cut) the exit begins, or null. */
  exitStart: number | null;
  /** Frames (relative to cut) at which a slot swaps to option k (k ≥ 1). */
  slotChanges: number[];
  countFrames: number;
  speed: number;
  direction: 'left' | 'right';
}

export interface TScene {
  index: number;
  id: string;
  /** Absolute frame of the cut into this scene. */
  cut: number;
  /** Frames from this cut to the next one. */
  dur: number;
  transition: TransitionType;
  transitionFrames: number;
  background: Background;
  layout: Layout;
  camera: CameraMove;
  reflow: boolean;
  lines: TLine[];
}

export interface TSfx {
  name: SfxName;
  frame: number;
  volume: number;
}

export interface Timeline {
  fps: number;
  totalFrames: number;
  scenes: TScene[];
  sfx: TSfx[];
  synced: boolean;
}

/** A single word with timing from a transcription (seconds). */
export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}
