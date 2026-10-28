import * as THREE from 'three';

export function createLandscape() {
  const landscape = new THREE.Group();
  landscape.name = 'landscape';
  const earth = new THREE.MeshStandardMaterial({ color: 0x4a5549 });
  const geometry = new THREE.PlaneGeometry(70, 70, 40, 40);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    // Keep the temple and approach level; raise the distant landscape gently.
    const distance = Math.hypot(x, y);
    positions.setZ(i, Math.max(0, distance - 9) * 0.015 * (Math.sin(x * 0.3) + Math.cos(y * 0.25)));
  }
  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, earth);
  ground.rotation.x = -Math.PI / 2;
  landscape.add(ground);
  const stone = new THREE.MeshStandardMaterial({ color: 0x89867a });
  for (let i = 0; i < 10; i++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.65), stone);
    slab.position.set(0, 0.07, 3.3 + i * 0.95);
    landscape.add(slab);
  }
  const bark = new THREE.MeshStandardMaterial({ color: 0x544238 });
  const foliage = new THREE.MeshStandardMaterial({ color: 0x52644d });
  for (const [x, z, scale] of [[-6, 2, 1], [6, 1, 1.15], [-8, -4, 1.3], [8, -5, 1.2], [-7, 9, 0.8], [7, 10, 0.9]]) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3, 7), bark);
    trunk.position.y = 1.5;
    tree.add(trunk);
    for (let j = 0; j < 3; j++) {
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.35 - j * 0.22, 1.7, 8), foliage);
      crown.position.y = 2.5 + j * 0.8;
      tree.add(crown);
    }
    landscape.add(tree);
  }
  return landscape;
}
