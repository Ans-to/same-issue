import * as THREE from 'three';
import { weatheredMaterial } from '../shaders/materials.js';
import { instances } from './instances.js';
import { carvedBlock, tileSurface, turnedShape } from './surfaces.js';

const blockGeometry = carvedBlock();
const tileGeometry = tileSurface();
const ornamentGeometry = turnedShape(v => .08 + .23 * Math.sin(Math.PI * v));

function box(group, material, size, position, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(blockGeometry, material);
  mesh.scale.set(...size); mesh.position.set(...position); mesh.rotation.set(...rotation); group.add(mesh); return mesh;
}

function createTier() {
  const temple = new THREE.Group(); temple.name = 'temple';
  const stone = weatheredMaterial({ color: 0x85847a, moss: 0.45 });
  const timber = weatheredMaterial({ color: 0xb98230, moss: 0.12 });
  const dark = weatheredMaterial({ color: 0x614423, moss: 0.08 });
  const wall = weatheredMaterial({ color: 0xcfa14e, moss: 0.18 });
  const roof = weatheredMaterial({ color: 0xb78a36, moss: 0.14, metalness: 0.68, roughness: 0.4 });
  const gold = weatheredMaterial({ color: 0xffc84e, metalness: 0.86, roughness: 0.25 });
  box(temple, stone, [7.8, .48, 5.5], [0, .24, 0]);
  box(temple, dark, [7.1, .25, 4.9], [0, .60, 0]);
  box(temple, timber, [6.8, .22, 4.65], [0, .78, 0]);
  box(temple, wall, [5.7, 2.95, 3.7], [0, 2.35, -.1]);
  for (const x of [-3, -1.5, 0, 1.5, 3]) for (const z of [-2, 2]) {
    box(temple, timber, [.27, 3.3, .27], [x, 2.38, z]);
    box(temple, gold, [.32, .09, .32], [x, .88, z]);
    box(temple, gold, [.32, .08, .32], [x, 3.87, z]);
  }
  for (const y of [1.05, 3.55, 3.92]) for (const z of [-2.06, 2.06]) box(temple, timber, [6.95, .18, .22], [0, y, z]);
  // Twin sloping tiled planes; each raised tile is its own instance.
  const tiles = [];
  const rows = 14, columns = 34, run = 3.05, rise = 1.55;
  const angle = Math.atan2(rise, run), length = Math.hypot(run, rise);
  for (const side of [-1, 1]) {
    box(temple, dark, [8.55, .14, length], [0, 4.02 + rise / 2, side * run / 2], [side * angle, 0, 0]);
    for (let r = 0; r < rows; r++) for (let c = 0; c < columns; c++) {
      const t = (r + .5) / rows;
      const x = -4.17 + (c + .5 + (r % 2) * .18) * (8.34 / columns);
      tiles.push({ position: [x, 5.60 - t * rise + .075, side * (t * run + .035)], rotation: [side * angle, 0, 0], scale: [8.34 / columns * .97, .20, length / rows * 1.15] });
    }
    box(temple, timber, [8.85, .2, .22], [0, 4.05, side * 3.12]);
    box(temple, gold, [8.85, .035, .045], [0, 4.12, side * 3.24]);
  }
  temple.add(instances(tileGeometry, roof, tiles, 'roof tiles'));
  box(temple, roof, [8.65, .22, .25], [0, 5.64, 0]);
  for (const x of [-4.2, 4.2]) {
    const finial = new THREE.Mesh(ornamentGeometry, gold); finial.scale.set(.9, .45, .9); finial.position.set(x, 5.75, 0); temple.add(finial);
  }
  // Layered, stepped dougong-inspired brackets and rafters below both eaves.
  const brackets = [];
  for (const side of [-1, 1]) for (let i = 0; i < 19; i++) {
    const x = -3.55 + i * (7.1 / 18);
    for (let layer = 0; layer < 4; layer++) brackets.push({ position: [x, 3.85 + layer * .105, side * (2.15 + layer * .14)], scale: [.17 + layer * .09, .09, .35 + layer * .12] });
  }
  temple.add(instances(blockGeometry, timber, brackets, 'eave brackets'));
  // Dense front lattice, set into dark window bays on either side of the door.
  for (const x of [-2.15, 2.15]) {
    box(temple, dark, [1.35, 2.05, .07], [x, 2.25, 1.81]);
    for (let i = 0; i <= 12; i++) box(temple, timber, [.045, 2.05, .07], [x - .675 + i * .1125, 2.25, 1.87]);
    for (let i = 0; i <= 15; i++) box(temple, timber, [1.35, .04, .07], [x, 1.225 + i * .137, 1.88]);
  }
  for (const x of [-.4, .4]) {
    box(temple, dark, [.78, 2.5, .12], [x, 2.18, 1.84]);
    for (let i = 0; i < 5; i++) box(temple, timber, [.045, 2.35, .05], [x - .30 + i * .15, 2.18, 1.93]);
    const knob = new THREE.Mesh(ornamentGeometry, gold); knob.scale.set(.42, .14, .42); knob.position.set(x + (x < 0 ? .23 : -.23), 2.05, 1.98); temple.add(knob);
  }
  return temple;
}

export function createTemple() {
  const temple = new THREE.Group(); temple.name = 'golden temple';
  const lower = createTier(); lower.name = 'lower tier'; temple.add(lower);
  const upper = createTier(); upper.name = 'upper tier';
  upper.scale.setScalar(.63); upper.position.y = 4.95; temple.add(upper);
  return temple;
}
