'use client';

import { create } from 'zustand';
import { FOLDERS } from '@/content/folders';
import { FOLDER_ICON_SIZE } from '@/desktop/layoutConstants';

interface FolderLayoutStore {
  positions: Record<string, { x: number; y: number }>;
  setPosition: (id: string, position: { x: number; y: number }) => void;
}

// positions here are relative to the bounds container, which already starts
// 40px below the header — so a plain 20 lands the icon 20px under the header
const GAP = 16;
const LABEL_HEIGHT = 20; // measured rendered height of the 13px label row below the icon
const STEP = FOLDER_ICON_SIZE + LABEL_HEIGHT + GAP;
const BASE_X = 28;
const BASE_Y = 20;

function defaultPositions() {
  return Object.fromEntries(FOLDERS.map((f, i) => [f.id, { x: BASE_X, y: BASE_Y + i * STEP }]));
}

// intentionally not persisted (unlike windows) — dragging a folder holds for
// the current page view, but any reload snaps every icon back to its default
// grid position, so the default layout is always one refresh away
export const useFolderLayoutStore = create<FolderLayoutStore>()((set) => ({
  positions: defaultPositions(),
  setPosition: (id, position) =>
    set((state) => ({ positions: { ...state.positions, [id]: position } })),
}));
