'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '@/stores/useAppStore';
import Desktop from '@/desktop/Desktop';

const CELL = 10;
const SCATTER = 0.25;
const SWEEP_DURATION = 0.6;
const CELL_FADE = 0.12;

export default function HackTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setPhase = useAppStore((s) => s.setPhase);
  const transitionSnapshot = useAppStore((s) => s.transitionSnapshot);
  const setTransitionSnapshot = useAppStore((s) => s.setTransitionSnapshot);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !transitionSnapshot) {
      setPhase('desktop');
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const cols = Math.ceil(width / CELL);
    const rows = Math.ceil(height / CELL);
    const cellFadeNorm = CELL_FADE / SWEEP_DURATION;

    // downscale the captured screen to one sample per cell, then draw it back
    // up with smoothing off — a chunky mosaic made of the screen's own pixels
    const tiny = document.createElement('canvas');
    tiny.width = cols;
    tiny.height = rows;
    const tinyCtx = tiny.getContext('2d')!;
    tinyCtx.drawImage(transitionSnapshot, 0, 0, transitionSnapshot.width, transitionSnapshot.height, 0, 0, cols, rows);

    const mosaic = document.createElement('canvas');
    mosaic.width = width;
    mosaic.height = height;
    const mosaicCtx = mosaic.getContext('2d')!;
    mosaicCtx.imageSmoothingEnabled = false;
    mosaicCtx.drawImage(tiny, 0, 0, cols, rows, 0, 0, width, height);

    const cells: { x: number; y: number; openAt: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const fromBottom = (rows - r - 0.5) / rows;
        const rnd = Math.random();
        const raw = fromBottom * (1 - SCATTER) + rnd * SCATTER;
        cells.push({ x: c * CELL, y: r * CELL, openAt: raw * (1 - cellFadeNorm) });
      }
    }

    const state = { progress: 0 };

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const cell of cells) {
        const t = (state.progress - cell.openAt) / cellFadeNorm;
        if (t >= 1) continue; // fully dissolved — let the next page show through
        if (t <= 0) {
          // not reached yet — sharp, untouched screen
          ctx!.globalAlpha = 1;
          ctx!.drawImage(transitionSnapshot!, cell.x, cell.y, CELL, CELL, cell.x, cell.y, CELL, CELL);
        } else {
          // actively dissolving — pixelated mosaic fading out
          ctx!.globalAlpha = 1 - t;
          ctx!.drawImage(mosaic, cell.x, cell.y, CELL, CELL, cell.x, cell.y, CELL, CELL);
        }
      }
      ctx!.globalAlpha = 1;
    }

    draw();

    const tween = gsap.to(state, {
      progress: 1,
      duration: SWEEP_DURATION,
      ease: 'power1.in',
      onUpdate: draw,
      onComplete: () => {
        setTransitionSnapshot(null);
        setPhase('desktop');
      },
    });

    return () => {
      tween.kill();
    };
  }, [setPhase, setTransitionSnapshot, transitionSnapshot]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Desktop />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />
    </div>
  );
}
