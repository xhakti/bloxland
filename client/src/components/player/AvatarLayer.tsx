// (Removed unused eslint-disable directive)

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import mapboxgl from "mapbox-gl";
import { ReadyPlayerMeAnimationLibrary } from "../../utils/ReadyPlayerMeAnimationLibrary";
import { AnimationStateMachine } from "../../utils/AnimationStateMachine";

export interface AvatarLayerOptions {
    id: string;
    avatarUrl: string;
    position: [number, number]; // [longitude, latitude]
    scale?: number;
    avatarHeight?: number; // configurable target avatar height in meters (default giant ~25m)
}

export class AvatarLayer implements mapboxgl.CustomLayerInterface {
    id: string;
    type = "custom" as const;
    renderingMode = "3d" as const;

    private map?: mapboxgl.Map;
    private camera?: THREE.Camera;
    private scene?: THREE.Scene;
    private renderer?: THREE.WebGLRenderer;
    private avatar?: THREE.Group;
    private options: AvatarLayerOptions;
    private mixer?: THREE.AnimationMixer;
    private clock: THREE.Clock;
    private currentAction?: THREE.AnimationAction;
    private actions: { [key: string]: THREE.AnimationAction } = {};
    private animationStateMachine?: AnimationStateMachine;
    // Lighting preset system
    private lightingPreset: string = 'day';
    private lights: Record<string, THREE.Light | undefined> = {};

    // Root bone reference (for stripping root motion during looping walk)
    private rootBone?: THREE.Bone;

    // Radar circles (20m inner, 50m outer)
    private radarInner?: THREE.Mesh;
    private radarOuter?: THREE.Mesh;
    private radarStartTime: number = performance.now();
    private readonly RADAR_INNER_RADIUS_M = 20;
    private readonly RADAR_OUTER_RADIUS_M = 50;
    private readonly RADAR_PULSE_PERIOD = 2; // seconds for a full grow/fade cycle
    private readonly RADAR_BREATH_PERIOD = 3; // subtle inner circle breathing period

    // Loading state tracking
    private isAvatarLoaded = false;
    private areAnimationsLoaded = false;

    // Building occlusion prevention
    private occlusionPreventionMesh?: THREE.Mesh;
    private nearbyBuildings = new Set<string>();
    private lastOcclusionUpdate = 0;
    private readonly OCCLUSION_UPDATE_INTERVAL = 100;
    private readonly OCCLUSION_RADIUS = 15; // meters
    // Smoothed movement tracking
    private currentLngLat?: [number, number];
    private targetLngLat?: [number, number];
    // Queue a walking intent if start/stop called before animations ready
    private pendingWalkCommand: 'start' | 'stop' | null = null;

