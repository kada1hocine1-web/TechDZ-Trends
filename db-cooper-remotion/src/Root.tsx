import React from 'react';
import {Composition} from 'remotion';
import {totalFrames, Video} from './Video';
import {FPS} from './data/script';

export const RemotionRoot: React.FC = () => (
  <Composition id="DbCooper" component={Video} durationInFrames={totalFrames()} fps={FPS} width={1080} height={1920} />
);
