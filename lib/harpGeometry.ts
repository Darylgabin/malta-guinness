import * as THREE from 'three';

/**
 * A Brian-Boru-style harp in the Guinness orientation (soundbox on the left,
 * curved forepillar on the right, strings running diagonally between them).
 *
 * Built as separate, physically meaningful parts so the scroll timeline can
 * split it open the way the coconut cracks open in the reference:
 *
 *   LEFT HALF  : soundbox + rear section of the neck
 *   RIGHT HALF : forepillar (with its scroll) + front section of the neck
 *   STRINGS    : individual strings that light up, snap and scatter
 *
 * The outlines are generated from centre-line splines with a width profile,
 * extruded with a bevel so the logo reads as a solid, cast-gold object.
 */

const V = (x: number, y: number) => new THREE.Vector2(x, y);

/** Turn a centre-line + width function into a closed 2D outline. */
function ribbon(
  pts: THREE.Vector2[],
  width: (t: number) => number,
  samples = 80,
): THREE.Shape {
  const curve = new THREE.SplineCurve(pts);
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t);
    const n = V(-tan.y, tan.x);
    const w = width(t) / 2;
    left.push(p.clone().addScaledVector(n, w));
    right.push(p.clone().addScaledVector(n, -w));
  }
  const shape = new THREE.Shape();
  shape.moveTo(left[0].x, left[0].y);
  left.slice(1).forEach((p) => shape.lineTo(p.x, p.y));
  right.reverse().forEach((p) => shape.lineTo(p.x, p.y));
  shape.closePath();
  return shape;
}

// ── Centre lines ────────────────────────────────────────────────────────────
// Units: the whole harp is ~2.6 wide × ~4.2 tall.
// Classic Irish-harp triangle: the soundbox is the long diagonal (foot at the
// bottom-right, rising to the top-left), the S-curved neck spans the top, and
// the slender curved forepillar closes the right side. Strings drop vertically
// from the neck onto the soundbox, filling the triangle.

/** Soundbox: long, tapering, slightly bowed diagonal. Bottom (foot) → top. */
export const SOUNDBOX_LINE = [V(0.62, -1.78), V(0.2, -0.95), V(-0.22, -0.08), V(-0.6, 0.78), V(-0.9, 1.5)];
const soundboxCurve = new THREE.SplineCurve(SOUNDBOX_LINE);

/** Neck (harmonic curve): the S-shaped top arm. Rear (soundbox) → front. */
const NECK_REAR = [V(-0.96, 1.48), V(-0.82, 1.86), V(-0.48, 2.0), V(-0.1, 1.9), V(0.18, 1.74)];
const NECK_FRONT = [V(0.18, 1.74), V(0.5, 1.6), V(0.82, 1.7), V(1.06, 1.9), V(1.18, 2.02)];

/** Forepillar: from the neck's end, bowing outward, down to the foot. */
const PILLAR = [V(1.14, 1.96), V(1.3, 1.2), V(1.3, 0.3), V(1.16, -0.6), V(0.94, -1.3), V(0.72, -1.82)];

/** Curl at the head of the forepillar (the carved scroll). */
function scrollShape(): THREE.Shape {
  const pts: THREE.Vector2[] = [];
  const c = V(1.22, 2.04);
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const a = Math.PI * 0.15 + t * Math.PI * 1.75;
    const r = 0.2 * (1 - t * 0.6);
    pts.push(V(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r));
  }
  return ribbon(pts, (t) => 0.11 * (1 - t * 0.55), 60);
}

/** Small foot/base block joining soundbox and forepillar. */
function footShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0.3, -2.0);
  s.lineTo(1.02, -2.0);
  s.quadraticCurveTo(1.12, -1.92, 0.98, -1.78);
  s.lineTo(0.42, -1.74);
  s.quadraticCurveTo(0.24, -1.86, 0.3, -2.0);
  return s;
}

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.22,
  bevelEnabled: true,
  bevelThickness: 0.06,
  bevelSize: 0.035,
  bevelSegments: 4,
  curveSegments: 48,
};

function extrude(shape: THREE.Shape | THREE.Shape[], opts: Partial<THREE.ExtrudeGeometryOptions> = {}) {
  const g = new THREE.ExtrudeGeometry(shape, { ...EXTRUDE, ...opts });
  g.translate(0, 0, -((opts.depth ?? EXTRUDE.depth!) / 2));
  g.computeVertexNormals();
  return g;
}

