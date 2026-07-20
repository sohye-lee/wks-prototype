export function DuotoneFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="duotone-dark" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.149 1" />
            <feFuncG type="table" tableValues="0.106 1" />
            <feFuncB type="table" tableValues="0.396 1" />
          </feComponentTransfer>
        </filter>
        {/* shadows -> #04E7FB, highlights -> #B7FF93 — used for the 3D
            model renders (phone / chatter) until the live dot-model shader
            replaces these with a static placeholder */}
        <filter id="duotone-cta" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0.299 0.587 0.114 0 0
                    0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.0157 0.7176" />
            <feFuncG type="table" tableValues="0.9059 1" />
            <feFuncB type="table" tableValues="0.9843 0.5765" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
