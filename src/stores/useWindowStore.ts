'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getWindowMeta } from '@/content/folders';
import { TITLEBAR_HEIGHT } from '@/desktop/layoutConstants';

export interface WindowState {
  id: string;
  contentKey: string;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  zIndex: number;
  // the folder icon's position when this window was opened, if any — used
  // for the genie-style curved open/close animation, not touched afterward
  origin?: { x: number; y: number };
}

interface WindowStore {
  windows: WindowState[];
  nextZ: number;
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
  open: (contentKey: string, origin?: { x: number; y: number }) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  updatePosition: (id: string, pos: { x: number; y: number }) => void;
  updateSize: (id: string, size: { w: number; h: number }) => void;
}

const BASE_POSITION = { x: 280, y: 96 };

export const useWindowStore = create<WindowStore>()(
  persist(
    (set) => ({
      windows: [],
      nextZ: 10,
      initialized: false,
      setInitialized: (initialized) => set({ initialized }),

      open: (contentKey, origin) =>
        set((state) => {
          const existing = state.windows.find((w) => w.contentKey === contentKey);
          if (existing) {
            const zIndex = state.nextZ;
            return {
              windows: state.windows.map((w) => (w.id === existing.id ? { ...w, zIndex } : w)),
              nextZ: zIndex + 1,
            };
          }

          const meta = getWindowMeta(contentKey);
          const last = state.windows[state.windows.length - 1];
          const position = last
            ? { x: last.position.x, y: last.position.y + TITLEBAR_HEIGHT }
            : BASE_POSITION;

          const win: WindowState = {
            id: crypto.randomUUID(),
            contentKey,
            title: meta.title,
            position,
            size: meta.defaultSize,
            zIndex: state.nextZ,
            origin,
          };

          return { windows: [...state.windows, win], nextZ: state.nextZ + 1 };
        }),

      close: (id) => set((state) => ({ windows: state.windows.filter((w) => w.id !== id) })),

      focus: (id) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, zIndex: state.nextZ } : w)),
          nextZ: state.nextZ + 1,
        })),

      updatePosition: (id, position) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, position } : w)),
        })),

      updateSize: (id, size) =>
        set((state) => ({
          windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
        })),
    }),
    {
      name: 'wks-window-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
