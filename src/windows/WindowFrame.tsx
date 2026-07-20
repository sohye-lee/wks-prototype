'use client';

import { useRef, type PointerEvent, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useWindowStore, type WindowState } from '@/stores/useWindowStore';
import { WINDOW_MIN_SIZE, WINDOW_MAX_VIEWPORT_FRACTION, TITLEBAR_HEIGHT } from '@/desktop/layoutConstants';
import { CONTENT_REGISTRY } from './contentRegistry';

gsap.registerPlugin(Draggable, MotionPathPlugin);

interface WindowFrameProps {
  win: WindowState;
  boundsRef: RefObject<HTMLDivElement | null>;
  skipEntrance?: boolean;
}

type Point = { x: number; y: number };

// a gentle downward-bulging arc between two points, rather than a straight
// line — used for both the genie-out entrance and the genie-back-in exit
function arcPath(start: Point, end: Point): Point[] {
  const controlX = (start.x + end.x) / 2;
  const arcHeight = Math.max(60, Math.abs(end.y - start.y) * 0.4 + 40);
  const controlY = Math.max(start.y, end.y) + arcHeight;
  return [start, { x: controlX, y: controlY }, end];
}

export default function WindowFrame({ win, boundsRef, skipEntrance }: WindowFrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titlebarRef = useRef<HTMLDivElement>(null);
  const close = useWindowStore((s) => s.close);
  const focus = useWindowStore((s) => s.focus);
  const updatePosition = useWindowStore((s) => s.updatePosition);
  const updateSize = useWindowStore((s) => s.updateSize);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const el = rootRef.current;

      gsap.set(el, { transformOrigin: 'top left' });

      // Draggable must not be created while an entrance tween is still
      // touching this element's transform — a still-running tween's own
      // render tick can stomp Draggable's bounds-clamped position, letting
      // the window drift past its bounds on the very next drag. Only wire
      // up dragging once the element's transform has fully settled — and if
      // this effect gets cleaned up before that (React Strict Mode's
      // mount→cleanup→mount replay in dev), cancel the pending tween so its
      // onComplete never fires a Draggable setup for an abandoned instance.
      let draggable: Draggable | undefined;
      let tween: gsap.core.Tween | undefined;
      let cancelled = false;
      let raf = 0;
      function setupDraggable() {
        if (cancelled) return;
        // the bounds container can still read null here in some render
        // orderings (e.g. the very first auto-opened window) — retry next
        // frame rather than ever creating an unbounded Draggable
        if (!boundsRef.current) {
          raf = requestAnimationFrame(setupDraggable);
          return;
        }
        [draggable] = Draggable.create(el, {
          trigger: titlebarRef.current,
          bounds: boundsRef.current,
          onPress: () => focus(win.id),
          onDragEnd() {
            updatePosition(win.id, { x: this.x, y: this.y });
          },
        });
      }

      if (!skipEntrance && win.origin && !reducedMotion) {
        const path = arcPath(win.origin, win.position);
        gsap.set(el, { x: win.origin.x, y: win.origin.y, scale: 0.15, opacity: 0 });
        tween = gsap.to(el, {
          motionPath: { path, curviness: 1.25 },
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: setupDraggable,
        });
      } else if (!skipEntrance && !reducedMotion) {
        gsap.set(el, { x: win.position.x, y: win.position.y, scale: 0.95, opacity: 0 });
        tween = gsap.to(el, {
          scale: 1,
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: setupDraggable,
        });
      } else {
        gsap.set(el, { x: win.position.x, y: win.position.y, scale: 1, opacity: 1 });
        setupDraggable();
      }

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        tween?.kill();
        draggable?.kill();
      };
    },
    { dependencies: [win.id], scope: rootRef }
  );

  function handleClose() {
    const el = rootRef.current;
    if (!el) {
      close(win.id);
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      close(win.id);
      return;
    }

    if (win.origin) {
      const path = arcPath(win.position, win.origin).reverse();
      gsap.to(el, {
        motionPath: { path, curviness: 1.25 },
        scale: 0.15,
        opacity: 0,
        duration: 0.4,
        ease: 'power1.in',
        onComplete: () => close(win.id),
      });
    } else {
      gsap.to(el, {
        scale: 0.95,
        opacity: 0,
        duration: 0.2,
        ease: 'power1.in',
        onComplete: () => close(win.id),
      });
    }
  }

  function handleResizePointerDown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    focus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.size.w;
    const startH = win.size.h;
    const maxW = window.innerWidth * WINDOW_MAX_VIEWPORT_FRACTION;
    const maxH = window.innerHeight * WINDOW_MAX_VIEWPORT_FRACTION;

    function onMove(ev: globalThis.PointerEvent) {
      const w = Math.min(maxW, Math.max(WINDOW_MIN_SIZE.w, startW + (ev.clientX - startX)));
      const h = Math.min(maxH, Math.max(WINDOW_MIN_SIZE.h, startH + (ev.clientY - startY)));
      if (rootRef.current) {
        rootRef.current.style.width = `${w}px`;
        rootRef.current.style.height = `${h}px`;
      }
    }
    function onUp(ev: globalThis.PointerEvent) {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const w = Math.min(maxW, Math.max(WINDOW_MIN_SIZE.w, startW + (ev.clientX - startX)));
      const h = Math.min(maxH, Math.max(WINDOW_MIN_SIZE.h, startH + (ev.clientY - startY)));
      updateSize(win.id, { w, h });
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const Content = CONTENT_REGISTRY[win.contentKey];

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label={win.title}
      onPointerDown={() => focus(win.id)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: win.size.w,
        height: win.size.h,
        zIndex: win.zIndex,
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid var(--colour-teal-600, #01D4DF)',
        boxShadow: '8px 8px 20px 0 rgba(3, 118, 124, 0.25)',
        background: 'var(--window-body-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        ref={titlebarRef}
        style={{
          height: TITLEBAR_HEIGHT,
          flexShrink: 0,
          background: 'var(--window-titlebar-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <span>{win.title}</span>
        <button
          type="button"
          aria-label={`Close ${win.title}`}
          onClick={handleClose}
          style={{
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.6)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{Content ? <Content /> : null}</div>
      <div
        onPointerDown={handleResizePointerDown}
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 16,
          height: 16,
          cursor: 'nwse-resize',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
