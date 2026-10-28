import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, SERIF } from "../lib/theme";
import { useAppear, useCue } from "../lib/timeline";
import { Dark, Photo } from "../lib/ui";

/** Motif discret de fond : projection de la maille diamant en points. */
const Lattice: React.FC = () => {
  const f = useCurrentFrame();
  const dots = [];
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 10; j++) {
      const x = i * 130 + (j % 2) * 65 - ((f * 0.4) % 130);
      const y = j * 115;
      dots.push(<circle key={`${i}-${j}`} cx={x} cy={y} r={3} fill={C.mist} opacity={0.18} />);
    }
  return <svg width={1920} height={1080} style={{ position: "absolute" }}>{dots}</svg>;
};

export const S00: React.FC = () => {
  const cue = useCue();
  const a = useAppear();
  const f = useCurrentFrame();
  const rule = interpolate(f, [cue("du sable"), cue("du sable") + 30], [0, 760], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Dark>
      <Lattice />
      <div style={{ position: "absolute", left: 140, top: 250, width: 1150 }}>
        <div style={{ fontFamily: SERIF, fontSize: 104, lineHeight: 1.05, opacity: a(10, 25) }}>Cristallogenèse du silicium</div>
        <div style={{ fontFamily: SERIF, fontSize: 48, color: C.gold, marginTop: 26, opacity: a(cue("du sable"), 20) }}>
          Du sable de quartz au monocristal parfait
        </div>
        <div style={{ height: 6, width: rule, background: C.orange, marginTop: 40 }} />
        <div style={{ marginTop: 52, fontSize: 46, opacity: a(cue("Kada")) }}>Kada Hocine</div>
        <div style={{ marginTop: 14, fontSize: 36, color: C.mist, opacity: a(cue("Master")) }}>Master 2 Physique des matériaux</div>
        <div style={{ marginTop: 14, fontSize: 36, color: C.mist, opacity: a(cue("encadré")) }}>Encadré par : Dr Sehabi</div>
      </div>
      <Photo
        file="lingot_cz_stahlkocher.jpg"
        x={1430} y={150} w={300} h={760} at={20}
        zoom={[1.0, 1.06]} pan={[0, -1]} bg={C.navy}
        creditW={560} creditAlign="right" creditColor={C.mist}
      />
    </Dark>
  );
};
