import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, seeded, TornPaper, TYPE} from '../components/TornPaper';
import {PaperTexture} from '../components/PaperTexture';

export const INTRO_FRAMES = 120;
export const LOGO = staticFile('channel/logo-cultura-generalis.jpg');

// Vertical torn edge used to reveal the logo.
const edge = (x: number, h: number) => {
  const r = seeded(77);
  const pts: string[] = [];
  for (let y = -20; y <= h + 20; y += 18) pts.push(`${(x + (r() - 0.5) * 40 + Math.sin(y / 120) * 30).toFixed(1)},${y}`);
  return pts;
};

// Channel opener (16:9 only): the Cultura Generalis logo is revealed by a paper tear, then "présente".
export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const reveal = spring({frame: f - 4, fps, config: {damping: 200}, durationInFrames: 22});
  const x = interpolate(reveal, [0, 1], [width + 80, -120]);
  const pts = edge(x, height);
  const clip = `path('M${width + 200},-50 L${pts.join(' L')} L${width + 200},${height + 50} Z')`;
  const zoom = interpolate(f, [0, INTRO_FRAMES], [1.12, 1.0]);
  const strip = spring({frame: f - 52, fps, config: {damping: 14}});
  const typed = 'PRÉSENTE'.slice(0, Math.max(0, Math.floor((f - 60) / 2.5)));
  const out = interpolate(f, [INTRO_FRAMES - 12, INTRO_FRAMES], [0, 1], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{clipPath: clip}}>
        <Img src={LOGO} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
      </AbsoluteFill>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(-8px 0 10px rgba(0,0,0,0.5))'}}>
        <path d={`M${pts.map((p) => p.replace(/^([\d.-]+)/, (m) => (parseFloat(m) - 7).toFixed(1))).join(' L')}`} stroke={C.fiber} strokeWidth={12} fill="none" />
      </svg>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - strip) * 300}px)`}}>
        <TornPaper x={width / 2} y={height - 52} w={400} h={76} seed={701} rotate={-1.5}>
          <div style={{fontFamily: TYPE, fontSize: 48, color: C.ink, textAlign: 'center', lineHeight: '78px', letterSpacing: 6}}>{typed}</div>
        </TornPaper>
      </div>
      <PaperTexture />
      <AbsoluteFill style={{background: C.ink, opacity: out}} />
      <Audio src={staticFile('audio/tear.mp3')} volume={0.6} />
      <Sequence from={52} layout="none">
        <Audio src={staticFile('audio/tear.mp3')} volume={0.35} />
      </Sequence>
      <Audio src={staticFile('audio/drone.mp3')} volume={(fr) => Math.pow(10, -18 / 20) * interpolate(fr, [0, 20, INTRO_FRAMES - 15, INTRO_FRAMES], [0, 1, 1, 0], {extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};
