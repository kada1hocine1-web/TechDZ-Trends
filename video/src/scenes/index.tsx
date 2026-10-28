import React from "react";
import { S00 } from "./S00_Ouverture";
import { S08 } from "./S08_PrincipeCz";

// Une entrée par scène de la timeline (identifiant = numéro de scène du script).
export const SCENES: Record<string, React.FC> = {
  "00": S00,
  "08": S08,
};
