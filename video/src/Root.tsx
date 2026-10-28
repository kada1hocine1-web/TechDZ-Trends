import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Composition, Sequence, continueRender, delayRender, staticFile } from "remotion";
import { SCENES } from "./scenes";
import { FPS, H, W, C } from "./lib/theme";
import { SceneCtx, SceneInfo, timeline } from "./lib/timeline";

/** Attend le chargement des polices (KaTeX, Caladea, Carlito) avant chaque rendu. */
const useFonts = () => {
  const [handle] = useState(() => delayRender("polices"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
};

const SceneBlock: React.FC<{ s: SceneInfo }> = ({ s }) => {
  const Comp = SCENES[s.id];
  if (!Comp) throw new Error(`composant manquant pour la scène ${s.id}`);
  return (
    <SceneCtx.Provider value={s}>
      <Comp />
      <Sequence from={s.audioOffsetFrames} layout="none">
        <Audio src={staticFile(s.audio)} />
      </Sequence>
    </SceneCtx.Provider>
  );
};

const Film: React.FC<{ ids?: string[] }> = ({ ids }) => {
  useFonts();
  const scenes = ids ? timeline.scenes.filter((s) => ids.includes(s.id)) : timeline.scenes;
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {scenes.map((s) => {
        const seq = (
          <Sequence key={s.id} from={from} durationInFrames={s.frames} name={`Scène ${s.id}`}>
            <SceneBlock s={s} />
          </Sequence>
        );
        from += s.frames;
        return seq;
      })}
    </AbsoluteFill>
  );
};

const APERCU = ["00", "08"];
const frames = (ids: string[]) => timeline.scenes.filter((s) => ids.includes(s.id)).reduce((a, s) => a + s.frames, 0);

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={timeline.totalFrames} fps={FPS} width={W} height={H} />
    <Composition id="Apercu" component={() => <Film ids={APERCU} />} durationInFrames={frames(APERCU)} fps={FPS} width={W} height={H} />
  </>
);
