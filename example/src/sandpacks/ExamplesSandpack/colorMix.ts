import type { SandpackFile } from '@codesandbox/sandpack-react'

const starTextureCode = `// Star shaped texture, I have created using canvas, but you free to load
// you alpha maps png/jpeg as three texture
import * as THREE from "three";

// AI Generated code :)
// Star texture generator with specified parameters
const POINTS = 12;
const INNER_RADIUS = 0.3;
const OUTER_RADIUS = 0.8;
const SOFTNESS = 11;
const SIZE = 128; // Texture size in pixels

function createStarPath(
  centerX: number,
  centerY: number,
  points: number,
  innerRadius: number,
  outerRadius: number
): Path2D {
  const path = new Path2D();
  const angleStep = (Math.PI * 2) / (points * 2);

  for (let i = 0; i < points * 2; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  }

  path.closePath();
  return path;
}

function generateStarTexture(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context from canvas");
  }

  const size = SIZE;
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = INNER_RADIUS * size * 0.5;
  const outerRadius = OUTER_RADIUS * size * 0.5;

  // Set canvas size
  canvas.width = canvas.height = size;

  // Clear canvas (transparent background)
  ctx.clearRect(0, 0, size, size);

  // Create radial gradient for soft edges
  const maxRadius = Math.max(outerRadius + SOFTNESS, size * 0.5);
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    maxRadius
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  // Create star path
  const starPath = createStarPath(
    centerX,
    centerY,
    POINTS,
    innerRadius,
    outerRadius
  );

  // Apply soft glow effect
  if (SOFTNESS > 0) {
    ctx.save();
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = SOFTNESS;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fill(starPath);
    ctx.restore();
  }

  // Fill the star with gradient
  ctx.save();
  ctx.clip(starPath);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Add crisp star outline
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fill(starPath);

  return canvas;
}

export function createStarTextureAsThreeTexture(): THREE.Texture {
  if (typeof document === "undefined") {
    throw new Error(
      "This function can only be called in a browser environment"
    );
  }
  // Create a canvas element
  const canvas = document.createElement("canvas");

  // Generate the star texture on the canvas
  generateStarTexture(canvas);

  // Create a Three.js texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);

  // Configure texture properties
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.premultiplyAlpha = true;

  return texture;
}
`

const fragmentModifierCode = `export const fragmentModifier = \`
// the uniforms which I have passed as props I can declare and use
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform sampler2D uStarTexture;

// my custom function I want to use for computation
vec3 angleMix(vec3 position) {
    float pi = asin(1.0) * 2.0;
    float angle = atan(position.z, position.x) + pi;
    float segment = angle / (2.0 * pi) * 3.0; // 3 color segments
    float t = fract(segment);
    
    if (segment < 1.0) return mix(uColor1, uColor2, t);
    if (segment < 2.0) return mix(uColor2, uColor3, t);
    return mix(uColor3, uColor1, t);
}

vec3 linearMix(vec3 position) {
    // Normalize x from [-1.5, 1.5] to [0, 1]
    float t = (position.x + 1.5) / 3.0;
    t = clamp(t, 0.0, 1.0);
    
    // Scale to [0, 2] for three-color blending
    float scaled = t * 2.0;
    
    if (scaled <= 1.0) {
        // First half: blend from uColor1 to uColor2
        return mix(uColor1, uColor2, scaled);
    } else {
        // Second half: blend from uColor2 to uColor3
        return mix(uColor2, uColor3, scaled - 1.0);
    }
}

// vPosition is already available in fragment modifier code
vec3 colorCalc(int index){
    // three js logo mesh
    if(index == 1) return linearMix(vPosition);
    // sphere mesh
    if(index == 2) return angleMix(vPosition);
    return uColor;
}

float aplhaCalc(int index){
    vec2 uv = gl_PointCoord;
    
    // for sphere and suzanne mesh star shaped particles
    if(index == 2 || index == 0){
        return texture(uStarTexture, uv).a;
    }
    
    // default to circle shape
    float distanceFromCenter = length(uv - 0.5);
    float alpha = ceil(max(0.5 - distanceFromCenter, 0.0));

    return alpha;
}

vec4 modifier(int index){
    float alpha = aplhaCalc(index);
    vec3 color = colorCalc(index);
    vec4 result = vec4(color, uAlpha * alpha);
    return result;
}
\`;
`

