'use client';

import { FormEvent, useRef, useState } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas-pro';
import gsap from 'gsap';
import { useAppStore } from '@/stores/useAppStore';
import { useClockLabel } from '@/hooks/useClockLabel';
import { WksLogo } from '@/components/WksLogo';
import { INTRO_WALLPAPERS } from '@/content/wallpapers';

export default function LoginScreen() {
  const setPhase = useAppStore((s) => s.setPhase);
  const setTransitionSnapshot = useAppStore((s) => s.setTransitionSnapshot);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [wallpaper] = useState(
    () => INTRO_WALLPAPERS[Math.floor(Math.random() * INTRO_WALLPAPERS.length)]
  );
  const clock = useClockLabel();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password.trim().toLowerCase() === 'password') {
      setError(true);
      if (inputWrapperRef.current) {
        gsap.fromTo(
          inputWrapperRef.current,
          { x: 0 },
          { x: 8, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'x' }
        );
      }
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setPhase('desktop');
      return;
    }

    if (containerRef.current) {
      const snapshot = await html2canvas(containerRef.current, { scale: 1 });
      setTransitionSnapshot(snapshot);
    }
    setPhase('hacking');
  }

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden">
      <Image src={wallpaper} alt="" fill priority sizes="100vw" className="object-cover" />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 45%, rgba(0, 242, 255, 0.35) 100%)',
        }}
      />

      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-white">
        <Image src="/images/header/icon-alien.svg" alt="" width={16} height={16} />
        <span>{clock}</span>
      </div>

      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
        <WksLogo />
{/* 
        <div
          aria-hidden="true"
          className="h-[280px] w-[280px] overflow-hidden rounded-3xl bg-black/10"
        /> */}

        <div className="flex flex-col items-center gap-3">
          <h1
            className="m-0"
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'var(--font-aeonik)',
              fontSize: '36px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '90%',
              letterSpacing: '-1.44px',
            }}
          >
            Top Secret!!!!
          </h1>
          <p
            className="m-0"
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'var(--font-aeonik)',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '90%',
              letterSpacing: '-0.8px',
            }}
          >
            Reminder: The password is PASSWORD
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2">
        <div className="flex w-full gap-2">
          <div
            ref={inputWrapperRef}
            className="focus-within:ring-2 focus-within:ring-[rgba(0,242,255,0.5)]"
            style={{
              display: 'flex',
              padding: '6px',
              alignItems: 'center',
              gap: '8px',
              flex: '1 0 0',
              borderRadius: '2px',
              border: '1px solid rgba(0, 242, 255, 0.20)',
              background: 'var(--greyscale-White)',
            }}
          >
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Password"
              aria-label="Password"
              autoFocus
              autoComplete="off"
              className="w-full outline-none placeholder:text-[var(--greyscale-Grey-200)]"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#000',
                fontFamily: 'var(--font-aeonik)',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              display: 'flex',
              padding: '4px 6px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              alignSelf: 'stretch',
              borderRadius: '2px',
              background: 'var(--brand-Green)',
              color: 'var(--greyscale-Black)',
              fontFamily: 'var(--font-aeonik)',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '90%',
              letterSpacing: '-0.56px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4.0013 10.6666H13.3346V9.33329H4.0013V10.6666ZM2.66797 10.6666H4.0013V2.66663H2.66797V10.6666Z"
                fill="black"
                />
              <path
                d="M10.6693 6.66663H9.33594V12H10.6693V6.66663ZM12.0026 7.99996H10.6693V9.33329H12.0026V7.99996ZM12.0026 10.6666H10.6693V12H12.0026V10.6666ZM10.6693 12H9.33594V13.3333H10.6693V12Z"
                fill="black"
                />
            </svg>
                Login
          </button>
        </div>
          {error && (
            <p
              role="alert"
              className="m-0 text-xs"
              style={{ color: '#000', fontFamily: 'var(--font-aeonik)' }}
            >
              Nice try — that&apos;s not it.
            </p>
          )}
        </form>

        {/* <button
          type="button"
          onClick={() => setPhase('desktop')}
          className="text-xs text-black/50 underline underline-offset-2"
        >
          Skip intro
        </button> */}
      </div>
    </div>
  );
}
