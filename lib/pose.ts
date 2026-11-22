import type * as THREE from 'three';
import type { Pose } from './rig';

/**
 * Applies a viewport-relative pose to an object.
 * x/y: -1..1 across the visible viewport at z=0.
 * scale: the object's on-screen height as a fraction of viewport height
 *        (objectHeight = model height in its own units).
 * On narrow portrait screens the scale basis is reduced so wide objects
 * (the harp) never overflow the sides.
 */
export function applyPose(
  obj: THREE.Object3D,
  p: Pose,
  vp: { width: number; height: number },
  objectHeight: number,
) {
  const basis = Math.min(vp.height, vp.width * 1.55);
  obj.position.set((p.x * vp.width) / 2, (p.y * vp.height) / 2, p.z);
  obj.rotation.set(p.rx, p.ry, p.rz);
  obj.scale.setScalar((p.scale * basis) / objectHeight);
}
