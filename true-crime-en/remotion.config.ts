import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
// Use the pre-installed headless Chromium when present (cloud sandbox); elsewhere Remotion downloads its own.
const SANDBOX_CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(SANDBOX_CHROME)) Config.setBrowserExecutable(SANDBOX_CHROME);
