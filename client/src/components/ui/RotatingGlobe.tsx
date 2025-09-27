import { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Loading fallback component with Tailwind
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
    </div>
  );
}

function AnimatedEarth() {
  const modelRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Use useGLTF hook properly
  const { scene } = useGLTF('/earth.glb');

  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  useEffect(() => {
    if (scene && modelRef.current) {
      // Enhance materials for better appearance
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            // Make the material more vibrant
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.metalness = 0.1;
              child.material.roughness = 0.7;
              child.material.emissive = new THREE.Color(0x112244);
              child.material.emissiveIntensity = 0.1;
            }
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  // Calculate responsive scale based on viewport size
  const scale = Math.min(viewport.width * 0.35, viewport.height * 0.35, 2.5);

  return (
    <group>
      {/* Main Earth Model */}
      <primitive
        ref={modelRef}
        object={scene}
        scale={[scale, scale, scale]}
        position={[0, 0, 0]}
      />
    </group>
  );
}

// Responsive resize handler with context lost recovery
function ResponsiveCanvas({ children }: { children: React.ReactNode }) {
  const { gl, camera } = useThree();
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      console.warn('WebGL context lost, attempting to recover...');
      event.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
    };

    const handleResize = () => {
      const container = canvas.parentElement;
      if (container && !contextLost) {
        const { clientWidth, clientHeight } = container;

        try {
          // Update renderer size
          gl.setSize(clientWidth, clientHeight);

          // Update camera aspect ratio
          if (camera instanceof THREE.PerspectiveCamera) {
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
          }
        } catch (error) {
          console.error('Error during resize:', error);
          setContextLost(true);
        }
      }
    };

    // Add event listeners
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      window.removeEventListener('resize', handleResize);
    };
  }, [gl, camera, contextLost]);

  if (contextLost) {
    return null; // Return null instead of HTML component in 3D context
  }

  return <>{children}</>;
}

const RotatingGlobe = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    // Use Intersection Observer to only render when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const resizeHandler = () => {
      updateDimensions();
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resizeHandler);
    };
  }, [updateDimensions]);

  // Don't render Canvas if not visible or dimensions not set
  if (!isVisible || dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div ref={containerRef} className="w-full h-full">
        <LoadingFallback />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={(state) => {
          state.gl.setClearColor('#000000', 0);
          // Enable tone mapping for better colors
          state.gl.toneMapping = THREE.ACESFilmicToneMapping;
          state.gl.toneMappingExposure = 1.2;
        }}
        className="bg-transparent"
        fallback={<LoadingFallback />}
      >
        <Suspense fallback={null}>
          <ResponsiveCanvas>
            {/* Enhanced Lighting for Glow Effect */}
            <ambientLight intensity={0.3} color="#404080" />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.5}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4FC3F7" />

            {/* Animated Earth with Glow */}
            <AnimatedEarth />

            {/* OrbitControls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.1}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI - Math.PI / 3}
            />
          </ResponsiveCanvas>
        </Suspense>
      </Canvas>
    </div>
  );
};

// Preload the GLTF model
useGLTF.preload('/earth.glb');

export default RotatingGlobe;
