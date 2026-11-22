import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { rig } from './rig';

gsap.registerPlugin(ScrollTrigger);

const TAU = Math.PI * 2;

/** Snapshot of the rig's initial state, restored before every rebuild. */
const INITIAL = JSON.parse(JSON.stringify(rig)) as typeof rig;
function resetRig() {
  const src = JSON.parse(JSON.stringify(INITIAL)) as typeof rig;
  for (const k of Object.keys(src) as (keyof typeof rig)[]) {
    const v = src[k];
    if (typeof v === 'object') Object.assign(rig[k] as object, v);
    else (rig as Record<string, unknown>)[k] = v;
  }
}

/**
 * Builds ONE master timeline whose time unit is "scroll pixels": a tween
 * placed at 1200 with duration 600 plays while the page scrolls from 1200px
 * to 1800px. ScrollTrigger scrubs it across the whole document, so every
 * 3D pose and text reveal is locked to the scrollbar (and reverses with it).
 */
export function buildTimeline({ reduced }: { reduced: boolean }) {
  resetRig();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const M = vw < 768; // mobile layout
  const sy = window.scrollY;

  const el = (id: string) => document.getElementById(id)!;
  const top = (id: string) => el(id).getBoundingClientRect().top + sy;
  const span = (id: string) => Math.max(1, el(id).offsetHeight - vh);
  const at = (id: string, f: number) => top(id) + span(id) * f;
  const one = (k: string) => document.querySelector<HTMLElement>(`[data-a="${k}"]`);
  const chars = (k: string) => gsap.utils.toArray<HTMLElement>(`[data-a="${k}"] .ch`);

  const maxScroll = document.documentElement.scrollHeight - vh;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  /** tween `vars` between scroll positions a → b */
  const T = (target: gsap.TweenTarget, vars: gsap.TweenVars, a: number, b: number) => {
    if (target == null) return;
    tl.to(target, { ...vars, duration: Math.max(1, b - a) }, a);
  };
  /** letters flip up into place, staggered across [a, b] */
  const flipIn = (k: string, a: number, b: number) => {
    const c = chars(k);
    if (!c.length) return;
    const each = ((b - a) * 0.55) / c.length;
    gsap.set(c, { rotateX: -100, yPercent: 55, opacity: 0 });
    tl.to(c, { rotateX: 0, yPercent: 0, opacity: 1, duration: (b - a) * 0.45, ease: 'back.out(1.6)', stagger: each }, a);
    // highlight pills (e.g. "BOLD") sweep in behind their letters
    const pills = gsap.utils.toArray<HTMLElement>(`[data-a="${k}"] .pill-word`);
    if (pills.length) {
      gsap.set(pills, { scaleX: 0, opacity: 0, transformOrigin: '0% 50%' });
      tl.to(pills, { scaleX: 1, opacity: 1, duration: (b - a) * 0.3, ease: 'power3.out' }, a + (b - a) * 0.45);
    }
  };
  const flipOut = (k: string, a: number, b: number, dir = -1) => {
    const c = chars(k);
    if (!c.length) return;
    const each = ((b - a) * 0.5) / c.length;
    tl.to(c, { rotateX: 95 * -dir, yPercent: 70 * dir, opacity: 0, duration: (b - a) * 0.5, ease: 'power2.in', stagger: each }, a);
  };
  const fadeUp = (target: gsap.TweenTarget, a: number, b: number, y = 30) => {
    if (target == null) return;
    gsap.set(target, { opacity: 0, y });
    tl.to(target, { opacity: 1, y: 0, duration: Math.max(1, b - a), ease: 'power2.out' }, a);
  };

  // ════════════════ SCENES 1–3 · story ════════════════
  const S = (f: number) => at('story', f);

  Object.assign(rig.harp, { x: 0, y: M ? 0.04 : -0.02, z: 0, rx: 0.06, ry: -0.42, rz: 0, scale: M ? 0.4 : 0.6 });

  // headline & intro leave, the harp comes alive
  flipOut('hero-w1', S(0.0), S(0.11), -1);
  flipOut('hero-w2', S(0.015), S(0.125), -1);
  T(one('hero-intro'), { opacity: 0, y: -30 }, S(0), S(0.07));
  T(one('hero-cue'), { opacity: 0, y: 20 }, S(0), S(0.04));
  T(one('hero-halo'), { scale: 1.35, opacity: 0.9 }, S(0), S(0.4));

  T(rig.harp, { ry: TAU - 0.0, y: 0, scale: M ? 0.46 : 0.66, ease: 'power1.inOut' }, S(0), S(0.3));
  T(rig.harp, { rx: 0, ease: 'sine.inOut' }, S(0.05), S(0.3));

  // coins rise past the camera at different speeds, flipping as they go
  [0, 1, 2, 3].forEach((i) => {
    const c = one(`coin-${i}`);
    if (!c) return;
    T(c, { y: -vh * (1.05 + i * 0.22), rotationY: 360 + i * 120, rotationZ: (i % 2 ? -1 : 1) * 25, ease: 'power1.in' }, S(0.02 + i * 0.015), S(0.34 + i * 0.02));
  });

  // the pluck: strings light up one after another as the harp tilts to the diagonal
  T(rig.harp, { rz: -0.42, ease: 'power2.inOut' }, S(0.24), S(0.36));
  T(rig, { harpPluck: 1 }, S(0.22), S(0.38));

  // the crack: a glowing seam draws itself through the harp
  T(rig, { harpCrack: 1, ease: 'power1.in' }, S(0.34), S(0.45));
  T(rig, { core: 0.3 }, S(0.36), S(0.46));
  T(rig.harp, { scale: M ? 0.48 : 0.7, ease: 'power1.inOut' }, S(0.34), S(0.46));

  // the split: hairline gap… then the halves fly apart like a cracked shell
  T(rig, { harpOpen: 0.16, ease: 'power2.out' }, S(0.46), S(0.5));
  T(rig, { harpOpen: 1, ease: 'power2.in' }, S(0.5), S(0.7));
  T(rig, { harpExplode: 1, ease: 'power2.out' }, S(0.48), S(0.62));
  T(rig, { burst: 1, ease: 'power1.out' }, S(0.49), S(0.76));
  T(rig, { core: 1, ease: 'power2.out' }, S(0.46), S(0.53));
  T(rig, { core: 0, ease: 'power1.in' }, S(0.6), S(0.76));
  T(rig, { harpOpacity: 0 }, S(0.7), S(0.72));

  // the bottle is born from the core light, sliding out along the seam
  Object.assign(rig.bottle, { x: -0.02, y: 0, z: -1.4, rx: 0, ry: 0, rz: -0.42, scale: 0.1 });
  T(rig, { bottleOpacity: 1 }, S(0.465), S(0.47));
  T(rig.bottle, { z: 0.6, scale: M ? 0.46 : 0.64, ry: TAU * 0.75, x: M ? 0.02 : 0.06, y: M ? 0.02 : 0.03, ease: 'power3.out' }, S(0.47), S(0.64));
  T(rig.bottle, {
    x: M ? 0 : 0.17, y: M ? -0.08 : -0.02, z: 0, rz: 0, ry: TAU + 0.28, scale: M ? 0.5 : 0.76, ease: 'power2.inOut',
  }, S(0.64), S(0.8));

  // reveal copy
  fadeUp(one('reveal-eyebrow'), S(0.7), S(0.76), 14);
  flipIn('reveal-l1', S(0.71), S(0.81));
  flipIn('reveal-l2', S(0.74), S(0.85));
  fadeUp(one('reveal-tag'), S(0.8), S(0.88));
  fadeUp(one('reveal-side'), S(0.83), S(0.91));
  T(rig.bottle, { ry: TAU + 0.6, ease: 'sine.inOut' }, S(0.8), S(1));

  // ════════════════ SCENE 4 · discover ════════════════
  const D = (f: number) => at('discover', f);
  const brandEnter = top('brand') - vh; // dark panel starts rising
  const brandTop = top('brand'); // dark panel fully covers the stage
  const discEnd = (brandEnter - top('discover')) / span('discover'); // progress where panel arrives
  const factSpan = (discEnd - 0.2) / 5;

  fadeUp(one('disc-head'), D(-0.12), D(0.0), 16);
  gsap.set(one('disc-rule'), { scaleY: 0 });
  T(one('disc-rule'), { scaleY: 1, ease: 'power2.out' }, D(-0.1), D(0.04));

  // carry the bottle from the reveal into the first fact pose
  const factPose = (i: number) =>
    M
      ? { x: 0, y: 0.34, scale: 0.4, rz: 0 }
      : { x: i % 2 === 0 ? 0.3 : -0.3, y: -0.02, scale: 0.72, rz: i % 2 === 0 ? -0.06 : 0.06 };

  T(rig.bottle, { ...factPose(0), ease: 'power2.inOut' }, S(1), D(0.02));
  // the bottle turns continuously through the facts, so every side of the label is seen
  T(rig.bottle, { ry: TAU * 3.4 }, D(0.02), D(discEnd));

  for (let i = 0; i < 5; i++) {
    const a = D(0.02 + i * factSpan);
    const b = a + factSpan * (D(1) - D(0));
    const f = one(`fact-${i}`);
    const shift = M ? 0 : i % 2 === 0 ? -50 : 50;
    if (f) {
      gsap.set(f, { opacity: 0, x: shift });
      tl.to(f, { opacity: 1, x: 0, duration: (b - a) * 0.22, ease: 'power2.out' }, a + (b - a) * 0.04);
      if (i < 4) tl.to(f, { opacity: 0, x: -shift * 0.6, duration: (b - a) * 0.16, ease: 'power2.in' }, a + (b - a) * 0.8);
      else tl.to(f, { opacity: 0, y: -30, duration: (b - a) * 0.16, ease: 'power2.in' }, a + (b - a) * 0.8);
    }
    flipIn(`fact-${i}`, a + (b - a) * 0.04, a + (b - a) * 0.34);
    const dot = one(`dot-${i}`);
    if (dot) {
      T(dot, { backgroundColor: '#d4a038', width: 56 }, a, a + (b - a) * 0.15);
      T(dot, { backgroundColor: 'rgba(58,29,14,0.15)', width: 32 }, a + (b - a) * 0.85, b);
    }
    if (i > 0) T(rig.bottle, { ...factPose(i), ease: 'power2.inOut' }, a - (b - a) * 0.1, a + (b - a) * 0.18);
  }
  T(one('disc-head'), { opacity: 0 }, D(discEnd - 0.2), D(discEnd - 0.16));
  T(one('disc-counter'), { opacity: 0 }, D(discEnd - 0.2), D(discEnd - 0.16));

  // "MAKE EVERY MOMENT COUNT." rises behind the bottle, which settles centre
  T(rig.bottle, { x: 0, y: M ? 0.02 : -0.03, rz: 0, scale: M ? 0.5 : 0.62, ease: 'power2.inOut' }, D(discEnd - 0.2), D(discEnd - 0.1));
  flipIn('moment-l1', D(discEnd - 0.17), D(discEnd - 0.07));
  flipIn('moment-l2', D(discEnd - 0.13), D(discEnd - 0.03));

  // the dark scalloped panel rises and swallows the scene
  T(rig.bottle, { y: -0.35, ry: '+=0.8', ease: 'power1.in' }, brandEnter, brandTop);
  T(rig, { mood: 1 }, brandEnter, brandTop);
  T(rig, { bottleOpacity: 0 }, brandTop - 2, brandTop);

  // ════════════════ SCENE 5 · brand ════════════════
  const B = (f: number) => brandTop + vh * f;
  flipIn('brand-l1', B(-0.35), B(0.15));
  flipIn('brand-l2', B(-0.1), B(0.45));
  fadeUp(one('brand-eyebrow'), B(-0.45), B(-0.2), 12);
  fadeUp(one('brand-copy'), B(0.35), B(0.65));
  const coin = one('brand-coin');
  if (coin) {
    gsap.set(coin, { y: vh * 0.6, rotationY: -180 });
    T(coin, { y: -vh * 0.15, rotationY: 360, ease: 'power1.out' }, B(-0.4), B(1.6));
  }
  // line art draws itself
  const brandSvgs = gsap.utils.toArray<SVGGeometryElement>('#brand .line-art path, #brand .line-art line, #brand .line-art circle, #brand .line-art ellipse');
  brandSvgs.forEach((p, i) => {
    const len = p.getTotalLength?.() || 200;
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    T(p, { strokeDashoffset: 0, ease: 'power1.inOut' }, B(-0.6) + (i % 9) * vh * 0.03, B(0.9) + (i % 9) * vh * 0.03);
  });

  // moments: horizontal gallery
  const track = one('moments-track');
  if (track) {
    const dist = Math.max(0, track.scrollWidth - vw);
    T(track, { x: -dist, ease: 'none' }, at('moments', 0.05), at('moments', 0.95));
  }
  flipIn('moments-title', at('moments', 0) - vh * 0.6, at('moments', 0) + vh * 0.1);
  T(one('moments-bar'), { scaleX: 1 }, at('moments', 0.05), at('moments', 0.95));

  // ════════════════ heritage ════════════════
  const H = (f: number) => at('heritage', f);
  const harpEl = one('her-harp');
  if (harpEl) {
    gsap.set(harpEl, { clipPath: 'inset(100% 0% 0% 0%)', rotate: -6, scale: 0.9 });
    T(harpEl, { clipPath: 'inset(0% 0% 0% 0%)', rotate: 0, scale: 1, ease: 'power2.out' }, H(0) - vh * 0.6, H(0.25));
  }
  fadeUp(one('her-eyebrow'), H(0) - vh * 0.4, H(0.05), 12);
  flipIn('her-title', H(0) - vh * 0.35, H(0.2));
  fadeUp(one('her-copy'), H(0.1), H(0.35));

  // ════════════════ SCENE 6 · finale ════════════════
  const F = (f: number) => at('finale', f);
  Object.assign(rig.ghost, { x: 0, y: 0.04, z: -4, rx: 0, ry: -0.7, rz: 0, scale: M ? 0.7 : 1.15 });
  tl.set(rig, { bottleOpacity: 1 }, F(0) - vh * 0.25);
  tl.set(rig.bottle, { x: 0, y: -1.6, z: 0, rx: 0, ry: -0.4, rz: 0, scale: M ? 0.52 : 0.66 }, F(0) - vh * 0.25);
  T(rig.bottle, { y: M ? 0.06 : 0.02, ry: TAU - 0.15, ease: 'power3.out' }, F(0) - vh * 0.24, F(0.34));
  T(rig.bottle, { ry: TAU + 0.5, ease: 'sine.inOut' }, F(0.34), F(1));
  T(rig, { spot: 1, ease: 'power2.out' }, F(0.02), F(0.32));
  T(rig, { ghostOpacity: 0.42, ease: 'power1.out' }, F(0.12), F(0.42));
  T(rig.ghost, { ry: 0, scale: M ? 0.62 : 1.02, ease: 'power2.out' }, F(0.12), F(0.5));
  T(one('fin-beam'), { opacity: 1 }, F(0.0), F(0.3));
  T(one('fin-floor'), { opacity: 1 }, F(0.1), F(0.34));
  flipIn('fin-l1', F(0.28), F(0.46));
  flipIn('fin-l2', F(0.33), F(0.52));
  fadeUp(one('fin-tag'), F(0.5), F(0.6));
  fadeUp(one('fin-cta'), F(0.55), F(0.66));

  // pad the timeline so 1 unit === 1 scroll pixel across the entire document
  tl.set({}, {}, maxScroll);

  const st = ScrollTrigger.create({
    start: 0,
    end: maxScroll,
    scrub: reduced ? true : 0.85,
    animation: tl,
  });
  // jump straight to the current position on (re)build
  tl.progress(Math.min(1, sy / maxScroll || 0));

  return () => {
    st.kill();
    tl.kill();
  };
}

/** Clears inline styles written by a previous build (before re-measuring). */
export function clearAnimatedStyles() {
  // (only the properties the timeline writes; React-owned inline styles such
  // as the coins' position/size custom properties must survive)
  gsap.set('[data-a], [data-a] .ch, [data-a] .pill-word, #brand .line-art *', {
    clearProps: 'transform,opacity,clipPath,strokeDasharray,strokeDashoffset,backgroundColor,width',
  });
}