    constructor(options: AvatarLayerOptions) {
        this.id = options.id;
        // Provide default giant avatar height if not specified
        this.options = { ...options, avatarHeight: options.avatarHeight || 25 };
        this.clock = new THREE.Clock();
        this.currentLngLat = [...options.position];
        this.targetLngLat = [...options.position];
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        this.map = map;

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();

        // Create renderer with specific settings for depth handling
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            logarithmicDepthBuffer: false,
        });

        // Configure renderer for proper depth handling
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.sortObjects = true;

        // Setup lighting and occlusion prevention
        this.setupLighting();
        this.createOcclusionPreventionSystem();
        this.createRadarCircles();

        // Load avatar
        this.loadAvatar();
    }

    private setupLighting() {
        if (!this.scene) return;
        const avatarH = this.options.avatarHeight || 25;
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(100, avatarH + 100, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        const backLight = new THREE.DirectionalLight(0x8899ff, 1.0);
        backLight.position.set(-100, avatarH + 50, -200);
        this.scene.add(backLight);
        const fillLight = new THREE.DirectionalLight(0xffaa88, 0.8);
        fillLight.position.set(-200, avatarH / 2, 50);
        this.scene.add(fillLight);
        const ambientLight = new THREE.AmbientLight(0x606060, 1.4);
        this.scene.add(ambientLight);
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 1.0);
        this.scene.add(hemisphereLight);
        const headLight = new THREE.PointLight(0xffffff, 1.5, 300);
        headLight.position.set(0, avatarH * 0.8, 50);
        this.scene.add(headLight);
        const rimLight = new THREE.PointLight(0xaaccff, 1.0, 400);
        rimLight.position.set(0, avatarH + 50, 100);
        this.scene.add(rimLight);
        this.lights = { directional: directionalLight, back: backLight, fill: fillLight, ambient: ambientLight, hemisphere: hemisphereLight, head: headLight, rim: rimLight };
    }

    private createRadarCircles() {
        if (!this.scene || !this.map) return;
        const makeCircle = (radiusMeters: number, color: number, initialOpacity: number) => {
            const geometry = new THREE.CircleGeometry(1, 64);
            const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: initialOpacity, depthWrite: false, depthTest: true, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.renderOrder = 2;
            (mesh.userData as any).targetRadiusMeters = radiusMeters;
            (mesh.userData as any).baseOpacity = initialOpacity;
            return mesh;
        };
        this.radarInner = makeCircle(this.RADAR_INNER_RADIUS_M, 0x0066ff, 0.25);
        this.radarOuter = makeCircle(this.RADAR_OUTER_RADIUS_M, 0x33aaff, 0.18);
        this.scene.add(this.radarInner);
        this.scene.add(this.radarOuter);
    }

    private async loadAvatar() {
        if (!this.scene) return;
        try {
            const loader = new GLTFLoader();
            const gltf = await new Promise<any>((resolve, reject) => {
                loader.load(this.options.avatarUrl, resolve, undefined, reject);
            });
            this.avatar = gltf.scene;
            if (this.avatar) {
                const targetHeight = this.options.avatarHeight || 25;
                const heightScale = targetHeight / 1.8;
                this.avatar.scale.set(heightScale, heightScale, heightScale);
                this.avatar.traverse(c => {
                    if (c instanceof THREE.Mesh) {
                        c.castShadow = true;
                        c.receiveShadow = true;
                        c.renderOrder = 1;
                    }
                });
                // root bone capture
                this.avatar.traverse(c => {
                    if (c instanceof THREE.SkinnedMesh && c.skeleton?.bones.length) {
                        if (!this.rootBone) this.rootBone = c.skeleton.bones[0];
                    }
                });
                this.mixer = new THREE.AnimationMixer(this.avatar);
                this.scene.add(this.avatar);
                this.isAvatarLoaded = true;
                await this.loadAnimations();
            }
        } catch (e) {
            this.createFallbackAvatar();
        }
        this.map?.triggerRepaint();
    }

    private createOcclusionPreventionSystem() {
        if (!this.scene) return;

        // Rebuild existing mesh if present
        if (this.occlusionPreventionMesh) {
            this.scene.remove(this.occlusionPreventionMesh);
            this.occlusionPreventionMesh.geometry.dispose();
            (this.occlusionPreventionMesh.material as THREE.Material).dispose();
        }

        // Invisible cylinder scaled to avatar height + buffer
        const geometry = new THREE.CylinderGeometry(
            this.OCCLUSION_RADIUS * 0.8,
            this.OCCLUSION_RADIUS,
            (this.options.avatarHeight || 25) + 20,
            16
        );

        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            colorWrite: false,
            depthWrite: true,
            depthTest: false,
        });

        this.occlusionPreventionMesh = new THREE.Mesh(geometry, material);
        this.occlusionPreventionMesh.renderOrder = -1;
        this.scene.add(this.occlusionPreventionMesh);
    }

    private applyLightingPreset(preset: string) {
        // NEW: Avatar lighting no longer changes dramatically with presets.
        // Keep neutral balanced lights from setupLighting; only (optionally) nudge
        // head/rim intensity for darker themes so avatar stays readable.
        const head = this.lights.head as THREE.PointLight | undefined;
        const rim = this.lights.rim as THREE.PointLight | undefined;
        if (head && rim) {
            if (preset === 'night') {
                head.intensity = 1.8; // slightly brighter so face readable
                rim.intensity = 1.3;
            } else if (preset === 'cyber') {
                head.intensity = 1.9;
                rim.intensity = 1.4;
            } else if (preset === 'sunset') {
                head.intensity = 1.6;
                rim.intensity = 1.1;
            } else { // day / default
                head.intensity = 1.5;
                rim.intensity = 1.0;
            }
        }
        this.lightingPreset = preset;
        this.map?.triggerRepaint();
    }

    public setLightingPreset(preset: string) {
        this.applyLightingPreset(preset);
        console.log(`(Avatar) lighting preset flag updated (visual lights remain neutral): ${preset}`);
    }

    // Expose simple walking animation controls (kept from previous implementation)
    public startWalking() {
        if (!this.animationStateMachine || !this.areAnimationsLoaded) {
            this.pendingWalkCommand = 'start';
            return;
        }
        try {
            (this.animationStateMachine as any).startWalking?.();
        } catch (e) {
            console.warn('startWalking failed', e);
        }
    }

    public stopWalking() {
        if (!this.animationStateMachine || !this.areAnimationsLoaded) {
            this.pendingWalkCommand = 'stop';
            return;
        }
        try {
            (this.animationStateMachine as any).stopWalking?.();
        } catch (e) {
            console.warn('stopWalking failed', e);
        }
    }

    // (Duplicate erroneous code block removed in refactor.)

    private enhanceMaterial(material: THREE.Material) {
        if (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial) {

            // Enhance material for better visibility at large scale
            material.envMapIntensity = 1.2;
            material.metalness = Math.max(0.05, material.metalness || 0);
            material.roughness = Math.min(0.9, material.roughness || 1);

            // Ensure proper depth testing
            material.depthTest = true;
            material.depthWrite = true;

            // Add subtle emissive for better visibility
            if (!material.emissive || material.emissive.getHex() === 0) {
                material.emissive = new THREE.Color(0x333333);
                material.emissiveIntensity = 0.15;
            }

            material.needsUpdate = true;
        }
    }

    private createFallbackAvatar() {
        if (!this.scene) return;

        console.log('Creating enhanced fallback avatar...');
        const group = new THREE.Group();

        // Enhanced fallback with better materials
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.4, 4, 8);
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x4a90e2,
            metalness: 0.1,
            roughness: 0.6,
            emissive: 0x111111,
            emissiveIntensity: 0.1,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.7;
        body.castShadow = true;
        body.receiveShadow = true;
        body.renderOrder = 10;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(0.25, 12, 8);
        const headMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffdbac,
            metalness: 0.0,
            roughness: 0.8,
            emissive: 0x221111,
            emissiveIntensity: 0.05,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        head.receiveShadow = true;
        head.renderOrder = 10;
        group.add(head);

        // Add simple arms for better visibility
        const armGeometry = new THREE.CapsuleGeometry(0.08, 0.6, 3, 6);
        const armMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffdbac,
            metalness: 0.0,
            roughness: 0.8
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 0.9, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        leftArm.renderOrder = 10;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 0.9, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        rightArm.renderOrder = 10;
        group.add(rightArm);

        this.avatar = group;
        this.avatar.renderOrder = 10;
        this.scene.add(this.avatar);
        this.isAvatarLoaded = true;
        console.log('Enhanced fallback avatar created');
        this.map?.triggerRepaint();
    }

    private updateOcclusionPrevention() {
        if (!this.occlusionPreventionMesh || !this.avatar) return;
        this.occlusionPreventionMesh.position.copy(this.avatar.position);
        this.occlusionPreventionMesh.position.y = (this.options.avatarHeight || 25) / 2;
    }

    render(_gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.camera || !this.scene || !this.renderer || !this.avatar) return;

        // Update occlusion prevention
        this.updateOcclusionPrevention();

        // Update animations
        if (this.mixer && this.areAnimationsLoaded) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);

            if (this.animationStateMachine) {
                this.animationStateMachine.update(deltaTime);
            }

            // Smart root motion handling: prevent forward drift + snap for looping walk clips
            // Many RPM walking animations include forward translation baked into the hip/root bone, which
            // causes the giant avatar to appear to glide forward then teleport back each loop since the
            // world position (geolocation) is fixed. We neutralize root motion in X/Z while preserving Y
            // (vertical bob) when the current animation is a walk.
            if (this.rootBone && this.animationStateMachine) {
                const current = this.animationStateMachine.getCurrentAnimationName() || '';
                if (/walk/i.test(current)) {
                    this.rootBone.position.x = 0;
                    this.rootBone.position.z = 0;
                }
            }
        }

        // Update radar circle positions & scaling to stay centered on avatar
        if (this.avatar && this.radarInner && this.radarOuter && this.map) {
            // Position circles at avatar origin (XZ). We leverage the same transformation matrix that scales the avatar
            // by meterInMercatorCoordinateUnits * options.scale. Our circle geometry is unit radius; after the layer's
            // modelScale multiplication we just need to scale by (radiusMeters / (options.scale || 12)) so that:
            // worldRadius = modelScale * circleScale = meterUnitsPerMeter * (options.scale) * (radiusMeters / options.scale)
            // = radiusMeters * meterUnitsPerMeter (correct real-world size).
            const circleScaleFactor = (mesh: THREE.Mesh) => {
                const radiusMeters = (mesh.userData as any).targetRadiusMeters || 1;
                return radiusMeters / (this.options.scale || 12);
            };
            const nowSec = (performance.now() - this.radarStartTime) / 1000;

            // Inner circle: gentle breathing (scale +/-5%, opacity slight)
            const innerBaseScale = circleScaleFactor(this.radarInner);
            const innerBreathPhase = (nowSec % this.RADAR_BREATH_PERIOD) / this.RADAR_BREATH_PERIOD; // 0..1
            const innerEase = 0.5 - 0.5 * Math.cos(innerBreathPhase * Math.PI * 2); // cosine ease
            const innerScale = innerBaseScale * (1 + innerEase * 0.05); // up to +5%
            this.radarInner.scale.set(innerScale, innerScale, innerScale);
            this.radarInner.position.set(this.avatar.position.x, 0.02, this.avatar.position.z);
            const innerMat = this.radarInner.material as THREE.MeshBasicMaterial;
            innerMat.opacity = ((this.radarInner.userData as any).baseOpacity || 0.25) * (0.9 + innerEase * 0.2);

            // Outer circle: growing pulse from 60% radius to full radius then fade out
            const outerBaseScale = circleScaleFactor(this.radarOuter);
            const pulsePhase = (nowSec % this.RADAR_PULSE_PERIOD) / this.RADAR_PULSE_PERIOD; // 0..1
            // Ease-out cubic for growth
            const growthEase = 1 - Math.pow(1 - pulsePhase, 3);
            const outerScale = outerBaseScale * (0.6 + growthEase * 0.4); // 60% -> 100%
            this.radarOuter.scale.set(outerScale, outerScale, outerScale);
            this.radarOuter.position.set(this.avatar.position.x, 0.021, this.avatar.position.z);
            const outerMat = this.radarOuter.material as THREE.MeshBasicMaterial;
            // Fade in quickly then fade out
            let opacity: number;
            if (pulsePhase < 0.2) {
                // ramp up first 20%
                opacity = 0.05 + (pulsePhase / 0.2) * 0.25; // 0.05 -> 0.30
            } else {
                const t = (pulsePhase - 0.2) / 0.8; // 0..1
                opacity = 0.30 * (1 - t); // fade to 0
            }
            outerMat.opacity = opacity;
            outerMat.needsUpdate = true;
        }

        // Smoothly interpolate current position toward target to avoid teleport jumps
        if (this.currentLngLat && this.targetLngLat) {
            const cur = this.currentLngLat;
            const tgt = this.targetLngLat;
            const dLng = tgt[0] - cur[0];
            const dLat = tgt[1] - cur[1];
            const dist = Math.hypot(dLng, dLat);
            if (dist > 0.0000005) { // about 5cm
                // Adaptive factor: faster for larger jumps, capped for stability
                const factor = Math.min(0.6, 0.15 + dist * 900);
                cur[0] += dLng * factor;
                cur[1] += dLat * factor;
            } else {
                cur[0] = tgt[0];
                cur[1] = tgt[1];
            }
        }

        // Use smoothed origin
        const modelOrigin = this.currentLngLat || this.options.position;
        const modelAltitude = 0; // Keep ground level (giant avatar)
        const modelRotate = [Math.PI / 2, Math.PI, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        const modelScale = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() *
            (this.options.scale || 12);

        const translate = new THREE.Matrix4().makeTranslation(
            modelAsMercatorCoordinate.x,
            modelAsMercatorCoordinate.y,
            modelAsMercatorCoordinate.z || 0
        );

        const scale = new THREE.Matrix4().makeScale(modelScale, -modelScale, modelScale);

        const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0), modelRotate[0]
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0), modelRotate[1]
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1), modelRotate[2]
        );

        const l = new THREE.Matrix4()
            .multiply(translate)
            .multiply(scale)
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        const m = new THREE.Matrix4().fromArray(matrix);
        this.camera.projectionMatrix = m.multiply(l);

        // Update dynamic lighting based on map bearing
        if (this.map) {
            const bearing = this.map.getBearing();
            const lights = this.scene.children.filter(child => child instanceof THREE.Light);

            lights.forEach(light => {
                if (light instanceof THREE.PointLight) {
                    // Move rim light relative to avatar position
                    const angle = (bearing * Math.PI) / 180;
                    light.position.set(
                        Math.sin(angle) * 50,
                        100,
                        Math.cos(angle) * 50
                    );
                } else if (light instanceof THREE.DirectionalLight && light.intensity === 1.0) {
                    // Move back light opposite to bearing
                    const angle = (bearing * Math.PI) / 180 + Math.PI;
                    light.position.set(
                        Math.sin(angle) * 100,
                        150,
                        Math.cos(angle) * 200
                    );
                }
            });
        }

        // Critical rendering setup for depth management
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map?.triggerRepaint();
    }

    onRemove() {
        if (this.avatar && this.scene) {
            this.scene.remove(this.avatar);
        }
        if (this.occlusionPreventionMesh && this.scene) {
            this.scene.remove(this.occlusionPreventionMesh);
        }
        if (this.radarInner && this.scene) {
            this.scene.remove(this.radarInner);
            this.radarInner.geometry.dispose();
            (this.radarInner.material as THREE.Material).dispose();
        }
        if (this.radarOuter && this.scene) {
            this.scene.remove(this.radarOuter);
            this.radarOuter.geometry.dispose();
            (this.radarOuter.material as THREE.Material).dispose();
        }
    }

    // Public methods
    isFullyLoaded(): boolean {
        return this.isAvatarLoaded && this.areAnimationsLoaded;
    }

    getAvailableAnimations(): string[] {
        return Object.keys(this.actions);
    }

    getCurrentAnimation(): string | null {
        if (this.animationStateMachine) {
            return this.animationStateMachine.getCurrentAnimationName() || null;
        }
        return null;
    }

    // Giant avatar height helpers
    updateAvatarHeight(newHeight: number) {
        if (!this.avatar || newHeight <= 0) return;
        const heightScale = newHeight / 1.8;
        this.avatar.scale.set(heightScale, heightScale, heightScale);
        this.options.avatarHeight = newHeight;
        // Recreate occlusion system to match new height
        this.createOcclusionPreventionSystem();
        console.log(`Avatar height updated to ${newHeight}m (scale factor ~${heightScale.toFixed(2)})`);
        this.map?.triggerRepaint();
    }

    getAvatarHeight(): number {
        return this.options.avatarHeight || 25;
    }

    updatePosition(newPosition: [number, number]) {
        this.targetLngLat = [...newPosition];
        if (!this.currentLngLat) this.currentLngLat = [...newPosition];
        if (this.map) this.map.triggerRepaint();
    }

    // Load ReadyPlayerMe animations
    private async loadAnimations() {
        if (!this.mixer || !this.avatar) return;

        try {
            console.log("Loading ReadyPlayerMe animations...");

            const availableAnimations = ReadyPlayerMeAnimationLibrary.getRecommendedAnimationSet();

            const animationPromises = availableAnimations.map(async (animationName) => {
                try {
                    const clip = await ReadyPlayerMeAnimationLibrary.loadAnimation(animationName);
                    if (clip && this.mixer) {
                        // Strip forward root motion for walking-type clips to eliminate drift + snap
                        if (/walk/i.test(animationName) && this.rootBone) {
                            clip.tracks.forEach(track => {
                                // VectorKeyframeTrack names look like 'Armature/Hips.position'
                                if (track.name.endsWith('.position') && track.name.includes(this.rootBone!.name)) {
                                    // Zero X/Z components of every keyframe, keep Y (vertical bob)
                                    // @ts-expect-error accessing concrete track typed at runtime (VectorKeyframeTrack.values)
                                    const values: number[] = track.values;
                                    for (let i = 0; i < values.length; i += 3) {
                                        values[i] = 0;       // x
                                        values[i + 2] = 0;   // z
                                    }
                                }
                            });
                        }

                        const action = this.mixer.clipAction(clip);
                        action.setLoop(THREE.LoopRepeat, Infinity);
                        action.clampWhenFinished = false;
                        this.actions[animationName] = action;
                        console.log(`Loaded animation: ${animationName}`);
                    }
                } catch (error) {
                    console.warn(`Failed to load animation "${animationName}":`, error);
                }
            });

            await Promise.all(animationPromises);
            console.log("All animations loaded:", Object.keys(this.actions));

            this.animationStateMachine = new AnimationStateMachine({
                initialVariationDuration: 8000,
                baseIdleDuration: 6000,
                variationDurationMin: 3000,
                variationDurationMax: 5000,
                fadeTime: 0.6
            });

            this.animationStateMachine.registerAnimations(this.actions);
            this.areAnimationsLoaded = true;
            console.log("Animation system ready!");
            // Flush any queued walking intent
            if (this.pendingWalkCommand && this.animationStateMachine) {
                if (this.pendingWalkCommand === 'start') {
                    (this.animationStateMachine as any).startWalking?.();
                } else if (this.pendingWalkCommand === 'stop') {
                    (this.animationStateMachine as any).stopWalking?.();
                }
                this.pendingWalkCommand = null;
            }

        } catch (error) {
            console.error("Failed to load animations:", error);
            this.areAnimationsLoaded = true;
        }
    }
}
