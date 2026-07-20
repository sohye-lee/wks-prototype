'use client';

import type { ReactNode } from 'react';
import { useAppStore, type Mode } from '@/stores/useAppStore';

const MODES: { value: Mode; label: string; icon: ReactNode }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3.5" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <line x1="8" y1="1" x2="8" y2="2.5" />
          <line x1="8" y1="13.5" x2="8" y2="15" />
          <line x1="1" y1="8" x2="2.5" y2="8" />
          <line x1="13.5" y1="8" x2="15" y2="8" />
          <line x1="3.05" y1="3.05" x2="4.1" y2="4.1" />
          <line x1="11.9" y1="11.9" x2="12.95" y2="12.95" />
          <line x1="3.05" y1="12.95" x2="4.1" y2="11.9" />
          <line x1="11.9" y1="4.1" x2="12.95" y2="3.05" />
        </g>
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13 8.5A5.5 5.5 0 1 1 7.5 3a4.2 4.2 0 0 0 5.5 5.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    value: 'crazy',
    label: 'Crazy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SettingsPanel() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <div
      role="menu"
      className="settings-glass-panel"
      style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0 }}
    >
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          role="menuitemradio"
          aria-checked={mode === m.value}
          onClick={() => setMode(m.value)}
          className="settings-menu-item"
        >
          {m.icon}
          {m.label}
        </button>
      ))}
    </div>
  );
}
