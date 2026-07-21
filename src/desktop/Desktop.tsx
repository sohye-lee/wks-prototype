'use client';

import { useEffect, useRef } from 'react';
import { useWindowStore } from '@/stores/useWindowStore';
import { FOLDERS } from '@/content/folders';
import MenuBar from './MenuBar';
import FolderIcon from './FolderIcon';
import WindowManager from '@/windows/WindowManager';
import CrazyModeOverlay from '@/effects/CrazyModeOverlay';
import FakeNotifications from './FakeNotifications';
import { HEADER_HEIGHT } from './layoutConstants';

export default function Desktop() {
  const boundsRef = useRef<HTMLDivElement>(null);
  const initialized = useWindowStore((s) => s.initialized);
  const setInitialized = useWindowStore((s) => s.setInitialized);
  const open = useWindowStore((s) => s.open);

  useEffect(() => {
    if (initialized) return;
    open('home');
    setInitialized(true);
  }, [initialized, open, setInitialized]);

  return (
    <div
      id="wks-desktop-root"
      className="fixed inset-0 overflow-hidden"
      style={{ background: 'var(--desktop-bg)', color: 'var(--desktop-fg)' }}
    >
      <MenuBar />
      <div
        ref={boundsRef}
        style={{ position: 'absolute', top: HEADER_HEIGHT, left: 0, right: 0, bottom: 0 }}
      >
        {FOLDERS.map((folder) => (
          <FolderIcon key={folder.id} folder={folder} boundsRef={boundsRef} />
        ))}
        <WindowManager boundsRef={boundsRef} />
      </div>
      <CrazyModeOverlay />
      <FakeNotifications />
    </div>
  );
}
