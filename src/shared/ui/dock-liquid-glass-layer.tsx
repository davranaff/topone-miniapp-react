import { useEffect, useMemo, useRef } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/shared/lib/cn";

const LiquidMaterial = shaderMaterial(
  { uTime: 0 },
  `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      uv.x += sin(uv.y * 9.0 + uTime * 1.1) * 0.012;
      uv.y += cos(uv.x * 8.5 + uTime * 0.95) * 0.008;

      float highlight = smoothstep(0.72, 0.0, distance(uv, vec2(0.2, 0.08)));
      float sideGlow = smoothstep(0.68, 0.0, distance(uv, vec2(0.84, 0.16)));
      float edge = smoothstep(0.48, 0.08, distance(uv, vec2(0.5, 0.5)));
      float body = 0.06 + highlight * 0.1 + sideGlow * 0.08 + edge * 0.06;

      vec3 glassTint = vec3(0.98, 0.97, 0.94);
      gl_FragColor = vec4(glassTint, body);
    }
  `,
);

extend({ LiquidMaterial });

const LiquidGlassPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => {
    const instance = new LiquidMaterial() as THREE.ShaderMaterial;
    instance.transparent = true;
    instance.depthWrite = false;
    return instance;
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state) => {
    const shader = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!shader?.uniforms?.uTime) {
      return;
    }

    shader.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
};

type DockLiquidGlassLayerProps = {
  className?: string;
};

export const DockLiquidGlassLayer = ({ className }: DockLiquidGlassLayerProps) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        orthographic
        camera={{ position: [0, 0, 5], zoom: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <LiquidGlassPlane />
      </Canvas>
    </div>
  );
};
