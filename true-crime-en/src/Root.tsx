import React from 'react';
import {Composition} from 'remotion';
import {CaseVideo, totalFrames} from './CaseVideo';
import {CASES} from './registry';

// One 1080x1920 composition per case, id = case slug.
export const RemotionRoot: React.FC = () => (
  <>
    {CASES.map(({data, timings}) => (
      <Composition
        key={data.slug}
        id={data.slug}
        component={CaseVideo}
        defaultProps={{data, timings}}
        durationInFrames={totalFrames(timings)}
        fps={30}
        width={1080}
        height={1920}
      />
    ))}
  </>
);
