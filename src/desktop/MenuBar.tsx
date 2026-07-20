'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useWindowStore } from '@/stores/useWindowStore';
import { useClockLabel } from '@/hooks/useClockLabel';
import { WksLogo } from '@/components/WksLogo';
import { HEADER_HEIGHT } from './layoutConstants';
import SettingsPanel from './SettingsPanel';

export default function MenuBar() {
  const open = useWindowStore((s) => s.open);
  const clock = useClockLabel();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [settingsOpen]);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        color: 'var(--desktop-fg)',
        // empty header space must never swallow clicks meant for a window
        // whose titlebar is dragged all the way up to this boundary
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        aria-label="Home"
        onClick={() => open('home')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          pointerEvents: 'auto',
        }}
      >
        <WksLogo size={20} color="currentColor" />
      </button>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          aria-label="Settings"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            padding: 4,
          }}
        >
          <Image
            src="/images/header/icon-setting.svg"
            alt=""
            width={16}
            height={16}
            className="icon-tint"
          />
        </button>
        {settingsOpen && <SettingsPanel />}
        <span style={{ fontSize: '13px' }}>{clock}</span>
      </div>
    </header>
  );
}
