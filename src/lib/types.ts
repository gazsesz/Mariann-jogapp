// Az ászanatár adatai (data/aszanak.json) és az óravázlat típusai.

export type Angles2 = [number, number] | [number, number, number];

export interface Figure {
  t: number;
  h?: number;
  c?: number;
  ts?: number;
  fc?: number;
  a: Angles2;
  b: Angles2;
  l: Angles2;
  r: Angles2;
  v?: 'f';
  wall?: boolean | number;
  strap?: boolean | number;
}

export interface Pose {
  id: string;
  sanskrit: string;
  hu: string;
  en: string;
  category: string;
  level: 1 | 2 | 3;
  traditions: string[];
  steps: string[];
  benefits: string;
  cautions: string;
  chakras: { primary: number; secondary: number[]; note?: string };
  benefitAreas: string[];
  /** Az öt elem (föld, víz, tűz, levegő, éter) a csakrákból származtatva. */
  elements: { primary: string; secondary: string[] };
  figure: Figure;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Chakra {
  id: number;
  sanskrit: string;
  name: string;
  location: string;
  theme: string;
  color: string;
}

export interface Element {
  id: string;
  name: string;
  sanskrit: string;
  chakra: number;
  color: string;
  quality: string;
  practice: string;
}

export interface BenefitArea {
  id: string;
  name: string;
  reason: string;
}

export interface Tradition {
  id: string;
  name: string;
}

export interface AsanaData {
  version: number;
  benefitAreas: BenefitArea[];
  chakras: Chakra[];
  elements: Element[];
  elementsNote: string;
  categories: Category[];
  traditions: Tradition[];
  levels: Record<string, string>;
  poses: Pose[];
}

export type Sides = 'nincs' | 'mindket' | 'jobb' | 'bal';

export interface PlanItem {
  key: string;
  poseId: string;
  /** Tartási idő szabad szöveggel, pl. „5 légzés”, „3 perc”. */
  hold: string;
  sides: Sides;
  note: string;
}

export interface PlanSection {
  key: string;
  title: string;
  items: PlanItem[];
}

export interface Plan {
  id: string;
  title: string;
  /** Az óra témája, szándéka. */
  theme: string;
  /** Célzott szint: 0 = vegyes. */
  level: 0 | 1 | 2 | 3;
  durationMin: number | null;
  tags: string[];
  /** A csoportban jelzett panaszok azonosítói (lásd cautions.ts). */
  conditions: string[];
  notes: string;
  sections: PlanSection[];
  createdAt: string;
  updatedAt: string;
}

export interface SeriesDay {
  key: string;
  /** A nap címe, pl. „Föld – gyökerezés”. */
  title: string;
  /** A nap fókusza, szándéka. */
  focus: string;
  planId: string | null;
}

/** Tematika: egy téma lebontása több (jellemzően 7) napra, naponként egy óravázlattal. */
export interface Series {
  id: string;
  title: string;
  theme: string;
  notes: string;
  days: SeriesDay[];
  createdAt: string;
  updatedAt: string;
}
