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
  // ══ HOOK 1 — the problem (0 – 9.6 s) ═══════════════════════════════════════
  {
    id: 'missing-leads',
    beats: 4,
    background: 'black',
    lines: [
      {text: '_Missing your_', enter: 'words', size: 120},
      {text: '**LEADS?**', enter: 'punch', at: 0.35},
    ],
  },
  {
    id: 'missed-call',
    beats: 5,
    transition: 'cut',
    background: 'grey',
    enter: 'rise',
    exit: 'up',
    lines: ['_Every_ **missed call**', {text: '_is a_', size: 120}, '**missed client.**'],
  },
  {
    id: 'no-worries-1',
    beats: 3,
    transition: 'cut',
    background: 'black',
    lines: [{text: '**No worries.**', enter: 'punch'}],
  },
  {
    id: 'solution',
    beats: 4,
    transition: 'whip',
    background: 'grey',
    lines: [
      {text: "_Here's the_", enter: 'words', size: 110},
      {text: '**SOLUTION**', enter: 'tracking', at: 0.3, drift: {tracking: 0.06}},
    ],
  },

  // ══ THE TREND (9.6 – 20.4 s) ═══════════════════════════════════════════════
  {
    id: 'fastest-trend',
    beats: 5,
    transition: 'panelUp',
    background: 'black',
    layout: 'spread',
    camera: 'drift',
    lines: [
      {text: '_The_', size: 130, enter: 'fromLeft', drift: {x: 40}},
      {text: '**FASTEST**', enter: 'punch', at: 0.35},
      {text: '**TREND**', enter: 'punch', at: 0.75},
      {text: '_in business right now._', size: 70, enter: 'fromRight', at: 1.1, drift: {x: -40}},
    ],
  },
  {
    id: 'ai',
    beats: 3,
    transition: 'zoom',
    background: 'grey',
    camera: 'pull',
    lines: [{text: '**AI.**', enter: 'punch', size: 620}],
    sfx: 'hit',
  },
  {
    id: 'integrating',
    beats: 6,
    transition: 'cut',
    background: 'black',
    layout: 'left',
    enter: 'rise',
    lines: [
      {text: '_Businesses are_', size: 120},
      {text: '**{integrating|automating|scaling}**'},
      {text: '_with AI._', size: 120},
    ],
  },
  {
    id: 'ready-trend',
    beats: 4,
    transition: 'push',
    background: 'grey',
    enter: 'pop',
    lines: ['_Will you go with_', '**the trend?**'],
  },

  // ══ HOOK 2 — the solution (20.4 – 32.4 s) ══════════════════════════════════
  {
    id: 'ai-automation',
    beats: 6,
    transition: 'cut',
    background: 'black',
    enter: 'marquee',
    camera: 'none',
    lineStagger: 0.12,
    lines: [
      {text: '**AI AUTOMATION**', size: 260, speed: 320},
      {text: '_the solution_', size: 150, speed: 220},
      {text: '**AI AUTOMATION**', size: 260, speed: 320},
    ],
  },
  {
    id: 'away-phone',
    beats: 4,
    transition: 'whipUp',
    background: 'grey',
    lines: [
      {text: '_Away from your_', enter: 'words', size: 110},
      {text: '**PHONE?**', enter: 'punch', at: 0.4},
    ],
  },
  {
    id: 'break',
    beats: 4,
    transition: 'cut',
    background: 'black',
    lines: [
      {text: '_Taking a_', enter: 'words', size: 110},
      {text: '**BREAK?**', enter: 'punch', at: 0.4},
    ],
  },
  {
    id: 'ai-takes-care',
    beats: 6,
    transition: 'iris',
    background: 'grey',
    enter: 'rise',
    lines: ['**No worries.**', '_AI takes care of_', '[**your leads.**]'],
  },

  // ══ WHAT IT DOES (32.4 – 46.8 s) ═══════════════════════════════════════════
  {
    id: 'always-on',
    beats: 5,
    transition: 'panelLeft',
    background: 'black',
    lines: [
      {text: '_Replies to every lead_', enter: 'words', size: 84},
      {text: '**{#0..24}/7**', enter: 'punch', at: 0.35},
    ],
  },
  {
    id: 'speed',
    beats: 5,
    transition: 'whip',
    background: 'grey',
    lines: [
      {text: '_Answers in_', enter: 'words', size: 110},
      {text: '**{#60..3}**', enter: 'punch', at: 0.3, countFor: 1.6},
      {text: '_seconds._', enter: 'tracking', size: 110, at: 0.6},
    ],
  },
  {
    id: 'qualifies',
    beats: 4,
    transition: 'cut',
    background: 'black',
    enter: 'chars',
    exit: 'blur',
    lines: ['_Qualifies_', '[**every**]', '_lead._'],
  },
  {
    id: 'books',
    beats: 6,
    transition: 'push',
    background: 'grey',
    layout: 'left',
    enter: 'rise',
    exit: 'left',
    lines: [{text: '_Books the_', size: 150}, {text: '**{call.|meeting.|deal.}**', size: 230}],
  },
  {
    id: 'follow-up',
    beats: 4,
    transition: 'zoom',
    background: 'black',
    enter: 'words',
    lines: ['_Follows up_', '**automatically.**'],
  },

  // ══ PAYOFF + CTA (46.8 – 60 s) ═════════════════════════════════════════════
  {
    id: 'you-rest',
    beats: 5,
    transition: 'cut',
    background: 'grey',
    lines: [
      {text: '_You_ **rest.**', enter: 'fromLeft'},
      {text: '_AI_ **works.**', enter: 'fromRight', at: 0.9},
    ],
  },
  {
    id: 'zero',
    beats: 4,
    transition: 'whipDown',
    background: 'black',
    lines: [
      {text: '**ZERO**', enter: 'punch'},
      {text: '_missed leads._', enter: 'tracking', size: 100, at: 0.35},
    ],
  },
  {
    id: 'ready',
    beats: 5,
    transition: 'panelUp',
    background: 'grey',
    enter: 'rise',
    exit: 'up',
    lines: ['_Ready to_', '**automate**', '_your business?_'],
  },
  {
    id: 'cta',
    beats: 8,
    transition: 'iris',
    background: 'black',
    camera: 'pull',
    lines: [
      {text: '_DM us_', enter: 'words', size: 120},
      {text: '[**"AI"**]', enter: 'punch', size: 340, at: 0.35},
      {text: '_to get started._', enter: 'fade', size: 80, at: 0.9},
    ],
    sfx: [{name: 'hit', at: 0.35}],
  },
];

/** Scene used for the Instagram cover still (`npm run cover`). */
export const cover: SceneConfig = {
  lines: ['_Missing your_', '**LEADS?**', '_AI fixes that._'],
  background: 'black',
};
