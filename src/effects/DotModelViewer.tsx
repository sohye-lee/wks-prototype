'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

interface DotModelViewerProps {
  src: string;
  color?: string;
  cell?: number;
  targetSize?: number;
  offsetY?: number;
  baseTiltX?: number;
  baseTiltY?: number;
  spinRange?: number;
  tiltMax?: number;
  className?: string;
}

// standard 4x4 Bayer (ordered dithering) threshold matrix — a textbook
// technique, judged against screen-space fragment coords (not object UV) so
// the dot pattern itself stays fixed on screen even as the model rotates
const BAYER_GLSL = /* glsl */ `
  float bayerThreshold(vec2 screenPos, float cell) {
    vec2 p = mod(floor(screenPos / cell), 4.0);
    int x = int(p.x), y = int(p.y);
    if (x == 0) {
      if (y == 0) return 0.0 / 16.0;
      if (y == 1) return 8.0 / 16.0;
      if (y == 2) return 2.0 / 16.0;
      return 10.0 / 16.0;
    } else if (x == 1) {
      if (y == 0) return 12.0 / 16.0;
      if (y == 1) return 4.0 / 16.0;
      if (y == 2) return 14.0 / 16.0;
      return 6.0 / 16.0;
    } else if (x == 2) {
      if (y == 0) return 3.0 / 16.0;
      if (y == 1) return 11.0 / 16.0;
      if (y == 2) return 1.0 / 16.0;
      return 9.0 / 16.0;
    } else {
      if (y == 0) return 15.0 / 16.0;
      if (y == 1) return 7.0 / 16.0;
      if (y == 2) return 13.0 / 16.0;
      return 5.0 / 16.0;
    }
  }
`;

const VERT = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uCell, uAmbient, uDiffuse;
  uniform vec3 uLightDir, uInk;
  varying vec3 vNormal;
  ${BAYER_GLSL}
  void main() {
    float lambert = max(0.0, dot(normalize(vNormal), normalize(uLightDir)));
    float brightness = clamp(uAmbient + lambert * uDiffuse, 0.0, 1.0);
    float thr = bayerThreshold(gl_FragCoord.xy, uCell);
    float dotOn = step(thr, brightness);
    gl_FragColor = vec4(uInk, dotOn);
  }
`;

const IDLE_SPEED = 0.35;
const IDLE_AMP_Y = 0.16;
const IDLE_AMP_X = 0.08;
const TILT_EASE = 0.06;

// ports wks-animations' dotModel.js: a GLB is lit with a single directional
// light, then its brightness is thresholded per-screen-pixel against a
// Bayer matrix to render as an ordered-dither dot pattern (idle sway +
// mouse-driven tilt/spin), instead of the app's other duotone-filter
// placeholders. Single flat ink color with a transparent background (alpha
// output), matching the monotone brand-cyan treatment used elsewhere on
// this site (PixelHighlight, PatternSilhouette) rather than the reference's
// solid dark backdrop or the model's own baked colors.
export function DotModelViewer({
  src,
  color = '#00F2FF',
  cell = 5,
  targetSize = 450,
  offsetY = 0,
  baseTiltX = 0.25,
  baseTiltY = 1.335,
  spinRange = 0.4,
  tiltMax = 0.12,
  className,
}: DotModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uCell: { value: cell },
        uAmbient: { value: 0.18 },
        uDiffuse: { value: 1.0 },
        uLightDir: { value: new THREE.Vector3(0.5, 0.8, 0.6) },
        uInk: { value: new THREE.Color(color) },
      },
    });

    const group = new THREE.Group();
    scene.add(group);
    let modelReady = false;
    let cancelled = false;

    new GLTFLoader().load(
      src,
      (gltf) => {
        if (cancelled) return;
        const root = gltf.scene;
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = material;
          }
        });

        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        root.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        root.scale.setScalar(targetSize / maxDim);

        group.add(root);
        modelReady = true;
      },
      undefined,
      (err) => console.error('[DotModelViewer] GLB load failed', err)
    );

    function resize() {
      const rect = container!.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      // 2*dist*tan(fov/2) == viewport height in world units -> 1 unit = 1px
      camera.position.z = h / 2 / Math.tan((camera.fov * Math.PI) / 180 / 2);
      camera.updateProjectionMatrix();
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let mx = 0.5;
    let my = 0.5;
    function handlePointerMove(e: PointerEvent) {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    }
    window.addEventListener('pointermove', handlePointerMove);

    let tiltX = 0;
    let spinY = 0;
    let rafId = 0;

    function render(now: number) {
      rafId = requestAnimationFrame(render);
      const t = now / 1000;
      const idleY = reducedMotion ? 0 : Math.sin(t * IDLE_SPEED) * IDLE_AMP_Y;
      const idleX = reducedMotion ? 0 : Math.sin(t * IDLE_SPEED * 0.63 + 1.3) * IDLE_AMP_X;

      if (!reducedMotion) {
        const targetSpinY = (mx - 0.5) * spinRange;
        const targetTiltX = (my - 0.5) * 2 * tiltMax;
        tiltX += (targetTiltX - tiltX) * TILT_EASE;
        spinY += (targetSpinY - spinY) * TILT_EASE;
      }

      group.rotation.set(tiltX + baseTiltX + idleX, baseTiltY + idleY + spinY, 0);
      group.position.set(0, offsetY, 0);

      if (modelReady) renderer.render(scene, camera);
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      material.dispose();
      container!.removeChild(renderer.domElement);
    };
  }, [src, color, cell, targetSize, offsetY, baseTiltX, baseTiltY, spinRange, tiltMax]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
