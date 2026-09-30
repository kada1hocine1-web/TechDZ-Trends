import React, { useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, Img, staticFile, useCurrentFrame } from "remotion";
import { AdvancementTable } from "./components/AdvancementTable.tsx";
import { Formula } from "./components/Formula.tsx";
import { GraphWithTangent } from "./components/GraphWithTangent.tsx";
import { ResultBox } from "./components/ResultBox.tsx";
import { SceneTitle } from "./components/SceneTitle.tsx";
import { WhiteboardText } from "./components/WhiteboardText.tsx";
import { BAR_HEIGHT, HEIGHT_AREA, MARGIN, progress } from "./theme.ts";
import type { Scene as SceneData, Visual } from "./types.ts";
import { WIDTH } from "./timing.ts";

const isBig = (v: Visual) => v.kind === "table" || v.kind === "graph" || v.kind === "image";

const WRITE_FRAMES = { text: 40, formula: 36, result: 45 } as const;

const ImageVisual: React.FC<{ src: string; height: number; start: number; duration: number }> = ({ src, height, start, duration }) => {
  const p = progress(useCurrentFrame(), start, duration);
  return <Img src={staticFile(src)} style={{ height, alignSelf: "center", borderRadius: 12, clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` }} />;
};

const renderVisual = (v: Visual, start: number, window: number, split: boolean) => {
  const size = split ? 0.86 : 1;
  switch (v.kind) {
    case "text":
      return <WhiteboardText text={v.text} tone={v.tone} start={start} duration={Math.min(window, WRITE_FRAMES.text)} size={44 * size} />;
    case "formula":
      return <Formula tex={v.tex} tone={v.tone} start={start} duration={Math.min(window, WRITE_FRAMES.formula)} size={50 * size} />;
    case "result":
      return <ResultBox tex={v.tex} start={start} duration={Math.min(window, WRITE_FRAMES.result)} size={52 * size} />;
    case "table":
      return <AdvancementTable species={v.species} rows={v.rows} start={start} duration={window} />;
    case "graph":
      return <GraphWithTangent graph={v.graph} start={start} duration={window} />;
    case "image":
      return <ImageVisual src={v.src} height={v.height} start={start} duration={Math.min(window, 30)} />;
  }
};

// One whiteboard scene: fixed top bar + writing area. Visuals are written one after another over the
// first 85 % of the narration. Content is scaled down if it would not fit inside the margins.
export const Scene: React.FC<{ scene: SceneData; episode: number; narrationFrames: number }> = ({ scene, episode, narrationFrames }) => {
  const n = scene.visuals.length;
  const window = (narrationFrames * 0.85) / Math.max(1, n);
  const starts = scene.visuals.map((_, i) => Math.round(6 + i * window));
  const big = scene.visuals.findIndex(isBig);
  const split = big >= 0 && n > 1;

  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [handle] = useState(() => delayRender("fit scene content"));
  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const el = ref.current;
      if (el) {
        const s = Math.min(1, HEIGHT_AREA / el.scrollHeight, (WIDTH - 2 * MARGIN) / el.scrollWidth);
        setScale(s);
      }
      continueRender(handle);
    });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const item = (i: number) => (
    <React.Fragment key={i}>{renderVisual(scene.visuals[i], starts[i], split && i === big ? window * 1.6 : window, split)}</React.Fragment>
  );
  const column = (indices: number[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start", flex: 1, minWidth: 0 }}>{indices.map(item)}</div>
  );
  const others = scene.visuals.map((_, i) => i).filter((i) => i !== big);

  return (
    <div style={{ position: "absolute", inset: MARGIN, direction: "rtl" }}>
      <SceneTitle bar={scene.bar} episode={episode} />
      <div style={{ position: "absolute", top: BAR_HEIGHT + 36, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <div ref={ref} style={{ transform: `scale(${scale})`, transformOrigin: "top right", width: `${100 / scale}%` }}>
          {split ? (
            <div style={{ display: "flex", flexDirection: "row", gap: 48, alignItems: "flex-start" }}>
              {column(others)}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column" }}>{item(big)}</div>
            </div>
          ) : (
            column(scene.visuals.map((_, i) => i))
          )}
        </div>
      </div>
    </div>
  );
};
