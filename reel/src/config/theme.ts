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

  colors: {
    blue: '#0647FF', // primary background
    navy: '#071B49', // secondary background
    text: '#FFFFFF',
  },

  /** Adds a soft light falloff + film grain so flat colour feels filmed, not flat. */
  background: {
    depth: 0.1, //  0 = perfectly flat, 0.1 = subtle light falloff
    grain: 0.045, // 0 = off
  },

  type: {
    family: 'Reel Display', // registered in engine/fonts.ts (Inter Display, bundled)
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
