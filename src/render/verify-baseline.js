import puppeteer from 'puppeteer';
process.env.AWS_LAMBDA_JS_RUNTIME ??= 'nodejs22.x';
const { default: chromium } = await import('@sparticuz/chromium');
const { startServer } = await import('./server.js');
const server = await startServer(); let browser;
try {
  browser = await puppeteer.launch({executablePath: process.env.CHROME_PATH || await chromium.executablePath(), args:[...chromium.args,'--no-sandbox','--enable-unsafe-swiftshader'], headless:true});
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`, {waitUntil:'networkidle0'});
  const pixel = await page.evaluate(async () => {
    const THREE = await import('three');
    const {tileSurface} = await import('/src/geometries/surfaces.js');
    const renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true}); renderer.setSize(64,64);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x101010);
    const geometry = tileSurface(); const mesh = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xffc454, side:THREE.DoubleSide})); scene.add(mesh);
    const camera = new THREE.PerspectiveCamera(45,1,.1,10); camera.position.set(0,1.6,1); camera.lookAt(0,0,0);
    renderer.render(scene,camera); const gl=renderer.getContext(); const p=new Uint8Array(4); gl.readPixels(32,32,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);
    return [...p];
  });
  if (pixel[0] < 100) throw new Error(`Baseline tile did not render: ${pixel}`);
  console.log('Baseline high-density tile rendered:',pixel);
} finally { if(browser) await browser.close(); await new Promise(resolve=>server.close(resolve)); }
