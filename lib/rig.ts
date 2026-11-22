/**
 * The single source of truth for everything the WebGL scene shows.
 *
 * GSAP's scroll-scrubbed master timeline (lib/timeline.ts) writes these
 * numbers; the R3F components read them every frame. Nothing in the 3D scene
 * animates on its own clock except tiny idle "breathing" motions, so every
 * pose of the harp and bottle is a pure function of scroll position and
 * scrolling backwards plays the whole film in reverse.
 *
 * Positions are in viewport-relative units: x = -1 (left edge) … 1 (right
 * edge), y = -1 (bottom) … 1 (top). Scale is relative to viewport height.
 */
export interface Pose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  scale: number;
}

const pose = (p: Partial<Pose> = {}): Pose => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1, ...p });

export const rig = {
  harp: pose({ scale: 0.56 }),
  /** 0 → closed, 1 → halves fully separated and gone. */
  harpOpen: 0,
  /** 0 → 1 the strings light up one after another (the "pluck"). */
  harpPluck: 0,
  /** 0 → 1 the glowing seam draws itself across the harp. */
  harpCrack: 0,
  /** Exploded-view separation of sub-components within each half. */
  harpExplode: 0,
  harpOpacity: 1,

  /** Finale: the harp re-forms, large and dim, behind the bottle. */
  ghost: pose({ scale: 1.25, z: -3 }),
  ghostOpacity: 0,

  bottle: pose({ scale: 0.15, z: -2 }),
  bottleOpacity: 0,

  /** Central amber light the bottle is born from. */
  core: 0,
  /** 0 → 1 drives the particle burst (deterministic, so it scrubs back). */
  burst: 0,
  /** Final spotlight intensity. */
  spot: 0,
  /** Warm vs. dark lighting mood (0 = cream daylight, 1 = night/studio). */
  mood: 0,
};

export type Rig = typeof rig;
