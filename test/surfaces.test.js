import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tileSurface, carvedBlock, turnedShape, petalSurface } from '../src/geometries/surfaces.js';

test('baseline parametric assets have subdivided indexed surfaces and normals', () => {
  for (const mesh of [tileSurface(), carvedBlock(), turnedShape(() => 1), petalSurface()]) {
    assert.ok(mesh.isBufferGeometry);
    assert.ok(mesh.attributes.position.count >= 1000);
    assert.ok(mesh.index.count / 3 >= 1900);
    assert.equal(mesh.attributes.normal.count, mesh.attributes.position.count);
  }
});