/** Decorative scale pattern on the soundbox face (raised studs). */
function soundboxStuds(): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.1;
    const p = soundboxCurve.getPoint(t);
    const g = new THREE.SphereGeometry(0.075 - i * 0.003, 20, 12);
    g.scale(1, 0.75, 0.45);
    g.translate(p.x, p.y, 0.2);
    out.push(g);
  }
  return out;
}

export interface HarpString {
  geometry: THREE.CylinderGeometry;
  start: THREE.Vector3;
  end: THREE.Vector3;
  mid: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
}

/** Point on a curve whose x is closest to `x` (curves here are x-monotonic). */
function atX(curve: THREE.SplineCurve, x: number) {
  let best = curve.getPoint(0);
  for (let i = 1; i <= 300; i++) {
    const p = curve.getPoint(i / 300);
    if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
  }
  return best;
}

/** Strings drop vertically from the underside of the neck onto the soundbox. */
function strings(count = 14): HarpString[] {
  const neck = new THREE.SplineCurve([...NECK_REAR, ...NECK_FRONT.slice(1)]);
  const out: HarpString[] = [];
  const x0 = -0.62, x1 = 0.56;
  for (let i = 0; i < count; i++) {
    const x = x0 + ((x1 - x0) * i) / (count - 1);
    const a = atX(soundboxCurve, x);
    const b = atX(neck, x);
    const start = new THREE.Vector3(x, a.y + 0.2, 0);
    const end = new THREE.Vector3(x, b.y - 0.1, 0);
    const dir = end.clone().sub(start);
    const length = dir.length();
    const geometry = new THREE.CylinderGeometry(0.012, 0.012, length, 6, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    out.push({ geometry, start, end, mid: start.clone().add(end).multiplyScalar(0.5), quaternion, length });
  }
  return out;
}

/** All flat outlines (for 2D use: SVG logo mark, label emblem). */
export function harpOutlines() {
  return {
    shapes: [
      ribbon(SOUNDBOX_LINE, (t) => 0.42 - t * 0.16),
      ribbon(NECK_REAR, (t) => 0.24 - t * 0.04),
      ribbon(NECK_FRONT, (t) => 0.2 + Math.sin(t * Math.PI) * 0.05),
      ribbon(PILLAR, (t) => 0.17 + Math.sin(t * Math.PI) * 0.09),
      scrollShape(),
      footShape(),
    ],
    strings: strings().map((s) => [s.start, s.end] as const),
  };
}

/** SVG markup of the harp mark, in a viewBox fitted to the outline. */
export function harpSvgMarkup(fill = 'currentColor', stringWidth = 0.035) {
  const { shapes, strings: str } = harpOutlines();
  const d = shapes
    .map((s) => {
      const pts = s.getPoints(40);
      return 'M' + pts.map((p) => `${p.x.toFixed(3)} ${(-p.y).toFixed(3)}`).join('L') + 'Z';
    })
    .join('');
  const lines = str
    .map(([a, b]) => `<line x1="${a.x.toFixed(3)}" y1="${(-a.y).toFixed(3)}" x2="${b.x.toFixed(3)}" y2="${(-b.y).toFixed(3)}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.45 -2.3 2.9 4.4"><path d="${d}" fill="${fill}"/><g stroke="${fill}" stroke-width="${stringWidth}" stroke-linecap="round">${lines}</g></svg>`;
}

export function buildHarp() {
  const soundbox = extrude(ribbon(SOUNDBOX_LINE, (t) => 0.42 - t * 0.16), { depth: 0.3 });
  const neckRear = extrude(ribbon(NECK_REAR, (t) => 0.24 - t * 0.04));
  const neckFront = extrude(ribbon(NECK_FRONT, (t) => 0.2 + Math.sin(t * Math.PI) * 0.05));
  const pillar = extrude(ribbon(PILLAR, (t) => 0.17 + Math.sin(t * Math.PI) * 0.09));
  const scroll = extrude(scrollShape(), { depth: 0.16 });
  const foot = extrude(footShape(), { depth: 0.34 });
  return {
    left: { soundbox, neckRear, foot, studs: soundboxStuds() },
    right: { neckFront, pillar, scroll },
    strings: strings(),
  };
}
