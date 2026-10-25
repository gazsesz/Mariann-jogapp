import type { Kind, Plan, PlanItem, PlanSection, Practice } from './types';
import { isSequence, practiceOf } from './data';

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

/** Mudránál, pránájámánál az ajánlott idő; sorozatnál a tempó; yin pózoknál perces tartás, máshol légzésszám. */
export function defaultHold(p: Practice): string {
  if (isSequence(p)) return '1 légzés / mozdulat';
  if ('duration' in p && typeof p.duration === 'string') return p.duration;
  if (p.category === 'yin') return '3 perc';
  if (p.category === 'pihen') return '1–2 perc';
  return '5 légzés';
}

export function newItem(p: Practice, kind: Kind = 'asana'): PlanItem {
  const item: PlanItem = { key: newId(), kind, poseId: p.id, hold: defaultHold(p), sides: 'nincs', note: '' };
  if (isSequence(p)) {
    item.reps = p.rounds;
    if (p.sided) item.sides = 'mindket';
  }
  return item;
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

/** Pl. „6 ászana · 1 mudra · 2 pránájáma”. */
export function countLabel(p: Plan): string {
  const n: Record<Kind, number> = { asana: 0, sequence: 0, mudra: 0, pranayama: 0 };
  p.sections.forEach((s) => s.items.forEach((it) => n[it.kind ?? 'asana']++));
  const parts = [
    n.asana ? `${n.asana} ászana` : '',
    n.sequence ? `${n.sequence} sorozat` : '',
    n.mudra ? `${n.mudra} mudra` : '',
    n.pranayama ? `${n.pranayama} pránájáma` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'még üres';
}

/** Pl. „3 kör” – sorozatnál kör, ászanánál ismétlés. */
export const repsLabel = (it: PlanItem) =>
  it.reps ? `${it.reps} ${it.kind === 'sequence' ? 'kör' : 'ismétlés'}` : '';

export const SIDES_LABEL: Record<PlanItem['sides'], string> = {
  nincs: '–',
  mindket: 'mindkét oldal',
  jobb: 'jobb oldal',
  bal: 'bal oldal',
};

/** Rövid felsorolás a tematika napjaihoz, pl. „Napüdvözlet A (3 kör) · Harcos II (jobb oldal)”. */
export function itemSummary(it: PlanItem): string {
  const p = practiceOf(it);
  if (!p) return '';
  const extra = [repsLabel(it), it.sides !== 'nincs' ? SIDES_LABEL[it.sides] : ''].filter(Boolean).join(', ');
  return extra ? `${p.hu} (${extra})` : p.hu;
}
