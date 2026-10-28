import React from "react";
import { C, MARGIN } from "../lib/theme";
import { useCue } from "../lib/timeline";
import { Label, Shell, Steps } from "../lib/ui";
import { CzFurnace } from "../viz/CzFurnace";

export const S08: React.FC = () => {
  const cue = useCue();
  const ph = {
    melt: cue("fond"),
    contact: cue("contact"),
    neck: cue("col"),
    shoulder: cue("épaulement"),
    body: cue("corps"),
    rotation: cue("tournent"),
    heat: cue("corps", 0, 1.5),
    cone: cue("cône"),
  };
  return (
    <Shell tag="4 · Le tirage Czochralski" title="Principe du tirage Czochralski (Cz)">
      <div style={{ position: "absolute", left: 40, top: 6 }}>
        <CzFurnace ph={ph} width={900} height={900} />
      </div>
      <Steps
        x={1000} y={90} w={824} size={34} gap={34}
        items={[
          { title: "Fusion", text: "du polysilicium dans un creuset de quartz, sous argon, au-dessus de 1414 °C", at: ph.melt },
          { title: "Contact", text: "d'un germe monocristallin orienté avec la surface du bain", at: ph.contact },
          { title: "Col (necking)", text: "tirage rapide et fin : les dislocations s'éliminent", at: ph.neck },
          { title: "Épaulement puis corps", text: "on élargit au diamètre voulu et on tire lentement", at: ph.shoulder },
          { title: "Fin conique", text: "on réduit le diamètre avant de quitter le bain", at: ph.cone },
        ]}
      />
      <Label x={1000} y={846} size={22} color={C.grey} at={0} w={1920 - 1000 - MARGIN}>
        <i>Animation d'après le schéma de principe réalisé pour l'exposé</i>
      </Label>
    </Shell>
  );
};
