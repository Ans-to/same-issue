# Procedural film

A zero-asset, procedurally detailed Three.js film following the phases in [skill.md](skill.md). The scene contains over 11 million instanced triangles and uses instanced geometry (1,904 subdivided roof tiles across two tiers, eave brackets, latticework, six lanterns, 200 lotus flowers, and dense tree foliage), simplex-noise weathering and animated water shaders, a shader-generated sky, fog, cinematic lighting, and a deterministic five-second camera move. All textures and geometry are generated in code.

## Setup and verification

Requires Node.js 22+ and npm. Run `npm ci`, then:

- `npm test` checks geometry density, the triangle budget, timeline, camera and temporal accumulation. `node src/render/verify-baseline.js` checks the subdivided tile in headless WebGL.
- `npm run verify` renders frames 0, 150, and 299 headlessly, checks for WebGL errors and image contrast, and verifies deterministic seeking.
- `npm start` serves the scene on port 3000 (override with `PORT`).

On Linux the verification and capture scripts use the npm-distributed `@sparticuz/chromium` binary and its bundled libraries. Set `CHROME_PATH` to use another compatible Chrome executable. Chromium still requires compatible system libraries.

## Render the film

For this dense scene on CPU-only machines, use `npm run capture -- --output golden-frames --samples 2` followed by `npm run compile -- golden-frames golden-film.mp4`. Rendering can take hours with software WebGL. The default `npm run capture` uses four samples. If the default frames directory already contains an earlier render, use `npm run capture -- --output frames-hd` then `npm run compile -- frames-hd film-hd.mp4`. Capture writes 300 PNGs named `frames/frame_000000.png` through `frame_000299.png`; compilation checks that all frames exist and produces `film.mp4` as H.264, 640×360, 60 FPS, five seconds, no audio. The compiler uses the bundled FFmpeg binary; `FFMPEG_PATH` can select a different FFmpeg with libx264 support. Output frames, the frame archive, and MP4s are ignored by Git.

Capture defaults to four equally spaced sub-frame samples (the CPU render above uses two) over a half-frame, forward-looking shutter; display-referred color buffers are averaged before PNG encoding. The static shadow maps are sampled along with the rest of the scene; this is temporal anti-aliasing/motion blur, not physically simulated area-light soft shadows. The renderer supports fractional frame indices and has no real-time clock. Output frames cover indices 0–299. The camera reaches its final pose at 5 seconds (frame 300); poses beyond this are clamped.

For a short test, use e.g. `npm run capture -- --output /tmp/film-test --start 120 --count 2 --samples 4 --shutter 0.5`. `--samples` accepts 1–64, `--shutter` accepts 0–1 frame, and start/count must remain within the film. The capture script refuses to overwrite existing frame sequences; use an empty directory for each run. To compile a full sequence in another location: `npm run compile -- /path/to/frames /path/to/film.mp4`.

## Layout

- `src/geometries/`: procedural temple, terrain, and props
- `src/animation/`: explicit frame timing and camera path
- `src/shaders/`: procedural sky, simplex-noise materials, lighting, and fog
- `src/render/`: local server, headless verification, accumulation, capture and compilation
