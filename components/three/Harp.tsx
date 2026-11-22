'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { buildHarp } from '@/lib/harpGeometry';
import { rig } from '@/lib/rig';
import { applyPose } from '@/lib/pose';
import { makeGlowTexture } from '@/lib/textures';

/** Overall model height in its own units (foot → top of scroll). */
export const HARP_H = 4.25;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Pivots of the two halves (roughly each half's centre of mass)
const PIVOT_L = new THREE.Vector3(-0.22, 0.3, 0);
const PIVOT_R = new THREE.Vector3(1.0, 0.25, 0);

/** Jagged fracture line that runs between the halves, through the strings. */
function crackPath() {
  const top = new THREE.Vector3(0.18, 1.8, 0.16);
  const bottom = new THREE.Vector3(0.66, -1.84, 0.16);
  const pts: THREE.Vector3[] = [];
  const n = 26;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = top.clone().lerp(bottom, t);
    if (i > 0 && i < n) {
      p.x += rnd() * 0.22 + Math.sin(t * Math.PI) * 0.25;
      p.y += rnd() * 0.06;
    }
    pts.push(p);
  }
  return pts;
}

const burstVertex = /* glsl */ `
  attribute vec3 aOrigin; attribute vec3 aVel; attribute float aSeed;
  uniform float uB; uniform float uScale;
  varying float vA;
  void main(){
    float b = uB * (0.75 + aSeed * 0.5);
    vec3 p = aOrigin + aVel * b + vec3(0.0, -0.9, 0.0) * b * b;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vA = (1.0 - smoothstep(0.55, 1.0, b)) * smoothstep(0.0, 0.03, uB);
    gl_PointSize = uScale * (0.6 + aSeed * 1.6) * (1.0 - b * 0.5) / -mv.z;
  }`;
const burstFragment = /* glsl */ `
  varying float vA;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d) * vA;
    vec3 col = mix(vec3(1.0, 0.62, 0.15), vec3(1.0, 0.95, 0.75), smoothstep(0.3, 0.0, d));
    gl_FragColor = vec4(col * a, a);
  }`;

interface Props {
  variant?: 'hero' | 'ghost';
}

