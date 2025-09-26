/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import mapboxgl from 'mapbox-gl';

export interface AvatarLayerOptions {
    id: string;
    avatarUrl: string;
    position: [number, number];
    scale?: number;
}

export class AvatarLayer implements mapboxgl.CustomLayerInterface {
    id: string;
    type = 'custom' as const;
    renderingMode = '3d' as const;

    private map?: mapboxgl.Map;
    private camera?: THREE.Camera;
    private scene?: THREE.Scene;
    private renderer?: THREE.WebGLRenderer;
    private avatar?: THREE.Group;
    private options: AvatarLayerOptions;
    private clock: THREE.Clock;

    constructor(options: AvatarLayerOptions) {
        this.id = options.id;
        this.options = options;
        this.clock = new THREE.Clock();
    }

    onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
        this.map = map;
        console.log('Adding avatar layer to map...');

        // Create Three.js scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.Camera();

        // Create renderer using the map's WebGL context
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
        });

        this.renderer.autoClear = false;

        // Add lighting
        this.setupLighting();

        // Load the avatar
        this.loadAvatar();
    }

    private setupLighting() {
        if (!this.scene) return;

        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);

        console.log('Lighting setup complete');
    }

    private async loadAvatar() {
        if (!this.scene) {
            console.error('Scene not initialized');
            return;
        }

        try {
            console.log('Loading avatar from URL:', this.options.avatarUrl);

            const loader = new GLTFLoader();

            // Load the avatar
            const gltf = await new Promise<any>((resolve, reject) => {
                loader.load(
                    this.options.avatarUrl,
                    resolve,
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                    },
                    reject
                );
            });

            this.avatar = gltf.scene;

            if (this.avatar && this.scene) {
                // Scale the avatar appropriately
                const scale = this.options.scale || 1;
                this.avatar.scale.set(scale, scale, scale);

                // Position the avatar at ground level
                this.avatar.position.set(0, 0, 0);

                // Ensure avatar is visible
                this.avatar.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.scene.add(this.avatar);
                console.log('Avatar loaded and added to scene');

                // Trigger map repaint
                this.map?.triggerRepaint();
            }
        } catch (error) {
            console.error('Error loading avatar:', error);

            // Create a simple fallback geometry if avatar loading fails
            this.createFallbackAvatar();
        }
    }

    private createFallbackAvatar() {
        if (!this.scene) return;

        console.log('Creating fallback avatar...');

        // Create a simple capsule as fallback
        const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x0066ff,
            roughness: 0.3,
            metalness: 0.1
        });

        const fallbackAvatar = new THREE.Mesh(geometry, material);
        fallbackAvatar.position.set(0, 0.75, 0); // Raise it so it sits on ground

        this.avatar = new THREE.Group();
        this.avatar.add(fallbackAvatar);
        this.scene.add(this.avatar);

        console.log('Fallback avatar created');
        this.map?.triggerRepaint();
    }

    render(gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.camera || !this.scene || !this.renderer || !this.avatar) return;

        const deltaTime = this.clock.getDelta();

        // Get the mercator coordinate for the position
        const modelOrigin = this.options.position;
        const modelAltitude = 0;
        const modelRotate = [Math.PI / 2, 0, 0]; // X, Y, Z rotation

        const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
            modelOrigin,
            modelAltitude
        );

        // Calculate scale based on map zoom
        const modelScale = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * 2;

        // Build transformation matrices
        const translate = new THREE.Matrix4().makeTranslation(
            modelAsMercatorCoordinate.x,
            modelAsMercatorCoordinate.y,
            modelAsMercatorCoordinate.z || 0
        );

        const scale = new THREE.Matrix4().makeScale(
            modelScale,
            -modelScale,
            modelScale
        );

        const rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelRotate[0]
        );

        const rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelRotate[1]
        );

        const rotationZ = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 0, 1),
            modelRotate[2]
        );

        // Compose the transformation
        const l = new THREE.Matrix4()
            .multiply(translate)
            .multiply(scale)
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        // Mapbox projection matrix
        const m = new THREE.Matrix4().fromArray(matrix);
        this.camera.projectionMatrix = m.multiply(l);

        // Render
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map?.triggerRepaint();
    }

    onRemove() {
        console.log('Removing avatar layer');
        if (this.avatar && this.scene) {
            this.scene.remove(this.avatar);
        }
    }

    // Update avatar position
    updatePosition(position: [number, number]) {
        this.options.position = position;
        console.log('Avatar position updated:', position);
        this.map?.triggerRepaint();
    }
}
