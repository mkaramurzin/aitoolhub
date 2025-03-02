"use client";
import { GizmoHelper, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import {
  BufferGeometry,
  Material,
  Mesh,
  NormalBufferAttributes,
  Object3DEventMap,
} from "three";
export type LoadingMessageProps = {};

export function LoadingMessage(props: LoadingMessageProps) {
  return (
    <Canvas>
      <GizmoHelper
        alignment="bottom-right" // widget alignment within scene
        margin={[80, 80]} // widget margins (X, Y)
      ></GizmoHelper>
      <OrbitControls />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={2.5}
      />
      <pointLight position={[-10, 10, 10]} decay={0} intensity={2.5} />
      <Box />
    </Canvas>
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
    meshRef.current.rotation.y += 0.002;
  });
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
      rotation={[0, 90, 0]}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"#75eb60"} />
    </mesh>
  );
}
