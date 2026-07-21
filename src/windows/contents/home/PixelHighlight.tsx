'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

interface PixelHighlightProps {
  children: ReactNode;
  color?: string;
  /** seconds to wait before this highlight starts drawing in */
  startDelay?: number;
  /** seconds the left-to-right fill takes */
  duration?: number;
}

const CELL = 10;
const SCATTER = 0.35;
const BOX_HEIGHT_FRACTION = 0.7; // ~30% shorter than the full text line box

function resolveColor(value: string, el: Element): string {
  if (!value.startsWith('var(')) return value;
  const varName = value.slice(4, -1).split(',')[0].trim();
  return getComputedStyle(el).getPropertyValue(varName).trim() || '#D1FA17';
}

// the highlighter-marker box behind the text draws in left-to-right, but as
// a grid of blocks with per-row jitter (not a smooth sweep) so the growing
// edge reads as jagged/pixelated — finishing as a solid rectangle once full
export function PixelHighlight({
  children,
  color = '#D1FA17',
  startDelay = 0,
  duration = 0.7,
}: PixelHighlightProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fill = resolveColor(color, wrap);

    let cells: { x: number; y: number; threshold: number }[] = [];
    let w = 0;
    let h = 0;
    const state = { progress: reducedMotion ? 1 : 0 };

    function build() {
      const rect = wrap!.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height * BOX_HEIGHT_FRACTION));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.max(1, Math.ceil(w / CELL));
      const rows = Math.max(1, Math.ceil(h / CELL));
      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const base = c / cols;
          const jitter = (Math.random() - 0.5) * SCATTER;
          // floor above 0 so no cell can satisfy threshold <= progress while
          // progress is still exactly 0 during the pre-startDelay wait
          cells.push({
            x: c * CELL,
            y: r * CELL,
            threshold: Math.min(1, Math.max(0.02, base + jitter)),
          });
        }
      }
      draw();
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = fill;
      for (const cell of cells) {
        if (cell.threshold <= state.progress) {
          ctx!.fillRect(cell.x, cell.y, CELL, CELL);
        }
      }
    }

    build();

    const tween = reducedMotion
      ? null
      : gsap.to(state, {
          progress: 1,
          duration,
          delay: startDelay,
          ease: 'none',
          onUpdate: draw,
        });

    const resizeObserver = new ResizeObserver(() => build());
    resizeObserver.observe(wrap);

    return () => {
      tween?.kill();
      resizeObserver.disconnect();
    };
  }, [color, startDelay, duration]);

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: `${(1 - BOX_HEIGHT_FRACTION) * 50}%`,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative' }}>{children}</span>
    </span>
  );
}
