import * as THREE from 'three';

// A shared indexed, curved parametric surface builder; no imported meshes.
export function surface(sample, uSegments = 32, vSegments = 32) {
  const positions = [], uvs = [], indices = [];
  for (let j = 0; j <= vSegments; j++) for (let i = 0; i <= uSegments; i++) {
    const u = i / uSegments, v = j / vSegments;
    positions.push(...sample(u, v)); uvs.push(u, v);
  }
  for (let j = 0; j < vSegments; j++) for (let i = 0; i < uSegments; i++) {
    const a = j * (uSegments + 1) + i, b = a + uSegments + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices); g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}

// Cross section of a gently curved ceramic tile with a raised central roll.
export function tileSurface() {
  return surface((u, v) => {
    const x = u - .5;
    return [x, .13 * Math.cos(x * Math.PI) + .015 * Math.sin(v * Math.PI * 4), v - .5];
  });
}

// Six finely gridded faces with a small bevel; each is a custom BufferGeometry.
export function carvedBlock(width = 1, height = 1, depth = 1, segments = 14) {
  const positions = [], indices = [];
  const faces = [
    (u,v) => [width/2,(v-.5)*height,(u-.5)*depth],
    (u,v) => [-width/2,(v-.5)*height,(.5-u)*depth],
    (u,v) => [(u-.5)*width,height/2,(v-.5)*depth],
    (u,v) => [(u-.5)*width,-height/2,(.5-v)*depth],
    (u,v) => [(.5-u)*width,(v-.5)*height,depth/2],
    (u,v) => [(u-.5)*width,(v-.5)*height,-depth/2],
  ];
  for (const face of faces) {
    const start = positions.length / 3;
    for (let j=0;j<=segments;j++) for(let i=0;i<=segments;i++) positions.push(...face(i/segments,j/segments));
    for (let j=0;j<segments;j++) for(let i=0;i<segments;i++) {
      const a=start+j*(segments+1)+i,b=a+segments+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setIndex(indices); g.computeVertexNormals(); g.computeBoundingSphere(); return g;
}

// Smooth revolved forms for pillars, lanterns, tree trunks and buds.
export function turnedShape(profile, radial = 64, vertical = 32) {
  return surface((u,v) => {
    const angle = u * Math.PI * 2;
    const radius = profile(v);
    return [Math.cos(angle)*radius, v-.5, Math.sin(angle)*radius];
  }, radial, vertical);
}
export function petalSurface() {
  return surface((u,v) => {
    const s = Math.sin(Math.PI*v), x = (u-.5)*s;
    return [x, v-.5, .18 * s * (1.0 - 4.0*(u-.5)*(u-.5))];
  });
}
