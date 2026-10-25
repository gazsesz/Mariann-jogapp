import raw from '../../data/aszanak.json';
import type { AsanaData, Pose } from './types';

export const DATA = raw as unknown as AsanaData;
export const POSES: Pose[] = DATA.poses;

export const POSE_BY_ID: Record<string, Pose> = Object.fromEntries(POSES.map((p) => [p.id, p]));
export const CATEGORY_BY_ID = Object.fromEntries(DATA.categories.map((c) => [c.id, c]));
export const CHAKRA_BY_ID = Object.fromEntries(DATA.chakras.map((c) => [c.id, c]));
export const ELEMENT_BY_ID = Object.fromEntries(DATA.elements.map((e) => [e.id, e]));
export const BENEFIT_BY_ID = Object.fromEntries(DATA.benefitAreas.map((b) => [b.id, b]));
export const TRADITION_BY_ID = Object.fromEntries(DATA.traditions.map((t) => [t.id, t]));

export const levelName = (lv: number) => DATA.levels[String(lv)] ?? '';
