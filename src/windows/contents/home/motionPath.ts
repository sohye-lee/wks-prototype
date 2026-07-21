export interface PathSegment {
  p0: [number, number];
  c1: [number, number];
  c2: [number, number];
  p1: [number, number];
}

// parses the specific "M x y C x1 y1 x2 y2 x y C ... Z" shape Figma exports
// for path-desktop.svg / path-mobile.svg — not a general SVG path parser,
// ported from wks-animations' motionCards.js
export function parsePathSegments(d: string): PathSegment[] {
  const nums = d
    .replace(/[MCZ]/g, ' ')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const start: [number, number] = [nums[0], nums[1]];
  const segments: PathSegment[] = [];
  let prev = start;
  for (let i = 2; i + 6 <= nums.length; i += 6) {
    const c1: [number, number] = [nums[i], nums[i + 1]];
    const c2: [number, number] = [nums[i + 2], nums[i + 3]];
    const p1: [number, number] = [nums[i + 4], nums[i + 5]];
    segments.push({ p0: prev, c1, c2, p1 });
    prev = p1;
  }
  return segments;
}

function cubicPoint(seg: PathSegment, t: number): [number, number] {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * seg.p0[0] + b * seg.c1[0] + c * seg.c2[0] + d * seg.p1[0],
    a * seg.p0[1] + b * seg.c1[1] + c * seg.c2[1] + d * seg.p1[1],
  ];
}

// progress is continuous; integers land exactly on path vertices, cycling
// through the loop (segments.length segments)
export function positionAt(segments: PathSegment[], progress: number): [number, number] {
  const n = segments.length;
  const p = ((progress % n) + n) % n;
  const idx = Math.floor(p);
  return cubicPoint(segments[idx], p - idx);
}

// topmost vertex gets the highest z-tier, next two get a middle tier, the
// rest stay at the base tier — used so cards passing near the top of the
// loop render in front of cards near the bottom
export function computeZTiers(segments: PathSegment[]): number[] {
  const n = segments.length;
  const order = segments.map((_, i) => i).sort((a, b) => segments[a].p0[1] - segments[b].p0[1]);
  const tiers = new Array(n).fill(1);
  if (order[0] !== undefined) tiers[order[0]] = 3;
  if (order[1] !== undefined) tiers[order[1]] = 2;
  if (order[2] !== undefined) tiers[order[2]] = 2;
  return tiers;
}
