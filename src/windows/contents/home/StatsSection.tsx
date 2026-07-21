'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './StatsSection.module.scss';
import { Tag } from './Tag';
import { STATS } from '@/content/stats';
import { parsePathSegments, positionAt, computeZTiers, type PathSegment } from './motionPath';

gsap.registerPlugin(ScrollTrigger);

const STAT_REPEAT = 5;
const PX_PER_STEP = 260;
const EXTRA_SCROLL = PX_PER_STEP * STATS.length;
const Z_HIGH = 30;
const Z_MID = 20;
const Z_LOW = 10;
const DESKTOP_BREAKPOINT = 768;
const SRC = {
  desktop: '/images/home/path-desktop.svg',
  mobile: '/images/home/path-mobile.svg',
};

interface PathData {
  segments: PathSegment[];
  viewW: number;
  viewH: number;
  zTiers: number[];
}

const pathCache: Partial<Record<'desktop' | 'mobile', PathData>> = {};

async function loadPath(which: 'desktop' | 'mobile'): Promise<PathData> {
  const cached = pathCache[which];
  if (cached) return cached;
  const res = await fetch(SRC[which]);
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svgEl = doc.querySelector('svg')!;
  const d = doc.querySelector('path')!.getAttribute('d')!;
  const segments = parsePathSegments(d);
  const data: PathData = {
    segments,
    viewW: parseFloat(svgEl.getAttribute('width')!),
    viewH: parseFloat(svgEl.getAttribute('height')!),
    zTiers: computeZTiers(segments),
  };
  pathCache[which] = data;
  return data;
}

// ports wks-animations' motionCards.js: N cards travel together along a
// closed SVG path (a 6-point "flower" loop), one scroll-locked step apart.
// The reference holds the cards in place with a position:fixed + manual
// onEnter/onLeave toggle; GSAP ScrollTrigger's `pin` is the natural
// equivalent, but its spacer fails to reserve extra scroll room when nested
// this deep under a transformed, overflow:hidden window frame (confirmed
// with an isolated repro — even a bare test div pinned in this exact DOM
// spot keeps its spacer at natural size). Native CSS `position: sticky`
// doesn't have that failure mode, so it holds .stage in view instead, while
// ScrollTrigger (no pin) just drives progress from scroll position.
export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    let trigger: ScrollTrigger | null = null;
    let currentIsDesktop: boolean | null = null;

    // window content divs use native overflow:auto, not the page itself —
    // find the actual scroll parent
    let scroller: Element | Window = window;
    let node: HTMLElement | null = section.parentElement;
    while (node) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
        scroller = node;
        break;
      }
      node = node.parentElement;
    }

    function draw(data: PathData, progress: number, isDesktop: boolean) {
      const n = data.segments.length;
      cardRefs.current.forEach((card, k) => {
        if (!card) return;
        const [x, y] = positionAt(data.segments, progress + k);
        const cw = card.offsetWidth;
        const ch = card.offsetHeight;
        gsap.set(card, { x: x - cw / 2, y: y - ch / 2 });
        if (isDesktop) {
          const idx = Math.round((((progress + k) % n) + n) % n) % n;
          const tier = data.zTiers[idx];
          card.style.zIndex = String(tier === 3 ? Z_HIGH : tier === 2 ? Z_MID : Z_LOW);
        } else {
          card.style.zIndex = '1';
        }
      });
    }

    async function setup(isDesktop: boolean) {
      currentIsDesktop = isDesktop;
      const data = await loadPath(isDesktop ? 'desktop' : 'mobile');
      if (cancelled) return;

      stage!.style.width = `${data.viewW}px`;
      stage!.style.height = `${data.viewH}px`;

      if (reducedMotion) {
        section!.style.height = 'auto';
        draw(data, 0, isDesktop);
        return;
      }

      section!.style.height = `calc(100vh + ${EXTRA_SCROLL}px)`;

      trigger?.kill();
      trigger = ScrollTrigger.create({
        trigger: section,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => draw(data, self.progress * STATS.length, isDesktop),
      });
      draw(data, 0, isDesktop);
    }

    setup(window.innerWidth >= DESKTOP_BREAKPOINT);

    function handleResize() {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      if (isDesktop !== currentIsDesktop) setup(isDesktop);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
      trigger?.kill();
    };
  }, []);

  return (
    <>
      <section ref={sectionRef} className={styles.section}>
        <div className={styles.stickyViewport}>
          <div ref={stageRef} className={styles.stage}>
            {STATS.map((stat, i) => (
              <div
                key={`${stat.eyebrow}-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={styles.card}
              >
                <p className={styles.eyebrow}>{stat.eyebrow}</p>
                <div className={styles.stats}>
                  {Array.from({ length: STAT_REPEAT }, (_, j) => (
                    <p key={j} className={styles.value}>
                      {stat.value}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      <div className={styles.ctas}>
        <Tag>see careers</Tag>
        <Tag>contact us</Tag>
      </div>
      </section>
    </>
  );
}
