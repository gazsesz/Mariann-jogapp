import type { Plan, Pose } from './types';

/**
 * Csoportban gyakori panaszok. Az ászanatár ellenjavallat-szövegeiben
 * (Pose.cautions) keresünk rájuk utaló kifejezéseket.
 */
export interface Condition {
  id: string;
  name: string;
  pattern: RegExp;
}

export const CONDITIONS: Condition[] = [
  { id: 'magasvn', name: 'Magas vérnyomás', pattern: /magas vérnyomás/ },
  { id: 'alacsonyvn', name: 'Alacsony vérnyomás, szédülés', pattern: /alacsony vérnyomás|szédül/ },
  { id: 'terhes', name: 'Várandósság', pattern: /terhes|várandós/ },
  { id: 'nyak', name: 'Nyak', pattern: /nyak\w*\s?(sérül|panasz|probl|fájd)|nyaki (panasz|probl|sérül)/ },
  { id: 'vall', name: 'Váll', pattern: /váll\w*\s?(sérül|panasz|probl|fájd|delikát)|váll- /},
  { id: 'csuklo', name: 'Csukló', pattern: /csukló\w*\s?(sérül|panasz|probl|fájd)|csukló-/ },
  {
    id: 'derek',
    name: 'Derék, hát, gerinc',
    pattern: /derék|hát(sérül|fájd|panasz|probl)|ágyék|porckorong|isiász|gerinc\w*\s?(sérül|probl|panasz)/,
  },
  { id: 'csipo', name: 'Csípő', pattern: /csípő\w*\s?(sérül|panasz|probl|fájd)|csípőprotézis/ },
  { id: 'terd', name: 'Térd', pattern: /térd\w*\s?(sérül|panasz|fájd|probl|érzékeny)|ha a térd fáj/ },
  { id: 'boka', name: 'Boka, lábfej', pattern: /boka|bütyök|lábujjprobl/ },
  { id: 'combh', name: 'Combhajlító', pattern: /combhajlító/ },
  { id: 'szem', name: 'Glaukóma, szemnyomás', pattern: /glaukóm|szem\w*\s?(probl|nyomás)/ },
];

export const CONDITION_BY_ID = Object.fromEntries(CONDITIONS.map((c) => [c.id, c]));

/** Azok a panaszok, amelyekre a póz ellenjavallata kitér. */
export function poseConditions(p: Pose): string[] {
  const text = p.cautions.toLowerCase();
  return CONDITIONS.filter((c) => c.pattern.test(text)).map((c) => c.id);
}

export interface PlanWarning {
  sectionKey: string;
  itemKey: string;
  pose: Pose;
  /** A csoport jelzett panaszai közül azok, amelyeket a póz érint. */
  conditions: string[];
  /** A póz szintje magasabb, mint az óra célzott szintje. */
  levelTooHigh: boolean;
}

export function planWarnings(plan: Plan, poseById: Record<string, Pose>): PlanWarning[] {
  const out: PlanWarning[] = [];
  for (const s of plan.sections) {
    for (const it of s.items) {
      const pose = poseById[it.poseId];
      if (!pose) continue;
      const conditions = poseConditions(pose).filter((c) => plan.conditions.includes(c));
      const levelTooHigh = plan.level > 0 && pose.level > plan.level;
      if (conditions.length || levelTooHigh) {
        out.push({ sectionKey: s.key, itemKey: it.key, pose, conditions, levelTooHigh });
      }
    }
  }
  return out;
}
