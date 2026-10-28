import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sampleFrame, addSample, averageSamples } from '../src/render/accumulation.js';

test('shutter samples are stratified, bounded and frame-relative', () => {
  assert.deepEqual(Array.from({ length: 4 }, (_, i) => sampleFrame(10, i, 4, 0.5)), [10.0625, 10.1875, 10.3125, 10.4375]);
  assert.ok(sampleFrame(299, 3, 4, 1) < 300);
  assert.equal(sampleFrame(1, 0, 1, 0), 1);
  assert.throws(() => sampleFrame(1, 4, 4));
  assert.throws(() => sampleFrame(0, 0, 0));
});
test('accumulation averages color buffers with rounding', () => {
  const sum = new Uint32Array(4);
  addSample(sum, new Uint8Array([0, 10, 255, 255]));
  addSample(sum, new Uint8Array([11, 30, 0, 255]));
  const output = new Uint8ClampedArray(4);
  averageSamples(sum, output, 2);
  assert.deepEqual([...output], [6, 20, 128, 255]);
  assert.throws(() => addSample(sum, new Uint8Array(3)));
});
