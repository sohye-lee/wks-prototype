'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Phase = 'init' | 'booting' | 'login' | 'hacking' | 'desktop';
export type Mode = 'light' | 'dark' | 'crazy';

interface AppStore {
  phase: Phase;
  mode: Mode;
  // snapshot of the login screen, captured right before the hacking transition
  // so it can dissolve away as its own actual pixels instead of a generic overlay
  transitionSnapshot: HTMLCanvasElement | null;
  setPhase: (phase: Phase) => void;
  setMode: (mode: Mode) => void;
  setTransitionSnapshot: (snapshot: HTMLCanvasElement | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      phase: 'init',
      mode: 'light',
      transitionSnapshot: null,
      setPhase: (phase) => set({ phase }),
      setMode: (mode) => set({ mode }),
      setTransitionSnapshot: (transitionSnapshot) => set({ transitionSnapshot }),
    }),
    {
      name: 'wks-app-store',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
