/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // Loading state tracking
    private isAvatarLoaded = false;
    private areAnimationsLoaded = false;

    constructor(options: AvatarLayerOptions) {
        this.id = options.id;
        this.options = options;
        this.clock = new THREE.Clock();
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        this.map = map;

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
        });

        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Setup lighting
        this.setupLighting();

        // Load avatar immediately
        this.loadAvatar();
    }

    private setupLighting() {
        if (!this.scene) return;

        // Enhanced lighting for better avatar visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0x8899ff, 0.8);
        backLight.position.set(-50, 80, -100);
        this.scene.add(backLight);

        const fillLight = new THREE.DirectionalLight(0xffaa88, 0.5);
        fillLight.position.set(-100, 50, 0);
        this.scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(0x606060, 0.8);
        this.scene.add(ambientLight);

        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.6);
        this.scene.add(hemisphereLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(0, 50, 0);
        this.scene.add(pointLight);

        console.log('Lighting setup complete');
    }

    private async loadAvatar() {
        if (!this.scene) return;

        try {
            console.log('Loading Ready Player Me avatar:', this.options.avatarUrl);

            const loader = new GLTFLoader();
            const gltf = await new Promise<{
                scene: THREE.Group;
                animations: THREE.AnimationClip[];
            }>((resolve, reject) => {
                loader.load(
                    this.options.avatarUrl,
                    resolve,
                    (progress) => {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        console.log(`Avatar loading: ${percent}%`);
                    },
                    reject
                );
            });

            this.avatar = gltf.scene;

            if (this.avatar && this.scene) {
                // Process avatar mesh
                this.avatar.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    if (mat instanceof THREE.MeshStandardMaterial ||
                                        mat instanceof THREE.MeshPhysicalMaterial) {
                                        mat.envMapIntensity = 0.8;
                                        mat.needsUpdate = true;
                                    }
                                });
                            } else if (child.material instanceof THREE.MeshStandardMaterial ||
                                child.material instanceof THREE.MeshPhysicalMaterial) {
                                child.material.envMapIntensity = 0.8;
                                child.material.needsUpdate = true;
                            }
                        }
                    }
                });

                // Setup animation mixer
                let animationRoot = this.avatar;
                this.avatar.traverse((child) => {
                    if (child instanceof THREE.SkinnedMesh) {
                        if (child.skeleton && child.skeleton.bones.length > 0) {
                            const parentBone = child.skeleton.bones[0].parent;
                            if (parentBone) {
                                animationRoot = parentBone as THREE.Group;
                            }
                        }
                    }
                });

                this.mixer = new THREE.AnimationMixer(animationRoot);

                // Handle built-in animations
                if (gltf.animations && gltf.animations.length > 0) {
                    gltf.animations.forEach((clip, index) => {
                        const action = this.mixer!.clipAction(clip);
                        this.actions[clip.name || `builtin_${index}`] = action;
                    });
                    console.log("Found built-in animations:", Object.keys(this.actions));
                }

                this.scene.add(this.avatar);
                this.isAvatarLoaded = true;
                console.log("Avatar loaded and added to scene");

                // Load animations after avatar is ready
                await this.loadAnimations();

                this.map?.triggerRepaint();
            }
        } catch (error) {
            console.error("Error loading avatar:", error);
            this.createFallbackAvatar();
        }
    }

    private createFallbackAvatar() {
        if (!this.scene) return;

        console.log('Creating fallback avatar...');
        const group = new THREE.Group();

        // Simple humanoid fallback
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        group.add(body);

        const headGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.4;
        group.add(head);

        this.avatar = group;
        this.scene.add(this.avatar);
        this.isAvatarLoaded = true;
        console.log('Fallback avatar created');
        this.map?.triggerRepaint();
    }

    render(_gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.camera || !this.scene || !this.renderer || !this.avatar) return;

        // Update animations
        if (this.mixer && this.areAnimationsLoaded) {
            const deltaTime = this.clock.getDelta();
            this.mixer.update(deltaTime);

            if (this.animationStateMachine) {
                this.animationStateMachine.update(deltaTime);
            }
        }

        // Transform and render
        const modelOrigin = this.options.position;
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, Math.PI, 0];

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        const modelScale = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() *
            (this.options.scale || 15);

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

        // Update dynamic lighting
        if (this.map) {
            const bearing = this.map.getBearing();
            const lights = this.scene.children.filter(child => child instanceof THREE.Light);
            lights.forEach(light => {
                if (light instanceof THREE.DirectionalLight && light.intensity === 0.8) {
                    const angle = (bearing * Math.PI) / 180;
                    light.position.set(-Math.sin(angle) * 100, 80, -Math.cos(angle) * 100);
                }
            });
        }

        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map?.triggerRepaint();
    }

    onRemove() {
        if (this.avatar && this.scene) {
            this.scene.remove(this.avatar);
        }
    }

    // Public methods for external access
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

    // Load ReadyPlayerMe animations
    private async loadAnimations() {
        if (!this.mixer || !this.avatar) return;

        try {
            console.log("Loading ReadyPlayerMe animations...");

            const availableAnimations = ReadyPlayerMeAnimationLibrary.getRecommendedAnimationSet();

            // Load animations in parallel for faster loading
            const animationPromises = availableAnimations.map(async (animationName) => {
                try {
                    const clip = await ReadyPlayerMeAnimationLibrary.loadAnimation(animationName);
                    if (clip && this.mixer) {
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

            // Initialize animation state machine
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

        } catch (error) {
            console.error("Failed to load animations:", error);
            this.areAnimationsLoaded = true;
        }
    }
}
