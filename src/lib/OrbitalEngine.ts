import * as THREE from 'three';
import {
  type PhysicsState,
  type OrbitalData,
  type InitialConditions,
  rk4Step,
  computeOrbitalData,
} from '@/lib/orbitalPhysics';
import { createStarfield } from '@/three/createStarfield';
import { createCentralBody } from '@/three/createCentralBody';
import { createTestBody } from '@/three/createTestBody';
import { createTrail, addTrailPoint, clearTrail, resizeTrail, type TrailObjects } from '@/three/createTrail';
import { createVisualizations, orientPlane } from '@/three/createVisualizations';

const PHYS_DT = 0.008; // Fixed physics timestep
const MAX_SUBSTEPS = 20;
const TRAIL_INTERVAL = 2; // Add a trail point every N physics steps

export interface EngineCallbacks {
  onDataUpdate: (data: OrbitalData) => void;
  onCollision: () => void;
}

interface CameraSpherical {
  radius: number;
  theta: number; // azimuthal
  phi: number; // polar (0 = north pole, PI/2 = equator)
}

export class OrbitalEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  // Physics state
  private state: PhysicsState;
  private gm: number;
  private centralRadius: number;
  private simTime = 0;
  private isPlaying = false;
  private speedMultiplier = 1;
  private hasCollided = false;

  // Initial conditions for reset
  private initialConditions: InitialConditions;

  // Three.js objects
  private starfield: THREE.Points;
  private centralBody: ReturnType<typeof createCentralBody>;
  private testBody: ReturnType<typeof createTestBody>;
  private trail: TrailObjects;
  private viz: ReturnType<typeof createVisualizations>;
  private pointLight: THREE.PointLight;
  private ambientLight: THREE.AmbientLight;

  // Camera control state
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private camSpherical: CameraSpherical = { radius: 50, theta: Math.PI / 4, phi: Math.PI / 3 };
  private camDamping = 0.12;
  private currentCamPos = new THREE.Vector3();
  private currentCamTarget = new THREE.Vector3();

  // Pointer interaction
  private isPointerDown = false;
  private isPanning = false;
  private pointerButton = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchDistance = 0;

  // Trail
  private trailEnabled = true;
  private trailMaxPoints = 2000;
  private stepCounter = 0;

  // Visualization toggles
  private showGrid = false;
  private showAxes = false;
  private showPlane = false;
  private showVelocity = true;

  // Follow mode
  private followBody = false;
  private followDamping = 0.08;

  // Animation
  private animationId = 0;
  private resizeObserver: ResizeObserver;
  private reducedMotion = false;

  constructor(container: HTMLElement, initialConditions: InitialConditions, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.initialConditions = { ...initialConditions };
    this.state = {
      position: { ...initialConditions.position },
      velocity: { ...initialConditions.velocity },
    };
    this.gm = initialConditions.gm;
    this.centralRadius = 3;

    // Reduced motion check
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const initW = container.clientWidth || container.parentElement?.clientWidth || window.innerWidth;
    const initH = container.clientHeight || container.parentElement?.clientHeight || 400;
    this.renderer.setSize(initW, initH);
    this.renderer.setClearColor(0x04060d, 1);
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x04060d, 0.0015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      initW / initH,
      0.1,
      2000
    );
    this.updateCameraSpherical();
    this.currentCamPos.copy(this.camera.position);
    this.currentCamTarget.copy(this.cameraTarget);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x3a4a6a, 0.5);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0x5ec8d8, 2.5, 300, 1.5);
    this.pointLight.position.set(0, 0, 0);
    this.scene.add(this.pointLight);

    // Starfield
    this.starfield = createStarfield(3000, 800);
    this.scene.add(this.starfield);

    // Central body
    this.centralBody = createCentralBody(this.centralRadius);
    this.scene.add(this.centralBody.group);

    // Test body
    this.testBody = createTestBody(0.4);
    this.testBody.group.position.set(this.state.position.x, this.state.position.y, this.state.position.z);
    this.scene.add(this.testBody.group);

    // Trail
    this.trail = createTrail(this.trailMaxPoints);
    this.scene.add(this.trail.mesh);

    // Visualizations
    this.viz = createVisualizations();
    this.scene.add(this.viz.group);

    // Initial camera position
    this.updateCameraSpherical();

    // Event listeners
    this.bindEvents();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // Start render loop
    this.animate();
  }

  // ---- Camera ----

  private updateCameraSpherical(): void {
    const { radius, theta, phi } = this.camSpherical;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    this.camera.position.set(
      x + this.cameraTarget.x,
      y + this.cameraTarget.y,
      z + this.cameraTarget.z
    );
    this.camera.lookAt(this.cameraTarget);
  }

  private smoothCamera(): void {
    // Compute desired camera position from spherical coords + target
    const { radius, theta, phi } = this.camSpherical;
    const desiredPos = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ).add(this.cameraTarget);

    this.currentCamPos.lerp(desiredPos, this.camDamping);
    this.currentCamTarget.lerp(this.cameraTarget, this.followBody ? this.followDamping : this.camDamping);

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamTarget);
  }

  resetCamera(): void {
    this.camSpherical = { radius: 50, theta: Math.PI / 4, phi: Math.PI / 3 };
    this.cameraTarget.set(0, 0, 0);
    this.followBody = false;
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
    this.isPointerDown = true;
    this.pointerButton = e.button;
    this.isPanning = e.button === 2 || e.shiftKey;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    if (this.isPanning) {
      // Pan: move the target in the camera's local plane
      const panSpeed = this.camSpherical.radius * 0.0015;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      this.camera.matrix.extractBasis(right, up, new THREE.Vector3());
      this.cameraTarget.addScaledVector(right, -dx * panSpeed);
      this.cameraTarget.addScaledVector(up, dy * panSpeed);
    } else {
      // Rotate
      const rotSpeed = 0.008;
      this.camSpherical.theta -= dx * rotSpeed;
      this.camSpherical.phi -= dy * rotSpeed;
      // Clamp phi to avoid flipping
      this.camSpherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this.camSpherical.phi));
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isPointerDown = false;
    this.isPanning = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    this.camSpherical.radius = Math.max(5, Math.min(300, this.camSpherical.radius * factor));
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
        this.camSpherical.radius = Math.max(5, Math.min(300, this.camSpherical.radius * factor));
      }
      this.pinchDistance = dist;
    }
  };

  private onTouchEnd = () => {
    this.pinchDistance = 0;
  };

  // ---- Resize ----

  private handleResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  // ---- Physics stepping ----

  private stepPhysics(): void {
    if (this.hasCollided) return;

    const totalDt = PHYS_DT * this.speedMultiplier;
    const subSteps = Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil(this.speedMultiplier)));
    const subDt = totalDt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      // Safety: check distance before stepping
      const r = Math.sqrt(
        this.state.position.x ** 2 +
          this.state.position.y ** 2 +
          this.state.position.z ** 2
      );

      if (r <= this.centralRadius) {
        this.hasCollided = true;
        this.isPlaying = false;
        this.callbacks.onCollision();
        break;
      }

      // Safety: check for NaN/Infinity
      if (!isFinite(this.state.position.x) || !isFinite(this.state.velocity.x)) {
        this.hasCollided = true;
        this.isPlaying = false;
        this.callbacks.onCollision();
        break;
      }

      this.state = rk4Step(this.state, this.gm, subDt);
      this.simTime += subDt;

      // Add trail point at intervals
      this.stepCounter++;
      if (this.trailEnabled && this.stepCounter % TRAIL_INTERVAL === 0) {
        addTrailPoint(
          this.trail,
          this.state.position.x,
          this.state.position.y,
          this.state.position.z
        );
      }
    }

    // Update test body position
    this.testBody.group.position.set(
      this.state.position.x,
      this.state.position.y,
      this.state.position.z
    );

    // Update velocity vector
    if (this.showVelocity) {
      const vel = new THREE.Vector3(
        this.state.velocity.x,
        this.state.velocity.y,
        this.state.velocity.z
      );
      const speed = vel.length();
      if (speed > 1e-8) {
        const dir = vel.clone().normalize();
        const len = Math.min(speed * 0.3, 8);
        this.viz.velocityArrow.position.copy(this.testBody.group.position);
        this.viz.velocityArrow.setDirection(dir);
        this.viz.velocityArrow.setLength(len, len * 0.2, len * 0.12);
      }
    }
  }

  // ---- Animation loop ----

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.isPlaying && !this.hasCollided) {
      this.stepPhysics();
    }

    // Update visualizations
    if (this.showPlane) {
      const data = computeOrbitalData(this.state, this.gm, this.simTime, this.centralRadius);
      orientPlane(this.viz.plane, data.angularMomentum);
    }

    // Follow body
    if (this.followBody) {
      this.cameraTarget.lerp(this.testBody.group.position, this.followDamping);
    }

    // Smooth camera
    this.smoothCamera();

    // Slowly rotate starfield for subtle parallax
    if (!this.reducedMotion) {
      this.starfield.rotation.y += 0.00005;
    }

    // Emit data update
    const data = computeOrbitalData(this.state, this.gm, this.simTime, this.centralRadius);
    this.callbacks.onDataUpdate(data);

    this.renderer.render(this.scene, this.camera);
  };

  // ---- Public API ----

  play(): void {
    if (!this.hasCollided) {
      this.isPlaying = true;
    }
  }

  pause(): void {
    this.isPlaying = false;
  }

  reset(): void {
    this.state = {
      position: { ...this.initialConditions.position },
      velocity: { ...this.initialConditions.velocity },
    };
    this.gm = this.initialConditions.gm;
    this.simTime = 0;
    this.hasCollided = false;
    this.isPlaying = false;
    this.stepCounter = 0;
    clearTrail(this.trail);
    this.testBody.group.position.set(
      this.state.position.x,
      this.state.position.y,
      this.state.position.z
    );
  }

  setInitialConditions(ic: InitialConditions): void {
    this.initialConditions = { ...ic };
    this.gm = ic.gm;
    this.state = {
      position: { ...ic.position },
      velocity: { ...ic.velocity },
    };
    this.simTime = 0;
    this.hasCollided = false;
    this.isPlaying = false;
    this.stepCounter = 0;
    clearTrail(this.trail);
    this.testBody.group.position.set(
      this.state.position.x,
      this.state.position.y,
      this.state.position.z
    );
  }

  setSpeed(speed: number): void {
    this.speedMultiplier = speed;
  }

  setTrailEnabled(enabled: boolean): void {
    this.trailEnabled = enabled;
    this.trail.mesh.visible = enabled;
    if (!enabled) {
      clearTrail(this.trail);
    }
  }

  setTrailLength(maxPoints: number): void {
    this.trailMaxPoints = maxPoints;
    resizeTrail(this.trail, maxPoints);
  }

  setGridVisible(visible: boolean): void {
    this.showGrid = visible;
    this.viz.grid.visible = visible;
  }

  setAxesVisible(visible: boolean): void {
    this.showAxes = visible;
    this.viz.axes.visible = visible;
  }

  setPlaneVisible(visible: boolean): void {
    this.showPlane = visible;
    this.viz.plane.visible = visible;
  }

  setVelocityVisible(visible: boolean): void {
    this.showVelocity = visible;
    this.viz.velocityArrow.visible = visible;
  }

  setFollowBody(enabled: boolean): void {
    this.followBody = enabled;
  }

  getGm(): number {
    return this.gm;
  }

  // ---- Cleanup ----

  dispose(): void {
    cancelAnimationFrame(this.animationId);
    this.unbindEvents();
    this.resizeObserver.disconnect();

    // Dispose Three.js resources
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
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
