import * as THREE from 'three';

export function instances(geometry, material, transforms, name) {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  mesh.name = name;
  const object = new THREE.Object3D();
  transforms.forEach(({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }, i) => {
    object.position.set(...position); object.rotation.set(...rotation); object.scale.set(...scale);
    object.updateMatrix(); mesh.setMatrixAt(i, object.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

export function random(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
