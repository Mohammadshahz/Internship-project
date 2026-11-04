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
//    *accent*           italic serif accent (Instrument Serif)
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
//    background         'black' | 'grey' | 'light' | { from: 'black', to: 'grey', at: 1, over: 0.5 }
//    glow               center · low · high · corners · split · none
//    textY              vertical centre of the text (0–1) — move text up to make room for visuals
//    visuals            UI mock-ups: leadWall · phone · input · prompt · knowledge · chat · toggle ·
//                       pill · leadList · chips · avatars · programs · logo   (see engine/types.ts)
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
  // ══ HOOK — the problem ═════════════════════════════════════════════════════
  {
    id: 'missing-leads',
    beats: 6,
    background: 'black',
    glow: 'none',
    visuals: [{type: 'leadWall'}],
    lines: [
      {text: '_Missing your_', enter: 'words', size: 120},
      {text: '*leads?*', enter: 'punch', size: 330, at: 0.4},
    ],
  },
  {
    id: '2am',
    beats: 4,
    transition: 'zoom',
    background: 'black',
    glow: 'high',
    textY: 0.2,
    lines: [{text: 'At *2 a.m.*', enter: 'rise', size: 150}],
    visuals: [
      {
        type: 'phone',
        at: 0.05,
        y: 0.62,
        scale: 0.86,
        time: '2:07',
        date: 'Tuesday, 14 November',
        notifications: [
          {title: 'Maya R.', body: '“Are you still taking clients?”'},
          {title: '3 new enquiries', body: 'Website form · Lead ads'},
          {title: 'Leo K.', body: '“How do I join??”'},
          {title: 'Missed · Aisha B.', body: '“I’m ready to start”'},
        ],
      },
    ],
  },
  {
    id: 'missed-client',
    beats: 4,
    transition: 'whipUp',
    background: 'grey',
    enter: 'rise',
    exit: 'up',
    lines: [{text: '_Every missed DM_', size: 110}, {text: 'is a *missed client.*', size: 140}],
  },
  {
    id: 'no-worries',
    beats: 3,
    transition: 'cut',
    background: 'black',
    lines: [{text: '**No worries.**', enter: 'punch', size: 200}],
  },

  // ══ THE TREND ══════════════════════════════════════════════════════════════
  {
    id: 'trend',
    beats: 5,
    transition: 'panelUp',
    background: 'black',
    glow: 'split',
    lines: [
      {text: '_The fastest-growing trend in business?_', enter: 'fade', size: 58},
      {text: '**AI.**', enter: 'punch', size: 600, at: 0.45},
    ],
  },
  {
    id: 'coaches-ai',
    beats: 4,
    transition: 'push',
    background: 'grey',
    enter: 'rise',
    lines: [{text: 'Coaches are', size: 120}, {text: '*{integrating|automating|scaling}*', size: 200}, {text: 'with AI.', size: 120}],
  },

  // ══ THE SOLUTION — the product ═════════════════════════════════════════════
  {
    id: 'solution',
    beats: 6,
    transition: 'zoom',
    background: 'black',
    glow: 'low',
    textY: 0.33,
    lines: [
      {text: '_The solution?_', enter: 'words', size: 96},
      {text: '*AI automation.*', enter: 'rise', size: 170, at: 0.3},
    ],
    visuals: [{type: 'input', text: 'Set up my AI assistant', at: 0.95, y: 0.6, enter: 'fromRight', scale: 0.92}],
  },
  {
    id: 'learns',
    beats: 6,
    transition: 'panelLeft',
    background: 'grey',
    textY: 0.19,
    lines: [{text: 'It *learns* your business.', enter: 'words', size: 92}],
    visuals: [
      {
        type: 'knowledge',
        at: 0.2,
        y: 0.6,
        title: 'Knowledge base',
        tag: 'Coach workspace',
        ringLabel: 'Learning your offers, prices & voice',
        rows: [
          {label: 'Program', value: '8-Week Fat Loss', chip: '$397'},
          {label: 'Program', value: '1:1 Coaching · 12 wks', chip: '$1,200'},
          {label: 'Pricing', value: 'Pay in full or 3 parts', chip: 'Approved'},
          {label: 'FAQs', value: '38 questions answered', chip: 'Synced'},
          {label: 'Voice', value: 'Friendly, clear, no pressure', chip: 'Learned'},
        ],
      },
    ],
  },
  {
    id: 'replies-like-you',
    beats: 6,
    transition: 'whip',
    background: 'black',
    glow: 'center',
    textY: 0.16,
    lines: [{text: '*Replies* like you.', enter: 'rise', size: 120}],
    visuals: [
      {type: 'prompt', text: 'Reply like me. Friendly, short, never pushy.', at: 0.1, y: 0.39, scale: 0.94, cps: 36},
      {
        type: 'chat',
        at: 1.45,
        y: 0.56,
        anchor: 'top',
        enter: 'card',
        header: {name: 'Maya R.', tag: 'Instagram'},
        messages: [
          {from: 'lead', text: 'Hi! How much is it? I’m ready to start', at: 1.6},
          {from: 'ai', text: 'Hey Maya! Love that. It’s $397, or 3 easy payments. Want me to save your spot?', at: 2.0},
        ],
      },
    ],
  },
  {
    id: 'objections',
    beats: 5,
    transition: 'cut',
    background: 'grey',
    glow: 'center',
    textY: 0.24,
    lines: [{text: 'Handles *objections.*', enter: 'words', size: 120}],
    visuals: [
      {
        type: 'chat',
        at: 0.25,
        y: 0.56,
        messages: [
          {from: 'note', text: 'OBJECTION DETECTED  ·  PRICE', at: 0.35},
          {from: 'lead', text: 'Love it, but I can’t afford it right now…', at: 0.45},
          {from: 'ai', text: 'Totally fair. Most clients split it into 3 smaller payments. Want me to send that option?', at: 0.85},
        ],
      },
    ],
  },

  // ══ HOOK 2 — you're away, AI isn't ═════════════════════════════════════════
  {
    id: 'away',
    beats: 4,
    transition: 'whipLeft',
    background: 'black',
    lines: [
      {text: '_Away from your_', enter: 'words', size: 110},
      {text: '*phone?*', enter: 'punch', size: 300, at: 0.4},
    ],
  },
  {
    id: 'break',
    beats: 4,
    transition: 'cut',
    background: 'grey',
    lines: [
      {text: '_Taking a_', enter: 'words', size: 110},
      {text: '*break?*', enter: 'punch', size: 300, at: 0.4},
    ],
  },
  {
    id: 'takes-care',
    beats: 5,
    transition: 'iris',
    background: 'black',
    glow: 'low',
    textY: 0.36,
    enter: 'rise',
    lines: [{text: '**No worries.**', size: 120}, {text: 'AI takes care of', size: 96}, {text: '*your leads.*', size: 190}],
    visuals: [{type: 'toggle', label: 'AI assistant', at: 0.7, onAt: 1.25, y: 0.64, size: 120}],
  },

  // ══ RESULTS ════════════════════════════════════════════════════════════════
  {
    id: 'booked',
    beats: 6,
    transition: 'panelUp',
    background: 'light',
    glow: 'center',
    textY: 0.32,
    enter: 'rise',
    lines: [{text: 'Books calls.', size: 130}, {text: 'Closes *sales.*', size: 170}],
    visuals: [{type: 'pill', texts: ['Call booked', 'Enrolled'], swapAt: [2.1], at: 0.75, y: 0.6, enter: 'pop', scale: 0.9}],
  },
  {
    id: 'who-to-call',
    beats: 5,
    transition: 'push',
    background: 'grey',
    glow: 'center',
    textY: 0.15,
    lines: [{text: 'Your *sales command* center.', enter: 'words', size: 88}],
    visuals: [
      {
        type: 'leadList',
        at: 0.1,
        y: 0.58,
        scale: 0.94,
        title: 'Ask your assistant',
        subtitle: 'Knows every lead, every conversation',
        query: 'Which leads should I call today?',
        leads: [
          {name: 'Maya R.', score: 94, note: 'ready to start, asked about payment plan'},
          {name: 'Leo K.', score: 88, note: 'booked last week, missed the call'},
          {name: 'Aisha B.', score: 85, note: 'replied to follow-up 2h ago'},
        ],
      },
    ],
  },
  {
    id: 'control',
    beats: 5,
    transition: 'zoom',
    background: 'black',
    glow: 'center',
    textY: 0.42,
    lines: [{text: '*Always* in control.', enter: 'rise', size: 140}],
    visuals: [{type: 'chips', items: ['Human takeover', 'Approval mode'], at: 0.55, activeAt: 1.3, y: 0.53, enter: 'none'}],
  },
  {
    id: 'never-sleeps',
    beats: 6,
    transition: 'cut',
    background: 'black',
    glow: 'split',
    textY: 0.48,
    enter: 'rise',
    lines: [{text: 'A *sales team*', size: 170}, {text: 'that never sleeps.', size: 110}],
    visuals: [
      {type: 'toggle', at: 0.05, onAt: 0.55, y: 0.34, size: 90, enter: 'pop'},
      {type: 'avatars', letters: ['M', 'L', 'A', 'T'], at: 1.0, y: 0.62, enter: 'none'},
    ],
  },
  {
    id: 'every-coach',
    beats: 6,
    transition: 'panelLeft',
    background: 'light',
    glow: 'center',
    textY: 0.27,
    lines: [
      {text: '_Built for every coach._', enter: 'fade', size: 62},
      {text: '**{Fitness.|Career.|Business.}**', enter: 'mask', size: 230, at: 0.15, swapEvery: 1.1},
    ],
    visuals: [
      {
        type: 'programs',
        at: 0.3,
        y: 0.6,
        cards: [
          {title: '8-Week Fat Loss', meta: '$397 · Group program', chips: ['+14 new leads', '5 calls booked']},
          {title: 'Career Switch Sprint', meta: '$650 · 6 weeks', chips: ['+9 new leads', '3 calls booked']},
          {title: 'Scale to 10K Mastermind', meta: '$2,000 · 1:1', chips: ['+11 new leads', '4 calls booked']},
        ],
      },
    ],
  },

  // ══ PAYOFF + CTA ═══════════════════════════════════════════════════════════
  {
    id: 'zero',
    beats: 4,
    transition: 'whipDown',
    background: 'black',
    glow: 'none',
    visuals: [{type: 'leadWall'}],
    lines: [
      {text: '**ZERO**', enter: 'punch', size: 330},
      {text: '*missed leads.*', enter: 'tracking', size: 150, at: 0.35},
    ],
  },
  {
    id: 'cta',
    beats: 6,
    transition: 'iris',
    background: 'black',
    glow: 'center',
    textY: 0.55,
    camera: 'pull',
    lines: [
      {text: 'Comment *“AI”*', enter: 'rise', size: 160, at: 0.35},
      {text: '_to get your free demo._', enter: 'fade', size: 66, at: 0.8},
    ],
    visuals: [{type: 'logo', at: 0.0, y: 0.36, size: 200, enter: 'pop'}],
    sfx: [{name: 'hit', at: 0.35}],
  },
];

/** Scene used for the Instagram cover still (`npm run cover`). */
export const cover: SceneConfig = {
  lines: ['_Missing your_', {text: '*leads?*', size: 330}],
  background: 'black',
  glow: 'none',
  visuals: [{type: 'leadWall'}],
};
