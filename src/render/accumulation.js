// Samples lie at the centers of equally sized shutter intervals. The shutter
// starts at the frame time, so the first and last samples remain in the film.
export function sampleFrame(frame, index, samples, shutter = 0.5) {
  if (!Number.isInteger(frame) || frame < 0 || !Number.isInteger(samples) || samples < 1 ||
      !Number.isInteger(index) || index < 0 || index >= samples ||
      !Number.isFinite(shutter) || shutter < 0 || shutter > 1) {
    throw new RangeError('Invalid temporal sampling parameters');
  }
  return frame + shutter * (index + 0.5) / samples;
}

// Sum display-referred RGBA values in an integer buffer; divide only once.
export function addSample(sum, pixels) {
  if (sum.length !== pixels.length) throw new RangeError('Sample dimensions differ');
  for (let i = 0; i < sum.length; i++) sum[i] += pixels[i];
}
export function averageSamples(sum, output, count) {
  if (sum.length !== output.length || !Number.isInteger(count) || count < 1) throw new RangeError('Invalid accumulation');
  for (let i = 0; i < sum.length; i++) output[i] = Math.round(sum[i] / count);
}
