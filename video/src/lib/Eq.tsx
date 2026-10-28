import katex from "katex";
import "katex/dist/katex.min.css";
import React, { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "./theme";

export type Term = { tex: string; at?: number };

/**
 * Équation KaTeX révélée terme à terme.
 * Chaque terme apparaît à la frame `at` (relative à la scène), d'abord en orange,
 * puis vire à la couleur de base. Sans `at`, le terme est visible d'emblée.
 * La largeur est réduite automatiquement pour ne jamais dépasser `maxWidth`.
 */
export const Eq: React.FC<{
  terms: Term[];
  size?: number;
  maxWidth?: number;
  color?: string;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({ terms, size = 54, maxWidth = 1600, color = C.navy, align = "left", style }) => {
  const frame = useCurrentFrame();
  const uid = "eq" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const html = useMemo(
    () =>
      katex.renderToString(
        terms.map((t, i) => `\\htmlClass{${uid}t${i}}{${t.tex}}`).join("\\,"),
        { displayMode: true, throwOnError: true, trust: true, strict: false, output: "html" }
      ),
    [terms, uid]
  );
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current?.querySelector(".katex") as HTMLElement | null;
    if (!el) return;
    const w = el.scrollWidth;
    setScale(w > maxWidth ? maxWidth / w : 1);
  }, [html, maxWidth]);

  const css = terms
    .map((t, i) => {
      if (t.at === undefined) return "";
      const o = interpolate(frame, [t.at, t.at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const hot = interpolate(frame, [t.at, t.at + 8, t.at + 40], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return `.${uid}t${i}{opacity:${o};color:${hot > 0.5 ? C.orange : color};}`;
    })
    .join("\n");

  return (
    <div
      ref={ref}
      data-fit="eq"
      style={{
        fontSize: size * scale,
        color,
        textAlign: align,
        maxWidth,
        ...style,
      }}
    >
      <style>{`#${uid} .katex-display{margin:0;text-align:${align}} #${uid} .katex-display>.katex{text-align:${align}} ${css}`}</style>
      <div id={uid} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
