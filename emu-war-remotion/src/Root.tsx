import React from 'react';
import {Composition} from 'remotion';
import {bookendFrames, totalFrames, Video} from './Video';
import {FPS} from './data/script';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="EmuWarVertical" component={Video} defaultProps={{bookends: false}} durationInFrames={totalFrames()} fps={FPS} width={1080} height={1920} />
    <Composition id="EmuWarHorizontal" component={Video} defaultProps={{bookends: true}} durationInFrames={bookendFrames()} fps={FPS} width={1920} height={1080} />
  </>
);
