import * as THREE from 'three';
import { harpOutlines } from './harpGeometry';

/**
 * Procedural textures for the 3D bottle.
 *
 * LABEL: a high-resolution rebuild of the label in the supplied photo
 * (public/assets/malta-bottle-reference.jpg), following its layout and colours:
 * yellow→orange sunburst, dark V-shield with harp, "Malta" wordmark in deep
 * brown with a gold keyline, GUINNESS, "NON ALCOHOLIC MALT DRINK", gold
 * chevron and the crimson band reading "VITALITY • GOODNESS • ENERGY".
 *
 * It is an approximation drawn in code (the real wordmark is custom lettering).
 * If official label artwork is available, set LABEL_ART_URL to a flat,
 * unwrapped PNG of the label and it will be used instead.
 */
export const LABEL_ART_URL: string | null = null;

/** Canvas width covers the full 360° wrap; front of the bottle is the centre. */
export const LABEL_W = 2048;

function sunburst(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.42);
  g.addColorStop(0, '#fff6a8');
  g.addColorStop(0.18, '#ffe03a');
  g.addColorStop(0.45, '#fbb21c');
  g.addColorStop(0.75, '#ef7d12');
  g.addColorStop(1, '#d9560c');
  ctx.fillStyle = g;
  ctx.fillRect(cx - w / 2, 0, w, h);

  // rays
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = 'soft-light';
  const rays = 44;
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2) / rays / (1.6 + (i % 3) * 0.6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, Math.max(w, h), a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? 'rgba(255,255,220,0.55)' : 'rgba(190,60,0,0.45)';
    ctx.fill();
  }
  // fine bright streaks
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2;
    const r0 = 40 + Math.random() * 60;
    const r1 = r0 + 120 + Math.random() * 420;
    ctx.strokeStyle = `rgba(255,${200 + Math.random() * 55},120,${0.15 + Math.random() * 0.35})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

function harpEmblem(ctx: CanvasRenderingContext2D, cx: number, top: number, size: number) {
  // V-shaped shield
  const w = size * 0.78;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top);
  ctx.quadraticCurveTo(cx, top - size * 0.08, cx + w / 2, top);
  ctx.quadraticCurveTo(cx + w * 0.42, top + size * 0.55, cx, top + size);
  ctx.quadraticCurveTo(cx - w * 0.42, top + size * 0.55, cx - w / 2, top);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, top, 0, top + size);
  g.addColorStop(0, '#3a1a0c');
  g.addColorStop(1, '#170804');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(80,20,0,0.5)';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // harp inside, gold
  const { shapes, strings } = harpOutlines();
  const k = size * 0.15;
  ctx.translate(cx, top + size * 0.4);
  ctx.scale(k, -k);
  ctx.fillStyle = '#e8b64a';
  for (const s of shapes) {
    const pts = s.getPoints(24);
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = '#e8b64a';
  ctx.lineWidth = 0.05;
  for (const [a, b] of strings) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Draw one front panel of the label centred on cx. */
function labelPanel(ctx: CanvasRenderingContext2D, cx: number, H: number, panelW: number) {
  const yellowEnd = H * 0.74;

  // emblem
  harpEmblem(ctx, cx, H * 0.07, H * 0.17);

  // "Malta"
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const mSize = H * 0.27;
  ctx.font = `${mSize}px "Lilita One", "Arial Black", sans-serif`;
  const baseY = H * 0.47;
  // keep "Malta" a little narrower than the visible front
  const measured = ctx.measureText('Malta').width;
  const sx = Math.min(1.25, (panelW * 0.5) / measured);
  ctx.translate(cx, baseY);
  ctx.scale(sx, 1);
  ctx.lineJoin = 'round';
  ctx.lineWidth = mSize * 0.11;
  ctx.strokeStyle = '#f7d77a';
  ctx.shadowColor = 'rgba(120,30,0,0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.strokeText('Malta', 0, 0);
  ctx.shadowColor = 'transparent';
  const mg = ctx.createLinearGradient(0, -mSize * 0.8, 0, 0);
  mg.addColorStop(0, '#6b2410');
  mg.addColorStop(0.55, '#3e140a');
  mg.addColorStop(1, '#2a0d06');
  ctx.fillStyle = mg;
  ctx.fillText('Malta', 0, 0);
  ctx.restore();

  // GUINNESS
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `700 ${H * 0.085}px "Playfair Display", Georgia, serif`;
  ctx.fillStyle = '#2b1208';
  ctx.translate(cx, H * 0.575);
  ctx.scale(1.08, 1);
  ctx.fillText('GUINNESS', 0, 0);
  ctx.restore();

  // NON ALCOHOLIC MALT DRINK
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `800 ${H * 0.038}px Inter, Arial, sans-serif`;
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(255,240,200,0.9)';
  ctx.fillStyle = '#8f1d12';
  ctx.strokeText('NON ALCOHOLIC', cx, H * 0.635);
  ctx.fillText('NON ALCOHOLIC', cx, H * 0.635);
  ctx.strokeText('MALT DRINK', cx, H * 0.68);
  ctx.fillText('MALT DRINK', cx, H * 0.68);
  ctx.restore();

  // crimson band with a V notch, gold chevron keyline
  const notch = H * 0.07;
  const half = panelW * 0.75;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - half, yellowEnd);
  ctx.lineTo(cx, yellowEnd + notch);
  ctx.lineTo(cx + half, yellowEnd);
  ctx.lineTo(cx + half, H);
  ctx.lineTo(cx - half, H);
  ctx.closePath();
  const rg = ctx.createLinearGradient(0, yellowEnd, 0, H);
  rg.addColorStop(0, '#c4161c');
  rg.addColorStop(0.5, '#9c0f16');
  rg.addColorStop(1, '#6d0a0f');
  ctx.fillStyle = rg;
  ctx.fill();
  ctx.lineWidth = H * 0.012;
  ctx.strokeStyle = '#f3c45a';
  ctx.beginPath();
  ctx.moveTo(cx - half, yellowEnd - H * 0.012);
  ctx.lineTo(cx, yellowEnd + notch - H * 0.012);
  ctx.lineTo(cx + half, yellowEnd - H * 0.012);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = `700 ${H * 0.036}px Inter, Arial, sans-serif`;
  ctx.fillStyle = '#ffe9c4';
  ctx.letterSpacing = '2px';
  ctx.fillText('VITALITY  •  GOODNESS  •  ENERGY', cx, H * 0.93);
  ctx.restore();
}

export async function makeLabelTexture(aspect: number): Promise<THREE.Texture> {
  if (LABEL_ART_URL) {
    const tex = await new THREE.TextureLoader().loadAsync(LABEL_ART_URL);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }
  if (typeof document !== 'undefined' && document.fonts) {
    await Promise.all([
      document.fonts.load('64px "Lilita One"'),
      document.fonts.load('700 64px "Playfair Display"'),
      document.fonts.load('800 32px Inter'),
    ]).catch(() => undefined);
  }
  const W = LABEL_W;
  const H = Math.round(W * aspect);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // continuous sunburst on both halves (front centred at W/2, back at 0/W)
  sunburst(ctx, W / 2, H * 0.33, W, H);
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.rect(0, 0, W * 0.25, H);
  ctx.rect(W * 0.75, 0, W * 0.25, H);
  ctx.clip();
  sunburst(ctx, 0, H * 0.33, W * 0.5, H);
  sunburst(ctx, W, H * 0.33, W * 0.5, H);
  ctx.restore();

  // panels: front and a matching back panel (wrapping across the seam)
  const panelW = W / 2;
  labelPanel(ctx, W / 2, H, panelW);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W * 0.25, H);
  ctx.clip();
  labelPanel(ctx, 0, H, panelW);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(W * 0.75, 0, W * 0.25, H);
  ctx.clip();
  labelPanel(ctx, W, H, panelW);
  ctx.restore();

  // subtle paper/print grain & edge darkening for realism
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, 'rgba(60,20,0,0.25)');
  edge.addColorStop(0.04, 'rgba(0,0,0,0)');
  edge.addColorStop(0.97, 'rgba(0,0,0,0)');
  edge.addColorStop(1, 'rgba(40,0,0,0.35)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Tiling normal map of condensation droplets + a matching roughness map
 * (droplets are smoother than the frosted film between them).
 */
export function makeCondensationMaps(size = 1024) {
  const n = document.createElement('canvas');
  n.width = n.height = size;
  const nc = n.getContext('2d')!;
  nc.fillStyle = 'rgb(128,128,255)';
  nc.fillRect(0, 0, size, size);

  const r = document.createElement('canvas');
  r.width = r.height = size;
  const rc = r.getContext('2d')!;
  rc.fillStyle = 'rgb(120,120,120)';
  rc.fillRect(0, 0, size, size);

  const drop = (x: number, y: number, rad: number, elong: number) => {
    // draw with wrap-around so the texture tiles seamlessly
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const cx = x + ox, cy = y + oy;
        if (cx < -rad * 3 || cx > size + rad * 3 || cy < -rad * 3 || cy > size + rad * 3) continue;
        // hemispherical bead: normal = (dx, -dy, sqrt(1-d²)) encoded into RGB
        const img = nc.getImageData(Math.floor(cx - rad), Math.floor(cy - rad * elong), Math.ceil(rad * 2) + 1, Math.ceil(rad * 2 * elong) + 1);
        const w = img.width;
        for (let j = 0; j < img.height; j++) {
          for (let i = 0; i < w; i++) {
            const dx = (i - rad) / rad;
            const dy = (j - rad * elong) / (rad * elong);
            const d2 = dx * dx + dy * dy;
            if (d2 > 1) continue;
            const dz = Math.sqrt(1 - d2);
            const k = (j * w + i) * 4;
            img.data[k] = 128 + dx * 110;
            img.data[k + 1] = 128 - dy * 110;
            img.data[k + 2] = 128 + dz * 127;
          }
        }
        nc.putImageData(img, Math.floor(cx - rad), Math.floor(cy - rad * elong));
        rc.fillStyle = 'rgb(18,18,18)';
        rc.beginPath();
        rc.ellipse(cx, cy, rad, rad * elong, 0, 0, Math.PI * 2);
        rc.fill();
      }
    }
  };

  // many tiny beads, fewer larger drops, a handful of elongated runs
  for (let i = 0; i < 1400; i++) drop(Math.random() * size, Math.random() * size, 1.5 + Math.random() * 3, 1);
  for (let i = 0; i < 160; i++) drop(Math.random() * size, Math.random() * size, 5 + Math.random() * 7, 1 + Math.random() * 0.25);
  for (let i = 0; i < 18; i++) drop(Math.random() * size, Math.random() * size, 6 + Math.random() * 5, 1.8 + Math.random() * 1.2);

  const normal = new THREE.CanvasTexture(n);
  const rough = new THREE.CanvasTexture(r);
  for (const t of [normal, rough]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
  }
  return { normal, rough };
}

/** Soft radial sprite used for glows, the core light and particles. */
export function makeGlowTexture(inner = 'rgba(255,214,120,1)', outer = 'rgba(255,140,20,0)') {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.55)'));
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
