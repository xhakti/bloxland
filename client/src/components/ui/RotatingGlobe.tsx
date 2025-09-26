import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedEarth() {
  const { scene } = useGLTF('/earth.glb');
  const modelRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  useFrame((_, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  // Calculate responsive scale based on viewport size
  const scale = Math.min(viewport.width * 0.3, viewport.height * 0.3, 2.5);

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      scale={[scale, scale, scale]} 
      position={[0, 0, 0]}
    />
  );
}

// Responsive resize handler
function ResponsiveCanvas({ children }: { children: React.ReactNode }) {
  const { gl, camera } = useThree();
  
  useEffect(() => {
    const handleResize = () => {
      const container = gl.domElement.parentElement;
      if (container) {
        const { clientWidth, clientHeight } = container;
        
        // Update renderer size
        gl.setSize(clientWidth, clientHeight);
        
        // Update camera aspect ratio
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, camera]);

  return <>{children}</>;
}

const RotatingGlobe: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Canvas 
        camera={{ 
          position: [0, 0, 5], 
          fov: 50,
          aspect: dimensions.width / dimensions.height || 1
        }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]} // Optimize pixel ratio for performance
        performance={{ min: 0.8 }} // Maintain 80% performance threshold
      >
        <ResponsiveCanvas>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <AnimatedEarth />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </ResponsiveCanvas>
      </Canvas>
    </div>
  );
};

export default RotatingGlobe;
