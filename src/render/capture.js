import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
import { startServer } from './server.js';
import { FILM_FPS, FILM_DURATION } from '../animation/timeline.js';

// Avoid a system Chrome download: the bundled headless browser includes Linux
// libraries when this runtime is selected. CHROME_PATH overrides it.
process.env.AWS_LAMBDA_JS_RUNTIME ??= 'nodejs22.x';
const { default: chromium } = await import('@sparticuz/chromium');

function options(args) {
  const result = { output: 'frames', start: 0, count: FILM_DURATION * FILM_FPS, samples: 4, shutter: 0.5 };
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    if (!args[i]?.startsWith('--') || !(key in result) || args[i + 1] === undefined) throw new Error(`Unknown or incomplete option: ${args[i]}`);
    result[key] = key === 'output' ? args[i + 1] : Number(args[i + 1]);
  }
  if (!Number.isInteger(result.start) || result.start < 0 || !Number.isInteger(result.count) || result.count < 1 || result.start + result.count > FILM_DURATION * FILM_FPS ||
      !Number.isInteger(result.samples) || result.samples < 1 || result.samples > 64 || !Number.isFinite(result.shutter) || result.shutter < 0 || result.shutter > 1 || !result.output) {
    throw new Error('Invalid capture options. Frames must be within 0–299, samples 1–64, shutter 0–1.');
  }
  return result;
}

const config = options(process.argv.slice(2));
const directory = resolve(config.output);
await mkdir(directory, { recursive: true });
if ((await readdir(directory)).some(name => /^frame_\d{6}\.png$/.test(name))) {
  throw new Error(`Refusing to overwrite existing frames in ${directory}; choose an empty output directory.`);
}
const server = await startServer();
let browser;
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || await chromium.executablePath(), args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'], headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.stack));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    if (typeof window.renderFrame !== 'function') throw new Error('Scene failed to initialize');
    const { sampleFrame, addSample, averageSamples } = await import('/src/render/accumulation.js');
    const source = document.querySelector('canvas');
    const canvas = document.createElement('canvas');
    canvas.width = source.width; canvas.height = source.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not create accumulation buffer');
    window.captureFrame = (frame, fps, samples, shutter) => {
      const sum = new Uint32Array(canvas.width * canvas.height * 4);
      for (let i = 0; i < samples; i++) {
        window.renderFrame(sampleFrame(frame, i, samples, shutter), fps);
        context.drawImage(source, 0, 0);
        addSample(sum, context.getImageData(0, 0, canvas.width, canvas.height).data);
      }
      const image = context.createImageData(canvas.width, canvas.height);
      averageSamples(sum, image.data, samples);
      context.putImageData(image, 0, 0);
      return canvas.toDataURL('image/png').split(',')[1];
    };
  });
  for (let frame = config.start; frame < config.start + config.count; frame++) {
    const encoded = await page.evaluate(({ frame, fps, samples, shutter }) => window.captureFrame(frame, fps, samples, shutter), { frame, fps: FILM_FPS, samples: config.samples, shutter: config.shutter });
    if (errors.length) throw new Error(errors.join('\n'));
    const file = `frame_${String(frame).padStart(6, '0')}.png`;
    await writeFile(resolve(directory, file), Buffer.from(encoded, 'base64'), { flag: 'wx' });
    if ((frame - config.start + 1) % 25 === 0 || frame === config.start + config.count - 1) console.log(`Captured ${frame - config.start + 1}/${config.count} frames`);
  }
  console.log(`PNG frames written to ${directory}`);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
