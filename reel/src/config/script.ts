// ═════════════════════════════════════════════════════════════════════════════
//  SCRIPT — the only file you need to edit to make a new Reel.
// ═════════════════════════════════════════════════════════════════════════════
//
//  Each scene = one beat of the story. Lines are stacked top-to-bottom.
//  A line can be a plain string, or an object when you need more control:
//      { text: 'for the perfect moment.', size: 76, enter: 'fade' }
//
//  INLINE MARKUP (emphasis is weight & size — never colour)
//  ───────────────────────────────────────────────────────
//    **heavy**          Black (900)
//    _light_            ExtraLight (200)
//    *italic*           italic
//    [underline]        underline that draws itself on
//    ~~strike~~         strike-through that draws itself on
//    ((circle))         hand-drawn circle around the word
//    {one|two|three}    rolling word swap (each option slides up through a mask)
//    {#0..365}          number counter   ({#0..9.5} → one decimal)
//    \*                 escape a markup character
//
//  SCENE OPTIONS (all optional except `lines`)
//  ───────────────────────────────────────────
//    beats / duration   length in beats (theme.bpm) or seconds
//    enter              rise · mask · words · chars · pop · punch · tracking ·
//                       fromLeft · fromRight · fromTop · fromBottom · marquee · fade · none
//    exit               none · up · down · left · right · scale · blur · fade
//    transition         cut · whip · whipLeft · whipRight · whipUp · whipDown · push ·
//                       panel · panelUp · panelDown · panelLeft · panelRight · zoom · iris · dissolve
//    background         'black' | 'grey' | { from: 'black', to: 'grey', at: 1, over: 0.5 }
//    layout             center · top · bottom · left · right · spread
//    camera             push · pull · drift · none
//    delay, wordStagger, lineStagger   (seconds)
//    sfx                'hit' | ['pop', { name: 'tick', at: 0.6 }]
//
//  LINE OPTIONS
//  ────────────
//    size ('fit' | px) · weight · enter · exit · align · tracking (em) · at (s)
//    drift { x, y, tracking, scale } · swapEvery (s) · countFor (s) · speed · direction
//
//  With a voiceover + transcript (see audio.ts) the beats are ignored: every cut
//  and word lands on the spoken word automatically.
// ═════════════════════════════════════════════════════════════════════════════

import type {SceneConfig} from '../engine/types';

export const script: SceneConfig[] = [
  // 01 — Hook: justified stack, three weights, built word by word
  {
    id: 'hook',
    beats: 5,
    background: 'black',
    enter: 'rise',
    exit: 'up',
    lines: ['_Your best idea_', 'is **still**', '**in your head.**'],
  },

  // 02 — Contradiction, with a strike-through drawn over "bad."
  {
    id: 'not-bad',
    beats: 4,
    transition: 'cut',
    background: 'grey',
    enter: 'words',
    camera: 'pull',
    lines: ['_Not because_', "it's ~~**bad.**~~"],
  },

  // 03 — Time stretches: the word literally spreads out while you wait
  {
    id: 'waiting',
    beats: 6,
    transition: 'whip',
    background: 'black',
    lines: [
      {text: "_Because you're_", enter: 'words', size: 96},
      {text: '**WAITING**', enter: 'tracking', drift: {tracking: 0.11}},
      {text: '_for the perfect moment._', enter: 'fade', size: 64, at: 1.15},
    ],
  },

  // 04 — Editorial spread: top-left / huge centre / bottom-right
  {
    id: 'no-moment',
    beats: 5,
    transition: 'panelUp',
    background: 'grey',
    layout: 'spread',
    camera: 'drift',
    lines: [
      {text: '_There is_', size: 120, enter: 'fromLeft', drift: {x: 40}},
      {text: '**NO**', size: 520, enter: 'punch', at: 0.45},
      {text: '_perfect moment._', size: 92, enter: 'fromRight', at: 0.85, drift: {x: -40}},
    ],
  },

  // 05 — Rolling swap: "Start" stays, the last word keeps changing on the beat
  {
    id: 'start',
    beats: 6,
    transition: 'zoom',
    background: 'black',
    layout: 'left',
    enter: 'rise',
    exit: 'left',
    lines: [{text: '_Start_', size: 220}, {text: '**{messy.|small.|now.}**', size: 250}],
  },

  // 06 — Marquee wall: three lines scrolling in opposite directions
  {
    id: 'progress',
    beats: 6,
    transition: 'cut',
    background: 'grey',
    enter: 'marquee',
    camera: 'none',
    lineStagger: 0.12,
    lines: [
      {text: '**PROGRESS**', size: 300, speed: 320},
      {text: '_beats_', size: 190, speed: 220},
      {text: '**PERFECTION**', size: 300, speed: 320},
    ],
  },

  // 07 — Word-by-word with a self-drawing underline
  {
    id: 'daily',
    beats: 4,
    transition: 'push',
    background: 'black',
    enter: 'pop',
    lines: ['One step.', '_Every single_', '[**day.**]'],
  },

  // 08 — Counter
  {
    id: 'counter',
    beats: 5,
    transition: 'whipUp',
    background: 'grey',
    lines: [
      {text: '**{#1..365}**', enter: 'punch'},
      {text: '_days from now_', enter: 'tracking', size: 92, at: 0.35},
    ],
  },

  // 09 — Letter cascade, circled keyword
  {
    id: 'thank',
    beats: 4,
    transition: 'panelLeft',
    background: 'black',
    enter: 'chars',
    exit: 'blur',
    lines: ["_you'll_", '**((thank))**', '_yourself._'],
  },

  // 10 — Impact
  {
    id: 'build',
    beats: 3,
    transition: 'cut',
    background: 'grey',
    lines: [
      {text: '_So_', enter: 'words', size: 140},
      {text: '**build it.**', enter: 'punch', at: 0.3},
    ],
    sfx: [{name: 'hit', at: 0.3}],
  },

  // 11 — Call to action
  {
    id: 'cta',
    beats: 7,
    transition: 'iris',
    background: 'black',
    enter: 'rise',
    camera: 'pull',
    lines: [{text: '_Follow for more_', size: 92}, {text: '[**@yourhandle**]', size: 150}],
  },
];

/** Scene used for the Instagram cover still (`npm run cover`). */
export const cover: SceneConfig = {
  lines: ['_Your best idea_', 'is **still**', '**in your head.**'],
  background: 'black',
};
