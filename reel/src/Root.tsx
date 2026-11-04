import React from 'react';
import {Composition, Still, staticFile} from 'remotion';
import {audio} from './config/audio';
import {script} from './config/script';
import {theme} from './config/theme';
import {computeTimeline, normalizeTranscript} from './engine/timeline';
import type {TranscriptWord} from './engine/types';
import {Reel, type ReelProps} from './components/Reel';
import {Cover} from './components/Cover';

const loadTranscript = async (): Promise<TranscriptWord[] | null> => {
  const path = audio.voiceover?.transcript;
  if (!path) return null;
  const res = await fetch(/^https?:\/\//.test(path) ? path : staticFile(path));
  if (!res.ok) throw new Error(`Could not load transcript ${path} (${res.status})`);
  return normalizeTranscript(await res.json());
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      width={theme.width}
      height={theme.height}
      fps={theme.fps}
      durationInFrames={computeTimeline(script).totalFrames}
      defaultProps={{transcript: null, showSafeZone: false} satisfies ReelProps}
      calculateMetadata={async ({props}) => {
        const transcript = await loadTranscript();
        return {
          durationInFrames: computeTimeline(script, transcript).totalFrames,
          props: {...props, transcript},
        };
      }}
    />
    {/* Instagram cover / thumbnail */}
    <Still id="Cover" component={Cover} width={theme.width} height={theme.height} />
  </>
);
