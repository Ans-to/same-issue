import * as THREE from 'three';

function box(group, material, size, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

// The architecture remains grouped so it can be treated as a single object.
export function createTemple() {
  const temple = new THREE.Group();
  temple.name = 'temple';
  const stone = new THREE.MeshStandardMaterial({ color: 0x77756c });
  const timber = new THREE.MeshStandardMaterial({ color: 0x813e30 });
  const wall = new THREE.MeshStandardMaterial({ color: 0xc6bba4 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x343944, side: THREE.DoubleSide });
  box(temple, stone, [7.8, 0.45, 5.6], [0, 0.225, 0]);
  box(temple, timber, [6.7, 0.4, 4.5], [0, 0.65, 0]);
  box(temple, wall, [5.7, 2.9, 3.7], [0, 2.3, -0.2]);
  for (const x of [-3, 0, 3]) for (const z of [-2, 2]) {
    box(temple, timber, [0.34, 3.3, 0.34], [x, 2.35, z]);
  }
  box(temple, timber, [6.9, 0.27, 0.3], [0, 3.85, 2]);
  // Four-sided pitched roof from indexed BufferGeometry.
  const vertices = new Float32Array([
    -4.3, 3.95, -3.1,  4.3, 3.95, -3.1,  0, 5.55, 0,
     4.3, 3.95, -3.1,  4.3, 3.95,  3.1,  0, 5.55, 0,
     4.3, 3.95,  3.1, -4.3, 3.95,  3.1,  0, 5.55, 0,
    -4.3, 3.95,  3.1, -4.3, 3.95, -3.1,  0, 5.55, 0,
  ]);
  const roofGeometry = new THREE.BufferGeometry();
  roofGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  roofGeometry.computeVertexNormals();
  temple.add(new THREE.Mesh(roofGeometry, roof));
  box(temple, timber, [1.6, 2.5, 0.1], [0, 2.05, 1.72]);
  return temple;
}
