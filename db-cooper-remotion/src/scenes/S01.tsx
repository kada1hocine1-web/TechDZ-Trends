import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Tape} from '../components/Tape';
import {Stamp} from '../components/Stamp';
import {cue} from '../data/script';

export const S01: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const date = '24 NOVEMBRE 1971';
  const typed = date.slice(0, Math.max(0, Math.floor((f - 4) / 2)));
  const inFolder = spring({frame: f, fps, config: {damping: 16}});
  const open = spring({frame: f - cue('s01', 'homme', 0.2), fps, config: {damping: 20, stiffness: 70}});
  const gone = cue('s01', 'disparaît', 0.45);
  const plane = interpolate(f, [gone - 10, gone + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const title = cue('s01', 'énigme', 0.7);

  return (
    <AbsoluteFill style={{background: C.ink}}>
      <TornPaper x={540} y={335} w={780} h={120} seed={11} rotate={-2.5}>
        <div style={{fontFamily: TYPE, fontSize: 76, color: C.ink, textAlign: 'center', lineHeight: '120px'}}>
          {typed}
          <span style={{opacity: Math.floor(f / 6) % 2 ? 1 : 0}}>_</span>
        </div>
      </TornPaper>

      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - inFolder) * 900}px)`}}>
        {/* folder back + inner sheet */}
        <TornPaper x={540} y={760} w={860} h={600} seed={21} color={C.kraft} rotate={1.5} />
        <TornPaper x={545} y={770} w={780} h={530} seed={22} rotate={-1}>
          <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontFamily: TYPE, fontSize: 34, color: C.ink, opacity: 0.8}}>
            VOL 305
          </div>
          {f >= title && (
            <>
              <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: TITLE, fontSize: 150, color: C.ink, lineHeight: 1}}>
                L'ÉNIGME
              </div>
            </>
          )}
        </TornPaper>
        {f >= title && (
          <TornPaper x={545} y={955} w={700} h={190} seed={23} color={C.red} rotate={-3}>
            <div style={{fontFamily: TITLE, fontSize: 190, color: C.cream, textAlign: 'center', lineHeight: '205px'}}>D.B. COOPER</div>
          </TornPaper>
        )}
        {/* cover swinging open */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            perspective: 1800,
            perspectiveOrigin: '110px 760px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: '110px 760px',
              transform: `rotateY(${-open * 115}deg)`,
              opacity: open > 0.97 ? 0 : 1,
            }}
          >
            <TornPaper x={540} y={760} w={860} h={600} seed={24} color={C.kraft} rotate={1.5}>
              <div style={{position: 'absolute', top: 70, left: 70, right: 70, height: 140, background: C.cream, transform: 'rotate(-1deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: TYPE, fontSize: 50, color: C.ink}}>
                FBI — AFFAIRE NORJAK
              </div>
              <div style={{position: 'absolute', bottom: 80, left: 70, right: 70, borderTop: `3px solid ${C.ink}`, opacity: 0.4}} />
              <div style={{position: 'absolute', bottom: 130, left: 70, right: 70, borderTop: `3px solid ${C.ink}`, opacity: 0.4}} />
            </TornPaper>
          </div>
        </div>
        <Tape x={170} y={470} rotate={-38} seed={3} />
        <Tape x={920} y={1060} rotate={-35} seed={4} />
      </div>

      {/* "disappears forever": a tiny plane leaves the paper strip */}
      <TornPaper x={540} y={1470} w={880} h={150} seed={31} color={C.cream} rotate={1.5}>
        <svg width={880} height={150}>
          <path d="M40 110 Q 300 20 840 60" stroke={C.red} strokeWidth={5} fill="none" pathLength={1} style={{strokeDasharray: `${plane} 1`}} />
          <g transform={`translate(${40 + plane * 800} ${110 - Math.sin(plane * Math.PI * 0.9) * 70}) rotate(-8)`} opacity={1 - Math.max(0, plane - 0.8) * 5}>
            <path d="M-30 0 L30 0 L40 6 L-30 8 Z M-5 2 L-18 22 L-8 22 L10 4 Z M-28 0 L-36 -16 L-28 -16 L-18 0 Z" fill={C.ink} />
          </g>
        </svg>
      </TornPaper>
      <Stamp x={760} y={1470} start={gone + 20} size={80} rotate={-10}>
        DISPARU
      </Stamp>
    </AbsoluteFill>
  );
};
