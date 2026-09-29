import React from 'react';
import {AbsoluteFill, spring, useVideoConfig} from 'remotion';
import {C, Stage, TITLE, TornPaper, useStep} from '../components/TornPaper';
import {Counter} from '../components/Counter';
import {cue} from '../data/script';

// Rotating DNA double helix.
export const Helix: React.FC<{width: number; height: number; frame: number; color?: string}> = ({width, height, frame, color = C.red}) => {
  const n = 22;
  return (
    <svg width={width} height={height}>
      {Array.from({length: n}).map((_, i) => {
        const y = (i / (n - 1)) * (height - 20) + 10;
        const ph = i * 0.55 + frame / 12;
        const a = width / 2 + Math.sin(ph) * (width / 2 - 14);
        const b = width / 2 - Math.sin(ph) * (width / 2 - 14);
        const front = Math.cos(ph) > 0;
        return (
          <g key={i}>
            <line x1={a} y1={y} x2={b} y2={y} stroke={C.kraft} strokeWidth={5} />
            <circle cx={a} cy={y} r={front ? 11 : 7} fill={color} />
            <circle cx={b} cy={y} r={front ? 7 : 11} fill={C.cream} stroke={C.ink} strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
};

export const S06: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const yearsAt = cue('s06', 'quarante', 0.2);
  const techAt = cue('s06', 'généalogie', 0.75);
  const tech = spring({frame: f - techAt, fps, config: {damping: 13}});
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <Stage>
        <TornPaper x={250} y={470} w={300} h={700} seed={61} color={C.night} rotate={-2}>
          <div style={{position: 'absolute', left: 30, top: 20}}>
            <Helix width={240} height={660} frame={f} />
          </div>
        </TornPaper>
        <Counter x={720} y={250} value={40} prefix="+ DE " suffix=" ANS" start={yearsAt} dur={20} size={96} rotate={-5} blend="normal" />
        {f >= techAt && (
          <div style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - tech) * 800}px)`}}>
            <TornPaper x={720} y={560} w={560} h={330} seed={62} color={C.red} rotate={2}>
              <div style={{fontFamily: TITLE, fontSize: 84, color: C.cream, textAlign: 'center', lineHeight: 1, paddingTop: 40, letterSpacing: 2}}>
                GÉNÉALOGIE
                <br />
                GÉNÉTIQUE
                <br />
                D'INVESTIGATION
              </div>
            </TornPaper>
          </div>
        )}
      </Stage>
    </AbsoluteFill>
  );
};
