import * as THREE from 'three';
import { instances, random } from './instances.js';
import { weatheredMaterial } from '../shaders/materials.js';
import { carvedBlock, turnedShape, petalSurface, surface } from './surfaces.js';
const block = carvedBlock();
const rounded = turnedShape(v => Math.max(.015, Math.sin(Math.PI * v) * .5));
const column = turnedShape(v => .30 + .035 * Math.cos(v * Math.PI * 6));
const cap = turnedShape(v => .45 * (1 - .8 * v) + .025);
const disc = surface((u,v) => [Math.cos(u * Math.PI * 2) * v * .3, Math.sin(u * Math.PI * 2) * v * .3, 0], 64, 32);
const ring = surface((u,v) => [Math.cos(u * Math.PI * 2) * (.36 + v * .015), Math.sin(u * Math.PI * 2) * (.36 + v * .015), 0], 64, 32);

function lantern(x, z, stone, trim, glow) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.name = 'ornate stone lantern';
  const add = (geometry, material, y) => { const m = new THREE.Mesh(geometry, material); m.position.y = y; group.add(m); return m; };
  add(column.clone().scale(1.35, .16, 1.35), stone, .08);
  add(column.clone().scale(.6, 1.08, .6), stone, .70);
  add(column.clone().scale(1.15, .18, 1.15), stone, 1.3);
  add(column.clone().scale(1, .55, 1), glow, 1.67);
  add(column.clone().scale(1.45, .16, 1.45), stone, 2.03);
  add(cap.clone().scale(1.1, .35, 1.1), stone, 2.25);
  add(rounded.clone().scale(.19, .19, .19), trim, 2.49);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const bar = new THREE.Mesh(block.clone().scale(.045, .55, .045), trim);
    bar.position.set(Math.sin(a) * .31, 1.67, Math.cos(a) * .31); group.add(bar);
  }
  return group;
}

export function createGarden() {
  const group = new THREE.Group(); group.name = 'lotus garden';
  const rand = random(8391);
  const water = weatheredMaterial({ color: 0x526d67, roughness: .22, metalness: .22, water: true });
  group.userData.update = time => { water.userData.time.value = time; };
  const leaf = weatheredMaterial({ color: 0x637a41, roughness: .85 });
  const blossom = weatheredMaterial({ color: 0xe9b4ad, roughness: .65, side: THREE.DoubleSide });
  const center = weatheredMaterial({ color: 0xf5c75c, roughness: .7 });
  const rippleMaterial = weatheredMaterial({ color: 0xa3b8a5, roughness: .4, side: THREE.DoubleSide });
  const stone = weatheredMaterial({ color: 0x999585, moss: .4 });
  const trim = weatheredMaterial({ color: 0xd2a450, metalness: .75, roughness: .35 });
  const glow = weatheredMaterial({ color: 0xffdf99, roughness: .9 });
  glow.emissive.set(0xffad42); glow.emissiveIntensity = .6;
  rippleMaterial.transparent = true; rippleMaterial.opacity = .42; rippleMaterial.depthWrite = false;
  const petals = [], pads = [], centers = [], rings = [];
  for (const side of [-1, 1]) {
    const pond = new THREE.Mesh(block.clone().scale(6.0, .06, 12.6), water);
    pond.position.set(side * 4.75, .045, 9.1); group.add(pond);
    for (let i = 0; i < 150; i++) {
      const x = side * (2 + rand() * 5.45), z = 3.05 + rand() * 12;
      const size = .75 + rand() * .7, flower = i % 3 !== 0;
      pads.push({ position: [x, .092, z], rotation: [-Math.PI / 2, 0, rand() * 6.28], scale: [size, size, size] });
      if (flower) {
        const y = .17 + rand() * .13;
        centers.push({ position: [x, y + .11 * size, z], scale: [size, size, size] });
        for (let p = 0; p < 6; p++) {
          const a = p * Math.PI * 2 / 6;
          petals.push({ position: [x + Math.sin(a) * .1 * size, y + .08 * size, z + Math.cos(a) * .1 * size], rotation: [Math.cos(a) * .55, -a, -Math.sin(a) * .55], scale: [size, size, size] });
        }
        if (i % 7 === 0) rings.push({ position: [x, .083, z], rotation: [-Math.PI / 2, 0, 0], scale: [size, size, size] });
      }
    }
    for (const z of [4.5, 9.0, 13.5]) group.add(lantern(side * 1.45, z, stone, trim, glow));
  }
  group.add(instances(disc, leaf, pads, 'lotus pads'));
  group.add(instances(petalSurface(), blossom, petals.map(t => ({ ...t, scale: [t.scale[0] * .16, t.scale[1] * .38, t.scale[2] * .18] })), 'lotus petals'));
  group.add(instances(rounded.clone().scale(.11, .11, .11), center, centers, 'lotus flower centers'));
  group.add(instances(ring, rippleMaterial, rings, 'water ripples'));
  return group;
}
