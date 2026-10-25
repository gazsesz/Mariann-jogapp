import type { Plan, PlanItem, PlanSection, Pose } from './types';

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Egy klasszikus óra íve; szabadon átnevezhető, bővíthető. */
export const DEFAULT_SECTIONS = [
  'Ráhangolódás',
  'Bemelegítés',
  'Fő rész',
  'Levezetés',
  'Relaxáció',
];

export function createPlan(title = 'Új óravázlat'): Plan {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title,
    theme: '',
    level: 0,
    durationMin: 60,
    tags: [],
    conditions: [],
    notes: '',
    sections: DEFAULT_SECTIONS.map((t) => ({ key: newId(), title: t, items: [] })),
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicatePlan(p: Plan): Plan {
  const now = new Date().toISOString();
  return {
    ...p,
    id: newId(),
    title: p.title + ' (másolat)',
    sections: p.sections.map((s) => ({
      ...s,
      key: newId(),
      items: s.items.map((it) => ({ ...it, key: newId() })),
    })),
    createdAt: now,
    updatedAt: now,
  };
}

/** Yin pózoknál perces tartás, máshol légzésszám az alapértelmezés. */
export function defaultHold(p: Pose): string {
  if (p.category === 'yin') return '3 perc';
  if (p.category === 'pihen') return '1–2 perc';
  return '5 légzés';
}

export function newItem(p: Pose): PlanItem {
  return { key: newId(), poseId: p.id, hold: defaultHold(p), sides: 'nincs', note: '' };
}

export function addItem(plan: Plan, sectionKey: string, item: PlanItem): Plan {
  return {
    ...plan,
    sections: plan.sections.map((s) => (s.key === sectionKey ? { ...s, items: [...s.items, item] } : s)),
  };
}

export function updateSection(plan: Plan, key: string, f: (s: PlanSection) => PlanSection): Plan {
  return { ...plan, sections: plan.sections.map((s) => (s.key === key ? f(s) : s)) };
}

export function move<T>(list: T[], index: number, delta: number): T[] {
  const j = index + delta;
  if (j < 0 || j >= list.length) return list;
  const out = list.slice();
  [out[index], out[j]] = [out[j], out[index]];
  return out;
}

export const poseCount = (p: Plan) => p.sections.reduce((n, s) => n + s.items.length, 0);

export const SIDES_LABEL: Record<PlanItem['sides'], string> = {
  nincs: '–',
  mindket: 'mindkét oldal',
  jobb: 'jobb oldal',
  bal: 'bal oldal',
};
