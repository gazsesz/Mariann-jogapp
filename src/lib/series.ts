import { DATA } from './data';
import { createPlan, newId } from './plan';
import type { Plan, Series, SeriesDay } from './types';

const day = (title = '', focus = ''): SeriesDay => ({ key: newId(), title, focus, planId: null });

export interface SeriesTemplate {
  id: string;
  name: string;
  description: string;
  build: () => Pick<Series, 'title' | 'theme' | 'days'>;
}

/** Kiinduló sablonok; minden nap címe és fókusza utána szabadon átírható. */
export const SERIES_TEMPLATES: SeriesTemplate[] = [
  {
    id: 'ures',
    name: 'Üres hét',
    description: '7 üres nap, te adod meg a témát és a napok fókuszát.',
    build: () => ({ title: 'Új tematika', theme: '', days: Array.from({ length: 7 }, () => day()) }),
  },
  {
    id: 'csakra',
    name: 'Csakra-utazás (7 nap)',
    description: 'Naponként egy csakra, a gyökértől a koronáig.',
    build: () => ({
      title: 'Csakra-utazás',
      theme: 'Hét nap alatt végig a hét csakrán, a földeléstől az elcsendesedésig.',
      days: DATA.chakras.map((c) => day(`${c.name} (${c.sanskrit})`, c.theme)),
    }),
  },
  {
    id: 'elemek',
    name: 'Öt elem (5 nap + 2)',
    description: 'Föld, víz, tűz, levegő, éter, majd integráló és pihentető nap.',
    build: () => ({
      title: 'Az öt elem hete',
      theme: 'Az öt alapelem megtapasztalása a testben és a légzésben.',
      days: [
        ...DATA.elements.map((e) => day(`${e.name} (${e.sanskrit})`, `${e.quality}. Gyakorlás: ${e.practice}.`)),
        day('Az elemek egysége', 'Mind az öt elem egy áramló órában, egyensúlyban.'),
        day('Pihenés, befelé figyelés', 'Restoratív és yin pózok, légzés, jóga nidra.'),
      ],
    }),
  },
];

export function createSeries(templateId = 'ures'): Series {
  const t = SERIES_TEMPLATES.find((x) => x.id === templateId) ?? SERIES_TEMPLATES[0];
  const now = new Date().toISOString();
  return { id: newId(), notes: '', ...t.build(), createdAt: now, updatedAt: now };
}

export const newSeriesDay = () => day();

/** Új óravázlat egy tematika adott napjához, a nap címével és fókuszával. */
export function planForDay(series: Series, dayIndex: number): Plan {
  const d = series.days[dayIndex];
  const title = `${series.title} – ${dayIndex + 1}. nap${d.title ? `: ${d.title}` : ''}`;
  const p = createPlan(title);
  return { ...p, theme: d.focus || series.theme, tags: series.title ? [series.title] : [] };
}

/** Melyik tematika melyik napjához tartozik egy óravázlat (az óravázlat-listához). */
export function seriesIndex(series: Series[]): Map<string, { series: Series; day: number }> {
  const m = new Map<string, { series: Series; day: number }>();
  for (const s of series) s.days.forEach((d, i) => d.planId && m.set(d.planId, { series: s, day: i }));
  return m;
}
