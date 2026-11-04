// Turns the human-friendly script into a frame-accurate timeline.
// Two modes:
//   • Beat mode   – scene lengths come from `beats`/`duration`, words auto-stagger.
//   • Voice mode  – a word-timestamp transcript drives every cut and word reveal.

import {audio} from '../config/audio';
import {theme} from '../config/theme';
import {lineHasCounter, parseLine, slotOptionCount} from './parse';
import type {
  EnterAnimation,
  LineConfig,
  SceneConfig,
  TLine,
  TScene,
  TSfx,
  Timeline,
  TranscriptWord,
  Word,
} from './types';

const FPS = theme.fps;
const sec = (s: number) => Math.round(s * FPS);
const beatFrames = (60 / theme.bpm) * FPS;

export const WORD_LEVEL: EnterAnimation[] = ['rise', 'words', 'chars', 'pop'];

const DEFAULT_DURATION_S = 2;
/** Voice mode: how early the cut happens before the first spoken word of a scene. */
const VO_LEAD_S = 0.12;
/** Voice mode: frames a word starts animating before it is spoken. */
const VO_ANTICIPATE = 3;

const toLineConfig = (l: string | LineConfig): LineConfig => (typeof l === 'string' ? {text: l} : l);

const configuredFrames = (s: SceneConfig) =>
  Math.max(
    6,
    Math.round(
      s.duration !== undefined
        ? s.duration * FPS
        : s.beats !== undefined
          ? s.beats * beatFrames
          : DEFAULT_DURATION_S * FPS,
    ),
  );

const defaultEnter = (s: SceneConfig): EnterAnimation => s.enter ?? 'rise';

// ─── Voice alignment ────────────────────────────────────────────────────────

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');

const lev1 = (a: string, b: string) => {
  // true if edit distance ≤ 1
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};

interface Entry {
  scene: number;
  line: number;
  word: number;
  /** -1 for regular text, k for slot option k */
  option: number;
  norm: string;
  time?: number;
  end?: number;
}

const flatten = (scenes: Word[][][]): Entry[] => {
  const out: Entry[] = [];
  scenes.forEach((lines, si) =>
    lines.forEach((words, li) =>
      words.forEach((w, wi) => {
        const text = norm(w.parts.map((p) => (p.kind === 'text' ? p.text : ' ')).join(''));
        if (text) out.push({scene: si, line: li, word: wi, option: -1, norm: text});
        for (const p of w.parts) {
          if (p.kind !== 'slot') continue;
          p.options.forEach((opt, k) =>
            opt.forEach((ow) => {
              const n = norm(ow.parts.map((pp) => (pp.kind === 'text' ? pp.text : '')).join(''));
              if (n) out.push({scene: si, line: li, word: wi, option: k, norm: n});
            }),
          );
        }
      }),
    ),
  );
  return out;
};

const align = (entries: Entry[], transcript: TranscriptWord[], offset: number) => {
  const tr = transcript.map((t) => ({...t, n: norm(t.word)})).filter((t) => t.n);
  let p = 0;
  for (const e of entries) {
    for (let j = p; j < Math.min(tr.length, p + 10); j++) {
      const t = tr[j];
      if (t.n === e.norm || (e.norm.length >= 4 && lev1(t.n, e.norm)) || (e.norm.length >= 5 && t.n.startsWith(e.norm))) {
        e.time = t.start + offset;
        e.end = t.end + offset;
        p = j + 1;
        break;
      }
    }
  }
  // Interpolate anything the transcript didn't match.
  const known = entries.map((e, i) => (e.time !== undefined ? i : -1)).filter((i) => i >= 0);
  if (!known.length) return;
  entries.forEach((e, i) => {
    if (e.time !== undefined) return;
    const prev = [...known].reverse().find((k) => k < i);
    const next = known.find((k) => k > i);
    if (prev !== undefined && next !== undefined) {
      const a = entries[prev].time!;
      const b = entries[next].time!;
      e.time = a + ((b - a) * (i - prev)) / (next - prev);
    } else if (prev !== undefined) e.time = entries[prev].time! + 0.3 * (i - prev);
    else e.time = Math.max(0, entries[next!].time! - 0.3 * (next! - i));
    e.end = e.time + 0.25;
  });
};

