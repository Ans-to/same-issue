import * as THREE from 'three';
import { instances, random } from './instances.js';
import { weatheredMaterial } from '../shaders/materials.js';

function lantern(x, z, stone, trim, glow) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.name = 'ornate stone lantern';
  const add = (geometry, material, y) => { const m = new THREE.Mesh(geometry, material); m.position.y = y; group.add(m); return m; };
  add(new THREE.CylinderGeometry(.38, .48, .16, 8), stone, .08);
  add(new THREE.CylinderGeometry(.16, .21, 1.08, 12), stone, .70);
  add(new THREE.CylinderGeometry(.38, .24, .18, 8), stone, 1.3);
  add(new THREE.CylinderGeometry(.31, .31, .55, 8), glow, 1.67);
  add(new THREE.CylinderGeometry(.47, .35, .16, 8), stone, 2.03);
  add(new THREE.ConeGeometry(.51, .35, 8), stone, 2.25);
  add(new THREE.SphereGeometry(.095, 12, 8), trim, 2.49);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.045, .55, .045), trim);
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
  const blossom = new THREE.MeshStandardMaterial({ color: 0xe9b4ad, roughness: .65, side: THREE.DoubleSide });
  const center = new THREE.MeshStandardMaterial({ color: 0xf5c75c, roughness: .7 });
  const rippleMaterial = new THREE.MeshStandardMaterial({ color: 0xa3b8a5, roughness: .4, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false });
  const stone = weatheredMaterial({ color: 0x999585, moss: .4 });
  const trim = weatheredMaterial({ color: 0xd2a450, metalness: .75, roughness: .35 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xffdf99, emissive: 0xffad42, emissiveIntensity: .6, roughness: .9 });
  const petals = [], pads = [], centers = [], rings = [];
  for (const side of [-1, 1]) {
    const pond = new THREE.Mesh(new THREE.BoxGeometry(6.0, .06, 12.6), water);
    pond.position.set(side * 4.75, .045, 9.1); group.add(pond);
    for (let i = 0; i < 180; i++) {
      const x = side * (2 + rand() * 5.45), z = 3.05 + rand() * 12;
      const size = .75 + rand() * .7, flower = i % 3 !== 0;
      pads.push({ position: [x, .092, z], rotation: [-Math.PI / 2, 0, rand() * 6.28], scale: [size, size, size] });
      if (flower) {
        const y = .17 + rand() * .13;
        centers.push({ position: [x, y + .11 * size, z], scale: [size, size, size] });
        for (let p = 0; p < 9; p++) {
          const a = p * Math.PI * 2 / 9;
          petals.push({ position: [x + Math.sin(a) * .1 * size, y + .08 * size, z + Math.cos(a) * .1 * size], rotation: [Math.cos(a) * .55, -a, -Math.sin(a) * .55], scale: [size, size, size] });
        }
        if (i % 7 === 0) rings.push({ position: [x, .083, z], rotation: [-Math.PI / 2, 0, 0], scale: [size, size, size] });
      }
    }
    for (const z of [4.5, 9.0, 13.5]) group.add(lantern(side * 1.45, z, stone, trim, glow));
  }
  group.add(instances(new THREE.CircleGeometry(.30, 20), leaf, pads, 'lotus pads'));
  group.add(instances(new THREE.SphereGeometry(1, 6, 4), blossom, petals.map(t => ({ ...t, scale: [t.scale[0] * .065, t.scale[1] * .19, t.scale[2] * .09] })), 'lotus petals'));
  group.add(instances(new THREE.SphereGeometry(.055, 8, 6), center, centers, 'lotus flower centers'));
  group.add(instances(new THREE.RingGeometry(.36, .375, 32), rippleMaterial, rings, 'water ripples'));
  return group;
}
