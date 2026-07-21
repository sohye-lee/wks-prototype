'use client';

import { useEffect, useRef, useState, type Ref } from 'react';
import gsap from 'gsap';
import { HEADER_HEIGHT } from './layoutConstants';
import { FAKE_NOTIFICATIONS, type FakeNotification } from '@/content/notifications';

const FIRST_DELAY_MS = 3000;
const MIN_GAP_MS = 2000;
const MAX_GAP_MS = 5000;
const CARD_WIDTH = 320;

interface ActiveNotification extends FakeNotification {
  key: number;
}

function NotificationCard({
  n,
  onDismiss,
  cardRef,
}: {
  n: ActiveNotification;
  onDismiss: (key: number) => void;
  cardRef?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={cardRef} className="notification-glass-panel">
      <button
        type="button"
        className="notification-close"
        aria-label={`Close ${n.app} notification`}
        onClick={() => onDismiss(n.key)}
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
      <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-aeonik)', fontWeight: 600, fontSize: 13 }}>{n.title}</p>
      <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-aeonik)', fontSize: 13, lineHeight: 1.3, opacity: 0.9 }}>
        {n.body}
      </p>
    </div>
  );
}

// a fake macOS-style notification stack — starts a few seconds after the
// desktop loads, then drips in occasional joke/real notifications, never
// repeating one already shown. "Already shown" is tracked purely in memory
// (not sessionStorage) so a refresh intentionally starts the drip over —
// this is a decorative loop, not state worth surviving a reload. Stacks
// newest-at-bottom, with per-card close (on hover) and a "Clear All" once
// more than one is queued.
export default function FakeNotifications() {
  const [active, setActive] = useState<ActiveNotification[]>([]);
  const keyRef = useRef(0);
  const prevCountRef = useRef(0);
  const shownRef = useRef<Set<string>>(new Set());
  const latestCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNext(delay: number) {
      timeoutId = setTimeout(() => {
        if (cancelled) return;

        const remaining = FAKE_NOTIFICATIONS.filter((n) => !shownRef.current.has(n.id));
        if (remaining.length === 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.info('[FakeNotifications] all notifications shown this load — none left to queue');
          }
          return;
        }

        // the WKS News item (index 0) always leads if it hasn't shown yet;
        // otherwise pick randomly from whatever's left
        const next =
          remaining.find((n) => n.id === FAKE_NOTIFICATIONS[0].id) ??
          remaining[Math.floor(Math.random() * remaining.length)];

        shownRef.current.add(next.id);
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
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (latestCardRef.current && !reducedMotion) {
        gsap.fromTo(latestCardRef.current, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });
      }
    }
    prevCountRef.current = active.length;
  }, [active.length]);

  if (active.length === 0) return null;

  function dismiss(key: number) {
    setActive((prev) => prev.filter((n) => n.key !== key));
  }

  const newestKey = active[active.length - 1].key;

  return (
    <div style={{ position: 'fixed', top: HEADER_HEIGHT + 12, right: 12, zIndex: 999, width: CARD_WIDTH }}>
      {active.length > 1 && (
        // positioned out of flow so its presence never shifts the stack
        // below it — the first notification stays exactly where it landed
        <button
          type="button"
          className="notification-clear-all"
          style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6 }}
          onClick={() => setActive([])}
        >
          Clear All
        </button>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.map((n) => (
          <NotificationCard
            key={n.key}
            n={n}
            onDismiss={dismiss}
            cardRef={n.key === newestKey ? latestCardRef : undefined}
          />
        ))}
      </div>
    </div>
  );
}
