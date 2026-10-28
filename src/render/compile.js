import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { FILM_DURATION, FILM_FPS } from '../animation/timeline.js';

const directory = resolve(process.argv[2] || 'frames');
const output = resolve(process.argv[3] || 'film.mp4');
const count = FILM_DURATION * FILM_FPS;
for (let frame = 0; frame < count; frame++) {
  const filename = resolve(directory, `frame_${String(frame).padStart(6, '0')}.png`);
  try { await access(filename); } catch { throw new Error(`Missing frame: ${filename}`); }
}
const executable = process.env.FFMPEG_PATH || ffmpeg.path;
const args = ['-hide_banner', '-y', '-framerate', String(FILM_FPS), '-start_number', '0', '-i', resolve(directory, 'frame_%06d.png'), '-frames:v', String(count), '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output];
await new Promise((resolvePromise, reject) => {
  const child = spawn(executable, args, { stdio: 'inherit' });
  child.once('error', reject);
  child.once('close', code => code === 0 ? resolvePromise() : reject(new Error(`FFmpeg exited with code ${code}`)));
});
console.log(`Film written to ${output}`);