// ─── Main ───────────────────────────────────────────────────────────────────

export function computeTimeline(script: SceneConfig[], transcript?: TranscriptWord[] | null): Timeline {
  const parsed = script.map((s) =>
    s.lines.map(toLineConfig).map((l) => parseLine(l.text, l.weight ?? theme.type.baseWeight)),
  );

  // 1) Scene cuts & lengths
  const synced = Boolean(transcript && transcript.length);
  let cuts: number[] = [];
  let durs: number[] = [];
  let entries: Entry[] = [];

  if (synced) {
    entries = flatten(parsed);
    align(entries, transcript!, audio.voiceover?.offset ?? 0);
    const sceneStart = script.map((_, i) => {
      const e = entries.find((x) => x.scene === i);
      return e?.time;
    });
    let prev = -Infinity;
    cuts = sceneStart.map((t, i) => {
      let c = i === 0 ? 0 : sec(Math.max(0, (t ?? 0) - VO_LEAD_S));
      if (t === undefined) c = prev + configuredFrames(script[i - 1] ?? script[i]);
      c = Math.max(c, prev + 9);
      prev = c;
      return c;
    });
    const lastEntries = entries.filter((e) => e.scene === script.length - 1);
    const lastEnd = lastEntries.length ? Math.max(...lastEntries.map((e) => e.end ?? 0)) : 0;
    durs = cuts.map((c, i) =>
      i < cuts.length - 1
        ? cuts[i + 1] - c
        : Math.max(configuredFrames(script[i]), sec(lastEnd + 1.2) - c),
    );
  } else {
    let acc = 0;
    durs = script.map(configuredFrames);
    cuts = durs.map((d) => {
      const c = acc;
      acc += d;
      return c;
    });
  }

  const sfx: TSfx[] = [];
  const addSfx = (name: string | null | undefined, frame: number, volume = 1) => {
    if (name) sfx.push({name, frame: Math.max(0, Math.round(frame)), volume});
  };

  // 2) Scenes
  const scenes: TScene[] = script.map((s, si) => {
    const cut = cuts[si];
    const dur = durs[si];
    const auto = s.autoSfx !== false;
    const ws = sec(s.wordStagger ?? theme.motion.wordStagger) || 1;
    const ls = sec(s.lineStagger ?? theme.motion.lineStagger);
    const exitFrames = sec(theme.motion.exitDuration);
    const lineCfgs = s.lines.map(toLineConfig);
    const nLines = lineCfgs.length;

    let t = sec(s.delay ?? 0);
    let marqueeIdx = 0;

    const lines: TLine[] = lineCfgs.map((lc, li) => {
      const words = parsed[si][li];
      const enter = lc.enter ?? defaultEnter(s);
      const wordLevel = WORD_LEVEL.includes(enter);
      const exit = lc.exit ?? s.exit ?? 'none';

      // Word timings
      let wordStarts: number[];
      let start: number;
      const lineEntries = entries.filter((e) => e.scene === si && e.line === li);
      if (synced && lineEntries.length) {
        const wordTime = (wi: number) => {
          const e = lineEntries.find((x) => x.word === wi && x.option <= 0);
          return e?.time;
        };
        const raw = words.map((_, wi) => wordTime(wi));
        const firstKnown = raw.find((x) => x !== undefined) ?? lineEntries[0].time!;
        wordStarts = raw.map((x) => sec((x ?? firstKnown) - cut / FPS) - VO_ANTICIPATE);
        for (let i = 1; i < wordStarts.length; i++) wordStarts[i] = Math.max(wordStarts[i], wordStarts[i - 1]);
        start = lc.at !== undefined ? sec(lc.at) : Math.max(0, wordStarts[0]);
        if (lc.at !== undefined) wordStarts = wordStarts.map((w, i) => start + i * ws);
        if (!wordLevel) wordStarts = wordStarts.map(() => start);
      } else {
        start = lc.at !== undefined ? sec(lc.at) : t;
        const per = enter === 'chars' ? Math.round(ws * 1.6) : ws;
        wordStarts = words.map((_, wi) => (wordLevel ? start + wi * per : start));
        t = wordLevel ? start + words.length * per : start + ls;
      }
      wordStarts = wordStarts.map((w) => Math.max(0, w));

      // Slots
      const nOpts = slotOptionCount(words);
      const slotChanges: number[] = [];
      if (nOpts > 1) {
        if (synced && lineEntries.some((e) => e.option > 0)) {
          for (let k = 1; k < nOpts; k++) {
            const e = lineEntries.find((x) => x.option === k);
            slotChanges.push(e ? sec(e.time! - cut / FPS) - VO_ANTICIPATE : (slotChanges[k - 2] ?? start) + sec(theme.motion.swapHold));
          }
        } else {
          const slotWord = words.findIndex((w) => w.parts.some((p) => p.kind === 'slot'));
          const s0 = wordStarts[Math.max(0, slotWord)];
          const room = dur - s0 - (exit !== 'none' ? exitFrames : 0) - sec(0.55);
          const hold = Math.min(sec(lc.swapEvery ?? theme.motion.swapHold), Math.max(6, Math.floor(room / (nOpts - 1))));
          let prev = s0;
          for (let k = 1; k < nOpts; k++) {
            let f = s0 + k * hold;
            if (theme.motion.snapToBeat && lc.swapEvery === undefined) {
              const snapped = Math.round((cut + f) / beatFrames) * beatFrames - cut;
              if (Math.abs(snapped - f) <= hold * 0.4) f = Math.round(snapped);
            }
            f = Math.max(f, prev + 6);
            slotChanges.push(f);
            prev = f;
          }
        }
      }

      const isMarquee = enter === 'marquee';
      const direction = lc.direction ?? (marqueeIdx++ % 2 === 0 ? 'left' : 'right');

      return {
        words,
        enter,
        exit,
        size: lc.size ?? (isMarquee ? 300 : 'fit'),
        baseWeight: lc.weight ?? theme.type.baseWeight,
        align:
          lc.align ??
          s.align ??
          (s.layout === 'left'
            ? 'left'
            : s.layout === 'right'
              ? 'right'
              : s.layout === 'spread' && nLines > 1
                ? li === 0
                  ? 'left'
                  : li === nLines - 1
                    ? 'right'
                    : 'center'
                : 'center'),
        tracking: lc.tracking ?? 0,
        drift: lc.drift ?? {},
        start,
        wordStarts,
        // top line leaves first, 2 frames apart; the last line finishes exactly on the cut
        exitStart: exit === 'none' ? null : dur - exitFrames - (nLines - 1 - li) * 2,
        slotChanges,
        countFrames: sec(lc.countFor ?? theme.motion.countFor),
        speed: lc.speed ?? 260,
        direction: isMarquee ? direction : 'left',
      };
    });

    // Transition into this scene
    const transition = si === 0 ? 'cut' : (s.transition ?? 'cut');
    const maxT = Math.floor(Math.min(dur, durs[si - 1] ?? dur) * 0.6);
    const transitionFrames = Math.min(theme.transitionFrames[transition], maxT);

    // Sound
    if (auto && si > 0) addSfx(audio.autoSfx.transitions[transition], cut - Math.ceil(transitionFrames / 2) - 2);
    lines.forEach((l) => {
      if (!auto) return;
      addSfx(audio.autoSfx.enter[l.enter], cut + l.start);
      l.slotChanges.forEach((f) => addSfx(audio.autoSfx.slotSwap, cut + f));
      if (lineHasCounter(l.words)) addSfx(audio.autoSfx.counter, cut + l.start, 0.6);
    });
    const extra = s.sfx === undefined ? [] : Array.isArray(s.sfx) ? s.sfx : [s.sfx];
    extra.forEach((x) =>
      typeof x === 'string' ? addSfx(x, cut) : addSfx(x.name, cut + sec(x.at ?? 0), x.volume ?? 1),
    );

    // Visual sounds
    const visuals = s.visuals ?? [];
    if (auto)
      visuals.forEach((v) => {
        const at = cut + sec(v.at ?? 0);
        if (v.type === 'phone') v.notifications.forEach((_, i) => addSfx('tick', at + 14 + i * 9, 0.8));
        else if (v.type === 'pill') {
          addSfx('pop', at + 4);
          (v.swapAt ?? []).forEach((x) => addSfx('tick', cut + sec(x)));
        } else if (v.type === 'toggle') addSfx('tick', cut + sec(v.onAt ?? (v.at ?? 0) + 0.5));
        else if (v.type === 'chips') addSfx('tick', cut + sec(v.activeAt ?? (v.at ?? 0) + 0.6), 0.7);
        else if (v.type === 'chat') v.messages.forEach((m) => addSfx('pop', cut + sec(m.at), 0.45));
        else if (v.type === 'logo' || v.type === 'avatars') addSfx('pop', at + 2, 0.6);
        else if (v.type !== 'leadWall') addSfx('swoosh', at - 2, 0.55);
      });

    const layout = s.layout ?? 'center';
    return {
      index: si,
      id: s.id ?? `scene-${si + 1}`,
      cut,
      dur,
      transition,
      transitionFrames,
      background: s.background ?? (si % 2 === 0 ? 'black' : 'grey'),
      layout,
      camera: s.camera ?? 'push',
      reflow: s.reflow ?? (layout === 'center' || layout === 'left' || layout === 'right'),
      glow: s.glow ?? 'center',
      textY: s.textY ?? theme.safe.centerY,
      visuals,
      slotChanges: lines.find((l) => l.slotChanges.length)?.slotChanges ?? [],
      lines,
    };
  });

  const last = scenes[scenes.length - 1];
  return {
    fps: FPS,
    totalFrames: last ? last.cut + last.dur : 1,
    scenes,
    sfx: sfx.sort((a, b) => a.frame - b.frame),
    synced,
  };
}

