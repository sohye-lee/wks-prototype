import type { ReactNode } from 'react';

export function Tag({
  children,
  color = 'var(--brand-Cyan)',
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '4px 6px',
        background: color,
        color: '#000',
        fontFamily: 'var(--font-aeonik-mono)',
        fontSize: '14px',
        lineHeight: '90%',
        letterSpacing: '-0.56px',
        textTransform: 'uppercase',
        cursor: 'pointer'
      }}
    >
      {children}
    </span>
  );
}