export default function Harp({ variant = 'hero' }: Props) {
  const ghost = variant === 'ghost';
  const root = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const parts = useRef<Record<string, THREE.Object3D | null>>({});
  const strings = useRef<THREE.Group>(null);
  const coreSprite = useRef<THREE.Sprite>(null);
  const raySprite = useRef<THREE.Sprite>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const { viewport, camera, size } = useThree();

  const harp = useMemo(() => buildHarp(), []);

  const gold = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: ghost ? '#b8862f' : '#d6a548',
        metalness: 1,
        roughness: ghost ? 0.35 : 0.2,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        envMapIntensity: ghost ? 0.9 : 1.35,
        emissive: new THREE.Color('#5a3208'),
        emissiveIntensity: ghost ? 0.5 : 0.18,
        transparent: ghost,
        opacity: 1,
      }),
    [ghost],
  );

  const stringMats = useMemo(
    () =>
      harp.strings.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: '#f3d28a',
            metalness: 0.9,
            roughness: 0.25,
            emissive: new THREE.Color('#ffb53a'),
            emissiveIntensity: 0,
            transparent: true,
          }),
      ),
    [harp],
  );

  const crack = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(crackPath(), false, 'catmullrom', 0.1);
    const core = new THREE.TubeGeometry(curve, 220, 0.016, 6, false);
    const glow = new THREE.TubeGeometry(curve, 220, 0.075, 8, false);
    const coreMat = new THREE.MeshBasicMaterial({ color: '#fff4cf', transparent: true, toneMapped: false });
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#ffa82e',
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    return { curve, core, glow, coreMat, glowMat };
  }, []);

  const glowTex = useMemo(() => makeGlowTexture(), []);
  const rayTex = useMemo(() => {
    const s = 512;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const ctx = c.getContext('2d')!;
    ctx.translate(s / 2, s / 2);
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const w = 0.025 + ((i * 37) % 7) * 0.01;
      const g = ctx.createLinearGradient(0, 0, Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5);
      g.addColorStop(0, 'rgba(255,220,140,0.9)');
      g.addColorStop(1, 'rgba(255,160,40,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, s / 2, a - w, a + w);
      ctx.closePath();
      ctx.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const burst = useMemo(() => {
    const N = 900;
    const origin = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const tmp = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      crack.curve.getPoint(Math.random(), tmp);
      origin.set([tmp.x, tmp.y, tmp.z], i * 3);
      const side = Math.random() < 0.5 ? -1 : 1;
      const dir = new THREE.Vector3(side * (0.6 + Math.random()), (Math.random() - 0.35) * 1.4, Math.random() * 1.6)
        .normalize()
        .multiplyScalar(1.2 + Math.random() * 3.2);
      vel.set([dir.x, dir.y, dir.z], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute('aOrigin', new THREE.BufferAttribute(origin, 3));
    g.setAttribute('aVel', new THREE.BufferAttribute(vel, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    const m = new THREE.ShaderMaterial({
      vertexShader: burstVertex,
      fragmentShader: burstFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uB: { value: 0 }, uScale: { value: 60 } },
    });
    return { g, m };
  }, [crack]);

  useFrame((state) => {
    const r = root.current;
    if (!r) return;
    const reduce = state.scene.userData.reducedMotion as boolean;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0], size);
    const t = state.clock.elapsedTime;

    if (ghost) {
      const vis = rig.ghostOpacity > 0.002;
      r.visible = vis;
      if (!vis) return;
      applyPose(r, rig.ghost, vp, HARP_H);
      gold.opacity = rig.ghostOpacity;
      if (float.current) float.current.rotation.y = reduce ? 0 : Math.sin(t * 0.25) * 0.18;
      return;
    }

    const open = rig.harpOpen;
    const vis = rig.harpOpacity > 0.002 && open < 0.999;
    r.visible = vis;
    if (!vis) return;
    applyPose(r, rig.harp, vp, HARP_H);

    // idle breathing — fades out once the opening sequence begins
    if (float.current) {
      const idle = reduce ? 0 : 1 - smooth(0, 0.15, open + rig.harpCrack);
      float.current.position.y = Math.sin(t * 1.2) * 0.07 * idle;
      float.current.rotation.z = Math.sin(t * 0.8) * 0.025 * idle;
      float.current.rotation.x = Math.cos(t * 0.9) * 0.04 * idle;
    }

    // ── halves separate like a cracked shell ────────────────────────────────
    const sep = easeInOut(clamp01(open));
    const lead = smooth(0, 0.18, open); // first hairline gap before they fly
    if (left.current) {
      left.current.position.set(
        PIVOT_L.x - 0.12 * lead - 3.0 * sep,
        PIVOT_L.y + 0.05 * lead + 1.6 * sep,
        PIVOT_L.z + 1.1 * sep,
      );
      left.current.rotation.set(0.35 * sep, -1.05 * sep, 0.55 * sep + 0.04 * lead);
    }
    if (right.current) {
      right.current.position.set(
        PIVOT_R.x + 0.12 * lead + 3.0 * sep,
        PIVOT_R.y - 0.05 * lead - 1.7 * sep,
        PIVOT_R.z + 1.1 * sep,
      );
      right.current.rotation.set(-0.3 * sep, 1.05 * sep, -0.6 * sep - 0.04 * lead);
    }

    // ── exploded view of sub-components ─────────────────────────────────────
    const e = rig.harpExplode;
    const P = parts.current;
    if (P.studs) P.studs.position.set(-0.08 * e, 0, 0.45 * e);
    if (P.neckRear) {
      P.neckRear.position.set(-0.12 * e, 0.32 * e, 0.12 * e);
      P.neckRear.rotation.z = 0.12 * e;
    }
    if (P.foot) P.foot.position.set(-0.05 * e, -0.3 * e, 0.1 * e);
    if (P.neckFront) {
      P.neckFront.position.set(0.1 * e, 0.34 * e, 0.15 * e);
      P.neckFront.rotation.z = -0.1 * e;
    }
    if (P.scroll) {
      P.scroll.position.set(0.22 * e, 0.28 * e, 0.25 * e);
      P.scroll.rotation.z = -0.9 * e;
    }
    if (P.pillar) P.pillar.position.set(0.16 * e, -0.05 * e, -0.08 * e);

    // ── strings: pluck shimmer, then snap and fall away ─────────────────────
    const n = harp.strings.length;
    const pluckHead = rig.harpPluck * (n + 3);
    strings.current?.children.forEach((child, i) => {
      const s = harp.strings[i];
      const mat = stringMats[i];
      const d = pluckHead - i;
      const glow = d > 0 ? Math.exp(-d * 0.55) * 3 + 0.35 * rig.harpPluck : 0;
      const vib = d > 0 && d < 4 && !reduce ? Math.sin(t * 60 + i) * 0.012 * Math.exp(-d) : 0;
      mat.emissiveIntensity = glow + rig.harpCrack * 0.8;
      const snap = smooth(i / n * 0.35, i / n * 0.35 + 0.3, open);
      const dir = i % 2 ? 1 : -1;
      child.position.set(s.mid.x + vib - dir * snap * 0.5, s.mid.y - snap * 0.9, s.mid.z + snap * 0.6);
      child.quaternion.copy(s.quaternion);
      child.rotateZ(dir * snap * 1.4);
      child.scale.set(1, Math.max(0.001, 1 - snap * 0.85), 1);
      mat.opacity = 1 - smooth(0.6, 1, snap);
    });

    // ── crack seam draws itself, then dissolves into the core light ─────────
    const crackDraw = clamp01(rig.harpCrack);
    const idx = crack.core.index!.count;
    crack.core.setDrawRange(0, Math.floor((idx * crackDraw) / 6) * 6);
    crack.glow.setDrawRange(0, Math.floor((crack.glow.index!.count * crackDraw) / 6) * 6);
    const crackFade = 1 - smooth(0.15, 0.45, open);
    crack.coreMat.opacity = crackFade;
    crack.glowMat.opacity = (0.35 + Math.sin(t * 18) * 0.08) * crackFade * (reduce ? 0.8 : 1);

    // ── the core light the bottle is born from ──────────────────────────────
    const core = rig.core;
    if (coreSprite.current) {
      coreSprite.current.visible = core > 0.001;
      coreSprite.current.scale.setScalar(0.6 + core * 4.5);
      (coreSprite.current.material as THREE.SpriteMaterial).opacity = Math.min(1, core * 1.4);
    }
    if (raySprite.current) {
      raySprite.current.visible = core > 0.001;
      raySprite.current.scale.setScalar(1 + core * 7);
      const m = raySprite.current.material as THREE.SpriteMaterial;
      m.opacity = core * 0.75;
      m.rotation = reduce ? 0 : t * 0.15 + open * 1.2;
    }
    if (coreLight.current) coreLight.current.intensity = core * 30;

    burst.m.uniforms.uB.value = rig.burst;
    burst.m.uniforms.uScale.value = size.height * 0.11;
  });

  const setPart = (k: string) => (o: THREE.Object3D | null) => {
    parts.current[k] = o;
  };

  return (
    <group ref={root} visible={false}>
      <group ref={float}>
        {/* offset so the model is centred on its own mid-height */}
        <group position={[-0.16, -0.12, 0]}>
          <group ref={left} position={PIVOT_L.toArray()}>
            <group position={PIVOT_L.clone().negate().toArray()}>
              <mesh geometry={harp.left.soundbox} material={gold} castShadow />
              <mesh ref={setPart('neckRear')} geometry={harp.left.neckRear} material={gold} castShadow />
              <group ref={setPart('studs')}>
                {harp.left.studs.map((g, i) => (
                  <mesh key={i} geometry={g} material={gold} />
                ))}
              </group>
            </group>
          </group>

          <group ref={right} position={PIVOT_R.toArray()}>
            <group position={PIVOT_R.clone().negate().toArray()}>
              <mesh ref={setPart('neckFront')} geometry={harp.right.neckFront} material={gold} castShadow />
              <mesh ref={setPart('pillar')} geometry={harp.right.pillar} material={gold} castShadow />
              <mesh ref={setPart('foot')} geometry={harp.left.foot} material={gold} castShadow />
              <group ref={setPart('scroll')} position={[0, 0, 0]}>
                <mesh geometry={harp.right.scroll} material={gold} />
              </group>
            </group>
          </group>

          {!ghost && (
            <>
              <group ref={strings}>
                {harp.strings.map((s, i) => (
                  <mesh key={i} geometry={s.geometry} material={stringMats[i]} />
                ))}
              </group>
              <mesh geometry={crack.glow} material={crack.glowMat} renderOrder={3} />
              <mesh geometry={crack.core} material={crack.coreMat} renderOrder={4} />
              <sprite ref={raySprite} position={[0.3, 0.4, -0.3]} visible={false}>
                <spriteMaterial map={rayTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
              </sprite>
              <sprite ref={coreSprite} position={[0.3, 0.4, 0.1]} visible={false}>
                <spriteMaterial map={glowTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
              </sprite>
              <pointLight ref={coreLight} position={[0.3, 0.4, 0.6]} color="#ffb14a" intensity={0} distance={7} decay={1.6} />
              <points geometry={burst.g} material={burst.m} frustumCulled={false} />
            </>
          )}
        </group>
      </group>
    </group>
  );
}
