import {createContext, useContext} from 'react';
import {theme} from '../config/theme';
import type {Background, BgToken} from '../engine/types';

export interface Palette {
  token: BgToken;
  text: string;
  accent: string;
  muted: string;
  glow: string;
  isLight: boolean;
}

export const paletteFor = (bg: Background, t = 0): Palette => {
  let token: BgToken;
  if (typeof bg === 'string') token = bg;
  else {
    const mid = ((bg.at ?? 0) + (bg.over ?? 0.5) / 2) * theme.fps;
    token = t < mid ? bg.from : bg.to;
  }
  return {token, ...theme.palettes[token], isLight: token === 'light'};
};

export const PaletteContext = createContext<Palette>(paletteFor('black'));
export const usePalette = () => useContext(PaletteContext);
