'use client';

import { useEffect, useRef } from 'react';

interface PixelSilhouetteProps {
  src: string;
  color?: string;
  cellSize?: number;
  alphaThreshold?: number;
  /** cells brighter than this (e.g. teeth, painted as light gray, not as an alpha hole) are left transparent too */
  luminanceThreshold?: number;
  className?: string;
}

// downsamples the source image into a grid, then fills each qualifying cell
// solid — a clean, fully-covered silhouette (no shape variety, no gaps) so
// photo detail like the gap between teeth reads as crisp, jagged-edged
// cutouts rather than a textured mosaic. Filling needs both alpha AND
// luminance thresholds: this source's teeth aren't punched-out alpha holes,
// they're just lighter grayscale pixels inside the same opaque region as
// the rest of the mouth — alpha alone can't separate them from the lips.
export function PixelSilhouette({
  src,
  color = '#00F2FF',
  cellSize = 6,
  alphaThreshold = 0.35,
  luminanceThreshold = 0.55,
  className,
}: PixelSilhouetteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;
    const ctx = context;

    let cancelled = false;
    let ready = false;

    const img = new Image();
    img.onload = () => {
      ready = true;
      draw();
    };
    img.src = src;

    const sample = document.createElement('canvas');
    const sctx = sample.getContext('2d')!;

    function draw() {
      if (!ready || cancelled) return;
      const rect = container!.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;

      const cols = Math.max(1, Math.round(w / cellSize));
      const rows = Math.max(1, Math.round(h / cellSize));
      sample.width = cols;
      sample.height = rows;
      sctx.clearRect(0, 0, cols, rows);
      sctx.drawImage(img, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      const cellW = w / cols;
      const cellH = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const alpha = data[i + 3] / 255;
          const luminance = data[i] / 255; // source is grayscale, R===G===B
          if (alpha < alphaThreshold || luminance > luminanceThreshold) continue;
          ctx.fillRect(c * cellW, r * cellH, cellW + 1, cellH + 1);
        }
      }
    }

    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
    };
  }, [src, color, cellSize, alphaThreshold, luminanceThreshold]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
