'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HEADER_HEIGHT } from './layoutConstants';
import { FAKE_NOTIFICATIONS, type FakeNotification } from '@/content/notifications';

const SHOWN_KEY = 'wks-shown-notifications';
const FIRST_DELAY_MS = 5000;
const MIN_GAP_MS = 15000;
const MAX_GAP_MS = 35000;

function getShownIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SHOWN_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function markShown(id: string) {
  const shown = getShownIds();
  if (!shown.includes(id)) {
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...shown, id]));
  }
}

interface ActiveNotification extends FakeNotification {
  key: number;
}

// a fake macOS-style notification stack — starts a few seconds after the
// desktop loads, then drips in occasional joke/real notifications (never
// repeating one already shown this session, tracked via sessionStorage so a
// refresh mid-session doesn't replay them), stacking newest-at-bottom, with
// per-card close (on hover) and a "Clear All" once more than one is queued
export default function FakeNotifications() {
  const [active, setActive] = useState<ActiveNotification[]>([]);
  const keyRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNext(delay: number) {
      timeoutId = setTimeout(() => {
        if (cancelled) return;

        const shown = getShownIds();
        const remaining = FAKE_NOTIFICATIONS.filter((n) => !shown.includes(n.id));
        if (remaining.length === 0) return; // exhausted for this session

        // the WKS News item (index 0) always leads if it hasn't shown yet;
        // otherwise pick randomly from whatever's left
        const next =
          remaining.find((n) => n.id === FAKE_NOTIFICATIONS[0].id) ??
          remaining[Math.floor(Math.random() * remaining.length)];

        markShown(next.id);
        keyRef.current += 1;
        setActive((prev) => [...prev, { ...next, key: keyRef.current }]);

        scheduleNext(MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS));
      }, delay);
    }

    scheduleNext(FIRST_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (active.length > prevCountRef.current) {
      const cards = listRef.current?.children;
      const last = cards?.[cards.length - 1] as HTMLElement | undefined;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (last && !reducedMotion) {
        gsap.fromTo(last, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
      }
    }
    prevCountRef.current = active.length;
  }, [active.length]);

  if (active.length === 0) return null;

  function dismiss(key: number) {
    setActive((prev) => prev.filter((n) => n.key !== key));
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: HEADER_HEIGHT + 12,
        right: 12,
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 6,
      }}
    >
      {active.length > 1 && (
        <button type="button" className="notification-clear-all" onClick={() => setActive([])}>
          Clear All
        </button>
      )}
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {active.map((n) => (
          <div key={n.key} className="notification-glass-panel">
            <button
              type="button"
              className="notification-close"
              aria-label={`Close ${n.app} notification`}
              onClick={() => dismiss(n.key)}
            >
              ×
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-aeonik-mono)', fontSize: 11, opacity: 0.9, textTransform: 'uppercase' }}>
                {n.app}
              </span>
              <span className="notification-timestamp" style={{ fontFamily: 'var(--font-aeonik-mono)', fontSize: 10, opacity: 0.55 }}>
                now
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-aeonik)', fontWeight: 600, fontSize: 13 }}>
              {n.title}
            </p>
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-aeonik)', fontSize: 13, lineHeight: 1.3, opacity: 0.9 }}>
              {n.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
