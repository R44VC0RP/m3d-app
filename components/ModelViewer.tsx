import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js'
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js'

interface ModelViewerProps {
  modelUrl?: string
  filename?: string
  className?: string
  enableControls?: boolean
}

type SupportedFormat = 'stl' | 'obj' | 'gltf' | 'glb' | 'ply' | '3mf' | 'unsupported'

// Get file extension from URL or filename
function getFileExtension(url?: string, filename?: string): SupportedFormat {
  const extensions: Record<string, SupportedFormat> = {
    'stl': 'stl',
    'obj': 'obj',
    'gltf': 'gltf',
    'glb': 'glb',
    'ply': 'ply',
    '3mf': '3mf',
  }
  
  // First try filename
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    if (ext && extensions[ext]) return extensions[ext]
  }
  // Then try URL
  if (url) {
    const urlPath = url.split('?')[0]
    const ext = urlPath.toLowerCase().split('.').pop()
    if (ext && extensions[ext]) return extensions[ext]
  }
  return 'stl' // Default to STL since most 3D printing files are STL
}

// Convert external URL to proxy URL
function getProxyUrl(url: string): string {
  // If it's an UploadThing URL, proxy it through our API
  if (url.includes('ufs.sh') || url.includes('uploadthing')) {
    return `/api/model-proxy?url=${encodeURIComponent(url)}`
  }
  return url
}

interface GeometryResult {
  geometry: THREE.BufferGeometry | null
  error: Error | null
  loading: boolean
}

// Custom hook to load STL geometry
function useSTLGeometry(url: string): GeometryResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setError(null)
    
    const loader = new STLLoader()
    const proxyUrl = getProxyUrl(url)
    
    loader.load(
      proxyUrl,
      (geo) => {
        if (disposed) return
        geo.center()
        geo.computeBoundingBox()
        setGeometry(geo)
        setLoading(false)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.error('STL load error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load STL'))
        setLoading(false)
      }
    )
    
    return () => {
      disposed = true
    }
  }, [url])
  
  return { geometry, error, loading }
}

// Custom hook to load OBJ geometry
function useOBJGeometry(url: string): GeometryResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setError(null)
    
    const loader = new OBJLoader()
    const proxyUrl = getProxyUrl(url)
    
    loader.load(
      proxyUrl,
      (obj) => {
        if (disposed) return
        let geo: THREE.BufferGeometry | null = null
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && !geo) {
            geo = child.geometry.clone()
            geo.center()
            geo.computeBoundingBox()
          }
        })
        
        if (geo) {
          setGeometry(geo)
        } else {
          setError(new Error('No geometry found in OBJ'))
        }
        setLoading(false)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.error('OBJ load error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load OBJ'))
        setLoading(false)
      }
    )
    
    return () => {
      disposed = true
    }
  }, [url])
  
  return { geometry, error, loading }
}

// Custom hook to load GLTF/GLB geometry
function useGLTFGeometry(url: string): GeometryResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setError(null)
    
    const loader = new GLTFLoader()
    const proxyUrl = getProxyUrl(url)
    
    loader.load(
      proxyUrl,
      (gltf) => {
        if (disposed) return
        let geo: THREE.BufferGeometry | null = null
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh && !geo) {
            geo = child.geometry.clone()
            geo.center()
            geo.computeBoundingBox()
          }
        })
        
        if (geo) {
          setGeometry(geo)
        } else {
          setError(new Error('No geometry found in GLTF'))
        }
        setLoading(false)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.error('GLTF load error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load GLTF'))
        setLoading(false)
      }
    )
    
    return () => {
      disposed = true
    }
  }, [url])
  
  return { geometry, error, loading }
}

// Custom hook to load PLY geometry
function usePLYGeometry(url: string): GeometryResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setError(null)
    
    const loader = new PLYLoader()
    const proxyUrl = getProxyUrl(url)
    
    loader.load(
      proxyUrl,
      (geo) => {
        if (disposed) return
        geo.center()
        geo.computeBoundingBox()
        setGeometry(geo)
        setLoading(false)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.error('PLY load error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load PLY'))
        setLoading(false)
      }
    )
    
    return () => {
      disposed = true
    }
  }, [url])
  
  return { geometry, error, loading }
}

