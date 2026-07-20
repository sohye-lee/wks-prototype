'use client';

import { useState, type RefObject } from 'react';
import { useWindowStore } from '@/stores/useWindowStore';
import WindowFrame from './WindowFrame';

interface WindowManagerProps {
  boundsRef: RefObject<HTMLDivElement | null>;
}

export default function WindowManager({ boundsRef }: WindowManagerProps) {
  const windows = useWindowStore((s) => s.windows);
  // windows already present at mount were restored from a persisted session,
  // not just opened — they should appear instantly, not genie in from a folder
  const [restoredIds] = useState(
    () => new Set(useWindowStore.getState().windows.map((w) => w.id))
  );

  return (
    <>
      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          win={win}
          boundsRef={boundsRef}
          skipEntrance={restoredIds.has(win.id)}
        />
      ))}
    </>
  );
}
