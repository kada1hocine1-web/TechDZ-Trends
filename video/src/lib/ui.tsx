import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import credits from "../../../assets/data/credits.json";
import { C, MARGIN, SANS, SERIF, TITLE_H } from "./theme";
import { useAppear } from "./timeline";

/** Habillage d'une scène de contenu : bandeau de titre #1B2A3A, contenu sur fond blanc. */
export const Shell: React.FC<{ title: string; tag?: string; children: React.ReactNode }> = ({ title, tag, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 12, durationInFrames - 10, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.white, fontFamily: SANS }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: TITLE_H, background: C.navy }}>
        {tag && (
          <div style={{ position: "absolute", left: MARGIN, top: 22, color: C.gold, fontSize: 26, letterSpacing: 2, textTransform: "uppercase", opacity: fade }}>
            {tag}
          </div>
        )}
        <div
          data-fit="title"
          style={{ position: "absolute", left: MARGIN, right: MARGIN, top: tag ? 58 : 40, color: C.white, fontFamily: SERIF, fontSize: 56, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", opacity: fade }}
        >
          {title}
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, width: `${bar * 100}%`, background: C.orange }} />
      </div>
      <AbsoluteFill style={{ top: TITLE_H, opacity: fade }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Plein écran #1B2A3A (ouverture, conclusion, générique). */
export const Dark: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 15, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: SANS, color: C.white }}>
      <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

type CreditKey = keyof typeof credits;

/**
 * Photo du PPT en mouvement Ken Burns lent. Le crédit et la licence restent affichés
 * pendant toute la présence de la photo.
 */
export const Photo: React.FC<{
  file: CreditKey;
  x: number;
  y: number;
  w: number;
  h: number;
  at?: number;
  fit?: "cover" | "contain";
  zoom?: [number, number];
  pan?: [number, number];
  bg?: string;
  /** largeur et alignement du crédit, s'il doit déborder la largeur de la photo */
  creditW?: number;
  creditAlign?: "left" | "right";
  creditColor?: string;
}> = ({ file, x, y, w, h, at = 0, fit = "cover", zoom = [1.0, 1.1], pan = [0, -2], bg = C.light, creditW, creditAlign = "left", creditColor = C.grey }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [at, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = interpolate(frame, [at, at + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = zoom[0] + (zoom[1] - zoom[0]) * p;
  const credit = credits[file];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: o }}>
      <div style={{ width: w, height: h, overflow: "hidden", background: bg, borderRadius: 6 }}>
        <Img
          src={staticFile(`images/${file}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: fit,
            transform: `scale(${s}) translate(${pan[0] * p}%, ${pan[1] * p}%)`,
          }}
        />
      </div>
      <div
        data-fit="credit"
        style={{
          position: "absolute", top: h + 8, width: creditW ?? w,
          ...(creditAlign === "right" ? { right: 0, textAlign: "right" } : { left: 0 }),
          fontSize: 21, color: creditColor, fontStyle: "italic", lineHeight: 1.25,
        }}
      >
        {credit}
      </div>
    </div>
  );
};

/** Carte chiffrée, comme dans le PPT : valeur en Cambria orange, légende en gris. */
export const Card: React.FC<{ value: React.ReactNode; label: string; at: number; x: number; y: number; w: number; h?: number }> = ({ value, label, at, x, y, w, h = 170 }) => {
  const a = useAppear()(at);
  return (
    <div
      style={{
        position: "absolute", left: x, top: y + (1 - a) * 20, width: w, height: h, opacity: a,
        background: C.light, borderLeft: `8px solid ${C.orange}`, borderRadius: 6, padding: "20px 28px", boxSizing: "border-box",
      }}
    >
      <div data-fit="card" style={{ fontFamily: SERIF, fontSize: 60, color: C.orange, lineHeight: 1.05, whiteSpace: "nowrap" }}>{value}</div>
      <div style={{ fontSize: 28, color: C.grey, marginTop: 8, lineHeight: 1.2 }}>{label}</div>
    </div>
  );
};

/** Liste à puces, chaque point apparaissant à sa frame. */
export const Bullets: React.FC<{ items: { text: React.ReactNode; at: number }[]; x: number; y: number; w: number; size?: number; gap?: number }> = ({
  items, x, y, w, size = 36, gap = 26,
}) => {
  const appear = useAppear();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {items.map((it, i) => {
        const a = appear(it.at);
        return (
          <div key={i} style={{ display: "flex", gap: 22, marginBottom: gap, opacity: a, transform: `translateX(${(1 - a) * -20}px)`, fontSize: size, color: C.navy, lineHeight: 1.3 }}>
            <div style={{ flex: "0 0 14px", height: 14, marginTop: size * 0.45, background: C.orange, borderRadius: 2 }} />
            <div>{it.text}</div>
          </div>
        );
      })}
    </div>
  );
};

/** Étapes numérotées (pastilles), comme dans le PPT. */
export const Steps: React.FC<{
  items: { title: string; text?: React.ReactNode; at: number }[];
  x: number; y: number; w: number; size?: number; gap?: number; active?: number;
}> = ({ items, x, y, w, size = 32, gap = 22 }) => {
  const appear = useAppear();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {items.map((it, i) => {
        const a = appear(it.at);
        return (
          <div key={i} style={{ display: "flex", gap: 22, marginBottom: gap, opacity: a, transform: `translateY(${(1 - a) * 16}px)` }}>
            <div style={{ flex: `0 0 ${size * 1.7}px`, height: size * 1.7, borderRadius: "50%", background: C.orange, color: C.white, fontFamily: SERIF, fontSize: size * 0.95, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i + 1}
            </div>
            <div style={{ fontSize: size, color: C.navy, lineHeight: 1.25, paddingTop: size * 0.2 }}>
              <span style={{ fontWeight: 700 }}>{it.title}</span>
              {it.text && <span style={{ color: C.slate }}> — {it.text}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Bloc d'équations empilées dans un encadré clair. */
export const EqBox: React.FC<{ x: number; y: number; w: number; h?: number; children: React.ReactNode; title?: string }> = ({ x, y, w, h, children, title }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: C.light, borderRadius: 8, padding: "26px 36px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
    {title && <div style={{ fontFamily: SERIF, fontSize: 32, color: C.blue }}>{title}</div>}
    {children}
  </div>
);

export const Label: React.FC<{ x: number; y: number; at?: number; color?: string; size?: number; children: React.ReactNode; w?: number; align?: "left" | "center" | "right" }> = ({
  x, y, at = 0, color = C.navy, size = 30, children, w, align = "left",
}) => {
  const a = useAppear()(at);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: a, color, fontSize: size, lineHeight: 1.25, textAlign: align }}>
      {children}
    </div>
  );
};
