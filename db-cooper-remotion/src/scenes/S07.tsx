import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, TYPE, useStep} from '../components/TornPaper';
import {Counter} from '../components/Counter';
import {Stamp} from '../components/Stamp';
import {Tape} from '../components/Tape';
import {Plane} from './S08';
import {cue} from '../data/script';

const ROUTE = 'M250 190 C 380 320, 470 470, 520 600';

const City: React.FC<{x: number; y: number; name: string}> = ({x, y, name}) => (
  <>
    <circle cx={x} cy={y} r={11} fill={C.ink} />
    <text x={x + 22} y={y + 10} fontFamily={TYPE} fontSize={32} fill={C.ink}>{name}</text>
  </>
);

export const S07: React.FC = () => {
  const f = useStep();
  const {fps} = useVideoConfig();
  const capAt = cue('s07', 'cap', 0.15);
  const route = interpolate(f, [capAt, capAt + 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const altAt = cue('s07', 'dix', 0.45);
  const alt = spring({frame: f - altAt, fps, config: {damping: 20, stiffness: 40}});
  const gearAt = cue('s07', 'train', 0.75);

  return (
    <AbsoluteFill style={{background: C.kraft}}>
      <TornPaper x={540} y={640} w={880} h={720} seed={701} rotate={-1.5}>
        <svg width={880} height={720}>
          {/* ocean hatching + coastline */}
          <defs>
            <pattern id="sea" width={18} height={18} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1={0} y1={0} x2={0} y2={18} stroke={C.night} strokeWidth={3} opacity={0.35} />
            </pattern>
          </defs>
          <path d="M0 0 L150 0 Q140 90 170 170 Q130 260 180 330 Q210 430 260 520 Q300 610 330 720 L0 720 Z" fill="url(#sea)" />
          <path d="M150 0 Q140 90 170 170 Q130 260 180 330 Q210 430 260 520 Q300 610 330 720" stroke={C.ink} strokeWidth={4} fill="none" />
          <City x={250} y={190} name="SEATTLE" />
          <City x={235} y={320} name="PORTLAND" />
          <path d={ROUTE} stroke={C.red} strokeWidth={8} fill="none" strokeDasharray="22 16" strokeDashoffset={0} />
          <path d={ROUTE} stroke={C.cream} strokeWidth={12} fill="none" pathLength={1} strokeDasharray={`${1 - route} 1`} strokeDashoffset={-route} />
          <path d="M520 600 L540 700" stroke={C.red} strokeWidth={8} strokeDasharray="22 16" opacity={route >= 1 ? 1 : 0} />
          <text x={30} y={690} fontFamily={TITLE} fontSize={48} fill={C.night} opacity={0.6}>NORD-OUEST PACIFIQUE</text>
        </svg>
      </TornPaper>
      <Tape x={130} y={290} rotate={-40} seed={71} />
      <Stamp x={760} y={900} start={capAt + 45} size={96} rotate={-8}>
        → MEXICO
      </Stamp>

      {/* altimeter */}
      <TornPaper x={280} y={1440} w={300} h={300} seed={702} color={C.ink} rotate={-3}>
        <svg width={300} height={300}>
          <circle cx={150} cy={150} r={128} fill="#1f1f1f" stroke={C.cream} strokeWidth={6} />
          {Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            return (
              <g key={i}>
                <line x1={150 + Math.cos(a) * 104} y1={150 + Math.sin(a) * 104} x2={150 + Math.cos(a) * 122} y2={150 + Math.sin(a) * 122} stroke={C.cream} strokeWidth={5} />
                <text x={150 + Math.cos(a) * 82} y={160 + Math.sin(a) * 82} textAnchor="middle" fontFamily={TYPE} fontSize={26} fill={C.cream}>{i}</text>
              </g>
            );
          })}
          <text x={150} y={205} textAnchor="middle" fontFamily={TYPE} fontSize={18} fill={C.kraft}>ALT × 1000 FT</text>
          <g transform={`rotate(${alt * 360 * 10} 150 150)`}>
            <line x1={150} y1={150} x2={150} y2={48} stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
          </g>
          <g transform={`rotate(${alt * 360} 150 150)`}>
            <line x1={150} y1={150} x2={150} y2={80} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
          </g>
          <circle cx={150} cy={150} r={12} fill={C.cream} />
        </svg>
      </TornPaper>
      <Counter x={760} y={1400} value={10000} suffix=" PIEDS" start={altAt} dur={36} size={60} rotate={5} />
      {f >= gearAt && (
        <div style={{position: 'absolute', left: 560, top: 1470, transform: `rotate(-4deg) translateY(${interpolate(f, [gearAt, gearAt + 10], [-60, 0], {extrapolateRight: 'clamp'})}px)`}}>
          <Plane width={400} gear />
          <div style={{fontFamily: TYPE, fontSize: 30, color: C.ink, textAlign: 'center'}}>TRAIN SORTI</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