// ─── Transcript loading (many formats) ──────────────────────────────────────

type AnyObj = Record<string, unknown>;

/** Accepts OpenAI verbose_json, whisper.cpp JSON, Remotion Caption[], or [{word,start,end}]. */
export function normalizeTranscript(raw: unknown): TranscriptWord[] {
  const out: TranscriptWord[] = [];
  const push = (o: AnyObj) => {
    const word = String(o.word ?? o.text ?? o.token ?? '').trim();
    if (!word) return;
    let start: number;
    let end: number;
    if (typeof o.startMs === 'number') {
      start = o.startMs / 1000;
      end = Number(o.endMs ?? o.startMs) / 1000;
    } else if (o.offsets && typeof o.offsets === 'object') {
      const off = o.offsets as AnyObj;
      start = Number(off.from) / 1000;
      end = Number(off.to) / 1000;
    } else {
      start = Number(o.start ?? o.startTime ?? 0);
      end = Number(o.end ?? o.endTime ?? start);
    }
    // Whisper sometimes emits multi-word tokens: split evenly.
    const parts = word.split(/\s+/).filter(Boolean);
    parts.forEach((w, i) => {
      const a = start + ((end - start) * i) / parts.length;
      const b = start + ((end - start) * (i + 1)) / parts.length;
      out.push({word: w, start: a, end: b});
    });
  };
  const walk = (x: unknown) => {
    if (Array.isArray(x)) x.forEach((i) => (i && typeof i === 'object' && !('words' in i) ? push(i as AnyObj) : walk(i)));
    else if (x && typeof x === 'object') {
      const o = x as AnyObj;
      if (Array.isArray(o.words)) walk(o.words);
      else if (Array.isArray(o.segments)) walk(o.segments);
      else if (Array.isArray(o.transcription)) walk(o.transcription);
      else if (Array.isArray(o.captions)) walk(o.captions);
    }
  };
  walk(raw);
  return out.sort((a, b) => a.start - b.start);
}