const AppCode = `import * as THREE from "three";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { R3FPointsFX } from "r3f-points-fx";
import { OrbitControls } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { R3FPointsFXRefType } from "r3f-points-fx";
import { fragmentModifier } from "./fragmentModifier";
import { createStarTextureAsThreeTexture } from "./starTexture";
import "./scene.css";

const TRANSITION_DURATION = 2;
const WAIT_DURATION = 2;

const SPHERE = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 32, 16),
  new THREE.MeshBasicMaterial()
);

const COLORS = {
  base: new THREE.Color("#9333ea"),
  color1: new THREE.Color("#60a5fa"),
  color2: new THREE.Color("#FF4B91"),
  color3: new THREE.Color("#FFCD4B"),
};

const STAR_TEXTURE = createStarTextureAsThreeTexture();

const Model = () => {
  const { nodes } = useGLTF("${import.meta.env.VITE_FRONTEND_URL}/suzanne.glb") as unknown as SuzanneGLTFResult;
  const { nodes: threejsNodes } = useGLTF(
    "${import.meta.env.VITE_FRONTEND_URL}/threejs.glb"
  ) as unknown as ThreejsGLTFResult;
  const fxRef = React.useRef<R3FPointsFXRefType>(null);
  const start = React.useRef(0);
  const modelA = React.useRef(0);
  const modelB = React.useRef(1);

  const meshes = [nodes.Suzanne, threejsNodes.threejs, SPHERE];

  // Ensure the update progress is called exactly once per frame
  // or transition will glitch.
  useFrame(({ clock }) => {
    if (start.current === 0) {
      start.current = clock.elapsedTime;
    }

    const elapsed = clock.elapsedTime - start.current;

    const progress = Math.min(
      Math.max(0, (elapsed - WAIT_DURATION) / TRANSITION_DURATION),
      1
    );

    if (progress >= 1) {
      modelA.current = modelB.current;
      modelB.current = (modelB.current + 1) % meshes.length;

      fxRef.current?.setModelA(modelA.current);
      fxRef.current?.updateProgress(0);
      fxRef.current?.setModelB(modelB.current);
      start.current = 0;
    } else {
      fxRef.current?.updateProgress(progress);
    }
  });

  return (
    <R3FPointsFX
      ref={fxRef}
      scale={[2.5, 2.5, 2.5]}
      position={[0, 0, 0]}
      modelA={modelA.current} // set value initally, later control using ref
      modelB={modelB.current}
      pointsCount={15000}
      pointSize={0.2}
      organizedParticleIndexes={[0]} // particles will arrange at exact vertex positions for suzanne mesh
      models={meshes}
      baseColor={COLORS.base}
      sizeAttenutation={true}
      alpha={0.5}
      uniforms={{
        uColor1: COLORS.color1,
        uColor2: COLORS.color2,
        uColor3: COLORS.color3,
        uStarTexture: STAR_TEXTURE,
      }}
      fragmentModifier={fragmentModifier}
    />
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Model />
      <OrbitControls />
    </Canvas>
  );
};

type SuzanneGLTFResult = GLTF & {
  nodes: {
    Suzanne: THREE.Mesh;
  };
  materials: object;
};

type ThreejsGLTFResult = GLTF & {
  nodes: {
    threejs: THREE.Mesh;
  };
  materials: object;
};

export default Scene;
`

const colorMixFiles: Record<string, SandpackFile> = {
  '/App.tsx': { code: AppCode, active: true },
  '/fragmentModifier.ts': { code: fragmentModifierCode, active: true },
  '/starTexture.ts': { code: starTextureCode, active: true },
}

export default colorMixFiles
