import * as THREE from 'three';
import { instances, random } from './instances.js';
import { weatheredMaterial } from '../shaders/materials.js';

export function createLandscape() {
  const landscape = new THREE.Group(); landscape.name = 'landscape';
  const earth = weatheredMaterial({ color: 0x505d4a, moss: .36 });
  const geometry = new THREE.PlaneGeometry(70, 70, 56, 56);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), distance = Math.hypot(x, y);
    positions.setZ(i, Math.max(0, distance - 17) * .015 * (Math.sin(x * .3) + Math.cos(y * .25)));
  }
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, earth); ground.rotation.x = -Math.PI / 2; landscape.add(ground);
  const stone = weatheredMaterial({ color: 0x989385, moss: .5 });
  for (let i = 0; i < 13; i++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.8, .12, .72), stone);
    slab.position.set(0, .09, 3.3 + i * .88); landscape.add(slab);
  }
  const bark = weatheredMaterial({ color: 0x4d3a2c, moss: .22 });
  const foliage = weatheredMaterial({ color: 0x536c49, moss: .1, roughness: .95 });
  const rand = random(43892), trunks = [], branches = [], crowns = [];
  const sites = [[-8,-4],[8,-5],[-9,0],[9,0],[-10,5],[10,5],[-10,10],[10,10],[-10,15],[10,15],[-6,-8],[5,-8],[-13,-5],[13,-3],[-14,8],[14,9]];
  for (const [x, z] of sites) {
    const height = 4.0 + rand() * 2.5;
    trunks.push({ position: [x, height * .5, z], scale: [1, height / 5, 1] });
    for (let b = 0; b < 12; b++) {
      const angle = b * 2.4 + rand() * .5, reach = .5 + rand() * 1.1, y = height * (.52 + rand() * .4);
      const bx = x + Math.cos(angle) * reach, bz = z + Math.sin(angle) * reach;
      branches.push({ position: [(x+bx)/2, y, (z+bz)/2], rotation: [Math.sin(angle)*.75, 0, -Math.cos(angle)*.75], scale: [.8, .55 + rand() * .3, .8] });
      for (let c = 0; c < 4; c++) crowns.push({ position: [bx + (rand()-.5)*1.2, y + (rand()-.3)*1.0, bz + (rand()-.5)*1.2], scale: [.45+rand()*.35, .35+rand()*.3, .45+rand()*.35] });
    }
  }
  landscape.add(instances(new THREE.CylinderGeometry(.16, .29, 5, 10, 4), bark, trunks, 'tree trunks'));
  landscape.add(instances(new THREE.CylinderGeometry(.04, .11, 2, 7), bark, branches, 'tree branches'));
  landscape.add(instances(new THREE.IcosahedronGeometry(1, 1), foliage, crowns, 'tree foliage clusters'));
  return landscape;
}
