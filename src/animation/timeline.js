export const FILM_DURATION = 5;
export const FILM_FPS = 60;

// Fractional frame indices are supported for later sub-frame sampling.
export function frameTime(frame, fps = FILM_FPS) {
  if (!Number.isFinite(frame) || frame < 0 || !Number.isFinite(fps) || fps <= 0) throw new RangeError('Invalid frame or frame rate');
  return frame / fps;
}
