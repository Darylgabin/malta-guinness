'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import profileData from '@/lib/bottleProfile.json';
import { rig } from '@/lib/rig';
import { applyPose } from '@/lib/pose';
import { makeCondensationMaps, makeLabelTexture } from '@/lib/textures';

/**
 * The Malta Guinness bottle as a real 3D object.
 *
 * Silhouette: lathed from lib/bottleProfile.json, which scripts/cutout-bottle.mjs
 * measures row-by-row from the supplied product photo, so proportions (body,
 * shoulder, long neck, crown cap) match the photographed bottle.
 * Height is normalised to 1 world unit; the parent scales it to the viewport.
 */

const PROFILE = (profileData.profile as [number, number][]).map(([r, t]) => new THREE.Vector2(r, t));

// Region boundaries (fractions of total height), tuned against the photo.
export const CAP_START = 0.925;
export const LABEL_BOTTOM = 0.272;
export const LABEL_TOP = 0.645;

function sliceProfile(from: number, to: number, inflate = 0) {
  const pts = PROFILE.filter((p) => p.y >= from - 1e-6 && p.y <= to + 1e-6).map(
    (p) => new THREE.Vector2(p.x * (1 + inflate), p.y),
  );
  return pts;
}

function radiusAt(t: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    if (PROFILE[i].y >= t) {
      const a = PROFILE[i - 1], b = PROFILE[i];
      return THREE.MathUtils.lerp(a.x, b.x, (t - a.y) / (b.y - a.y || 1));
    }
  }
  return PROFILE[PROFILE.length - 1].x;
}

const rimVertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV; varying float vY;
  void main(){
    vec4 wp = modelMatrix * vec4(position,1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    vY = position.y;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`;
const rimFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uStrength; uniform float uLabelBottom; uniform float uLabelTop;
  varying vec3 vN; varying vec3 vV; varying float vY;
  void main(){
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
    // light transmitted through the malt is strongest where glass is thin (neck)
    float neck = smoothstep(0.62, 0.85, vY);
    float onLabel = step(uLabelBottom, vY) * step(vY, uLabelTop);
    float a = f * uStrength * (0.65 + neck * 0.9) * (1.0 - onLabel * 0.85);
    gl_FragColor = vec4(uColor * a, a);
  }`;

export default function Bottle() {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { viewport, camera, size } = useThree();
  const [label, setLabel] = useState<THREE.Texture | null>(null);

  const geo = useMemo(() => {
    const glassPts = [new THREE.Vector2(0.0001, 0), ...sliceProfile(0, CAP_START + 0.01)];
    const glass = new THREE.LatheGeometry(glassPts, 96);

    const labelPts = sliceProfile(LABEL_BOTTOM, LABEL_TOP, 0.012);
    const labelGeo = new THREE.LatheGeometry(labelPts, 128, -Math.PI, Math.PI * 2);
    // re-map V so the label art spans exactly LABEL_BOTTOM..LABEL_TOP
    const uv = labelGeo.attributes.uv as THREE.BufferAttribute;
    const pos = labelGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, (pos.getY(i) - LABEL_BOTTOM) / (LABEL_TOP - LABEL_BOTTOM));
    }
    uv.needsUpdate = true;

    // crown cap: lathe with crimped (fluted) skirt
    const capR = radiusAt(CAP_START) * 1.18;
    const capPts = [
      new THREE.Vector2(capR * 0.98, CAP_START - 0.004),
      new THREE.Vector2(capR, CAP_START + 0.01),
      new THREE.Vector2(capR * 1.01, 0.975),
      new THREE.Vector2(capR * 0.96, 0.993),
      new THREE.Vector2(capR * 0.8, 1.0),
      new THREE.Vector2(0.0001, 1.0),
    ];
    const cap = new THREE.LatheGeometry(capPts, 147);
    const cp = cap.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < cp.count; i++) {
      const x = cp.getX(i), z = cp.getZ(i), y = cp.getY(i);
      const a = Math.atan2(x, z);
      const skirt = 1 - THREE.MathUtils.smoothstep(y, 0.97, 0.995);
      const k = 1 + Math.cos(a * 21) * 0.035 * skirt;
      cp.setX(i, x * k);
      cp.setZ(i, z * k);
    }
    cap.computeVertexNormals();

    // label measurements → canvas aspect (height / circumference)
    const rMid = radiusAt((LABEL_BOTTOM + LABEL_TOP) / 2);
    const labelAspect = (LABEL_TOP - LABEL_BOTTOM) / (2 * Math.PI * rMid);
    return { glass, labelGeo, cap, labelAspect };
  }, []);

  const maps = useMemo(() => makeCondensationMaps(1024), []);

  useEffect(() => {
    let alive = true;
    makeLabelTexture(geo.labelAspect).then((t) => alive && setLabel(t));
    return () => {
      alive = false;
    };
  }, [geo.labelAspect]);

  const glassMat = useMemo(() => {
    const n = maps.normal.clone();
    n.repeat.set(4, 4);
    n.needsUpdate = true;
    const r = maps.rough.clone();
    r.repeat.set(4, 4);
    r.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1b0c06'),
      roughness: 0.28,
      roughnessMap: r,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      normalMap: n,
      normalScale: new THREE.Vector2(0.28, 0.28),
      clearcoatNormalMap: n,
      clearcoatNormalScale: new THREE.Vector2(0.45, 0.45),
      envMapIntensity: 1.6,
      sheen: 0.4,
      sheenColor: new THREE.Color('#7a3a12'),
      sheenRoughness: 0.5,
    });
  }, [maps]);

  const labelMat = useMemo(() => {
    const n = maps.normal.clone();
    n.repeat.set(4, 1.4);
    n.needsUpdate = true;
    return new THREE.MeshPhysicalMaterial({
      roughness: 0.42,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      clearcoatNormalMap: n,
      clearcoatNormalScale: new THREE.Vector2(0.7, 0.7),
      envMapIntensity: 0.9,
      color: '#ffffff',
    });
  }, [maps]);

  useEffect(() => {
    if (label) {
      labelMat.map = label;
      labelMat.needsUpdate = true;
    }
  }, [label, labelMat]);

  const capMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7b4421',
        metalness: 0.75,
        roughness: 0.32,
        envMapIntensity: 1.2,
      }),
    [],
  );

  const rimMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: rimVertex,
        fragmentShader: rimFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color('#ff8a2a') },
          uStrength: { value: 1.1 },
          uLabelBottom: { value: LABEL_BOTTOM },
          uLabelTop: { value: LABEL_TOP },
        },
      }),
    [],
  );

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const visible = rig.bottleOpacity > 0.002;
    g.visible = visible;
    if (!visible) return;
    applyPose(g, rig.bottle, viewport.getCurrentViewport(camera, [0, 0, 0], size), 1);
    // centre the bottle on its own mid-height so rotations pivot naturally
    if (spin.current) {
      spin.current.position.y = -0.5;
      const reduce = state.scene.userData.reducedMotion as boolean;
      g.position.y += reduce ? 0 : Math.sin(state.clock.elapsedTime * 1.1) * 0.012 * rig.bottle.scale;
    }
    rimMat.uniforms.uStrength.value = 0.9 + rig.mood * 0.8;
  });

  return (
    <group ref={group} visible={false}>
      <group ref={spin}>
        <mesh geometry={geo.glass} material={glassMat} castShadow />
        <mesh geometry={geo.glass} material={rimMat} scale={[1.004, 1, 1.004]} renderOrder={2} />
        <mesh geometry={geo.labelGeo} material={labelMat} />
        <mesh geometry={geo.cap} material={capMat} />
      </group>
    </group>
  );
}
