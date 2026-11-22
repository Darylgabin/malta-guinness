'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import Bottle from './Bottle';
import Harp from './Harp';
import Dust from './Dust';
import { rig } from '@/lib/rig';

/** Lights that respond to the scroll "mood" (cream daylight → night studio). */
function Lighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (spot.current) {
      spot.current.target.position.set(0, -1, 0);
      scene.add(spot.current.target);
    }
  }, [scene]);

  useFrame(() => {
    const m = rig.mood;
    if (key.current) key.current.intensity = 2.4 - m * 1.3;
    if (amb.current) amb.current.intensity = 0.55 - m * 0.4;
    if (rim.current) rim.current.intensity = 40 + m * 90;
    if (spot.current) spot.current.intensity = rig.spot * 260;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.55} color="#fff2dc" />
      <directionalLight ref={key} position={[-4, 5, 6]} intensity={2.4} color="#fff1d6" />
      <spotLight ref={rim} position={[5, 3, -4]} angle={0.6} penumbra={1} intensity={40} color="#ff9a3c" />
      <spotLight ref={spot} position={[0, 9, 3]} angle={0.32} penumbra={0.9} intensity={0} color="#ffe2b0" />
    </>
  );
}

function Flags({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene } = useThree();
  scene.userData.reducedMotion = reducedMotion;
  return null;
}

export default function Stage({ reducedMotion, lowPower }: { reducedMotion: boolean; lowPower: boolean }) {
  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-full"
      style={{ position: 'fixed', zIndex: 5, pointerEvents: 'none' }}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 10], fov: 30, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Flags reducedMotion={reducedMotion} />
      <Lighting />
      {/* Studio reflections built from light panels — no external HDR needed */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} color="#fff3dd" position={[-5, 2, 4]} scale={[3, 8, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#ffd59a" position={[5, 1, 3]} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ff9b3d" position={[0, -4, 2]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffe7bd" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={4} />
        <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, 0, -8]} scale={[12, 6, 1]} />
        {/* panels behind the camera: front-facing gold surfaces reflect these
            instead of the void (otherwise the harp goes black face-on) */}
        <Lightformer form="rect" intensity={2.2} color="#ffe2a8" position={[-1.5, 2.5, 9]} rotation-y={Math.PI} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ff9d3a" position={[2, -2.5, 9]} rotation-y={Math.PI} scale={[9, 2.2, 1]} />
      </Environment>
      <Dust count={lowPower ? 200 : 420} />
      <Harp variant="ghost" />
      <Harp />
      <Bottle />
    </Canvas>
  );
}
