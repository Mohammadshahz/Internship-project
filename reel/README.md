# Kinetic Typography Reel Generator

A Remotion + React + TypeScript system for making cinematic kinetic-typography Instagram Reels
(1080 × 1920, 30 fps, H.264). You write the script in **one file**; the engine handles layout,
type sizing, animation, transitions, motion blur, sound effects and voiceover sync.

```
out/reel.mp4    ← final export (33 s, H.264 High / yuv420p / BT.709, AAC 320k)
out/cover.png   ← Instagram cover frame
```

---

## 1. Visual language

The look is built around the brief's style: flat electric-blue full-bleed frames, oversized white
type, and every cut on the beat.

| Element | Rule used in this system |
|---|---|
| **Colour** | Only two backgrounds: `#0647FF` electric blue and `#071B49` navy, alternating scene to scene. Text is always `#FFFFFF`. A very soft light falloff and animated film grain stop the flat colour looking like a slide. |
| **Type** | Inter Display (bundled, SIL OFL). Emphasis comes from **weight and size, never colour**: ExtraLight 200 ↔ Medium 500 ↔ Black 900. Heavier weights get tighter tracking (−0.045 em), the way a typesetter would set them. |
| **Composition** | Lines are justified to the frame width (`size: 'fit'`), so a short heavy word gets huge and a long light phrase gets small. That gives the "stacked poster" look. Alternative layouts are editorial `spread` (top-left / centre / bottom-right), left-aligned, top and bottom. Everything stays inside the Instagram UI-safe area. |
| **Rhythm** | 100 BPM grid, 1 beat = 18 frames. Scenes are 3–7 beats long, so hard cuts and swaps land on the kick. Words arrive about 90 ms apart, which matches speaking cadence. |
| **Motion** | Expo-out arrivals (`cubic-bezier(.16,1,.3,1)`), expo-in exits, expo-in-out camera moves. Every scene has a slow camera push/pull/drift so nothing sits dead still. Directional (not uniform) motion blur scales with each element's real velocity. |
| **Transitions** | Hard cuts with a 6% scale kick, whip-pans with shutter blur, parallax panel wipes, push, zoom-through and iris. No fades or cross-dissolves unless asked. |

## 2. Quick start

```bash
cd reel
npm install
npm run studio            # live preview + timeline scrubbing at http://localhost:3000
npm run render            # → out/reel.mp4
npm run cover             # → out/cover.png
```

> **Headless/CI machines:** if Remotion can't download its browser, point it at an installed Chrome:
> `npx remotion render Reel out/reel.mp4 --browser-executable=/path/to/chrome`

Render settings (H.264, CRF 19, yuv420p, BT.709, AAC 320k) live in `remotion.config.ts`.

## 3. Changing the script

Edit **`src/config/script.ts`**. Each scene is one beat of the story:

```ts
{
  beats: 5,                       // or duration: 2.4 (seconds)
  transition: 'whip',             // how we get INTO this scene
  background: 'navy',
  enter: 'rise',                  // default for every line
  exit: 'up',
  lines: [
    '_Your best idea_',           // plain strings…
    'is **still**',
    { text: '**in your head.**', size: 'fit', drift: { tracking: 0.1 } },  // …or objects
  ],
}
```

### Inline markup

| Markup | Result |
|---|---|
| `**word**` | Black 900 |
| `_word_` | ExtraLight 200 |
| `*word*` | Italic |
| `[word]` | Underline that draws on |
| `~~word~~` | Strike-through that draws on (the word dims) |
| `((word))` | Hand-drawn circle |
| `{messy.\|small.\|now.}` | Rolling word swap; the line re-centres as the width changes |
| `{#1..365}` | Count-up with tabular digits (`{#0..9.5}` gives one decimal) |
| `\*` | Literal character |

### Animations

| `enter` | |
|---|---|
| `rise` | Word by word, rising out of a mask with a slight rotation (signature reveal) |
| `mask` | Whole line rises out of a mask |
| `words` | Word by word: blur + lift + fade |
| `chars` | Letter cascade |
| `pop` | Word by word, spring scale with overshoot |
| `punch` | Line slams in from 175% scale with blur (impact words) |
| `tracking` | Letters converge from wide letter-spacing |
| `fromLeft` `fromRight` `fromTop` `fromBottom` | Line flies in with directional motion blur |
| `marquee` | Endless horizontal scroll; direction alternates per line |
| `fade`, `none` | Supporting copy / static |

`exit`: `up` `down` (masked, word by word) · `left` `right` (whip off) · `scale` · `blur` · `fade` · `none`

`transition`: `cut` · `whip`/`whipLeft`/`whipRight`/`whipUp`/`whipDown` · `push` ·
`panel`/`panelUp`/`panelDown`/`panelLeft`/`panelRight` · `zoom` · `iris` · `dissolve`

`layout`: `center` (re-flows as lines build) · `top` · `bottom` · `left` · `right` · `spread`
`camera`: `push` · `pull` · `drift` · `none`

Line options: `size` (`'fit'` or px), `weight`, `align`, `tracking`, `at` (seconds),
`drift: {x, y, tracking, scale}`, `swapEvery`, `countFor`, `speed`, `direction`.

