'use client';

import { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import { useAppStore } from '@/stores/useAppStore';

const CELL = 28;
const REFERENCE_OPACITY = 0.5;
const PATTERN_COLOR = '#00F2FF';
const SETTLE_DELAY = 400;
// cells brighter than this are treated as empty background and left blank,
// so the pattern traces content/edges instead of tiling solid over white space
const BACKGROUND_LUM_THRESHOLD = 0.88;

type Shape = 'square' | 'circle' | 'ring' | 'diamond';
const SHAPES: Shape[] = ['ring', 'diamond', 'circle', 'square'];

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, cx: number, cy: number, size: number) {
  ctx.fillStyle = PATTERN_COLOR;
  ctx.strokeStyle = PATTERN_COLOR;
  ctx.lineWidth = Math.max(1, size * 0.16);
  switch (shape) {
    case 'square': {
      const s = size * 0.72;
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ring': {
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'diamond': {
      const r = size * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
}

// re-captures the desktop and repaints it as a brand shape-grid whenever an
// interaction settles (drag end / scroll stop / resize) rather than every
// frame — a live 60fps DOM screenshot isn't feasible, this is the tradeoff
export default function CrazyModeOverlay() {
  const mode = useAppStore((s) => s.mode);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode !== 'crazy') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let rafId: number | null = null;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    async function render() {
      const target = document.getElementById('wks-desktop-root');
      if (!target || cancelled || !canvasRef.current) return;

      const snapshot = await html2canvas(target, {
        scale: 1,
        ignoreElements: (el) => el === canvasRef.current,
      });
      if (cancelled || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = REFERENCE_OPACITY;
      ctx.drawImage(snapshot, 0, 0, width, height);
      ctx.globalAlpha = 1;

      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const tiny = document.createElement('canvas');
      tiny.width = cols;
      tiny.height = rows;
      const tinyCtx = tiny.getContext('2d')!;
      tinyCtx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, cols, rows);
      const { data } = tinyCtx.getImageData(0, 0, cols, rows);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 4;
          const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
          if (lum >= BACKGROUND_LUM_THRESHOLD) continue;
          const shape = SHAPES[Math.min(SHAPES.length - 1, Math.floor(lum * SHAPES.length))];
          drawShape(ctx, shape, c * CELL + CELL / 2, r * CELL + CELL / 2, CELL);
        }
      }
    }

    function scheduleRender() {
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(() => {
        rafId = requestAnimationFrame(render);
      }, SETTLE_DELAY);
    }

    scheduleRender();
    window.addEventListener('scroll', scheduleRender, true);
    window.addEventListener('resize', scheduleRender);
    window.addEventListener('pointerup', scheduleRender);

    return () => {
      cancelled = true;
      if (settleTimer) clearTimeout(settleTimer);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleRender, true);
      window.removeEventListener('resize', scheduleRender);
      window.removeEventListener('pointerup', scheduleRender);
    };
  }, [mode]);

  if (mode !== 'crazy') return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
    />
  );
}
