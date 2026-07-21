'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// starts as a coarse 12x12-ish block mosaic; as the image scrolls from the
// bottom 30% of its scroll container up toward the middle, the blocks
// subdivide into progressively more (smaller) cells until the image reads
// as full resolution — ports wks-animations' pixelateReveal.js technique
// (downsample to a tiny canvas, then redraw with imageSmoothingEnabled=false)
// but driven by scroll progress instead of hover. Cell *count* increasing is
// what reveals detail — 1 cell would average the whole image into a single
// flat color, the opposite of resolved.
const START_CELLS = 12;
// the final cell count must reach the container's actual device-pixel width
// or a faint block pattern remains even at progress=1 — a fixed count (e.g.
// 200) looks sharp on small cards but stays visibly blocky on larger ones
const MIN_END_CELLS = 200;

interface PixelateRevealImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function PixelateRevealImage({ src, alt = '', className }: PixelateRevealImageProps) {
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
    let revealed = false;
    let cells = START_CELLS;
    let endCells = MIN_END_CELLS;

    function updateEndCells() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      endCells = Math.max(MIN_END_CELLS, Math.round(rect.width * dpr));
    }

    const img = new Image();
    img.onload = () => {
      ready = true;
      draw(cells);
    };
    img.src = src;

    const tiny = document.createElement('canvas');
    const tctx = tiny.getContext('2d')!;

    function drawCover(targetCtx: CanvasRenderingContext2D, dw: number, dh: number) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(dw / iw, dh / ih);
      const sw = dw / scale;
      const sh = dh / scale;
      targetCtx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, dw, dh);
    }

    function draw(cellCount: number) {
      if (!ready || cancelled) return;
      const rect = container!.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;

      const cols = Math.max(1, Math.round(cellCount));
      const rows = Math.max(1, Math.round(cellCount * (h / w)));
      tiny.width = cols;
      tiny.height = rows;
      drawCover(tctx, cols, rows);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tiny, 0, 0, cols, rows, 0, 0, w, h);
    }

    // find the nearest scrollable ancestor — the window's own content
    // viewport — rather than assuming the page itself scrolls
    let scroller: Element | Window = window;
    let node: HTMLElement | null = container.parentElement;
    while (node) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
        scroller = node;
        break;
      }
      node = node.parentElement;
    }

    updateEndCells();

    const trigger = ScrollTrigger.create({
      trigger: container,
      scroller,
      start: 'top 85%',
      end: 'top -15%',
      scrub: true,
      onUpdate(self) {
        if (revealed) return;
        // geometric (not linear) interpolation — perceived sharpness scales
        // with cell density roughly exponentially, so a linear ramp made the
        // image look "basically resolved" within the first ~20% of scroll
        const ratio = endCells / START_CELLS;
        cells = START_CELLS * Math.pow(ratio, self.progress);
        draw(cells);
        // once fully revealed, lock it — this is a one-time reveal, not a
        // scrubbed toggle, so scrolling back up must not re-pixelate it
        if (self.progress >= 1) {
          cells = endCells;
          revealed = true;
          trigger.kill();
        }
      },
    });

    const resizeObserver = new ResizeObserver(() => {
      updateEndCells();
      draw(cells);
      if (!revealed) trigger.refresh();
    });
    resizeObserver.observe(container);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      trigger.kill();
    };
  }, [src]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} role="img" aria-label={alt} style={{ display: 'block' }} />
    </div>
  );
}
