import { loadFont } from "@remotion/google-fonts/Cairo";
import { interpolate } from "remotion";
import type { Tone } from "./types.ts";

export const { fontFamily } = loadFont("normal", { weights: ["400", "700"], subsets: ["arabic", "latin"] });

export const COLORS: Record<Tone, string> = { ink: "#1d1d1f", law: "#1a56b8", result: "#c62828" };

export const MARGIN = 80;
export const BAR_HEIGHT = 96;
// Height available for the writing area below the bar (1080 - 2 margins - bar - spacing).
export const HEIGHT_AREA = 1080 - 2 * MARGIN - BAR_HEIGHT - 36;

// 0 → 1 over [start, start + duration], clamped.
export const progress = (frame: number, start: number, duration: number): number =>
  interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Faint whiteboard texture (SVG noise) layered on an off-white board.
export const BOARD_BACKGROUND =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\"), radial-gradient(ellipse at 30% 20%, #ffffff 0%, #f7f7f3 70%, #efefea 100%)";
