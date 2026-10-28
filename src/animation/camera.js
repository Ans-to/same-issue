import * as THREE from 'three';
import { FILM_DURATION, frameTime } from './timeline.js';

// A gentle arcing dolly in. Evaluating a cubic rather than integrating motion
// makes seeking and future temporal samples independent of render order.
const path = new THREE.CubicBezierCurve3(
  new THREE.Vector3(13, 11, 25),
  new THREE.Vector3(11, 10, 23),
  new THREE.Vector3(8, 8, 20),
  new THREE.Vector3(4, 7.2, 17),
);
const lookStart = new THREE.Vector3(0, 4.1, 0);
const lookEnd = new THREE.Vector3(0, 4.3, 0);
const target = new THREE.Vector3();

export function updateCamera(camera, frame, fps = 60) {
  const time = frameTime(frame, fps);
  const progress = THREE.MathUtils.clamp(time / FILM_DURATION, 0, 1);
  // Smoothstep makes both ends settle without a sharp change in velocity.
  const eased = progress * progress * (3 - 2 * progress);
  path.getPoint(eased, camera.position);
  target.lerpVectors(lookStart, lookEnd, eased);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  return time;
}
