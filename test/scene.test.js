import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTemple } from '../src/geometries/temple.js';
import { createLandscape } from '../src/geometries/landscape.js';
import { frameTime } from '../src/animation/timeline.js';

test('scene blockout consists of procedural buffer geometries', () => {
  for (const group of [createTemple(), createLandscape()]) {
    let meshes = 0;
    group.traverse(object => {
      if (object.isMesh) { meshes++; assert.ok(object.geometry.isBufferGeometry); }
    });
    assert.ok(meshes > 1);
  }
});
test('timeline uses frame indices and rejects invalid input', () => {
  assert.equal(frameTime(300), 5);
  assert.equal(frameTime(0.5, 60), 1 / 120);
  assert.throws(() => frameTime(-1));
  assert.throws(() => frameTime(0, 0));
});

test('lighting builds a fogged scene with a procedural sky and shadow-casting sun', async () => {
  const THREE = await import('three');
  const { addLightingAndAtmosphere, enableSceneShadows } = await import('../src/shaders/lighting.js');
  const scene = new THREE.Scene();
  const group = createTemple();
  enableSceneShadows(group);
  const { sun } = addLightingAndAtmosphere(scene);
  assert.ok(scene.fog.isFogExp2);
  assert.ok(scene.getObjectByName('procedural sky').material.isShaderMaterial);
  assert.ok(sun.castShadow);
  group.traverse(object => { if (object.isMesh) assert.ok(object.castShadow && object.receiveShadow); });
});

test('camera path is deterministic, clamped and continuous for fractional frames', async () => {
  const THREE = await import('three');
  const { updateCamera } = await import('../src/animation/camera.js');
  const camera = new THREE.PerspectiveCamera();
  updateCamera(camera, 120);
  const position = camera.position.clone();
  const rotation = camera.quaternion.clone();
  updateCamera(camera, 270);
  updateCamera(camera, 120);
  assert.ok(camera.position.distanceTo(position) < 1e-12);
  assert.ok(camera.quaternion.angleTo(rotation) < 1e-7);
  updateCamera(camera, 120.5);
  assert.ok(camera.position.distanceTo(position) < 0.1);
  updateCamera(camera, 300);
  const end = camera.position.clone();
  updateCamera(camera, 600);
  assert.ok(camera.position.distanceTo(end) < 1e-12);
  assert.ok(end.distanceTo(new THREE.Vector3(4, 7.2, 17)) < 1e-10);
});

test('high-detail scene is dense and deterministic without external assets', async () => {
  const { createGarden } = await import('../src/geometries/garden.js');
  const temple = createTemple();
  const garden = createGarden();
  const landscape = createLandscape();
  assert.equal(temple.getObjectByName('roof tiles').count, 952);
  assert.equal(temple.getObjectByName('eave brackets').count, 152);
  assert.equal(garden.getObjectByName('lotus pads').count, 300);
  assert.equal(garden.getObjectByName('lotus flower centers').count, 200);
  assert.equal(garden.getObjectByName('lotus petals').count, 1200);
  assert.ok(garden.getObjectByName('water ripples').count > 20);
  assert.ok(landscape.getObjectByName('tree foliage clusters').count >= 190);
  const anotherGarden = createGarden();
  assert.deepEqual([...garden.getObjectByName('lotus pads').instanceMatrix.array], [...anotherGarden.getObjectByName('lotus pads').instanceMatrix.array]);
  const pond = garden.children.find(child => child.material?.userData?.time);
  garden.userData.update(2.5);
  assert.equal(pond.material.userData.time.value, 2.5);
});

test('multi-tier temple and garden contain millions of real rendered triangles', async () => {
  const { createGarden } = await import('../src/geometries/garden.js');
  let triangles = 0;
  for (const group of [createTemple(), createLandscape(), createGarden()]) {
    group.traverse(object => {
      if (!object.isMesh) return;
      const geometry = object.geometry;
      assert.ok(geometry.attributes.position.count >= 1000, `${object.name || geometry.type} has insufficient vertices`);
      const faces = (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3;
      triangles += faces * (object.isInstancedMesh ? object.count : 1);
      assert.equal(typeof object.material.onBeforeCompile, 'function');
    });
  }
  assert.ok(triangles > 1_000_000, `Only ${triangles} triangles`);
  console.log(`Procedural scene triangle count: ${triangles.toLocaleString()}`);
});
