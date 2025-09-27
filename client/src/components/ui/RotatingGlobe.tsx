import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
    </div>
  );
}

// Error fallback component
function ErrorFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🌍</div>
        <p className="text-sm opacity-75">Globe Loading...</p>
      </div>
    </div>
  );
}

function AnimatedEarth() {
  const modelRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const [error, setError] = useState(false);

  // Load GLTF with error handling
  let scene;
  try {
    const gltf = useGLTF('/earth.glb');
    scene = gltf.scene;
  } catch (err) {
    console.error('Failed to load earth.glb:', err);
    setError(true);
    return <ErrorFallback />;
  }

  useFrame((_, delta) => {
    if (modelRef.current && !error) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  if (error) {
    return <ErrorFallback />;
  }

  // Calculate responsive scale based on viewport size
  const scale = Math.min(viewport.width * 0.3, viewport.height * 0.3, 2.5);

  return (
    <primitive
      ref={modelRef}
      object={scene.clone()}
      scale={[scale, scale, scale]}
      position={[0, 0, 0]}
    />
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
    return <ErrorFallback />;
  }

  return <>{children}</>;
}

const RotatingGlobe: React.FC = () => {
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
    <div ref={containerRef} className="w-full h-full">
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
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ResponsiveCanvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <AnimatedEarth />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.1}
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