// Custom hook to load 3MF geometry
function use3MFGeometry(url: string): GeometryResult {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setError(null)
    
    const loader = new ThreeMFLoader()
    const proxyUrl = getProxyUrl(url)
    
    loader.load(
      proxyUrl,
      (object) => {
        if (disposed) return
        let geo: THREE.BufferGeometry | null = null
        object.traverse((child) => {
          if (child instanceof THREE.Mesh && !geo) {
            geo = child.geometry.clone()
            geo.center()
            geo.computeBoundingBox()
          }
        })
        
        if (geo) {
          setGeometry(geo)
        } else {
          setError(new Error('No geometry found in 3MF'))
        }
        setLoading(false)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.error('3MF load error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load 3MF'))
        setLoading(false)
      }
    )
    
    return () => {
      disposed = true
    }
  }, [url])
  
  return { geometry, error, loading }
}

interface ModelMeshProps {
  geometry: THREE.BufferGeometry
}

function ModelMesh({ geometry }: ModelMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Auto-fit the model to view
  const scale = useMemo(() => {
    if (!geometry?.boundingBox) return 0.02
    
    const box = geometry.boundingBox
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    
    // Scale to fit nicely in view (target ~2 units)
    return maxDim > 0 ? 2 / maxDim : 0.02
  }, [geometry])
  
  // Gentle rotation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry} scale={scale}>
      <meshStandardMaterial 
        color="#64748b"
        metalness={0.3} 
        roughness={0.5}
        envMapIntensity={0.5}
      />
    </mesh>
  )
}

// Individual format loaders as components
function STLModel({ url }: { url: string }) {
  const { geometry, error, loading } = useSTLGeometry(url)
  if (loading) return <LoadingFallback />
  if (error || !geometry) return <ModelFallback />
  return <ModelMesh geometry={geometry} />
}

function OBJModel({ url }: { url: string }) {
  const { geometry, error, loading } = useOBJGeometry(url)
  if (loading) return <LoadingFallback />
  if (error || !geometry) return <ModelFallback />
  return <ModelMesh geometry={geometry} />
}

function GLTFModel({ url }: { url: string }) {
  const { geometry, error, loading } = useGLTFGeometry(url)
  if (loading) return <LoadingFallback />
  if (error || !geometry) return <ModelFallback />
  return <ModelMesh geometry={geometry} />
}

function PLYModel({ url }: { url: string }) {
  const { geometry, error, loading } = usePLYGeometry(url)
  if (loading) return <LoadingFallback />
  if (error || !geometry) return <ModelFallback />
  return <ModelMesh geometry={geometry} />
}

function ThreeMFModel({ url }: { url: string }) {
  const { geometry, error, loading } = use3MFGeometry(url)
  if (loading) return <LoadingFallback />
  if (error || !geometry) return <ModelFallback />
  return <ModelMesh geometry={geometry} />
}

function ModelFallback() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.6} />
    </mesh>
  )
}

function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 2
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#94a3b8" wireframe />
    </mesh>
  )
}

interface Model3DProps {
  url: string
  filename?: string
}

function Model3D({ url, filename }: Model3DProps) {
  const format = getFileExtension(url, filename)
  
  // Route to appropriate loader based on file extension
  switch (format) {
    case 'stl':
      return <STLModel url={url} />
    case 'obj':
      return <OBJModel url={url} />
    case 'gltf':
    case 'glb':
      return <GLTFModel url={url} />
    case 'ply':
      return <PLYModel url={url} />
    case '3mf':
      return <ThreeMFModel url={url} />
    default:
      // For unsupported formats (STEP, IGES, etc.), show fallback cube
      // These CAD formats aren't directly supported in the browser
      return <ModelFallback />
  }
}

export default function ModelViewer({ 
  modelUrl, 
  filename,
  className = "w-full h-32", 
  enableControls = false 
}: ModelViewerProps) {
  return (
    <div className={className}>
      <Canvas
        orthographic
        camera={{
          position: [5, 5, 5],
          zoom: 40,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <directionalLight position={[0, -10, 0]} intensity={0.3} />
        
        <Suspense fallback={<LoadingFallback />}>
          {modelUrl ? (
            <Model3D url={modelUrl} filename={filename} />
          ) : (
            <ModelFallback />
          )}
        </Suspense>
        
        {enableControls && (
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        )}
      </Canvas>
    </div>
  )
}
