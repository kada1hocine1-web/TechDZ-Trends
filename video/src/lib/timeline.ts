import { createContext, useContext } from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import data from "../../../assets/data/timeline.json";
import { FPS } from "./theme";

export type Word = { t: number; d: number; w: string };
export type SceneInfo = {
  id: string;
  from: number;
  frames: number;
  audio: string;
  audioOffsetFrames: number;
  audioSeconds: number;
  words: Word[];
};

export const timeline = data as { fps: number; totalFrames: number; scenes: SceneInfo[] };
export const sceneById = (id: string) => {
  const s = timeline.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`scène ${id} absente de la timeline`);
  return s;
};

export const SceneCtx = createContext<SceneInfo | null>(null);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * Renvoie la frame (relative au début de la scène) où la voix prononce `phrase`.
 * `phrase` : un ou plusieurs mots consécutifs ; `nth` : occurrence (0 = première).
 * Lève une erreur si la phrase est introuvable, pour ne jamais désynchroniser en silence.
 */
export const useCue = () => {
  const scene = useContext(SceneCtx);
  if (!scene) throw new Error("useCue hors d'une scène");
  const start = scene.from / FPS;
  const words = scene.words.map((w) => norm(w.w));
  return (phrase: string, nth = 0, offsetSec = 0): number => {
    // comparaison sur la chaîne normalisée : le moteur regroupe parfois plusieurs mots
    // (« 1414 degrés ») dans une seule frontière
    const target = norm(phrase);
    let seen = 0;
    for (let i = 0; i < words.length; i++) {
      let acc = "";
      for (let j = i; j < words.length && acc.length < target.length; j++) {
        acc += words[j];
        if (!target.startsWith(acc) && !acc.startsWith(target)) break;
      }
      // égalité exacte, ou préfixe d'un bloc numérique fusionné (« 1414degres »)
      const ok = acc === target || (acc.startsWith(target) && /\d/.test(target));
      if (ok && words[i].length > 0) {
        if (seen === nth) return Math.round((scene.words[i].t - start + offsetSec) * FPS);
        seen++;
      }
    }
    throw new Error(`repère « ${phrase} » (#${nth}) introuvable dans la scène ${scene.id}`);
  };
};

export const useScene = () => {
  const s = useContext(SceneCtx);
  if (!s) throw new Error("useScene hors d'une scène");
  return s;
};

/** Progression 0→1 entre `at` et `at + dur` frames, adoucie. */
export const useAppear = () => {
  const frame = useCurrentFrame();
  return (at: number, dur = 15) =>
    interpolate(frame, [at, at + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
};
