import * as THREE from 'three';
import {
  type MagnetParameters,
  type ProbeData,
  DEFAULT_MAGNET_PARAMS,
  dipoleField,
  traceFieldLine,
  generateSeedPoints,
  computeProbeData,
} from '@/lib/magneticFieldPhysics';
import { createStarfield } from '@/three/createStarfield';

export interface MagneticFieldCallbacks {
  onProbeUpdate: (data: ProbeData) => void;
}

export type VizMode = 'lines' | 'vectors' | 'map';

interface FieldLine {
  line: THREE.Line;
  directionMarkers: THREE.LineSegments | null;
}

interface CameraSpherical {
  radius: number;
  theta: number;
  phi: number;
}

const NORTH_COLOR = 0xe85d5d;
const SOUTH_COLOR = 0x5e8ae8;
const FIELD_LINE_COLOR = 0x5ec8d8;
const PROBE_COLOR = 0xe8c87a;

export class MagneticFieldEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private callbacks: MagneticFieldCallbacks;

  private params: MagnetParameters;
  // 3D objects
  private starfield: THREE.Points;
  private magnetGroup: THREE.Group;
  private northPole!: THREE.Mesh;
  private southPole!: THREE.Mesh;
  private magnetBody!: THREE.Mesh;
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.PointLight;

  // Field visualization
  private fieldLinesGroup: THREE.Group;
  private fieldLines: FieldLine[] = [];
  private vectorsGroup: THREE.Group;
  private fieldMapMesh: THREE.Mesh | null = null;
  private fieldMapGroup: THREE.Group;

  // Probe
  private probeGroup: THREE.Group;
  private probeNeedle!: THREE.Mesh;
  private probeRing!: THREE.Mesh;
  private probePosition: THREE.Vector3;

  // Viz modes
  private vizMode: VizMode = 'lines';
  private showFieldDirection = true;
  private showFieldStrength = false;

  // Camera
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private camSpherical: CameraSpherical = { radius: 30, theta: Math.PI / 4, phi: Math.PI / 3 };
  private camDamping = 0.12;
  private currentCamPos = new THREE.Vector3();
  private currentCamTarget = new THREE.Vector3();

  // Pointer interaction
  private isPointerDown = false;
  private isPanning = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pinchDistance = 0;
  private isDraggingProbe = false;

  // Animation
  private animationId = 0;
  private resizeObserver: ResizeObserver;
  private reducedMotion = false;
  private lastProbeSignature = '';

  constructor(container: HTMLElement, params: MagnetParameters, callbacks: MagneticFieldCallbacks) {
    this.container = container;
    this.params = { ...params };
    this.callbacks = callbacks;
    this.probePosition = new THREE.Vector3(8, 0, 0);

    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const initW = container.clientWidth || container.parentElement?.clientWidth || window.innerWidth;
    const initH = container.clientHeight || container.parentElement?.clientHeight || 400;
    this.renderer.setSize(initW, initH);
    this.renderer.setClearColor(0x04060d, 1);
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04060d, 0.004);

    // Camera
    this.camera = new THREE.PerspectiveCamera(55, initW / initH, 0.1, 2000);
    this.updateCameraSpherical();
    this.currentCamPos.copy(this.camera.position);
    this.currentCamTarget.copy(this.cameraTarget);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x3a4a6a, 0.6);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xa8d5e8, 0.8);
    this.keyLight.position.set(10, 15, 10);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0x5ec8d8, 1.5, 100, 1.5);
    this.fillLight.position.set(-8, -5, -8);
    this.scene.add(this.fillLight);

    // Starfield
    this.starfield = createStarfield(900, 400);
    this.scene.add(this.starfield);

    // Magnet
    this.magnetGroup = new THREE.Group();
    this.createMagnet();
    this.scene.add(this.magnetGroup);

    // Field visualization groups
    this.fieldLinesGroup = new THREE.Group();
    this.scene.add(this.fieldLinesGroup);
    this.vectorsGroup = new THREE.Group();
    this.vectorsGroup.visible = false;
    this.scene.add(this.vectorsGroup);
    this.fieldMapGroup = new THREE.Group();
    this.fieldMapGroup.visible = false;
    this.scene.add(this.fieldMapGroup);

    // Probe
    this.probeGroup = new THREE.Group();
    this.createProbe();
    this.scene.add(this.probeGroup);

    // Generate initial field lines
    this.rebuildFieldLines();
    this.rebuildVectors();
    this.rebuildFieldMap();

    // Events
    this.bindEvents();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // Start
    this.animate();
  }

  // ---- Magnet geometry ----

  private createMagnet(): void {
    const halfLen = 2.0;
    const radius = 0.7;

    // Body (middle section — dark metallic)
    const bodyGeom = new THREE.CylinderGeometry(radius, radius, halfLen * 0.4, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2a3450,
      metalness: 0.8,
      roughness: 0.3,
    });
    this.magnetBody = new THREE.Mesh(bodyGeom, bodyMat);
    this.magnetBody.rotation.x = Math.PI / 2;
    this.magnetGroup.add(this.magnetBody);

    // North pole (red)
    const poleGeom = new THREE.CylinderGeometry(radius, radius, halfLen * 0.8, 32);
    const northMat = new THREE.MeshStandardMaterial({
      color: NORTH_COLOR,
      metalness: 0.6,
      roughness: 0.35,
      emissive: NORTH_COLOR,
      emissiveIntensity: 0.15,
    });
    this.northPole = new THREE.Mesh(poleGeom, northMat);
    this.northPole.rotation.x = Math.PI / 2;
    this.northPole.position.z = halfLen * 0.7;
    this.magnetGroup.add(this.northPole);

    // South pole (blue)
    const southMat = new THREE.MeshStandardMaterial({
      color: SOUTH_COLOR,
      metalness: 0.6,
      roughness: 0.35,
      emissive: SOUTH_COLOR,
      emissiveIntensity: 0.15,
    });
    this.southPole = new THREE.Mesh(poleGeom.clone(), southMat);
    this.southPole.rotation.x = Math.PI / 2;
    this.southPole.position.z = -halfLen * 0.7;
    this.magnetGroup.add(this.southPole);

    // N/S labels using small spheres as pole indicators
    const nIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    nIndicator.position.z = halfLen * 1.1;
    this.magnetGroup.add(nIndicator);

    const sIndicator = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x666666 })
    );
    sIndicator.position.z = -halfLen * 1.1;
    this.magnetGroup.add(sIndicator);
  }

  // ---- Probe ----

  private createProbe(): void {
    // Ring marker
    const ringGeom = new THREE.TorusGeometry(0.6, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: PROBE_COLOR, transparent: true, opacity: 0.5 });
    this.probeRing = new THREE.Mesh(ringGeom, ringMat);
    this.probeGroup.add(this.probeRing);

    // Needle (arrow shape)
    const needleGeom = new THREE.ConeGeometry(0.15, 1.2, 16);
    const needleMat = new THREE.MeshStandardMaterial({
      color: PROBE_COLOR,
      emissive: PROBE_COLOR,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.3,
    });
    this.probeNeedle = new THREE.Mesh(needleGeom, needleMat);
    this.probeGroup.add(this.probeNeedle);

    // Small sphere at probe center
    const centerGeom = new THREE.SphereGeometry(0.2, 16, 16);
    const centerMat = new THREE.MeshBasicMaterial({ color: PROBE_COLOR });
    const center = new THREE.Mesh(centerGeom, centerMat);
    this.probeGroup.add(center);

    this.probeGroup.position.copy(this.probePosition);
  }

  // ---- Field lines ----

  private rebuildFieldLines(): void {
    // Release old GPU buffers before replacing the field paths.
    for (const fieldLine of this.fieldLines) {
      fieldLine.line.geometry.dispose();
      (fieldLine.line.material as THREE.Material).dispose();
      if (fieldLine.directionMarkers) {
        fieldLine.directionMarkers.geometry.dispose();
        (fieldLine.directionMarkers.material as THREE.Material).dispose();
      }
    }
    this.fieldLines = [];
    while (this.fieldLinesGroup.children.length > 0) {
      this.fieldLinesGroup.remove(this.fieldLinesGroup.children[0]);
    }

    const seeds = generateSeedPoints(this.params.lineDensity, this.params.orientation);
    const scale = this.params.vizScale;
    const weakColor = new THREE.Color(0x4d8792);
    const strongColor = new THREE.Color(0xe8c87a);
    const referenceMagnitude = Math.max(this.params.strength / Math.pow(2.5, 3), 1e-9);

    for (const seed of seeds) {
      const scaledSeed = seed.clone().multiplyScalar(scale);
      const forward = traceFieldLine(
        scaledSeed, this.params.strength, this.params.orientation, 500, 0.5 * scale
      );
      if (forward.length < 2) continue;

      // Keep the visible exterior path ordered from north toward south.
      const inner = traceFieldLine(
        scaledSeed, this.params.strength, this.params.orientation, 250, -0.5 * scale
      );
      const points = [...inner.reverse(), ...forward];
      if (points.length < 2) continue;

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const colors = new Float32Array(points.length * 3);
      points.forEach((point, index) => {
        const magnitude = dipoleField(point, this.params.strength, this.params.orientation).length();
        const strengthRatio = THREE.MathUtils.clamp(
          Math.pow(magnitude / referenceMagnitude, 0.4), 0, 1
        );
        const color = weakColor.clone().lerp(strongColor, strengthRatio);
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
      });
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.LineBasicMaterial({
        color: this.showFieldStrength ? 0xffffff : FIELD_LINE_COLOR,
        vertexColors: this.showFieldStrength,
        transparent: true,
        opacity: this.showFieldStrength ? 0.9 : 0.72,
        linewidth: 1,
      });
      const line = new THREE.Line(geometry, material);
      this.fieldLinesGroup.add(line);

      const directionMarkers = this.showFieldDirection
        ? this.createDirectionMarkers(points, scale)
        : null;
      if (directionMarkers) this.fieldLinesGroup.add(directionMarkers);
      this.fieldLines.push({ line, directionMarkers });
    }
  }

  /**
   * Static chevrons sit tangent to the field path. Their tips point along B,
   * replacing the old animated spheres with a precise direction cue.
   */
  private createDirectionMarkers(
    points: THREE.Vector3[],
    scale: number
  ): THREE.LineSegments | null {
    if (points.length < 8) return null;

    const vertices: number[] = [];
    const fractions = [0.34, 0.58, 0.82];
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3(1, 0, 0);

    for (const fraction of fractions) {
      const index = Math.max(1, Math.min(
        points.length - 2, Math.round(fraction * (points.length - 1))
      ));
      const tip = points[index];
      const tangent = points[index + 1].clone().sub(points[index - 1]).normalize();
      if (tangent.lengthSq() < 1e-8) continue;

      const reference = Math.abs(tangent.dot(up)) > 0.92 ? right : up;
      const side = new THREE.Vector3().crossVectors(tangent, reference).normalize();
      const base = tip.clone().addScaledVector(tangent, -0.52 * scale);
      const halfWidth = 0.22 * scale;
      const left = base.clone().addScaledVector(side, halfWidth);
      const rightPoint = base.clone().addScaledVector(side, -halfWidth);

      vertices.push(
        tip.x, tip.y, tip.z, left.x, left.y, left.z,
        tip.x, tip.y, tip.z, rightPoint.x, rightPoint.y, rightPoint.z
      );
    }

    if (vertices.length === 0) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0xe8c87a,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    return new THREE.LineSegments(geometry, material);
  }

  // ---- Field vectors ----

  private rebuildVectors(): void {
    while (this.vectorsGroup.children.length > 0) {
      const child = this.vectorsGroup.children[0];
      if (child instanceof THREE.ArrowHelper) {
        child.dispose();
      }
      this.vectorsGroup.remove(child);
    }

    const scale = this.params.vizScale;
    const grid = 5;
    const spacing = 4 * scale;

    for (let i = -grid; i <= grid; i++) {
      for (let j = -grid; j <= grid; j++) {
        for (let k = -grid; k <= grid; k++) {
          const x = i * spacing;
          const y = j * spacing;
          const z = k * spacing;
          const pos = new THREE.Vector3(x, y, z);
          const dist = pos.length();
          if (dist < 3 * scale || dist > 30 * scale) continue;

          const field = dipoleField(pos, this.params.strength, this.params.orientation);
          const mag = field.length();
          if (mag < 1e-8) continue;

          const dir = field.normalize();
          // Arrow length proportional to field strength (clamped)
          const len = Math.min(mag * 0.5, 2.5);
          if (len < 0.15) continue;

          const color = new THREE.Color(0x5ec8d8);
          const opacity = Math.min(0.7, 0.15 + mag * 0.02);
          const arrow = new THREE.ArrowHelper(dir, pos, len, color, len * 0.3, len * 0.15);
          (arrow.line.material as THREE.LineBasicMaterial).transparent = true;
          (arrow.line.material as THREE.LineBasicMaterial).opacity = opacity;
          this.vectorsGroup.add(arrow);
        }
      }
    }
  }

  // ---- Field map ----

  private rebuildFieldMap(): void {
    if (this.fieldMapMesh) {
      this.fieldMapMesh.geometry.dispose();
      (this.fieldMapMesh.material as THREE.Material).dispose();
      this.fieldMapGroup.remove(this.fieldMapMesh);
      this.fieldMapMesh = null;
    }

    // Create a plane in the XZ plane showing field strength as color intensity
    const size = 40 * this.params.vizScale;
    const segments = 80;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const pos = new THREE.Vector3(x, 0, z);
      const field = dipoleField(pos, this.params.strength, this.params.orientation);
      const mag = field.length();
      const referenceMagnitude = Math.max(this.params.strength / 27, 1e-9);
      const intensity = THREE.MathUtils.clamp(
        Math.pow(mag / referenceMagnitude, 0.5), 0, 1
      );

      // Keep field-map contrast comparable as dipole moment changes.
      colors[i * 3] = 0.025 + intensity * 0.42;
      colors[i * 3 + 1] = 0.045 + intensity * 0.34;
      colors[i * 3 + 2] = 0.055 + intensity * 0.18;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.fieldMapMesh = new THREE.Mesh(geometry, material);
    this.fieldMapGroup.add(this.fieldMapMesh);
  }

  // ---- Camera ----

  private updateCameraSpherical(): void {
    const { radius, theta, phi } = this.camSpherical;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    this.camera.position.set(x + this.cameraTarget.x, y + this.cameraTarget.y, z + this.cameraTarget.z);
    this.camera.lookAt(this.cameraTarget);
  }

  private smoothCamera(): void {
    const { radius, theta, phi } = this.camSpherical;
    const desiredPos = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ).add(this.cameraTarget);

    this.currentCamPos.lerp(desiredPos, this.camDamping);
    this.currentCamTarget.lerp(this.cameraTarget, this.camDamping);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamTarget);
  }

  resetCamera(): void {
    this.camSpherical = { radius: 30, theta: Math.PI / 4, phi: Math.PI / 3 };
    this.cameraTarget.set(0, 0, 0);
  }

  // ---- Event handling ----

  private bindEvents(): void {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('pointercancel', this.onPointerUp);
    el.addEventListener('pointerleave', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('touchstart', this.onTouchStart, { passive: false });
    el.addEventListener('touchmove', this.onTouchMove, { passive: false });
    el.addEventListener('touchend', this.onTouchEnd);
    el.addEventListener('contextmenu', this.onContextMenu);
  }

  private unbindEvents(): void {
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('pointercancel', this.onPointerUp);
    el.removeEventListener('pointerleave', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('touchstart', this.onTouchStart);
    el.removeEventListener('touchmove', this.onTouchMove);
    el.removeEventListener('touchend', this.onTouchEnd);
    el.removeEventListener('contextmenu', this.onContextMenu);
  }

  private onContextMenu = (e: Event) => e.preventDefault();

  private onPointerDown = (e: PointerEvent) => {
    // Check if clicking near probe — use raycasting
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    const hits = raycaster.intersectObjects([this.probeGroup], true);
    if (hits.length > 0) {
      this.isDraggingProbe = true;
      return;
    }

    this.isPointerDown = true;
    this.isPanning = e.button === 2 || e.shiftKey;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.isDraggingProbe) {
      // Move probe on the XZ plane based on mouse position
      const rect = this.renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);
      // Intersect with a horizontal plane at y=0
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);
      if (point) {
        const dist = point.length();
        // Keep probe outside the magnet
        if (dist > 3.5) {
          this.probePosition.copy(point);
        }
      }
      return;
    }

    if (!this.isPointerDown) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    if (this.isPanning) {
      const panSpeed = this.camSpherical.radius * 0.0015;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      this.camera.matrix.extractBasis(right, up, new THREE.Vector3());
      this.cameraTarget.addScaledVector(right, -dx * panSpeed);
      this.cameraTarget.addScaledVector(up, dy * panSpeed);
    } else {
      const rotSpeed = 0.008;
      this.camSpherical.theta -= dx * rotSpeed;
      this.camSpherical.phi -= dy * rotSpeed;
      this.camSpherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this.camSpherical.phi));
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isPointerDown = false;
    this.isPanning = false;
    this.isDraggingProbe = false;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    this.camSpherical.radius = Math.max(8, Math.min(150, this.camSpherical.radius * factor));
  };

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.pinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (this.pinchDistance > 0) {
        const factor = this.pinchDistance / dist;
        this.camSpherical.radius = Math.max(8, Math.min(150, this.camSpherical.radius * factor));
      }
      this.pinchDistance = dist;
    }
  };

  private onTouchEnd = () => { this.pinchDistance = 0; };

  // ---- Resize ----

  private handleResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---- Update probe ----

  private updateProbe(): void {
    this.probeGroup.position.copy(this.probePosition);

    // Orient needle along field direction
    const data = computeProbeData(this.probePosition, this.params.strength, this.params.orientation);
    if (data.magnitude > 1e-6) {
      const dir = data.field.clone().normalize();
      // Align cone (default points +Y) to field direction
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
      this.probeNeedle.quaternion.slerp(quat, 0.1);
    }

    // Rotate ring to face camera
    this.probeRing.lookAt(this.camera.position);

    const signature = [
      this.probePosition.x,
      this.probePosition.y,
      this.probePosition.z,
      this.params.strength,
      this.params.orientation,
    ].map((value) => value.toFixed(4)).join('|');

    // Avoid pushing identical probe values into React on every animation frame.
    if (signature !== this.lastProbeSignature) {
      this.lastProbeSignature = signature;
      this.callbacks.onProbeUpdate(data);
    }
  }

  // ---- Render loop ----

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // A fixed dipole has a static field. Only scene interaction needs rendering.
    this.magnetGroup.rotation.y = THREE.MathUtils.degToRad(this.params.orientation);
    this.updateProbe();
    this.smoothCamera();

    if (!this.reducedMotion) {
      this.starfield.rotation.y += 0.00003;
    }
    this.renderer.render(this.scene, this.camera);
  };

  // ---- Public API ----

  reset(): void {
    this.params = { ...DEFAULT_MAGNET_PARAMS };
    this.showFieldDirection = true;
    this.showFieldStrength = false;
    this.probePosition.set(8, 0, 0);
    this.lastProbeSignature = '';
    this.vizMode = 'lines';
    this.fieldLinesGroup.visible = true;
    this.vectorsGroup.visible = false;
    this.fieldMapGroup.visible = false;
    this.rebuildFieldLines();
    this.rebuildVectors();
    this.rebuildFieldMap();
  }

  setStrength(v: number): void {
    this.params.strength = v;
    this.rebuildFieldLines();
    this.rebuildVectors();
    this.rebuildFieldMap();
  }

  setOrientation(v: number): void {
    this.params.orientation = v;
    this.rebuildFieldLines();
    this.rebuildVectors();
    this.rebuildFieldMap();
  }

  setLineDensity(v: number): void {
    this.params.lineDensity = v;
    this.rebuildFieldLines();
  }

  setVizScale(v: number): void {
    this.params.vizScale = v;
    this.rebuildFieldLines();
    this.rebuildVectors();
    this.rebuildFieldMap();
  }

  setVizMode(mode: VizMode): void {
    this.vizMode = mode;
    this.fieldLinesGroup.visible = mode === 'lines';
    this.vectorsGroup.visible = mode === 'vectors';
    this.fieldMapGroup.visible = mode === 'map';
  }

  setShowFieldDirection(show: boolean): void {
    this.showFieldDirection = show;
    this.rebuildFieldLines();
  }

  setShowFieldStrength(show: boolean): void {
    this.showFieldStrength = show;
    this.rebuildFieldLines();
  }

  getProbePosition(): THREE.Vector3 {
    return this.probePosition.clone();
  }

  setProbePosition(pos: THREE.Vector3): void {
    this.probePosition.copy(pos);
  }

  // ---- Cleanup ----

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.unbindEvents();
    this.resizeObserver.disconnect();

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
      if (obj instanceof THREE.Line) {
        obj.geometry?.dispose();
        (obj.material as THREE.Material)?.dispose();
      }
      if (obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        (obj.material as THREE.Material)?.dispose();
      }
      if (obj instanceof THREE.ArrowHelper) {
        obj.dispose();
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