Brand colours, fonts, BPM, safe areas, motion-blur strength and default timings are in
**`src/config/theme.ts`**.

## 4. Audio and voiceover sync

All audio settings are in **`src/config/audio.ts`**. Files go in `public/audio/`.

- **Music:** replace `public/audio/music.mp3` and set `theme.bpm` to your track's tempo, so
  scene `beats` stay on the beat. Volume, fade in/out and start offset are configurable.
  Music is ducked automatically under a voiceover.
- **Sound effects:** transitions, punches, swaps and counters trigger SFX automatically (`autoSfx`).
  To add more, use `sfx: ['hit', {name: 'pop', at: 0.6}]` on any scene. Drop your own files into
  `public/audio/sfx/` and register them in `sfx.library`.
- **Voiceover sync:**
  1. Put `voiceover.mp3` in `public/audio/`.
  2. Generate word timestamps with any of these. The loader accepts all of them:
     - OpenAI Whisper API (`response_format=verbose_json`, `timestamp_granularities=["word"]`)
     - whisper.cpp (`-ojf` / `--output-json-full`, or `-ml 1` for word-level)
     - `@remotion/install-whisper-cpp` / `@remotion/captions` `Caption[]`
     - any `[{ "word": "...", "start": 0.12, "end": 0.40 }]`
  3. Save the result as `public/audio/voiceover.json` and uncomment the `voiceover` block in `audio.ts`.

  `beats`/`duration` are then ignored. Each scene cuts 0.12 s before its first spoken word,
  every word starts animating 3 frames before it is spoken, and `{a|b|c}` swaps happen when
  each option is said. The script and transcript are matched with fuzzy alignment, so small
  wording differences and filler words don't break it. The video length follows the voice.

The bundled music bed and SFX are **original placeholders** synthesised with ffmpeg
(`npm run audio:placeholders`). Replace them with licensed audio before publishing.

## 5. Scene breakdown (default script, 100 BPM)

| # | Time | Text | Enter / exit | Transition in | Layout / background |
|---|---|---|---|---|---|
| 1 | 0.0–3.0 s | *Your best idea* / is **still** / **in your head.** | rise → up | — | centre, justified stack · blue |
| 2 | 3.0–5.4 | *Not because* / it's ~~**bad.**~~ | words | cut + kick | centre, camera pull · navy |
| 3 | 5.4–9.0 | *Because you're* / **WAITING** (tracking keeps spreading) / *for the perfect moment.* | words, tracking, fade | whip left | centre · blue |
| 4 | 9.0–12.0 | *There is* / **NO** / *perfect moment.* | fromLeft, punch, fromRight | panel up | spread, opposing drift · navy |
| 5 | 12.0–15.6 | *Start* / **{messy. → small. → now.}** | rise → left | zoom-through | left · blue |
| 6 | 15.6–19.2 | **PROGRESS** / *beats* / **PERFECTION** | marquee, alternating | cut + kick | full-bleed · navy |
| 7 | 19.2–21.6 | One step. / *Every single* / [**day.**] | pop | push | centre · blue |
| 8 | 21.6–24.6 | **1 → 365** / *days from now* | punch, tracking | whip up | centre · navy |
| 9 | 24.6–27.0 | *you'll* / ((**thank**)) / *yourself.* | chars → blur | panel left | centre · blue |
| 10 | 27.0–28.8 | *So* / **build it.** | words, punch (+ hit) | cut + kick | centre · navy |
| 11 | 28.8–33.0 | *Follow for more* / [**@yourhandle**] | rise | iris | centre, camera pull · blue |

## 6. Project structure

```
reel/
├─ src/
│  ├─ config/            ← EDIT THESE
│  │  ├─ script.ts       scenes + text (markup cheat-sheet at the top)
│  │  ├─ theme.ts        colours, type, BPM, safe area, motion defaults
│  │  └─ audio.ts        voiceover, music, sfx
│  ├─ engine/
│  │  ├─ parse.ts        inline markup → words/parts
│  │  ├─ timeline.ts     beats or transcript → frame-accurate timeline, voice alignment, sfx cues
│  │  ├─ measure.ts      canvas text measurement, fit-to-width sizing, weight-aware tracking
│  │  ├─ motion.ts       easing curves + helpers
│  │  └─ fonts.ts        bundled font loading
│  ├─ components/
│  │  ├─ Reel.tsx        master composition: scene scheduling, transitions, audio
│  │  ├─ Scene.tsx       background, camera, line layout / re-flow
│  │  ├─ TextLine.tsx    every enter/exit animation, slots, counters, marquee
│  │  ├─ Accent.tsx      SVG underline / strike / circle draw-ons
│  │  ├─ MotionBlur.tsx  velocity-based directional blur (SVG filter)
│  │  ├─ transitions.ts  transition presentations
│  │  ├─ Background.tsx  brand backgrounds + film grain
│  │  └─ Cover.tsx       cover still
│  └─ Root.tsx           compositions (Reel, Cover)
├─ public/  fonts/ audio/ textures/
└─ scripts/make-placeholder-audio.sh
```

In Studio, turn on the `showSafeZone` prop to overlay the Instagram UI zones while you lay out text.
