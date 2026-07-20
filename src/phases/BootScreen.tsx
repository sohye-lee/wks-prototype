'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAppStore } from '@/stores/useAppStore';

export default function BootScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const setPhase = useAppStore((s) => s.setPhase);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        delay: 0.3,
        onComplete: () => {
          sessionStorage.setItem('booted', 'true');
          setPhase('login');
        },
      });

      tl.set(barRef.current, { scaleX: 0, transformOrigin: 'left center' })
        .to(barRef.current, { scaleX: 0.3, duration: 0.3, ease: 'power1.out' })
        .to(barRef.current, { scaleX: 0.45, duration: 0.12, ease: 'steps(4)' })
        .to(barRef.current, { scaleX: 0.7, duration: 0.25, ease: 'power1.inOut' })
        .to(barRef.current, { scaleX: 0.78, duration: 0.08, ease: 'steps(2)' })
        .to(barRef.current, { scaleX: 1, duration: 0.25, ease: 'power2.in' })
        .to(
          containerRef.current,
          { opacity: 0.15, duration: 0.05, repeat: 3, yoyo: true },
          '+=0.05'
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      style={{ cursor: 'none' }}
    >
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="h-[3px] w-60 overflow-hidden rounded-full bg-white/15">
        <div ref={barRef} className="h-full w-full bg-white" />
      </div>
    </div>
  );
}
