// Színek az ászanatár világos témájából.
export const C = {
  bg: '#f2f4f1',
  surface: '#ffffff',
  panel: '#e6ebe5',
  ink: '#23262e',
  muted: '#5d6470',
  line: '#d5dbd4',
  accent: '#3d4f8f',
  accentSoft: '#dfe4f3',
  gold: '#a86f0c',
  goldSoft: '#f6ead2',
  warn: '#a2412b',
  warnSoft: '#f8e6e1',
  fig: '#2b2f3a',
  figFar: '#a8b1ad',
  mat: '#b9c8d9',
};

export const FIGURE_COLORS = { fig: C.fig, far: C.figFar, mat: C.mat, eye: C.panel, strap: C.gold };

/** Tableten (pl. Galaxy Tab S6 Lite) ne nyúljon szét a tartalom: középre igazított, max. 860 px széles oszlop. */
export const WIDE = { width: '100%', maxWidth: 860, alignSelf: 'center' } as const;
