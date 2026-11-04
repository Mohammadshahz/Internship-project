// ─────────────────────────────────────────────────────────────────────────────
// THEME — brand, typography and motion defaults. Safe to edit.
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {
  // Video
  width: 1080,
  height: 1920,
  fps: 30,

  /** Tempo of the music. Scene `beats` are converted with this, so cuts land on the beat. */
  bpm: 100,

  /** Scene backgrounds. Each has its own text + accent colour so contrast is always right. */
  colors: {
    black: '#060606',
    grey: '#1B1B1B',
    light: '#E6E6E6',
  },
  palettes: {
    black: {text: '#FFFFFF', accent: '#CFCFCF', muted: 'rgba(255,255,255,0.5)', glow: 'rgba(255,255,255,0.13)'},
    grey: {text: '#FFFFFF', accent: '#D8D8D8', muted: 'rgba(255,255,255,0.55)', glow: 'rgba(255,255,255,0.12)'},
    light: {text: '#0A0A0A', accent: '#4A4A4A', muted: 'rgba(0,0,0,0.5)', glow: 'rgba(255,255,255,0.95)'},
  },
  /** UI mock-up cards */
  cards: {
    dark: {bg: '#111111', border: 'rgba(255,255,255,0.08)', text: '#F2F2F2', muted: 'rgba(255,255,255,0.5)', chip: '#262626'},
    light: {bg: '#F7F7F7', border: 'rgba(0,0,0,0.06)', text: '#0E0E0E', muted: 'rgba(0,0,0,0.45)', chip: '#E4E4E4'},
  },

  /** Adds a soft light falloff + film grain so flat colour feels filmed, not flat. */
  background: {
    depth: 0.1, //  0 = perfectly flat, 0.1 = subtle light falloff
    grain: 0.045, // 0 = off
  },

  type: {
    family: 'Reel Display', // registered in engine/fonts.ts (Inter Display, bundled)
    /** *accent* words use this italic serif (Instrument Serif, bundled) */
    serif: 'Reel Serif',
    serifScale: 1.12, // serif has a smaller x-height; scale it to sit with the sans
    baseWeight: 500, //   unmarked words
    heavyWeight: 900, //  **heavy**
    lightWeight: 200, //  _light_
    lineHeight: 0.96, //  multiple of font size
    wordGap: 0.26, //     space between words, in em
    maxFitSize: 360, //   cap for lines with size 'fit'
    paddingX: 84, //      side margins, px
  },

  /** Instagram UI-safe area (keep important text out of these bands). */
  safe: {
    top: 260,
    bottom: 460,
    centerY: 0.46, // vertical centre for 'center' layouts, fraction of height
  },

  motion: {
    wordStagger: 0.09, // seconds between words
    lineStagger: 0.2, //  seconds between lines (line-level animations)
    exitDuration: 0.4, // seconds
    swapHold: 0.75, //    seconds each {slot|option} holds before swapping (when not set)
    countFor: 1.5, //     seconds a {#0..100} counter takes
    snapToBeat: true, //  snap slot swaps to the beat grid
    /** Directional motion-blur strength (0 = off). */
    motionBlur: 0.32,
  },

  /** Default transition lengths in frames. */
  transitionFrames: {
    cut: 0,
    whip: 14,
    whipLeft: 14,
    whipRight: 14,
    whipUp: 14,
    whipDown: 14,
    push: 18,
    panel: 20,
    panelUp: 20,
    panelDown: 20,
    panelLeft: 20,
    panelRight: 20,
    zoom: 16,
    iris: 20,
    dissolve: 14,
  },
} as const;

export type Theme = typeof theme;
