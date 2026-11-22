// Removes the white studio background from the supplied Malta Guinness photo
// (public/assets/malta-bottle-reference.jpg) and writes a tightly-cropped,
// transparent PNG cut-out: public/assets/malta-bottle.png
//
// Method: flood-fill from the image border through "near-white" pixels, then
// feather the alpha along the silhouette edge. The bottle is dark glass, so the
// contrast against white is very high and this is reliable for this photo.
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public/assets/malta-bottle-reference.jpg');
const out = path.join(root, 'public/assets/malta-bottle.png');

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => (y * W + x) * 4;

// "Background-ness" of a pixel: bright and unsaturated.
const bgScore = (i) => {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx > 205 && mx - mn < 40;
};

const isBg = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) { stack.push([x, 0], [x, H - 1]); }
for (let y = 0; y < H; y++) { stack.push([0, y], [W - 1, y]); }
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (isBg[k] || !bgScore(px(x, y))) continue;
  isBg[k] = 1;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

// Alpha with a 1px soft edge: foreground pixels adjacent to background get a
// partial alpha based on their own brightness (anti-aliased white fringe).
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x, i = k * 4;
    if (isBg[k]) { data[i + 3] = 0; continue; }
    let edge = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < W && ny < H && isBg[ny * W + nx]) edge = true;
    }
    if (edge) {
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i + 3] = Math.round(255 * Math.min(1, Math.max(0.25, (255 - lum) / 140)));
    }
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
}

const pad = 2;
const left = Math.max(0, minX - pad), top = Math.max(0, minY - pad);
const width = Math.min(W, maxX + pad + 1) - left, height = Math.min(H, maxY + pad + 1) - top;

await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left, top, width, height })
  .png()
  .toFile(out);

console.log(`cut-out written: ${out} (${width}x${height}, from ${W}x${H})`);

// ── Silhouette profile → lib/bottleProfile.json ─────────────────────────────
// For each row, measure the half-width of the opaque region. Normalised so the
// bottle height is 1 (y=0 base, y=1 top of cap). Used for the 3D lathe so the
// modelled glass shares the photographed bottle's exact proportions.
// Rows are smoothed with a median filter (droplet highlights can nibble edges).
const rows = [];
for (let y = minY; y <= maxY; y++) {
  let l = -1, r = -1;
  for (let x = minX; x <= maxX; x++) if (!isBg[y * W + x]) { l = x; break; }
  for (let x = maxX; x >= minX; x--) if (!isBg[y * W + x]) { r = x; break; }
  rows.push(l < 0 ? 0 : (r - l + 1) / 2);
}
const med = rows.map((_, i) => {
  const win = rows.slice(Math.max(0, i - 3), i + 4).sort((a, b) => a - b);
  return win[win.length >> 1];
});
const h = maxY - minY;
const N = 64;
const profile = [];
for (let k = 0; k <= N; k++) {
  const t = k / N; // 0 = base, 1 = top
  const row = Math.round((1 - t) * h);
  profile.push([+(med[Math.min(med.length - 1, row)] / h).toFixed(5), +t.toFixed(5)]);
}
const fs = await import('node:fs');
fs.writeFileSync(
  path.join(root, 'lib/bottleProfile.json'),
  JSON.stringify({ source: 'public/assets/malta-bottle-reference.jpg', aspect: +(width / height).toFixed(4), profile }, null, 0),
);
console.log('profile written: lib/bottleProfile.json');
console.log(profile.map(([r, t]) => `${t.toFixed(2)}:${r.toFixed(3)}`).join('  '));
