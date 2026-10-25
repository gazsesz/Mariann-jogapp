import type { Plan, PlanItem, Practice } from './types';

/** Az óra gyakorlatainak elsődleges csakrái és elemei darabszámra. */
export function planBalance(plan: Plan, lookup: (it: PlanItem) => Practice | undefined) {
  const chakras: Record<string, number> = {};
  const elements: Record<string, number> = {};
  for (const s of plan.sections) {
    for (const it of s.items) {
      const p = lookup(it);
      if (!p) continue;
      chakras[p.chakras.primary] = (chakras[p.chakras.primary] ?? 0) + 1;
      elements[p.elements.primary] = (elements[p.elements.primary] ?? 0) + 1;
    }
  }
  return { chakras, elements };
}

/** A leggyakoribb elem(ek) azonosítója, vagy üres lista, ha nincs póz. */
export function dominantElements(counts: Record<string, number>): string[] {
  const max = Math.max(0, ...Object.values(counts));
  return max ? Object.keys(counts).filter((k) => counts[k] === max) : [];
}
