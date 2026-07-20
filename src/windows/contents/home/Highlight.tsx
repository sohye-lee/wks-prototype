import type { ReactNode } from 'react';

// the "highlighter marker" look on hero headlines — a yellow-green block
// multiply-blended behind the text, like a redaction pen used to emphasize
// instead of hide
export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span style={{ background: 'var(--brand-Green)', mixBlendMode: 'multiply' }}>{children}</span>
  );
}
