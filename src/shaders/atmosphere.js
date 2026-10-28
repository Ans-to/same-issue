import * as THREE from 'three';
import { simplex } from './materials.js';

// A world-space sky gradient with a broad, warm sun halo. No texture assets.
export function createAtmosphere() {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      zenith: { value: new THREE.Color(0x405b72) },
      horizon: { value: new THREE.Color(0xdab9a2) },
      sunColor: { value: new THREE.Color(0xffd5a5) },
      sunDirection: { value: new THREE.Vector3(-0.53, 0.66, 0.53).normalize() },
    },
    vertexShader: `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 zenith;
      uniform vec3 horizon;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;
      varying vec3 vDirection;
      ${simplex}
      void main() {
        vec3 direction = normalize(vDirection);
        float height = smoothstep(-0.12, 0.75, direction.y);
        vec3 sky = mix(horizon, zenith, height);
        sky *= 1.0 + 0.025 * snoise(direction * 7.0);
        float alignment = max(dot(direction, sunDirection), 0.0);
        float halo = pow(alignment, 16.0) * 0.28 + pow(alignment, 180.0) * 0.5;
        gl_FragColor = vec4(sky + sunColor * halo, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), material);
  sky.name = 'procedural sky';
  sky.frustumCulled = false;
  return sky;
}
