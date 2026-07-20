'use client';

import { useEffect, useState } from 'react';

export function useClockLabel() {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => {
      const parts = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).formatToParts(new Date());
      const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
      setLabel(
        `${get('weekday')} ${get('day')} ${get('month')} ${get('hour')}:${get('minute')} ${get('timeZoneName')}`
      );
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return label;
}
