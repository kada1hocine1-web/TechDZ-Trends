import React from 'react';
import {Composition} from 'remotion';
import {totalFrames, Video, Wide, wideFrames} from './Video';
import {FPS} from './data/script';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DbCooper" component={Video} durationInFrames={totalFrames()} fps={FPS} width={1080} height={1920} />
    <Composition id="DbCooperWide" component={Wide} durationInFrames={wideFrames()} fps={FPS} width={1920} height={1080} />
  </>
);
