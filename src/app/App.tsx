'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import BootScreen from '@/phases/BootScreen';
import LoginScreen from '@/phases/LoginScreen';
import HackTransition from '@/phases/HackTransition';
import Desktop from '@/desktop/Desktop';

export default function App() {
  const phase = useAppStore((s) => s.phase);
  const mode = useAppStore((s) => s.mode);
  const setPhase = useAppStore((s) => s.setPhase);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  useEffect(() => {
    if (phase !== 'init') return;
    const hasBooted = sessionStorage.getItem('booted');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(hasBooted || reducedMotion ? 'login' : 'booting');
  }, [phase, setPhase]);

  switch (phase) {
    case 'init':
      return null;
    case 'booting':
      return <BootScreen />;
    case 'login':
      return <LoginScreen />;
    case 'hacking':
      return <HackTransition />;
    case 'desktop':
      return <Desktop />;
  }
}
