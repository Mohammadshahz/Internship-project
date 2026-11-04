import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {theme} from '../config/theme';

// Inter Display (SIL Open Font License) is bundled in public/fonts so renders are
// identical on every machine. To use another family, drop .woff2 files in
// public/fonts and edit this table.
const FILES: Array<[number, 'normal' | 'italic', string]> = [
  [100, 'normal', 'InterDisplay-Thin'],
  [200, 'normal', 'InterDisplay-ExtraLight'],
  [200, 'italic', 'InterDisplay-ExtraLightItalic'],
  [300, 'normal', 'InterDisplay-Light'],
  [300, 'italic', 'InterDisplay-LightItalic'],
  [400, 'normal', 'InterDisplay-Regular'],
  [500, 'normal', 'InterDisplay-Medium'],
  [500, 'italic', 'InterDisplay-MediumItalic'],
  [600, 'normal', 'InterDisplay-SemiBold'],
  [700, 'normal', 'InterDisplay-Bold'],
  [800, 'normal', 'InterDisplay-ExtraBold'],
  [900, 'normal', 'InterDisplay-Black'],
  [900, 'italic', 'InterDisplay-BlackItalic'],
];

const SERIF: Array<['normal' | 'italic', string]> = [
  ['normal', 'InstrumentSerif-Regular'],
  ['italic', 'InstrumentSerif-Italic'],
];

let loaded = false;
let promise: Promise<void> | null = null;

const load = () => {
  if (!promise) {
    const faces = [
      ...FILES.map(([weight, style, file]) => new FontFace(theme.type.family, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight: String(weight), style})),
      ...SERIF.map(([style, file]) => new FontFace(theme.type.serif, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight: '400', style})),
    ];
    promise = Promise.all(
      faces.map(async (face) => {
        await face.load();
        document.fonts.add(face);
      }),
    ).then(() => {
      loaded = true;
    });
  }
  return promise;
};

/** Returns true once every weight is ready (rendering waits for it). */
export const useFontsReady = () => {
  const [ready, setReady] = useState(loaded);
  const [handle] = useState(() => (loaded ? null : delayRender('Loading fonts')));
  useEffect(() => {
    if (loaded) return;
    load()
      .then(() => {
        setReady(true);
        if (handle !== null) continueRender(handle);
      })
      .catch((e) => {
        console.error(e);
        if (handle !== null) continueRender(handle);
      });
  }, [handle]);
  return ready;
};
