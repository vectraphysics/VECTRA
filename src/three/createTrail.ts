import * as THREE from 'three';

export interface TrailObjects {
  mesh: THREE.Line;
  positions: Float32Array;
  indices: Uint32Array;
  geometry: THREE.BufferGeometry;
  count: number;
  head: number;
  filled: number;
}

/**
 * Create a thin orbital trail using a dynamic Line with a fixed-size buffer.
 * Points are written in a ring buffer pattern to avoid reallocation.
 */
export function createTrail(maxPoints = 2000): TrailObjects {
  const positions = new Float32Array(maxPoints * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const indices = new Uint32Array(maxPoints);
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setDrawRange(0, 0);

  const material = new THREE.LineBasicMaterial({
    color: 0xa8d5e8,
    transparent: true,
    opacity: 0.55,
    linewidth: 1,
    depthWrite: false,
  });

  const mesh = new THREE.Line(geometry, material);
  mesh.frustumCulled = false;

  return {
    mesh,
    positions,
    indices,
    geometry,
    count: maxPoints,
    head: 0,
    filled: 0,
  };
}

/**
 * Add a point to the trail ring buffer.
 */
export function addTrailPoint(trail: TrailObjects, x: number, y: number, z: number): void {
  const idx = trail.head * 3;
  trail.positions[idx] = x;
  trail.positions[idx + 1] = y;
  trail.positions[idx + 2] = z;

  trail.head = (trail.head + 1) % trail.count;
  trail.filled = Math.min(trail.filled + 1, trail.count);

  // Index the points from oldest to newest. Once the ring buffer wraps,
  // this prevents a false straight chord between the newest and oldest points.
  const start = trail.filled === trail.count ? trail.head : 0;
  for (let i = 0; i < trail.filled; i++) {
    trail.indices[i] = (start + i) % trail.count;
  }

  trail.geometry.setDrawRange(0, trail.filled);
  trail.geometry.attributes.position.needsUpdate = true;
  const indexAttribute = trail.geometry.index;
  if (indexAttribute) indexAttribute.needsUpdate = true;
}

/**
 * Clear all trail points.
 */
export function clearTrail(trail: TrailObjects): void {
  trail.head = 0;
  trail.filled = 0;
  trail.geometry.setDrawRange(0, 0);
  trail.geometry.attributes.position.needsUpdate = true;
}

/**
 * Update the maximum number of trail points.
 * This recreates the buffer with a new size.
 */
export function resizeTrail(trail: TrailObjects, newMax: number): void {
  trail.count = newMax;
  trail.positions = new Float32Array(newMax * 3);
  trail.indices = new Uint32Array(newMax);
  trail.geometry.setAttribute('position', new THREE.BufferAttribute(trail.positions, 3));
  trail.geometry.setIndex(new THREE.BufferAttribute(trail.indices, 1));
  clearTrail(trail);
}
