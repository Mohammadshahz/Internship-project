import {Config} from '@remotion/cli/config';

// Instagram Reels: H.264, yuv420p, 30 fps, high quality.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(19);
Config.setColorSpace('bt709');
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
Config.setEntryPoint('src/index.ts');
