import raw from '../../data/aszanak.json';
import mudraRaw from '../../data/mudrak.json';
import pranayamaRaw from '../../data/pranayamak.json';
import sequenceRaw from '../../data/sorozatok.json';
import type { AsanaData, Category, Kind, PlanItem, Pose, Practice, Sequence, SequenceData, Technique, TechniqueData } from './types';

export const DATA = raw as unknown as AsanaData;
export const POSES: Pose[] = DATA.poses;
const MUDRA = mudraRaw as unknown as TechniqueData;
const PRANAYAMA = pranayamaRaw as unknown as TechniqueData;
export const MUDRAS: Technique[] = MUDRA.items;
export const PRANAYAMAS: Technique[] = PRANAYAMA.items;
const SEQUENCE = sequenceRaw as unknown as SequenceData;
export const SEQUENCES: Sequence[] = SEQUENCE.items;

export const POSE_BY_ID: Record<string, Pose> = Object.fromEntries(POSES.map((p) => [p.id, p]));
export const CATEGORY_BY_ID = Object.fromEntries(DATA.categories.map((c) => [c.id, c]));
export const CHAKRA_BY_ID = Object.fromEntries(DATA.chakras.map((c) => [c.id, c]));
export const ELEMENT_BY_ID = Object.fromEntries(DATA.elements.map((e) => [e.id, e]));
export const BENEFIT_BY_ID = Object.fromEntries(DATA.benefitAreas.map((b) => [b.id, b]));
export const TRADITION_BY_ID = Object.fromEntries(DATA.traditions.map((t) => [t.id, t]));

export const levelName = (lv: number) => DATA.levels[String(lv)] ?? '';

export interface KindInfo {
  kind: Kind;
  /** Egy elem neve, pl. „Mudra”. */
  label: string;
  /** A gyűjtemény neve, pl. „Mudratár”. */
  library: string;
  categories: Category[];
  items: Practice[];
  byId: Record<string, Practice>;
}

const info = (kind: Kind, label: string, library: string, categories: Category[], items: Practice[]): KindInfo => ({
  kind,
  label,
  library,
  categories,
  items,
  byId: Object.fromEntries(items.map((p) => [p.id, p])),
});

export const KINDS: Record<Kind, KindInfo> = {
  asana: info('asana', 'Ászana', 'Ászanatár', DATA.categories, POSES),
  mudra: info('mudra', 'Mudra', 'Mudratár', MUDRA.categories, MUDRAS),
  pranayama: info('pranayama', 'Pránájáma', 'Pránájámák', PRANAYAMA.categories, PRANAYAMAS),
  sequence: info('sequence', 'Sorozat', 'Sorozatok', SEQUENCE.categories, SEQUENCES),
};
export const KIND_LIST: Kind[] = ['asana', 'sequence', 'mudra', 'pranayama'];
/** Többes számú rövid név a fülekhez, választóhoz. */
export const KIND_PLURAL: Record<Kind, string> = { asana: 'Ászanák', sequence: 'Sorozatok', mudra: 'Mudrák', pranayama: 'Pránájáma' };

export const itemKind = (it: Pick<PlanItem, 'kind'>): Kind => it.kind ?? 'asana';

/** Egy óravázlat-elemhez tartozó ászana, mudra vagy pránájáma. */
export const practiceOf = (it: Pick<PlanItem, 'kind' | 'poseId'>): Practice | undefined =>
  KINDS[itemKind(it)].byId[it.poseId];

export const isPose = (p: Practice): p is Pose => 'figure' in p;
export const isSequence = (p: Practice): p is Sequence => 'flow' in p;
/** Oldalt lehet-e választani (ászana vagy oldalanként végzett sorozat). */
export const hasSides = (kind: Kind, p?: Practice) => kind === 'asana' || (!!p && isSequence(p) && p.sided);
export const categoryName = (kind: Kind, id: string) => KINDS[kind].categories.find((c) => c.id === id)?.name ?? id;
