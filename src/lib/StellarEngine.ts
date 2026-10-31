import * as THREE from 'three';
import {
  type StellarStage,
  getStagesForMass,
} from '@/lib/stellarEvolution';
import { createStarfield } from '@/three/createStarfield';

export interface StellarCallbacks {
  onStageChange: (stageIndex: number, stage: StellarStage) => void;
}

interface CameraSpherical {
  radius: number;
  theta: number;
  phi: number;
}

const NEBULA_COLOR = 0x4a6a8a;
const ACCRETION_COLOR = 0xff8844;

/**
 * Three.js engine for the stellar life cycle visualization.
 *
 * Renders a central star/nebula/remnant that transforms through evolutionary
 * stages. Each stage has its own visual character — nebula gas, glowing
 * protostar, stable main-sequence star, expanded giant, supernova flash,
 * compact remnant, or black hole with accretion disk.
 *
 * Transitions between stages interpolate the star's radius, color, and
 * emissive intensity smoothly over a transition duration.
 */
export class StellarEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;
  private callbacks: StellarCallbacks;

  private mass = 1.0;
  private stages: StellarStage[] = [];
  private currentStageIndex = 0;
  private isPlaying = false;
  private speedMultiplier = 1;
  private stageTimer = 0;
  private stageDuration = 4; // seconds per stage at 1x speed
  private transitionProgress = 1; // 0 = start of transition, 1 = complete
  private transitionSpeed = 0.8;
  private transitionStartRadius = 2.5;
  private transitionStartColor = new THREE.Color(0xfff5e0);
  private transitionStartEmissive = new THREE.Color(0xffddaa);
  private transitionStartGlow = 1;
  private transitionStartNebulaOpacity = 0;
  private transitionStartSupernovaOpacity = 0;
  private transitionStartAccretionOpacity = 0;

  // 3D objects
  private starfield: THREE.Points;
  private starMesh: THREE.Mesh;
  private starMaterial: THREE.MeshStandardMaterial;
  private starGlow: THREE.Sprite;
  private starGlowMaterial: THREE.SpriteMaterial;
  private nebulaPoints: THREE.Points;
  private nebulaMaterial: THREE.PointsMaterial;
  private supernovaShell: THREE.Mesh;
  private supernovaMaterial: THREE.MeshBasicMaterial;
  private accretionDisk: THREE.Mesh;
  private accretionMaterial: THREE.MeshBasicMaterial;
  private pulsarBeams: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private pointLight: THREE.PointLight;

  // Current visual state (interpolated)
  private currentRadius = 2.5;
  private currentColor = new THREE.Color(0xfff5e0);
  private currentEmissive = new THREE.Color(0xffddaa);
  private currentGlowIntensity = 1.0;

  // Target visual state (from stage data)
  private targetRadius = 2.5;
  private targetColor = new THREE.Color(0xfff5e0);
  private targetEmissive = new THREE.Color(0xffddaa);
  private targetGlowIntensity = 1.0;
  private targetNebulaOpacity = 0;
  private currentNebulaOpacity = 0;
  private targetSupernovaOpacity = 0;
  private currentSupernovaOpacity = 0;
  private targetAccretionOpacity = 0;
  private currentAccretionOpacity = 0;

  // Camera
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private camSpherical: CameraSpherical = { radius: 40, theta: Math.PI / 4, phi: Math.PI / 3 };
  private camDamping = 0.12;
  private currentCamPos = new THREE.Vector3();
  private currentCamTarget = new THREE.Vector3();

  // Pointer
  private isPointerDown = false;
  private isPanning = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pinchDistance = 0;

  // Animation
  private animationId = 0;
  private resizeObserver: ResizeObserver;
  private reducedMotion = false;
  private clock = new THREE.Clock();

  constructor(container: HTMLElement, mass: number, callbacks: StellarCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.mass = mass;
    this.stages = getStagesForMass(mass);

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
    this.scene.fog = new THREE.FogExp2(0x04060d, 0.003);

    // Camera
    this.camera = new THREE.PerspectiveCamera(55, initW / initH, 0.1, 2000);
    this.updateCameraSpherical();
    this.currentCamPos.copy(this.camera.position);
    this.currentCamTarget.copy(this.cameraTarget);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x334466, 0.3);
    this.scene.add(this.ambientLight);
    this.pointLight = new THREE.PointLight(0xffffff, 2, 200, 1.5);
    this.pointLight.position.set(0, 0, 0);
    this.scene.add(this.pointLight);

    // Starfield
    this.starfield = createStarfield(1400, 400);
    this.scene.add(this.starfield);

    // Star mesh
    const starGeom = new THREE.SphereGeometry(1, 48, 48);
    this.starMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff5e0,
      emissive: 0xffddaa,
      emissiveIntensity: 1.0,
      roughness: 0.4,
      metalness: 0.0,
    });
    this.starMesh = new THREE.Mesh(starGeom, this.starMaterial);
    this.starMesh.scale.setScalar(this.currentRadius);
    this.scene.add(this.starMesh);

    // Star glow sprite
    const glowTexture = this.createGlowTexture();
    this.starGlowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xfff5e0,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.starGlow = new THREE.Sprite(this.starGlowMaterial);
    this.starGlow.scale.setScalar(this.currentRadius * 4);
    this.scene.add(this.starGlow);

    // Nebula particle system
    this.nebulaMaterial = new THREE.PointsMaterial({
      color: NEBULA_COLOR,
      size: 0.5,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const nebulaGeom = new THREE.BufferGeometry();
    const nebulaCount = 350;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      // Distribute in a roughly spherical cloud
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 6 + Math.random() * 6;
      nebulaPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      nebulaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      nebulaPos[i * 3 + 2] = r * Math.cos(phi);
    }
    nebulaGeom.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    this.nebulaPoints = new THREE.Points(nebulaGeom, this.nebulaMaterial);
    this.scene.add(this.nebulaPoints);

    // Supernova expanding shell
    const shellGeom = new THREE.SphereGeometry(1, 32, 32);
    this.supernovaMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.supernovaShell = new THREE.Mesh(shellGeom, this.supernovaMaterial);
    this.supernovaShell.scale.setScalar(1);
    this.scene.add(this.supernovaShell);

    // Accretion disk (for black hole)
    const diskGeom = new THREE.RingGeometry(2, 8, 64);
    this.accretionMaterial = new THREE.MeshBasicMaterial({
      color: ACCRETION_COLOR,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.accretionDisk = new THREE.Mesh(diskGeom, this.accretionMaterial);
    this.accretionDisk.rotation.x = Math.PI / 2.5;
    this.scene.add(this.accretionDisk);

    // Pulsar radiation beams: a paired, tilted beam model for neutron-star stages.
    // These are schematic emission cones, not a literal rendering of the magnetic field.
    this.pulsarBeams = new THREE.Group();
    const beamGeometry = new THREE.ConeGeometry(1.15, 15, 24, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x78cfff,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const northBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    northBeam.position.y = 8;
    const southBeam = new THREE.Mesh(beamGeometry, beamMaterial);
    southBeam.position.y = -8;
    southBeam.rotation.z = Math.PI;
    this.pulsarBeams.add(northBeam, southBeam);
    this.pulsarBeams.rotation.z = 0.42;
    this.pulsarBeams.visible = false;
    this.scene.add(this.pulsarBeams);

    // Set initial stage
    this.applyStage(0, false);

    // Events
    this.bindEvents();

    // Resize
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // Start
    this.animate();
  }

  // ---- Glow texture ----

  private createGlowTexture(): THREE.Texture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // ---- Stage management ----

  private applyStage(index: number, animate = true): void {
    if (index < 0 || index >= this.stages.length) return;
    this.currentStageIndex = index;
    const stage = this.stages[index];

    this.targetRadius = stage.radius;
    this.targetColor = new THREE.Color(stage.color);
    this.targetEmissive = new THREE.Color(stage.emissive);
    this.targetGlowIntensity = stage.glowIntensity;

    // Stage-specific visual elements
    this.targetNebulaOpacity = stage.id === 'nebula' ? 0.7 : stage.id === 'protostar' ? 0.3 : 0;
    this.targetSupernovaOpacity = stage.id === 'supernova' ? 0.9 : 0;
    this.targetAccretionOpacity = stage.id === 'black-hole' ? 0.6 : 0;
    this.pulsarBeams.visible = stage.id === 'neutron-star';

    if (animate) {
      this.transitionStartRadius = this.currentRadius;
      this.transitionStartColor.copy(this.currentColor);
      this.transitionStartEmissive.copy(this.currentEmissive);
      this.transitionStartGlow = this.currentGlowIntensity;
      this.transitionStartNebulaOpacity = this.currentNebulaOpacity;
      this.transitionStartSupernovaOpacity = this.currentSupernovaOpacity;
      this.transitionStartAccretionOpacity = this.currentAccretionOpacity;
      this.transitionProgress = 0;
    } else {
      this.transitionProgress = 1;
      this.currentRadius = this.targetRadius;
      this.currentColor.copy(this.targetColor);
      this.currentEmissive.copy(this.targetEmissive);
      this.currentGlowIntensity = this.targetGlowIntensity;
      this.currentNebulaOpacity = this.targetNebulaOpacity;
      this.currentSupernovaOpacity = this.targetSupernovaOpacity;
      this.currentAccretionOpacity = this.targetAccretionOpacity;
      this.updateVisualState();
    }

    this.callbacks.onStageChange(index, stage);
  }

  private updateVisualState(): void {
    this.starMesh.scale.setScalar(this.currentRadius);
    this.starMaterial.color.copy(this.currentColor);
    this.starMaterial.emissive.copy(this.currentEmissive);
    this.starMaterial.emissiveIntensity = this.currentGlowIntensity;

    this.starGlow.scale.setScalar(this.currentRadius * 4 * Math.max(0.5, this.currentGlowIntensity));
    this.starGlowMaterial.color.copy(this.currentColor);
    this.starGlowMaterial.opacity = 0.4 * this.currentGlowIntensity;
    this.pulsarBeams.visible = this.stages[this.currentStageIndex]?.id === 'neutron-star';

    this.pointLight.color.copy(this.currentColor);
    this.pointLight.intensity = 2 * this.currentGlowIntensity;

    this.nebulaMaterial.opacity = this.currentNebulaOpacity;
    this.supernovaMaterial.opacity = this.currentSupernovaOpacity;
    this.accretionMaterial.opacity = this.currentAccretionOpacity;

    // For black hole, make the star mesh invisible (it's the event horizon)
    if (this.stages[this.currentStageIndex]?.id === 'black-hole') {
      this.starMesh.visible = false;
      this.starGlow.visible = false;
    } else {
      this.starMesh.visible = true;
      this.starGlow.visible = true;
    }
  }

  private updateTransition(dt: number): void {
    if (this.transitionProgress >= 1) return;
    this.transitionProgress = Math.min(1, this.transitionProgress + dt * this.transitionSpeed);
    const t = this.easeInOutCubic(this.transitionProgress);

    this.currentRadius = THREE.MathUtils.lerp(this.transitionStartRadius, this.targetRadius, t);
    this.currentColor.copy(this.transitionStartColor).lerp(this.targetColor, t);
    this.currentEmissive.copy(this.transitionStartEmissive).lerp(this.targetEmissive, t);
    this.currentGlowIntensity = THREE.MathUtils.lerp(this.transitionStartGlow, this.targetGlowIntensity, t);
    this.currentNebulaOpacity = THREE.MathUtils.lerp(this.transitionStartNebulaOpacity, this.targetNebulaOpacity, t);
    this.currentSupernovaOpacity = THREE.MathUtils.lerp(this.transitionStartSupernovaOpacity, this.targetSupernovaOpacity, t);
    this.currentAccretionOpacity = THREE.MathUtils.lerp(this.transitionStartAccretionOpacity, this.targetAccretionOpacity, t);
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
    this.camSpherical = { radius: 40, theta: Math.PI / 4, phi: Math.PI / 3 };
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
    this.isPointerDown = true;
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
      const panSpeed = this.camSpherical.radius * 0.0015;
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();
      this.camera.matrix.extractBasis(right, up, new THREE.Vector3());
      this.cameraTarget.addScaledVector(right, -dx * panSpeed);
      this.cameraTarget.addScaledVector(up, dy * panSpeed);
    } else {
      this.camSpherical.theta -= dx * 0.008;
      this.camSpherical.phi -= dy * 0.008;
      this.camSpherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this.camSpherical.phi));
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.isPointerDown = false;
    this.isPanning = false;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.89;
    this.camSpherical.radius = Math.max(10, Math.min(200, this.camSpherical.radius * factor));
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
        this.camSpherical.radius = Math.max(10, Math.min(200, this.camSpherical.radius * factor));
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

  // ---- Animation loop ----

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());

    // Stage auto-advancement
    if (this.isPlaying && this.transitionProgress >= 1) {
      this.stageTimer += dt * this.speedMultiplier;
      if (this.stageTimer >= this.stageDuration) {
        this.stageTimer = 0;
        if (this.currentStageIndex < this.stages.length - 1) {
          this.applyStage(this.currentStageIndex + 1);
        } else {
          this.isPlaying = false;
        }
      }
    }

    // Update transition
    this.updateTransition(dt);
    this.updateVisualState();

    // Supernova shell expansion
    if (this.currentSupernovaOpacity > 0.01) {
      const expandScale = 1 + (this.stageTimer / this.stageDuration) * 3;
      this.supernovaShell.scale.setScalar(expandScale * this.currentRadius);
    }

    // Nebula slow rotation
    if (this.currentNebulaOpacity > 0.01) {
      this.nebulaPoints.rotation.y += dt * 0.05;
    }

    // Accretion disk rotation
    if (this.currentAccretionOpacity > 0.01) {
      this.accretionDisk.rotation.z += dt * 0.5;
    }

    if (this.pulsarBeams.visible && !this.reducedMotion) {
      this.pulsarBeams.rotation.y += dt * 1.8;
    }

    // Star slow rotation
    if (this.starMesh.visible) {
      this.starMesh.rotation.y += dt * 0.1;
    }

    // Camera
    this.smoothCamera();

    // Starfield parallax
    if (!this.reducedMotion) {
      this.starfield.rotation.y += 0.00003;
    }

    this.renderer.render(this.scene, this.camera);
  };

  // ---- Public API ----

  play(): void {
    if (this.currentStageIndex >= this.stages.length - 1) {
      this.applyStage(0);
    }
    this.isPlaying = true;
    this.stageTimer = 0;
  }

  pause(): void { this.isPlaying = false; }

  reset(): void {
    this.isPlaying = false;
    this.stageTimer = 0;
    this.applyStage(0);
  }

  setSpeed(s: number): void { this.speedMultiplier = s; }

  setMass(m: number): void {
    this.mass = m;
    this.stages = getStagesForMass(m);
    this.isPlaying = false;
    this.stageTimer = 0;
    this.applyStage(0);
  }

  goToStage(index: number): void {
    if (index < 0 || index >= this.stages.length) return;
    this.isPlaying = false;
    this.stageTimer = 0;
    this.applyStage(index);
  }

  nextStage(): void {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.goToStage(this.currentStageIndex + 1);
    }
  }

  prevStage(): void {
    if (this.currentStageIndex > 0) {
      this.goToStage(this.currentStageIndex - 1);
    }
  }

  getStages(): StellarStage[] { return this.stages; }
  getCurrentStageIndex(): number { return this.currentStageIndex; }
  getMass(): number { return this.mass; }

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
      if (obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        (obj.material as THREE.Material)?.dispose();
      }
      if (obj instanceof THREE.Sprite) {
        (obj.material as THREE.Material)?.dispose();
      }
    });

    // The beam geometry/material are included in scene traversal and disposed above.
    this.starGlowMaterial.map?.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
