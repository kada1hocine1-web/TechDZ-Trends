import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { C, SANS } from "../lib/theme";

/**
 * Four Czochralski animé (d'après le schéma de principe de l'exposé).
 * Les phases sont pilotées par des frames données par la scène (synchronisées sur la voix).
 */
export type CzPhases = {
  melt: number;      // fusion de la charge
  contact: number;   // descente du germe et contact
  neck: number;      // tirage du col
  shoulder: number;  // épaulement
  body: number;      // corps du lingot
  rotation: number;  // apparition des flèches de contre-rotation
  heat: number;      // flèches de flux thermique
  cone: number;      // fin conique et sortie du bain
};

const NECK = 70;
const SHOULDER = 80;
const BODY = 210;
const CONE = 80;
const R_NECK = 7;
const R_BODY = 150;
const CX = 360;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

/** Rayon du cristal à la distance l (px) mesurée depuis le germe. */
const radius = (l: number) => {
  if (l <= NECK) return R_NECK;
  if (l <= NECK + SHOULDER) {
    const u = (l - NECK) / SHOULDER;
    return R_NECK + (R_BODY - R_NECK) * Math.sin((u * Math.PI) / 2);
  }
  if (l <= NECK + SHOULDER + BODY) return R_BODY;
  const u = Math.min(1, (l - NECK - SHOULDER - BODY) / CONE);
  return R_BODY * Math.cos((u * Math.PI) / 2) + 4 * (1 - u);
};

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; o: number; w?: number }> = ({ x1, y1, x2, y2, color, o, w = 5 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 16;
  const p1 = [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)];
  const p2 = [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)];
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2 - 8 * Math.cos(a)} y2={y2 - 8 * Math.sin(a)} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={color} />
    </g>
  );
};

/** Flèche de rotation : demi-ellipse dont les tirets défilent. */
const Spin: React.FC<{ cx: number; cy: number; rx: number; dir: 1 | -1; o: number; frame: number; label: string; labelX: number; labelY: number }> = ({ cx, cy, rx, dir, o, frame, label, labelX, labelY }) => {
  const ry = rx * 0.22;
  const x0 = cx - rx * dir;
  const x1 = cx + rx * dir;
  const sweep = dir === 1 ? 0 : 1;
  const d = `M ${x0} ${cy} A ${rx} ${ry} 0 0 ${sweep} ${x1} ${cy}`;
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={C.blue} strokeWidth={5} strokeDasharray="14 10" strokeDashoffset={-frame * 1.2} />
      <polygon points={`${x1},${cy} ${x1 - 18 * dir},${cy - 12} ${x1 - 14 * dir},${cy + 10}`} fill={C.blue} />
      <text x={labelX} y={labelY} fontSize={22} fill={C.blue} fontFamily={SANS}>
        {label.split("\n").map((l, i) => (
          <tspan key={i} x={labelX} dy={i ? 26 : 0}>{l}</tspan>
        ))}
      </text>
    </g>
  );
};

