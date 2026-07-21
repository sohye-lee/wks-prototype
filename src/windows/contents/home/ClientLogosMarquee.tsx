'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ClientLogosMarquee.module.scss';
import type { ClientLogo } from '@/content/clients';

gsap.registerPlugin(ScrollTrigger);

const LOGO_HEIGHT = 240;
const GAP = 32;
const SPACING = LOGO_HEIGHT + GAP;
const POP_DURATION = 1.8;
const POP_STAGGER = 0.45;
const ARC_HEIGHT = 36;
const LOOP_DURATION = 60;

interface ClientLogosMarqueeProps {
  logos: ClientLogo[];
}

// on first entering view, each logo scales up from 0 and travels from the
// mouth's center out to its slot along a slight upward arc (two-phase
// keyframe tween — up-and-over, then settle) with a per-logo stagger; once
// the last one lands, the whole (doubled, for a seamless wrap) track starts
// drifting left forever
export function ClientLogosMarquee({ logos }: ClientLogosMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!viewport || !track || !firstSet) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slots = Array.from(firstSet.children) as HTMLElement[];

    function startMarquee() {
      if (reducedMotion) return;
      gsap.to(track, { xPercent: -50, duration: LOOP_DURATION, ease: 'none', repeat: -1 });
    }

    if (reducedMotion) {
      gsap.set(slots, { x: 0, y: 0, scale: 1, opacity: 1 });
      return;
    }

    const centerX = viewport.getBoundingClientRect().width / 2;
    const tl = gsap.timeline({ onComplete: startMarquee, paused: true });

    slots.forEach((el, i) => {
      const slotX = i * SPACING + SPACING / 2;
      const dx = centerX - slotX;
      tl.fromTo(
        el,
        { x: dx, y: 0, scale: 0, opacity: 0 },
        {
          keyframes: [
            { x: dx * 0.45, y: -ARC_HEIGHT, scale: 1, opacity: 1, duration: POP_DURATION * 0.5, ease: 'power2.out' },
            { x: 0, y: 0, duration: POP_DURATION * 0.5, ease: 'power2.in' },
          ],
        },
        i * POP_STAGGER
      );
    });

    // scoped scroller discovery — window content divs use native
    // overflow:auto, not the page itself, so find the actual scroll parent
    let scroller: Element | Window = window;
    let node: HTMLElement | null = viewport.parentElement;
    while (node) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) {
        scroller = node;
        break;
      }
      node = node.parentElement;
    }

    const trigger = ScrollTrigger.create({
      trigger: viewport,
      scroller,
      start: 'top 80%',
      once: true,
      onEnter: () => tl.play(0),
    });

    return () => {
      tl.kill();
      trigger.kill();
    };
  }, []);

  const renderSlots = (keyPrefix: string) =>
    logos.map((logo, i) => (
      <div key={`${keyPrefix}-${logo.name}-${i}`} className={styles.slot} style={{ left: i * SPACING }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt={logo.name} className={styles.logoImage} style={{ height: LOGO_HEIGHT }} />
      </div>
    ));

  const setWidth = logos.length * SPACING;

  return (
    <div ref={viewportRef} className={styles.viewport}>
      <div ref={trackRef} className={styles.track} style={{ width: setWidth * 2 }}>
        <div ref={firstSetRef} className={styles.set} style={{ width: setWidth }}>
          {renderSlots('a')}
        </div>
        <div className={styles.set} style={{ width: setWidth, left: setWidth }}>
          {renderSlots('b')}
        </div>
      </div>
    </div>
  );
}
