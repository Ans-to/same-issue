import * as THREE from 'three';
import { FILM_DURATION, frameTime } from './timeline.js';

// A gentle arcing dolly in. Evaluating a cubic rather than integrating motion
// makes seeking and future temporal samples independent of render order.
const path = new THREE.CubicBezierCurve3(
  new THREE.Vector3(11, 8, 18),
  new THREE.Vector3(9, 7, 17),
  new THREE.Vector3(5, 5.8, 15),
  new THREE.Vector3(2.6, 5.0, 12.5),
);
const lookStart = new THREE.Vector3(0, 2.1, 0);
const lookEnd = new THREE.Vector3(0, 2.35, 0);
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
