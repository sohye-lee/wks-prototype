const TAG_COLOR: Record<string, string> = {
  design: 'var(--brand-Cyan)',
  strategy: 'var(--brand-Green)',
  campaign: 'var(--brand-Cyan)',
  digital: 'var(--brand-Green)',
};

export function CapabilityTags({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex',
            padding: '4px 6px',
            background: TAG_COLOR[tag] ?? 'var(--brand-Cyan)',
            color: '#000',
            fontFamily: 'var(--font-aeonik)',
            fontSize: '14px',
            lineHeight: '90%',
            letterSpacing: '-0.56px',
            textTransform: 'uppercase',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
