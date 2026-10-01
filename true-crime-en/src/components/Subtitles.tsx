import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {C, TITLE, TornPaper, useLayout} from './TornPaper';
import type {Word} from '../CaseVideo';

const MAX_CHARS = 42;
const MAX_LINES = 2;

type Chunk = {lines: Word[][]; s: number; e: number};

const paginate = (words: Word[]): Chunk[] => {
  const chunks: Chunk[] = [];
  let lines: Word[][] = [[]];
  const len = (l: Word[]) => l.map((w) => w.w).join(' ').length;
  const flush = () => {
    const all = lines.flat();
    if (all.length) chunks.push({lines, s: all[0].s, e: all[all.length - 1].e});
    lines = [[]];
  };
  for (const word of words) {
    const cur = lines[lines.length - 1];
    if (cur.length && len([...cur, word]) > MAX_CHARS) {
      if (lines.length === MAX_LINES) flush();
      else lines.push([]);
    }
    lines[lines.length - 1].push(word);
    // Start a new card after a sentence end so a card never straddles two sentences.
    if (/[.!?…»"]$/.test(word.w) && !/^([A-Z]\.)+$/.test(word.w) && word !== words[words.length - 1]) flush();
  }
  flush();
  return chunks;
};

// Word-level subtitles on a torn paper band: under the stage in 9:16, over the bottom of the frame in 16:9.
export const Subtitles: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const {horizontal, width} = useLayout();
  const chunks = React.useMemo(() => paginate(words), [words]);
  const idx = chunks.findLastIndex((c) => c.s <= t);
  const chunk = chunks[Math.max(0, idx)];
  if (!chunk) return null;
  const h = chunk.lines.length * 66 + 40;
  return (
    <TornPaper x={width / 2} y={(horizontal ? 1050 : 1560) - h / 2} w={horizontal ? 1300 : 1000} h={h} seed={idx * 13 + 5} rotate={idx % 2 ? 0.8 : -0.8} rough={9}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: TITLE,
          fontSize: 58,
          lineHeight: '66px',
          whiteSpace: 'nowrap',
          color: C.ink,
          letterSpacing: 1,
        }}
      >
        {chunk.lines.map((line, i) => (
          <div key={i}>
            {line.map((w, k) => (
              <span key={k} style={{color: t >= w.s && t < w.e ? C.red : C.ink}}>
                {w.w}
                {k < line.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </TornPaper>
  );
};
