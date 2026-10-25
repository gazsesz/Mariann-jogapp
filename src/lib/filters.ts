import type { Practice } from './types';

/**
 * Kombinálható szűrők: egy csoporton belül VAGY, csoportok között ÉS.
 * Üres csoport = nincs szűrés arra a szempontra.
 */
export interface PoseFilter {
  query: string;
  categories: string[];
  levels: number[];
  traditions: string[];
  chakras: number[];
  elements: string[];
  /** Csak az elsődleges csakra és elem számít. */
  primaryChakraOnly: boolean;
  benefits: string[];
}

export const EMPTY_FILTER: PoseFilter = {
  query: '',
  categories: [],
  levels: [],
  traditions: [],
  chakras: [],
  elements: [],
  primaryChakraOnly: false,
  benefits: [],
};

/** Ékezet- és kisbetű-független kereséshez. */
export const fold = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const searchKey = (p: Practice) => fold([p.hu, p.sanskrit, p.en, p.id].join(' '));

export function activeFilterCount(f: PoseFilter): number {
  return (
    f.categories.length +
    f.levels.length +
    f.traditions.length +
    f.chakras.length +
    f.elements.length +
    f.benefits.length
  );
}

export function matchesFilter(p: Practice, f: PoseFilter): boolean {
  if (f.categories.length && !f.categories.includes(p.category)) return false;
  if (f.levels.length && !f.levels.includes(p.level)) return false;
  if (f.traditions.length && !p.traditions?.some((t) => f.traditions.includes(t))) return false;
  if (f.chakras.length) {
    const own = f.primaryChakraOnly ? [p.chakras.primary] : [p.chakras.primary, ...p.chakras.secondary];
    if (!own.some((c) => f.chakras.includes(c))) return false;
  }
  if (f.elements.length) {
    const own = f.primaryChakraOnly ? [p.elements.primary] : [p.elements.primary, ...p.elements.secondary];
    if (!own.some((e) => f.elements.includes(e))) return false;
  }
  if (f.benefits.length && !p.benefitAreas.some((b) => f.benefits.includes(b))) return false;
  const q = fold(f.query.trim());
  if (q && !q.split(/\s+/).every((w) => searchKey(p).includes(w))) return false;
  return true;
}

export function filterPoses<T extends Practice>(poses: T[], f: PoseFilter): T[] {
  return poses.filter((p) => matchesFilter(p, f));
}

export function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}
