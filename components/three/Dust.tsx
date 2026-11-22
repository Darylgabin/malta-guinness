'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { rig } from '@/lib/rig';

/** Slow-drifting golden dust motes filling the stage. Density follows mood. */
const vert = /* glsl */ `
  attribute float aSeed;
  uniform float uTime; uniform float uScale; uniform vec2 uSpan;
  varying float vA;
  void main(){
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.05 + aSeed * 0.12) + uSpan.y, uSpan.y * 2.0) - uSpan.y;
    p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uScale * (0.4 + aSeed) / -mv.z;
    vA = 0.35 + 0.65 * abs(sin(uTime * (0.6 + aSeed) + aSeed * 30.0));
  }`;
const frag = /* glsl */ `
  uniform float uOpacity; uniform vec3 uColor;
  varying float vA;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vA * uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }`;

export default function Dust({ count = 420 }: { count?: number }) {
  const { size } = useThree();
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9, -6 + Math.random() * 9], i * 3);
      seed[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40);
    const m = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 40 },
        uSpan: { value: new THREE.Vector2(8, 4.5) },
        uOpacity: { value: 0.5 },
        uColor: { value: new THREE.Color('#ffc45e') },
      },
    });
    return { geo: g, mat: m };
  }, [count]);

  useFrame((state) => {
    const reduce = state.scene.userData.reducedMotion as boolean;
    mat.uniforms.uTime.value = reduce ? 0 : state.clock.elapsedTime;
    mat.uniforms.uScale.value = size.height * 0.045;
    // on cream backgrounds additive gold is faint → render subtler; at night it sings
    mat.uniforms.uOpacity.value = 0.35 + rig.mood * 0.65 + rig.core * 0.4;
    (mat.uniforms.uColor.value as THREE.Color).set(rig.mood > 0.5 ? '#ffc45e' : '#e0a038');
  });

  return <points geometry={geo} material={mat} frustumCulled={false} />;
}
