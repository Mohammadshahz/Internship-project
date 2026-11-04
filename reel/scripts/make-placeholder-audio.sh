#!/usr/bin/env bash
# Generates ORIGINAL placeholder audio with ffmpeg (no third-party samples):
#   public/audio/music.mp3        – minimal 100 BPM pulse bed (replace with your track)
#   public/audio/sfx/*.wav        – whoosh, swoosh, hit, pop, tick, riser
# Re-run any time:  npm run audio:placeholders
set -euo pipefail
cd "$(dirname "$0")/../public/audio"
mkdir -p sfx

SR=48000
Q="-hide_banner -loglevel error -y"

# ---------- SFX ----------
# whoosh: band-limited pink noise with a swelling envelope (peak ≈ 0.22 s)
ffmpeg $Q -f lavfi -i "anoisesrc=d=0.45:c=pink:r=$SR:a=0.9" \
  -af "highpass=f=300,lowpass=f=4200,afade=t=in:st=0:d=0.22:curve=exp,afade=t=out:st=0.22:d=0.23:curve=exp,volume=1.4" \
  sfx/whoosh.wav

# swoosh: softer, darker, longer air movement
ffmpeg $Q -f lavfi -i "anoisesrc=d=0.6:c=brown:r=$SR:a=1" \
  -af "highpass=f=120,lowpass=f=2200,afade=t=in:st=0:d=0.3:curve=qsin,afade=t=out:st=0.3:d=0.3:curve=qsin,volume=2.2" \
  sfx/swoosh.wav

# hit: sub-boom with a pitch drop (impact under punch words)
ffmpeg $Q -f lavfi -i "aevalsrc='0.9*sin(2*PI*(42*t+(110/28)*(1-exp(-28*t))))*exp(-5.5*t)':s=$SR:d=0.9" \
  -af "lowpass=f=900" sfx/hit.wav

# pop: short rounded blip
ffmpeg $Q -f lavfi -i "aevalsrc='0.6*sin(2*PI*(520*t+(500/40)*(1-exp(-40*t))))*exp(-28*t)':s=$SR:d=0.18" sfx/pop.wav

# tick: tiny percussive click (slot swaps / counters)
ffmpeg $Q -f lavfi -i "aevalsrc='0.5*sin(2*PI*1800*t)*exp(-90*t)+0.25*sin(2*PI*3600*t)*exp(-140*t)':s=$SR:d=0.08" sfx/tick.wav

# riser: noise swell (build-ups)
ffmpeg $Q -f lavfi -i "anoisesrc=d=1.2:c=white:r=$SR:a=0.5" \
  -af "highpass=f=1500,afade=t=in:st=0:d=1.1:curve=exp,afade=t=out:st=1.1:d=0.1,volume=1.2" sfx/riser.wav

# ---------- MUSIC BED (100 BPM = 0.6 s per beat) ----------
B=0.6
DUR=40
# kick on every beat
ffmpeg $Q -f lavfi -i "aevalsrc='0.85*sin(2*PI*(46*mod(t,$B)+(95/30)*(1-exp(-30*mod(t,$B)))))*exp(-7*mod(t,$B))':s=$SR:d=$DUR" \
  -af "lowpass=f=700" /tmp/_kick.wav
# soft off-beat hat (filtered noise gated on the "and")
ffmpeg $Q -f lavfi -i "anoisesrc=d=$DUR:c=white:r=$SR:a=0.35" \
  -af "highpass=f=7000,volume='exp(-38*mod(t+$B/2,$B))':eval=frame" /tmp/_hat.wav
# minor pad: A–C–E–G with slow swell every 4 bars
ffmpeg $Q -f lavfi -i "aevalsrc='(0.10*sin(2*PI*110*t)+0.07*sin(2*PI*130.81*t)+0.06*sin(2*PI*164.81*t)+0.04*sin(2*PI*196*t))*(0.6+0.4*sin(2*PI*t/9.6))':s=$SR:d=$DUR" \
  -af "lowpass=f=1200" /tmp/_pad.wav
ffmpeg $Q -i /tmp/_kick.wav -i /tmp/_hat.wav -i /tmp/_pad.wav \
  -filter_complex "[0][1][2]amix=inputs=3:weights='1 0.5 1':normalize=0,afade=t=in:d=0.3,alimiter=limit=0.9" \
  -ac 2 -b:a 192k music.mp3
rm -f /tmp/_kick.wav /tmp/_hat.wav /tmp/_pad.wav
echo "Placeholder audio written to public/audio/"
