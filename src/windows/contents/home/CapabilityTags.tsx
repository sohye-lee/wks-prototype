const TAG_COLOR: Record<string, string> = {
  design: 'var(--brand-Cyan)',
  strategy: 'var(--brand-Green)',
  campaign: 'var(--brand-Cyan)',
  digital: 'var(--brand-Green)',
};

const TAG_HEIGHT = 21;
const NOTCH_WIDTH = 6;
const THIRD = TAG_HEIGHT / 3;

// deterministic per-index pseudo-random, so the notch pattern doesn't
// reshuffle on every re-render
function hash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

// a small vertical strip split into thirds, mostly `fill` with one third
// swapped to `notch` — mimics the reference's interlocking Lego-style tabs
// between adjacent tags (two of three thirds one color, one the other)
function Notch({ fill, notch, skipThird }: { fill: string; notch: string | null; skipThird: number }) {
  return (
    <div style={{ position: 'relative', width: NOTCH_WIDTH, height: TAG_HEIGHT, flexShrink: 0 }}>
      {[0, 1, 2].map((third) => {
        if (third === skipThird && !notch) return null;
        return (
          <div
            key={third}
            style={{
              position: 'absolute',
              top: third * THIRD,
              left: 0,
              width: NOTCH_WIDTH,
              height: THIRD,
              background: third === skipThird ? (notch ?? fill) : fill,
            }}
          />
        );
      })}
    </div>
  );
}

export function CapabilityTags({ tags }: { tags: string[] }) {
  const colors = tags.map((tag) => TAG_COLOR[tag] ?? 'var(--brand-Cyan)');

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {tags.map((tag, i) => (
        <div key={tag} style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              height: TAG_HEIGHT,
              padding: '0 6px',
              background: colors[i],
              color: '#000',
              fontFamily: 'var(--font-aeonik-mono)',
              fontSize: '14px',
              lineHeight: '90%',
              letterSpacing: '-0.56px',
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </span>
          {i < tags.length - 1 ? (
            <Notch fill={colors[i]} notch={colors[i + 1]} skipThird={Math.floor(hash(i) * 3)} />
          ) : (
            <Notch fill={colors[i]} notch={null} skipThird={Math.floor(hash(i + 1) * 3)} />
          )}
        </div>
      ))}
    </div>
  );
}
