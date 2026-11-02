// Yogahome színvilág: zöldes-kékes (teal) alap, sáfrány kiemelés.
export const C = {
  bg: '#eff3f0',
  surface: '#ffffff',
  panel: '#e5ece8',
  ink: '#1c2826',
  muted: '#50605d',
  line: '#d3ded9',
  accent: '#1f5a55',
  accentSoft: '#ddedea',
  dark: '#12302c',
  gold: '#9a640f',
  goldSoft: '#f6ebd6',
  saffron: '#e9b76a',
  warn: '#8e3420',
  warnSoft: '#f8e6e1',
  fig: '#1c2826',
  figFar: '#a3b5af',
  mat: '#b5cfc8',
};

export const FIGURE_COLORS = { fig: C.fig, far: C.figFar, mat: C.mat, eye: C.panel, strap: C.gold };

/** Tableten (pl. Galaxy Tab S6 Lite) ne nyúljon szét a tartalom: középre igazított, max. 860 px széles oszlop. */
export const WIDE = { width: '100%', maxWidth: 860, alignSelf: 'center' } as const;
