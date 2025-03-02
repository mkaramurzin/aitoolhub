"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import {
  BufferGeometry,
  Material,
  Mesh,
  NormalBufferAttributes,
  Object3DEventMap,
} from "three";

// @hidden
export default function MessageLoading() {
  return (
    <div className="h-10 w-10">
      <Canvas>
        <OrbitControls />
        <spotLight
          position={[15, 15, 15]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={2.5}
        />
        <pointLight position={[-15, 15, 15]} decay={0} intensity={2.5} />
        <Box />
      </Canvas>
    </div>
  );
}

function Box(props: any) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh<
    BufferGeometry<NormalBufferAttributes>,
    Material | Material[],
    Object3DEventMap
  > | null>();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.01;
  });
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={3.5}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
      rotation={[0, 0, 0]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#32a852"
        emissive="#59BCF3"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}
