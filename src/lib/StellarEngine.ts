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
  private transitionSpeed = 0.5;

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
  private protostellarJets: THREE.Group;
  private protostellarJetMaterial: THREE.MeshBasicMaterial;
  private planetaryNebulaPoints: THREE.Points;
  private planetaryNebulaMaterial: THREE.PointsMaterial;
  private planetaryNebulaShell: THREE.Mesh;
  private planetaryNebulaShellMaterial: THREE.MeshBasicMaterial;
  private planetaryEquatorialRing: THREE.Mesh;
  private planetaryEquatorialRingMaterial: THREE.MeshBasicMaterial;
  private neutronStarGroup: THREE.Group;
  private neutronStarMaterial: THREE.MeshStandardMaterial;
  private neutronBeamMaterial: THREE.MeshBasicMaterial;
  private neutronFieldMaterials: THREE.MeshBasicMaterial[] = [];
  private eventHorizon: THREE.Mesh;
  private photonRing: THREE.Mesh;
  private photonRingMaterial: THREE.MeshBasicMaterial;
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
  private targetProtostellarJetOpacity = 0;
  private currentProtostellarJetOpacity = 0;
  private targetPlanetaryOpacity = 0;
  private currentPlanetaryOpacity = 0;
  private targetPulsarOpacity = 0;
  private currentPulsarOpacity = 0;
  private targetBlackHoleOpacity = 0;
  private currentBlackHoleOpacity = 0;

  // Captured transition origins prevent repeated, asymptotic lerping.
  private transitionStartRadius = 2.5;
  private transitionStartColor = new THREE.Color(0xfff5e0);
  private transitionStartEmissive = new THREE.Color(0xffddaa);
  private transitionStartGlowIntensity = 1;
  private transitionStartNebulaOpacity = 0;
  private transitionStartSupernovaOpacity = 0;
  private transitionStartAccretionOpacity = 0;
  private transitionStartProtostellarJetOpacity = 0;
  private transitionStartPlanetaryOpacity = 0;
  private transitionStartPulsarOpacity = 0;
  private transitionStartBlackHoleOpacity = 0;
  private elapsedTime = 0;

  // Camera
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private camSpherical: CameraSpherical = { radius: 40, theta: Math.PI / 4, phi: Math.PI / 3 };
  private camDamping = 0.12;
  private currentCamPos = new THREE.Vector3();
  private currentCamTarget = new THREE.Vector3();
  private desiredCamPos = new THREE.Vector3();

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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    this.starfield = createStarfield(2000, 400);
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
    const nebulaCount = 500;
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
      side: THREE.DoubleSide,
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

    // Protostellar bipolar outflows. These are stylised gas jets, not light beams.
    this.protostellarJets = new THREE.Group();
    this.protostellarJetMaterial = new THREE.MeshBasicMaterial({
      color: 0x78cdeb,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const protoJetGeometry = new THREE.CylinderGeometry(0.08, 0.65, 11, 16, 1, true);
    const protoJetNorth = new THREE.Mesh(protoJetGeometry, this.protostellarJetMaterial);
    protoJetNorth.position.y = 5.5;
    const protoJetSouth = new THREE.Mesh(protoJetGeometry, this.protostellarJetMaterial);
    protoJetSouth.position.y = -5.5;
    protoJetSouth.rotation.x = Math.PI;
    this.protostellarJets.add(protoJetNorth, protoJetSouth);
    this.protostellarJets.rotation.z = 0.08;
    this.scene.add(this.protostellarJets);

    // Expelled planetary-nebula gas: a structured, mildly bipolar shell.
    const planetaryCount = 1100;
    const planetaryPositions = new Float32Array(planetaryCount * 3);
    for (let i = 0; i < planetaryCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const cosPhi = 2 * Math.random() - 1;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      const radius = 8 + Math.random() * 2.3 + Math.abs(cosPhi) * 2.2;
      planetaryPositions[i * 3] = radius * sinPhi * Math.cos(theta) * 0.82;
      planetaryPositions[i * 3 + 1] = radius * cosPhi * 1.18;
      planetaryPositions[i * 3 + 2] = radius * sinPhi * Math.sin(theta) * 0.82;
    }
    const planetaryGeometry = new THREE.BufferGeometry();
    planetaryGeometry.setAttribute('position', new THREE.BufferAttribute(planetaryPositions, 3));
    this.planetaryNebulaMaterial = new THREE.PointsMaterial({
      color: 0x72cfff,
      size: 0.2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.planetaryNebulaPoints = new THREE.Points(planetaryGeometry, this.planetaryNebulaMaterial);
    this.scene.add(this.planetaryNebulaPoints);

    const planetaryShellGeometry = new THREE.SphereGeometry(1, 40, 28);
    this.planetaryNebulaShellMaterial = new THREE.MeshBasicMaterial({
      color: 0x63c7f2,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.planetaryNebulaShell = new THREE.Mesh(planetaryShellGeometry, this.planetaryNebulaShellMaterial);
    this.planetaryNebulaShell.scale.set(8, 10, 8);
    this.scene.add(this.planetaryNebulaShell);

    // Dense equatorial waist between the bipolar lobes.
    const planetaryRingGeometry = new THREE.TorusGeometry(5.2, 0.28, 8, 80);
    this.planetaryEquatorialRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xd78e72,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.planetaryEquatorialRing = new THREE.Mesh(planetaryRingGeometry, this.planetaryEquatorialRingMaterial);
    this.planetaryEquatorialRing.rotation.x = Math.PI / 2;
    this.scene.add(this.planetaryEquatorialRing);

    // Neutron star and pulsar structure. The magnetic axis is tilted relative
    // to the spin axis, so the two radiation beams sweep around as it rotates.
    this.neutronStarGroup = new THREE.Group();
    this.neutronStarMaterial = new THREE.MeshStandardMaterial({
      color: 0xbadfff,
      emissive: 0x4d9fff,
      emissiveIntensity: 1.7,
      roughness: 0.28,
      metalness: 0.05,
    });
    const neutronGeometry = new THREE.SphereGeometry(0.34, 40, 32);
    const neutronSphere = new THREE.Mesh(neutronGeometry, this.neutronStarMaterial);
    this.neutronStarGroup.add(neutronSphere);

    const neutronGlowMaterial = new THREE.SpriteMaterial({
      map: this.starGlowMaterial.map,
      color: 0x65baff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const neutronGlow = new THREE.Sprite(neutronGlowMaterial);
    neutronGlow.scale.setScalar(2.6);
    this.neutronStarGroup.add(neutronGlow);

    const magneticAxis = new THREE.Group();
    magneticAxis.rotation.z = 0.48;
    this.neutronBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0x73caff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beamGeometry = new THREE.CylinderGeometry(0.06, 0.72, 12, 20, 1, true);
    const northBeam = new THREE.Mesh(beamGeometry, this.neutronBeamMaterial);
    northBeam.position.y = 6;
    const southBeam = new THREE.Mesh(beamGeometry, this.neutronBeamMaterial);
    southBeam.position.y = -6;
    southBeam.rotation.x = Math.PI;
    magneticAxis.add(northBeam, southBeam);

    const polarHotspotGeometry = new THREE.SphereGeometry(0.075, 16, 12);
    const polarHotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xf2fbff });
    const northHotspot = new THREE.Mesh(polarHotspotGeometry, polarHotspotMaterial);
    northHotspot.position.y = 0.31;
    const southHotspot = new THREE.Mesh(polarHotspotGeometry, polarHotspotMaterial);
    southHotspot.position.y = -0.31;
    magneticAxis.add(northHotspot, southHotspot);

    // A few dipole-like loops make the tilted magnetic structure legible.
    for (let loopIndex = 0; loopIndex < 3; loopIndex++) {
      const loopRadius = 2.6 + loopIndex * 1.25;
      const points: THREE.Vector3[] = [];
      for (let step = 0; step <= 80; step++) {
        const theta = 0.12 + (Math.PI - 0.24) * (step / 80);
        const radius = loopRadius * Math.sin(theta) ** 2;
        points.push(new THREE.Vector3(radius * Math.sin(theta), radius * Math.cos(theta), 0));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const fieldGeometry = new THREE.TubeGeometry(curve, 72, 0.018, 5, false);
      const fieldMaterial = new THREE.MeshBasicMaterial({
        color: loopIndex === 1 ? 0x7ccfff : 0x488fda,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const fieldLine = new THREE.Mesh(fieldGeometry, fieldMaterial);
      fieldLine.rotation.y = loopIndex * Math.PI / 3;
      magneticAxis.add(fieldLine);
      this.neutronFieldMaterials.push(fieldMaterial);
    }
    this.neutronStarGroup.add(magneticAxis);
    this.scene.add(this.neutronStarGroup);

    // A black hole needs a dark horizon, not an invisible missing star.
    const horizonGeometry = new THREE.SphereGeometry(1, 48, 36);
    const horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x010208 });
    this.eventHorizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    this.eventHorizon.scale.setScalar(1.6);
    this.scene.add(this.eventHorizon);

    const photonRingGeometry = new THREE.TorusGeometry(2.45, 0.045, 8, 96);
    this.photonRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x9bdcf5,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.photonRing = new THREE.Mesh(photonRingGeometry, this.photonRingMaterial);
    this.photonRing.rotation.x = Math.PI / 2.5;
    this.scene.add(this.photonRing);

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

    this.transitionStartRadius = this.currentRadius;
    this.transitionStartColor.copy(this.currentColor);
    this.transitionStartEmissive.copy(this.currentEmissive);
    this.transitionStartGlowIntensity = this.currentGlowIntensity;
    this.transitionStartNebulaOpacity = this.currentNebulaOpacity;
    this.transitionStartSupernovaOpacity = this.currentSupernovaOpacity;
    this.transitionStartAccretionOpacity = this.currentAccretionOpacity;
    this.transitionStartProtostellarJetOpacity = this.currentProtostellarJetOpacity;
    this.transitionStartPlanetaryOpacity = this.currentPlanetaryOpacity;
    this.transitionStartPulsarOpacity = this.currentPulsarOpacity;
    this.transitionStartBlackHoleOpacity = this.currentBlackHoleOpacity;

    this.targetRadius = stage.radius;
    this.targetColor = new THREE.Color(stage.color);
    this.targetEmissive = new THREE.Color(stage.emissive);
    this.targetGlowIntensity = stage.glowIntensity;

    // Stage-specific visual elements
    // Nebula clouds remain visible during formation and are expelled again
    // during the planetary-nebula phase.
    this.targetNebulaOpacity =
      stage.id === 'nebula' ? 0.7 :
      stage.id === 'protostar' ? 0.3 :
      stage.id === 'asymptotic-giant' ? 0.24 : 0;

    // Core-collapse ejecta are separate from the slower planetary-nebula shell.
    this.targetSupernovaOpacity = stage.id === 'supernova' ? 0.9 : 0;

    // A flattened accretion structure appears during protostellar formation
    // and becomes hotter and brighter around a black hole.
    this.targetAccretionOpacity =
      stage.id === 'protostar' ? 0.52 :
      stage.id === 'black-hole' ? 0.76 : 0;
    this.targetProtostellarJetOpacity = stage.id === 'protostar' ? 0.52 : 0;
    this.targetPlanetaryOpacity = stage.id === 'planetary-nebula' ? 0.82 : 0;
    this.targetPulsarOpacity = stage.id === 'neutron-star' ? 1 : 0;
    this.targetBlackHoleOpacity = stage.id === 'black-hole' ? 1 : 0;

    this.accretionMaterial.color.setHex(
      stage.id === 'protostar' ? 0xd9874b :
      stage.id === 'black-hole' ? ACCRETION_COLOR : 0x66cde8
    );
    this.accretionDisk.scale.setScalar(stage.id === 'protostar' ? 2.15 : 1.25);
    this.accretionDisk.rotation.x = stage.id === 'protostar' ? Math.PI / 2 : Math.PI / 2.5;
    this.supernovaMaterial.color.setHex(0xffe1c5);
    this.planetaryNebulaMaterial.color.setHex(0x72cfff);
    this.planetaryNebulaShellMaterial.color.setHex(0x63c7f2);
    this.eventHorizon.visible = stage.id === 'black-hole';
    this.photonRing.visible = stage.id === 'black-hole';
    if (stage.id === 'planetary-nebula') {
      this.planetaryNebulaPoints.scale.setScalar(1);
      this.planetaryNebulaShell.scale.set(8, 10, 8);
      this.planetaryEquatorialRing.scale.setScalar(1);
    }
    if (stage.id === 'supernova') {
      this.supernovaShell.scale.setScalar(5);
    }
    if (stage.id === 'neutron-star') {
      this.neutronStarGroup.rotation.set(0, 0, 0);
    }

    if (animate) {
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
      this.currentProtostellarJetOpacity = this.targetProtostellarJetOpacity;
      this.currentPlanetaryOpacity = this.targetPlanetaryOpacity;
      this.currentPulsarOpacity = this.targetPulsarOpacity;
      this.currentBlackHoleOpacity = this.targetBlackHoleOpacity;
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

    this.pointLight.color.copy(this.currentColor);
    this.pointLight.intensity = 2 * this.currentGlowIntensity;

    this.nebulaMaterial.opacity = this.currentNebulaOpacity;
    this.nebulaPoints.visible = this.currentNebulaOpacity > 0.01;
    this.supernovaMaterial.opacity = this.currentSupernovaOpacity;
    this.supernovaShell.visible = this.currentSupernovaOpacity > 0.01;
    this.accretionMaterial.opacity = this.currentAccretionOpacity;
    this.accretionDisk.visible = this.currentAccretionOpacity > 0.01;

    this.protostellarJetMaterial.opacity = this.currentProtostellarJetOpacity;
    this.protostellarJets.visible = this.currentProtostellarJetOpacity > 0.01;

    this.planetaryNebulaMaterial.opacity = this.currentPlanetaryOpacity;
    this.planetaryNebulaShellMaterial.opacity = this.currentPlanetaryOpacity * 0.12;
    this.planetaryEquatorialRingMaterial.opacity = this.currentPlanetaryOpacity * 0.28;
    this.planetaryNebulaPoints.visible = this.currentPlanetaryOpacity > 0.01;
    this.planetaryNebulaShell.visible = this.currentPlanetaryOpacity > 0.01;
    this.planetaryEquatorialRing.visible = this.currentPlanetaryOpacity > 0.01;

    this.neutronBeamMaterial.opacity = this.currentPulsarOpacity * 0.38;
    for (const material of this.neutronFieldMaterials) {
      material.opacity = this.currentPulsarOpacity * 0.42;
    }
    this.neutronStarGroup.visible = this.currentPulsarOpacity > 0.01;

    this.eventHorizon.visible = this.currentBlackHoleOpacity > 0.01;
    this.photonRing.visible = this.currentBlackHoleOpacity > 0.01;

    const activeStage = this.stages[this.currentStageIndex]?.id;
    const showStellarBody = activeStage !== 'nebula' && activeStage !== 'neutron-star' && activeStage !== 'black-hole';
    this.starMesh.visible = showStellarBody;
    this.starGlow.visible = showStellarBody;
  }

  private updateTransition(dt: number): void {
    if (this.transitionProgress >= 1) return;
    this.transitionProgress = Math.min(1, this.transitionProgress + dt * this.transitionSpeed);
    const t = this.easeInOutCubic(this.transitionProgress);

    this.currentRadius = THREE.MathUtils.lerp(this.transitionStartRadius, this.targetRadius, t);
    this.currentColor.copy(this.transitionStartColor).lerp(this.targetColor, t);
    this.currentEmissive.copy(this.transitionStartEmissive).lerp(this.targetEmissive, t);
    this.currentGlowIntensity = THREE.MathUtils.lerp(this.transitionStartGlowIntensity, this.targetGlowIntensity, t);
    this.currentNebulaOpacity = THREE.MathUtils.lerp(this.transitionStartNebulaOpacity, this.targetNebulaOpacity, t);
    this.currentSupernovaOpacity = THREE.MathUtils.lerp(this.transitionStartSupernovaOpacity, this.targetSupernovaOpacity, t);
    this.currentAccretionOpacity = THREE.MathUtils.lerp(this.transitionStartAccretionOpacity, this.targetAccretionOpacity, t);
    this.currentProtostellarJetOpacity = THREE.MathUtils.lerp(this.transitionStartProtostellarJetOpacity, this.targetProtostellarJetOpacity, t);
    this.currentPlanetaryOpacity = THREE.MathUtils.lerp(this.transitionStartPlanetaryOpacity, this.targetPlanetaryOpacity, t);
    this.currentPulsarOpacity = THREE.MathUtils.lerp(this.transitionStartPulsarOpacity, this.targetPulsarOpacity, t);
    this.currentBlackHoleOpacity = THREE.MathUtils.lerp(this.transitionStartBlackHoleOpacity, this.targetBlackHoleOpacity, t);
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
    this.desiredCamPos.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ).add(this.cameraTarget);
    this.currentCamPos.lerp(this.desiredCamPos, this.camDamping);
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
    this.elapsedTime += dt;

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

    // Expanding supernova ejecta shell (accelerated teaching time).
    if (this.currentSupernovaOpacity > 0.01) {
      const expansion = 5 + Math.min(this.stageTimer, this.stageDuration) * 2.8;
      this.supernovaShell.scale.setScalar(expansion);
      if (!this.reducedMotion) this.supernovaShell.rotation.y += dt * 0.08;
    }

    // Nebula dynamics remain deliberately subtle.
    if (this.currentNebulaOpacity > 0.01) {
      if (!this.reducedMotion) this.nebulaPoints.rotation.y += dt * 0.025;
    }

    if (this.currentPlanetaryOpacity > 0.01) {
      const expansion = 1 + Math.min(this.stageTimer, this.stageDuration) * 0.018;
      this.planetaryNebulaPoints.scale.setScalar(expansion);
      this.planetaryNebulaShell.scale.set(8 * expansion, 10 * expansion, 8 * expansion);
      this.planetaryEquatorialRing.scale.setScalar(expansion);
      if (!this.reducedMotion) {
        this.planetaryNebulaPoints.rotation.y += dt * 0.018;
        this.planetaryNebulaShell.rotation.y += dt * 0.018;
      }
    }

    // Disk material moves around the protostar or black hole.
    if (this.currentAccretionOpacity > 0.01 && !this.reducedMotion) {
      this.accretionDisk.rotation.z += dt * (this.currentBlackHoleOpacity > 0.1 ? 0.62 : 0.34);
    }

    if (this.currentProtostellarJetOpacity > 0.01 && !this.reducedMotion) {
      this.protostellarJets.rotation.y += dt * 0.025;
    }

    // A pulsar is shown with a deliberately slowed spin so the tilted beams
    // can be followed by eye. This is not its physical rotation period.
    if (this.currentPulsarOpacity > 0.01 && !this.reducedMotion) {
      this.neutronStarGroup.rotation.y += dt * 4.2;
    }

    if (this.currentBlackHoleOpacity > 0.01 && !this.reducedMotion) {
      this.photonRing.rotation.z += dt * 0.025;
    }

    // Giants gently pulsate; ordinary main-sequence stars remain steadier.
    if (this.starMesh.visible) {
      const activeStage = this.stages[this.currentStageIndex]?.id;
      const pulsation = activeStage === 'red-giant' || activeStage === 'asymptotic-giant' || activeStage === 'red-supergiant'
        ? 1 + Math.sin(this.elapsedTime * 1.2) * 0.022
        : 1;
      this.starMesh.scale.setScalar(this.currentRadius * pulsation);
      if (!this.reducedMotion) {
        this.starMesh.rotation.y += dt * (activeStage === 'main-sequence' ? 0.055 : 0.025);
      }
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

    // Sprite materials do not dispose their shared texture maps automatically.
    this.starGlowMaterial.map?.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
