import React, { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

interface ModelViewerProps {
  modelUrl?: string
  className?: string
  enableControls?: boolean
}

function STLModel({ url }: { url: string }) {
  try {
    const geometry = useLoader(STLLoader, url)
    
    // Center the geometry
    React.useEffect(() => {
      if (geometry) {
        geometry.center()
        geometry.computeBoundingBox()
      }
    }, [geometry])
    
    return (
      <mesh geometry={geometry} scale={0.02}>
        <meshStandardMaterial 
          color="#6366f1" 
          metalness={0.2} 
          roughness={0.3} 
        />
      </mesh>
    )
  } catch (error) {
    console.warn('Failed to load STL model:', error)
    return <ModelFallback />
  }
}

function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  )
}

export default function ModelViewer({ 
  modelUrl, 
  className = "w-full h-16 sm:h-20", 
  enableControls = false 
}: ModelViewerProps) {
  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{
          position: [10, 10, 10],
          zoom: 50,
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} />
        <directionalLight position={[-10, -10, -10]} intensity={0.4} />
        
        <Suspense fallback={<ModelFallback />}>
          {modelUrl ? (
            <STLModel url={modelUrl} />
          ) : (
            <ModelFallback />
          )}
          {enableControls && (
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate={true}
              autoRotateSpeed={1}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
