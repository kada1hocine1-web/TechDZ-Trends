import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE} from '../components/TornPaper';
import {PaperTexture} from '../components/PaperTexture';
import {Tape} from '../components/Tape';
import {LOGO} from './Intro';

export const OUTRO_FRAMES = 240;

// Where the medallion sits in the 2000x1091 logo image.
const MEDAL = {cx: 1000, cy: 530, r: 470, imgW: 2000};

const CLICK_SUB = 95;
const CLICK_BELL = 150;

const Cursor: React.FC = () => (
  <svg width={56} height={70} viewBox="0 0 28 35">
    <path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill={C.cream} stroke={C.ink} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

const Bell: React.FC<{ring: number}> = ({ring}) => (
  <svg width={90} height={90} viewBox="0 0 48 48" style={{transform: `rotate(${Math.sin(ring * 1.4) * 22 * Math.exp(-ring / 25)}deg)`, transformOrigin: '50% 10%'}}>
    <path d="M24 5 C 15 5 11 12 11 20 L11 30 L6 36 L42 36 L37 30 L37 20 C 37 12 33 5 24 5 Z" fill={C.cream} stroke={C.ink} strokeWidth={2.5} />
    <circle cx={24} cy={41} r={4} fill={C.cream} stroke={C.ink} strokeWidth={2.5} />
  </svg>
);

// Channel closer (16:9 only): logo medallion + animated "subscribe" button and bell.
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const medal = spring({frame: f - 4, fps, config: {damping: 13}});
  const card = spring({frame: f - 14, fps, config: {damping: 14}});
  const subscribed = f >= CLICK_SUB;
  const bellOn = f >= CLICK_BELL;
  const press = (at: number) => interpolate(f, [at - 2, at, at + 5], [1, 0.9, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // cursor path: off-screen -> subscribe button -> bell
  const cx = interpolate(f, [50, CLICK_SUB - 5, CLICK_SUB + 20, CLICK_BELL - 5], [1980, 1210, 1210, 1545], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cy = interpolate(f, [50, CLICK_SUB - 5, CLICK_SUB + 20, CLICK_BELL - 5], [1120, 735, 735, 725], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const D = 560;
  const s = D / (MEDAL.r * 2);
  const out = interpolate(f, [OUTRO_FRAMES - 15, OUTRO_FRAMES], [0, 1], {extrapolateLeft: 'clamp'});
  const tagline = 'Pour ne manquer aucune histoire.';
  const typed = tagline.slice(0, Math.max(0, Math.floor((f - 34) / 1.2)));

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Img src={LOGO} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(10px) brightness(0.35)', transform: 'scale(1.1)'}} />
      {/* logo medallion */}
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: (1080 - D) / 2,
          width: D,
          height: D,
          borderRadius: '50%',
          backgroundImage: `url(${LOGO})`,
          backgroundSize: `${MEDAL.imgW * s}px auto`,
          backgroundPosition: `${-(MEDAL.cx * s - D / 2)}px ${-(MEDAL.cy * s - D / 2)}px`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          transform: `scale(${medal}) rotate(${(1 - medal) * -90}deg)`,
        }}
      />
      {/* subscribe card */}
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - card) * 1100}px)`}}>
        <TornPaper x={1320} y={540} w={900} h={620} seed={801} rotate={-1.2}>
          <div style={{position: 'absolute', top: 50, width: '100%', textAlign: 'center', fontFamily: TITLE, fontSize: 150, color: C.red, letterSpacing: 4, lineHeight: 1}}>
            ABONNE-TOI !
          </div>
          <div style={{position: 'absolute', top: 220, width: '100%', textAlign: 'center', fontFamily: TYPE, fontSize: 40, color: C.ink}}>{typed}</div>
          {/* subscribe button */}
          <div
            style={{
              position: 'absolute',
              left: 120,
              top: 330,
              width: 480,
              height: 110,
              borderRadius: 55,
              background: subscribed ? '#8a8578' : C.red,
              color: C.cream,
              fontFamily: TITLE,
              fontSize: 64,
              letterSpacing: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${press(CLICK_SUB)})`,
              boxShadow: '0 8px 0 rgba(0,0,0,0.35)',
            }}
          >
            {subscribed ? 'ABONNÉ ✓' : "S'ABONNER"}
          </div>
          <div style={{position: 'absolute', left: 650, top: 340, transform: `scale(${press(CLICK_BELL)})`}}>
            <Bell ring={bellOn ? f - CLICK_BELL : 0} />
          </div>
          {bellOn && (
            <div style={{position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontFamily: TYPE, fontSize: 36, color: C.red}}>ET ACTIVE LA CLOCHE</div>
          )}
        </TornPaper>
        <Tape x={900} y={250} rotate={-35} seed={81} />
        <Tape x={1740} y={830} rotate={-30} seed={82} />
      </div>
      <div style={{position: 'absolute', left: cx, top: cy, zIndex: 10, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))'}}>
        <Cursor />
      </div>
      <PaperTexture />
      <AbsoluteFill style={{background: C.ink, opacity: out}} />
      <Audio src={staticFile('audio/tear.mp3')} volume={0.5} />
      <Sequence from={CLICK_SUB} layout="none">
        <Audio src={staticFile('audio/click.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={CLICK_BELL} layout="none">
        <Audio src={staticFile('audio/click.mp3')} volume={0.8} />
      </Sequence>
      <Sequence from={CLICK_BELL + 2} layout="none">
        <Audio src={staticFile('audio/bell.mp3')} volume={0.5} />
      </Sequence>
      <Audio src={staticFile('audio/drone.mp3')} volume={(fr) => Math.pow(10, -20 / 20) * interpolate(fr, [0, 20, OUTRO_FRAMES - 20, OUTRO_FRAMES], [0, 1, 1, 0], {extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};
