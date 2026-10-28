import * as THREE from 'three';
import { createTemple } from './geometries/temple.js';
import { createLandscape } from './geometries/landscape.js';
import { createGarden } from './geometries/garden.js';
import { updateCamera } from './animation/camera.js';
import { addLightingAndAtmosphere, enableSceneShadows } from './shaders/lighting.js';

const width = 640, height = 360;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(width, height, false);
renderer.shadowMap.enabled = true;
// Only camera and water color move; the light and shadow-casters are static.
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const landscape = createLandscape();
const temple = createTemple();
const garden = createGarden();
enableSceneShadows(landscape);
enableSceneShadows(temple);
enableSceneShadows(garden);
// Tiny translucent ripples and petals do not need expensive shadow passes.
for (const name of ['lotus petals', 'lotus pads', 'lotus flower centers', 'water ripples']) garden.getObjectByName(name).castShadow = false;
scene.add(landscape, temple, garden);
addLightingAndAtmosphere(scene);
const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
window.renderFrame = (frame, fps = 60) => {
  const time = updateCamera(camera, frame, fps);
  garden.userData.update(time);
  scene.getObjectByName('procedural sky').position.copy(camera.position);
  renderer.render(scene, camera);
  return time;
};
window.renderFrame(0);