export const CzFurnace: React.FC<{ ph: CzPhases; width: number; height: number }> = ({ ph, width, height }) => {
  const f = useCurrentFrame();

  // longueur de cristal tirée
  const grown =
    interpolate(f, [ph.neck, ph.neck + 110], [0, NECK], ease) +
    interpolate(f, [ph.shoulder, ph.shoulder + 90], [0, SHOULDER], ease) +
    interpolate(f, [ph.body, ph.body + 150], [0, BODY], ease) +
    interpolate(f, [ph.cone, ph.cone + 70], [0, CONE], ease);
  const total = NECK + SHOULDER + BODY + CONE;

  // niveau du bain : baisse à mesure que la matière passe dans le cristal
  const melt0 = 610;
  const meltY = melt0 + 40 * (grown / total);
  // germe : descente jusqu'au bain, puis le cristal remonte à mesure qu'il croît
  const descend = interpolate(f, [ph.contact - 30, ph.contact + 60], [0, 1], ease);
  const lift = interpolate(f, [ph.cone + 70, ph.cone + 110], [0, 30], ease);
  const interfaceY = meltY - lift;
  const seedBottom = descend < 1 ? 120 + (melt0 - 120) * descend : interfaceY - grown;
  const seedTop = seedBottom - 46;

  // profil du cristal
  const pts: [number, number][] = [];
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const l = (grown * i) / steps;
    pts.push([CX + radius(l), seedBottom + l]);
  }
  const right = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const left = pts
    .slice()
    .reverse()
    .map(([x, y]) => `${2 * CX - x},${y}`)
    .join(" ");

  const meltGlow = interpolate(f, [ph.melt, ph.melt + 90], [0, 1], clamp);
  const chunks = 1 - meltGlow;
  const rotO = interpolate(f, [ph.rotation, ph.rotation + 15], [0, 1], clamp);
  const heatO = interpolate(f, [ph.heat, ph.heat + 20], [0, 1], clamp);
  const pulse = 0.75 + 0.25 * Math.sin(f / 6);
  const lbl = (at: number) => interpolate(f, [at, at + 15], [0, 1], clamp);

  // étiquettes du cristal : y souhaité, puis empilement sans chevauchement au-dessus
  // des étiquettes fixes du four (y > 570)
  const want = [
    { text: "germe orienté", at: ph.contact, show: true, ty: seedTop + 22, tx: CX + 10 },
    { text: "col (necking)", at: ph.neck + 20, show: grown > 5, ty: seedBottom + Math.min(grown, NECK) / 2, tx: CX + R_NECK + 2 },
    { text: "épaulement", at: ph.shoulder + 20, show: grown > NECK + 10, ty: seedBottom + NECK + 45, tx: CX + 100 },
    { text: "corps du lingot", at: ph.body + 30, show: grown > NECK + SHOULDER + 40, ty: seedBottom + NECK + SHOULDER + 100, tx: CX + R_BODY },
    { text: "fin conique", at: ph.cone + 30, show: grown > NECK + SHOULDER + BODY + 20, ty: seedBottom + total - 40, tx: CX + 70 },
  ].filter((d) => d.show);
  const dyn: { text: string; o: number; y: number; tx: number; ty: number }[] = [];
  let floor = 545;
  for (let i = want.length - 1; i >= 0; i--) {
    const y = Math.min(want[i].ty, floor);
    dyn.push({ text: want[i].text, o: lbl(want[i].at), y, tx: want[i].tx, ty: want[i].ty });
    floor = y - 36;
  }

  // bandes de rotation sur le corps
  const bands = [];
  if (grown > NECK + SHOULDER) {
    for (let k = 0; k < 6; k++) {
      const phase = ((f * 2 + k * 30) % 180) / 180;
      const x = CX - R_BODY + 2 * R_BODY * phase;
      bands.push(
        <line key={k} x1={x} y1={seedBottom + NECK + SHOULDER} x2={x} y2={Math.min(seedBottom + grown, seedBottom + NECK + SHOULDER + BODY)} stroke="#FFFFFF" strokeOpacity={0.12 * Math.sin(phase * Math.PI)} strokeWidth={10} />
      );
    }
  }

  return (
    <svg width={width} height={height} viewBox="0 0 900 900" style={{ fontFamily: SANS }}>
      <defs>
        <linearGradient id="si" x1="0" x2="1">
          <stop offset="0" stopColor="#3D4C5C" />
          <stop offset="0.35" stopColor="#7A8A9A" />
          <stop offset="0.55" stopColor="#5B6B7C" />
          <stop offset="1" stopColor="#2F3C49" />
        </linearGradient>
        <linearGradient id="melt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.gold} />
          <stop offset="1" stopColor={C.orange} />
        </linearGradient>
        <clipPath id="crucibleClip">
          <path d={`M 150 ${meltY} L 570 ${meltY} L 570 780 Q 570 800 550 800 L 170 800 Q 150 800 150 780 Z`} />
        </clipPath>
      </defs>

      {/* enceinte sous argon */}
      <rect x={40} y={40} width={640} height={830} rx={18} fill="#F6F8FA" stroke={C.mist} strokeWidth={3} />
      <text x={64} y={84} fontSize={24} fill={C.grey} fontStyle="italic">atmosphère d'argon</text>
      {/* écoulement d'argon descendant */}
      {[0, 1, 2].map((k) => {
        const y = 110 + ((f * 2 + k * 70) % 210);
        return <line key={k} x1={CX + 190} y1={y} x2={CX + 190} y2={y + 30} stroke={C.mist} strokeWidth={3} opacity={0.6} />;
      })}

      {/* résistances graphite */}
      <rect x={96} y={560} width={26} height={250} rx={4} fill={C.slate} />
      <rect x={598} y={560} width={26} height={250} rx={4} fill={C.slate} />
      <rect x={96} y={560} width={26} height={250} rx={4} fill={C.orange} opacity={0.35 * meltGlow * pulse} />
      <rect x={598} y={560} width={26} height={250} rx={4} fill={C.orange} opacity={0.35 * meltGlow * pulse} />

      {/* creuset de quartz */}
      <path d="M 140 560 L 140 785 Q 140 812 168 812 L 552 812 Q 580 812 580 785 L 580 560" fill="none" stroke="#C9D2DA" strokeWidth={12} />
      {/* bain fondu */}
      <rect x={150} y={meltY} width={420} height={810 - meltY} fill="url(#melt)" clipPath="url(#crucibleClip)" opacity={0.25 + 0.75 * meltGlow} />
      {/* charge de polysilicium qui fond */}
      {chunks > 0.01 &&
        [170, 230, 300, 380, 450, 510].map((x, i) => (
          <polygon key={i} points={`${x},${600 - (i % 2) * 24} ${x + 52},${590} ${x + 60},${640} ${x + 6},${648}`} fill={C.grey} opacity={chunks} />
        ))}

      {/* tige de tirage et germe */}
      <line x1={CX} y1={40} x2={CX} y2={seedTop} stroke={C.slate} strokeWidth={4} />
      <rect x={CX - 12} y={seedTop - 14} width={24} height={16} fill={C.slate} />
      <rect x={CX - 8} y={seedTop} width={16} height={46} fill="url(#si)" stroke={C.navy} strokeWidth={1.5} />

      {/* cristal */}
      {grown > 0.5 && <polygon points={`${right} ${left}`} fill="url(#si)" stroke={C.navy} strokeWidth={1.5} />}
      {bands}
      {/* ménisque / interface */}
      {descend >= 1 && lift < 1 && grown > 0.5 && (
        <ellipse cx={CX} cy={interfaceY} rx={radius(grown) + 6} ry={5} fill={C.gold} opacity={0.9} />
      )}

      {/* contre-rotation */}
      <Spin cx={CX} cy={seedTop - 30} rx={46} dir={1} o={rotO} frame={f} label="rotation du germe" labelX={CX - 250} labelY={seedTop - 40} />
      <Spin cx={CX} cy={845} rx={170} dir={-1} o={rotO} frame={f} label={"rotation inverse\ndu creuset"} labelX={700} labelY={846} />

      {/* flux thermiques */}
      <Arrow x1={70} y1={690} x2={140} y2={690} color={C.orange} o={heatO * pulse} />
      <Arrow x1={650} y1={690} x2={585} y2={690} color={C.orange} o={heatO * pulse} />
      <Arrow x1={CX} y1={interfaceY - 10} x2={CX} y2={interfaceY - 130} color={C.gold} o={heatO * (grown > NECK + SHOULDER ? 1 : 0)} w={7} />
      {grown > NECK + SHOULDER &&
        [0, 1, 2].map((k) => {
          const y = seedBottom + NECK + SHOULDER + 40 + k * 70;
          return (
            <g key={k}>
              <Arrow x1={CX - R_BODY - 6} y1={y} x2={CX - R_BODY - 70} y2={y - 20} color={C.mist} o={heatO * 0.9} w={4} />
              <Arrow x1={CX + R_BODY + 6} y1={y} x2={CX + R_BODY + 70} y2={y - 20} color={C.mist} o={heatO * 0.9} w={4} />
            </g>
          );
        })}

      {/* étiquettes */}
      <g fontSize={24} fill={C.navy}>
        <g opacity={lbl(ph.melt)}>
          <text x={700} y={690}>bain de Si fondu</text>
          <text x={700} y={718} fill={C.grey}>&gt; 1414 °C</text>
          <line x1={695} y1={683} x2={540} y2={700} stroke={C.grey} strokeWidth={1.5} />
          <text x={700} y={790}>creuset de quartz</text>
          <line x1={695} y1={783} x2={584} y2={770} stroke={C.grey} strokeWidth={1.5} />
          <text x={700} y={600}>résistances</text>
          <text x={700} y={626}>graphite</text>
          <line x1={695} y1={605} x2={626} y2={600} stroke={C.grey} strokeWidth={1.5} />
        </g>
        {dyn.map((d) => (
          <g key={d.text} opacity={d.o}>
            <text x={700} y={d.y + 8}>{d.text}</text>
            <line x1={695} y1={d.y} x2={d.tx} y2={d.ty} stroke={C.grey} strokeWidth={1.5} />
          </g>
        ))}
      </g>
    </svg>
  );
};
