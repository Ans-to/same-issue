import puppeteer from 'puppeteer';
process.env.AWS_LAMBDA_JS_RUNTIME ??= 'nodejs22.x';
const { default: chromium } = await import('@sparticuz/chromium');
import { startServer } from './server.js';

const server = await startServer();
let browser;
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || await chromium.executablePath(), args: [...chromium.args, '--no-sandbox', '--enable-unsafe-swiftshader'], headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.stack));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle0' });
  const result = await page.evaluate(() => {
    if (typeof window.renderFrame !== 'function') throw new Error('Renderer did not initialize');
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    return [0, 150, 299, 0].map(frame => {
      window.renderFrame(frame, 60);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const error = gl.getError();
      if (error) throw new Error(`WebGL error ${error} at frame ${frame}`);
      let hash = 2166136261;
      let min = 255, max = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        hash = Math.imul(hash ^ pixels[i], 16777619) >>> 0;
        min = Math.min(min, pixels[i]);
        max = Math.max(max, pixels[i]);
      }
      return { frame, hash, range: max - min };
    });
  });
  if (errors.length) throw new Error(errors.join('\n'));
  if (result.some(frame => frame.range < 20)) throw new Error(`Blank or low-contrast render: ${JSON.stringify(result)}`);
  if (result[0].hash !== result[3].hash) throw new Error('Rendering is not deterministic when seeking');
  if (new Set(result.slice(0, 3).map(frame => frame.hash)).size !== 3) throw new Error('Camera frames did not change');
  console.log('Verified headless frames:', result);
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
