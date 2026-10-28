import * as THREE from 'three';
import { createAtmosphere } from './atmosphere.js';

export function addLightingAndAtmosphere(scene) {
  scene.fog = new THREE.FogExp2(0xc5b0a2, 0.018);
  scene.add(createAtmosphere());
  const fill = new THREE.HemisphereLight(0xb8d0e2, 0x544537, 1.3);
  fill.name = 'sky fill';
  scene.add(fill);
  const sun = new THREE.DirectionalLight(0xffcf9e, 3.0);
  sun.name = 'warm sun';
  sun.position.set(-12, 15, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 0.5, far: 60 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.035;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun);
  const bounce = new THREE.DirectionalLight(0xffe1a6, .9);
  bounce.position.set(8, 9, 18); bounce.name = 'golden bounce'; scene.add(bounce);
  return { sun, fill };
}

export function enableSceneShadows(group) {
  group.traverse(object => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
}
