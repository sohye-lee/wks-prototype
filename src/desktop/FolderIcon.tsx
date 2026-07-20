'use client';

import { useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import { useWindowStore } from '@/stores/useWindowStore';
import { useFolderLayoutStore } from '@/stores/useFolderLayoutStore';
import { FOLDER_ICON_SIZE } from './layoutConstants';
import type { FolderMeta } from '@/content/folders';

gsap.registerPlugin(Draggable);

const ICON_SRC = {
  default: '/images/header/icon-folder-default.svg',
  hover: '/images/header/icon-folder-hover.svg',
  clicked: '/images/header/icon-folder-clicked.svg',
};

const DOUBLE_CLICK_MS = 350;
const MIN_CLICKED_VISIBLE_MS = 150;

interface FolderIconProps {
  folder: FolderMeta;
  boundsRef: RefObject<HTMLDivElement | null>;
}

export default function FolderIcon({ folder, boundsRef }: FolderIconProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const papersRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickRef = useRef(0);
  const visual = pressed ? 'clicked' : hovered ? 'hover' : 'default';

  const position = useFolderLayoutStore((s) => s.positions[folder.id]);
  const setPosition = useFolderLayoutStore((s) => s.setPosition);
  const open = useWindowStore((s) => s.open);

  useGSAP(
    () => {
      if (!rootRef.current || !position) return;
      gsap.set(rootRef.current, { x: position.x, y: position.y });

      // folders mount in the very first commit, in the same pass as the
      // bounds container itself — its ref can still read null this early,
      // so defer creation a frame to guarantee `bounds` is actually applied
      let draggable: Draggable | undefined;
      const raf = requestAnimationFrame(() => {
        [draggable] = Draggable.create(rootRef.current, {
          bounds: boundsRef.current ?? undefined,
          onDragEnd() {
            setPosition(folder.id, { x: this.x, y: this.y });
          },
        });
      });

      return () => {
        cancelAnimationFrame(raf);
        draggable?.kill();
      };
    },
    { dependencies: [folder.id], scope: rootRef }
  );

  function handleClick() {
    const now = Date.now();
    const isDouble = now - lastClickRef.current < DOUBLE_CLICK_MS;
    lastClickRef.current = now;

    const alreadyOpen = useWindowStore
      .getState()
      .windows.some((w) => w.contentKey === folder.contentKey);

    open(folder.contentKey, position);
    if (isDouble) playEmptyAnimation();
    else if (!alreadyOpen) playBounce();
  }

  function playBounce() {
    if (!iconRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap
      .timeline()
      .to(iconRef.current, { y: -14, duration: 0.15, ease: 'power2.out' })
      .to(iconRef.current, { y: 0, duration: 0.25, ease: 'bounce.out' })
      .to(iconRef.current, { y: -8, duration: 0.12, ease: 'power2.out' })
      .to(iconRef.current, { y: 0, duration: 0.2, ease: 'bounce.out' });
  }

  function playEmptyAnimation() {
    if (!papersRef.current) return;
    const papers = Array.from(papersRef.current.children);
    gsap.killTweensOf(papers);
    gsap.set(papers, { opacity: 1, x: 0, y: 0, rotation: 0 });
    papers.forEach((paper, i) => {
      gsap.to(paper, {
        x: gsap.utils.random(-40, 40),
        y: gsap.utils.random(-140, -80),
        rotation: gsap.utils.random(-45, 45),
        opacity: 0,
        duration: gsap.utils.random(0.5, 0.8),
        delay: i * 0.05,
        ease: 'power2.out',
      });
    });
    setHovered(false);
    setPressed(false);
  }

  function handlePointerDown() {
    if (pressedTimeoutRef.current) clearTimeout(pressedTimeoutRef.current);
    setPressed(true);
  }

  function handlePointerUp() {
    if (pressedTimeoutRef.current) clearTimeout(pressedTimeoutRef.current);
    pressedTimeoutRef.current = setTimeout(() => setPressed(false), MIN_CLICKED_VISIBLE_MS);
  }

  if (!position) return null;

  return (
    <div ref={rootRef} style={{ position: 'absolute', top: 0, left: 0, touchAction: 'none' }}>
      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // gap: '8px',
        }}
      >
        <span
          ref={iconRef}
          style={{ position: 'relative', width: FOLDER_ICON_SIZE, height: FOLDER_ICON_SIZE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ICON_SRC[visual]}
            alt=""
            width={FOLDER_ICON_SIZE}
            height={FOLDER_ICON_SIZE}
            draggable={false}
          />
          <span
            ref={papersRef}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: '12%',
                  top: '28%',
                  width: '76%',
                  height: '48%',
                  borderRadius: '2px',
                  background: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  opacity: 0,
                }}
              />
            ))}
          </span>
        </span>
        <span style={{ fontSize: '13px', maxWidth: '80px', lineHeight: 1, color: 'var(--desktop-fg)' }}>{folder.title}</span>
      </button>
    </div>
  );
}
