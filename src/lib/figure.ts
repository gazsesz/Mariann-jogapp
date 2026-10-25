import type { Figure } from './types';

// Pálcikafigura-geometria az ászanatár (docs/aszanatar.html) rajzolójából.
// Szögek fokban: 0 = fel, 90 = előre.

export const FIG_W = 140;
export const FIG_H = 112;
export const FLOOR = 102;
const L = { torso: 28, neck: 9, head: 6.2, ua: 15, fa: 14, th: 21, sh: 21 };

type Pt = [number, number];
const dir = (a: number): Pt => {
  const r = (a * Math.PI) / 180;
  return [Math.sin(r), -Math.cos(r)];
};
const add = (p: Pt, a: number, len: number): Pt => {
  const d = dir(a);
  return [p[0] + d[0] * len, p[1] + d[1] * len];
};

export interface FigureShapes {
  far: string[];
  near: string[];
  torso: string;
  neck: string;
  head: { cx: number; cy: number; r: number };
  eye?: { cx: number; cy: number; r: number };
  wallX?: number;
  strap?: string;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function figureShapes(f: Figure): FigureShapes {
  const ts = f.ts ?? 1;
  const hip: Pt = [0, 0];
  const neck = add(hip, f.t, L.torso * ts);
  const sh = add(hip, f.t, L.torso * ts - 2);
  const hd = f.h ?? f.t;
  const head = add(neck, hd, L.neck);
  const limb = (o: Pt, s: number[], ln1: number, ln2: number): Pt[] => {
    const k = s[2] ?? 1;
    const j = add(o, s[0], ln1 * k);
    return [o, j, add(j, s[1], ln2 * k)];
  };
  const P = {
    a: limb(sh, f.a, L.ua, L.fa),
    b: limb(sh, f.b, L.ua, L.fa),
    l: limb(hip, f.l, L.th, L.sh),
    r: limb(hip, f.r, L.th, L.sh),
  };
  const pts: Pt[] = [hip, neck, ...P.a, ...P.b, ...P.l, ...P.r,
    [head[0] - L.head, head[1] - L.head], [head[0] + L.head, head[1] + L.head]];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const pad = 4;
  const sc = Math.min(1, (FIG_W - 2 * pad) / (maxX - minX + 4), (FLOOR - pad) / (maxY - minY + 2));
  const ox = FIG_W / 2 - (sc * (minX + maxX)) / 2;
  const oy = FLOOR - 2 - sc * maxY;
  const T = (p: Pt): Pt => [r1(ox + p[0] * sc), r1(oy + p[1] * sc)];
  const poly = (pp: Pt[]) => pp.map(T).map((q) => q.join(',')).join(' ');

  // a törzs másodfokú görbe; c > 0 hát felé domborodik
  const c = f.c ?? 0;
  const mid: Pt = [(hip[0] + neck[0]) / 2, (hip[1] + neck[1]) / 2];
  const ctrl = add(mid, f.t - 90, c * 2);
  const [h0, h1] = T(hip), [c0, c1] = T(ctrl), [n0, n1] = T(neck);
  const [hx, hy] = T(head);
  const out: FigureShapes = {
    far: [poly(P.b), poly(P.r)],
    near: [poly(P.l), poly(P.a)],
    torso: `M${h0} ${h1} Q${c0} ${c1} ${n0} ${n1}`,
    neck: poly([neck, add(neck, hd, L.neck - L.head + 0.5)]),
    head: { cx: hx, cy: hy, r: r1(L.head * sc) },
  };
  if (f.v !== 'f') {
    const [ex, ey] = T(add(head, f.fc ?? hd + 90, 3.2));
    out.eye = { cx: ex, cy: ey, r: Math.round(1.3 * sc * 100) / 100 };
  }
  if (f.wall) out.wallX = r1(T(P.l[2])[0] + 5 * sc);
  if (f.strap) out.strap = poly([P.a[2], P.l[2]]);
  return out;
}

export interface FigureColors {
  fig: string;
  far: string;
  mat: string;
  eye: string;
  strap: string;
}

/** Ugyanaz a figura SVG szövegként (PDF exporthoz). */
export function figureSvg(f: Figure, c: FigureColors, size = 90): string {
  const s = figureShapes(f);
  const pl = (pts: string, color: string) =>
    `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FIG_W} ${FIG_H}" width="${size}" height="${(size * FIG_H) / FIG_W}">` +
    `<rect x="10" y="${FLOOR}" width="${FIG_W - 20}" height="3.5" rx="1.75" fill="${c.mat}"/>` +
    (s.wallX != null ? `<line x1="${s.wallX}" y1="8" x2="${s.wallX}" y2="${FLOOR}" stroke="${c.far}" stroke-width="3" stroke-linecap="round"/>` : '') +
    (s.strap ? `<polyline points="${s.strap}" fill="none" stroke="${c.strap}" stroke-width="1.6" stroke-dasharray="3 2"/>` : '') +
    s.far.map((p) => pl(p, c.far)).join('') +
    `<path d="${s.torso}" fill="none" stroke="${c.fig}" stroke-width="6.5" stroke-linecap="round"/>` +
    pl(s.neck, c.fig) +
    `<circle cx="${s.head.cx}" cy="${s.head.cy}" r="${s.head.r}" fill="${c.fig}"/>` +
    (s.eye ? `<circle cx="${s.eye.cx}" cy="${s.eye.cy}" r="${s.eye.r}" fill="${c.eye}"/>` : '') +
    s.near.map((p) => pl(p, c.fig)).join('') +
    '</svg>'
  );
}
