/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import raw from '../data/aszanak.json';
import { CONDITIONS, planWarnings, poseConditions } from '../src/lib/cautions';
import { figureShapes, figureSvg } from '../src/lib/figure';
import { EMPTY_FILTER, filterPoses } from '../src/lib/filters';
import { addItem, createPlan, duplicatePlan, move, newItem, poseCount } from '../src/lib/plan';
import { planHtml } from '../src/lib/pdf';
import type { AsanaData } from '../src/lib/types';

const DATA = raw as unknown as AsanaData;
const POSES = DATA.poses;
const byId = Object.fromEntries(POSES.map((p) => [p.id, p]));

test('az adat teljes: 205 ászana, minden hivatkozás feloldható', () => {
  assert.equal(POSES.length, 205);
  const cats = new Set(DATA.categories.map((c) => c.id));
  const bens = new Set(DATA.benefitAreas.map((b) => b.id));
  const chs = new Set(DATA.chakras.map((c) => c.id));
  for (const p of POSES) {
    assert.ok(cats.has(p.category), p.id);
    assert.ok(chs.has(p.chakras.primary), p.id);
    p.benefitAreas.forEach((b) => assert.ok(bens.has(b), `${p.id}: ${b}`));
  }
});

test('üres szűrő mindent mutat', () => {
  assert.equal(filterPoses(POSES, EMPTY_FILTER).length, 205);
});

test('a szűrők csoportok között ÉS, csoporton belül VAGY', () => {
  const yin = filterPoses(POSES, { ...EMPTY_FILTER, categories: ['yin'] });
  const yinOrRest = filterPoses(POSES, { ...EMPTY_FILTER, categories: ['yin', 'pihen'] });
  assert.ok(yin.length > 0 && yinOrRest.length > yin.length);
  const yinSleep = filterPoses(POSES, { ...EMPTY_FILTER, categories: ['yin'], benefits: ['alvas'] });
  assert.ok(yinSleep.length <= yin.length);
  assert.ok(yinSleep.every((p) => p.category === 'yin' && p.benefitAreas.includes('alvas')));
});

test('csakra: elsődleges vagy másodlagos, kapcsolóval csak elsődleges', () => {
  const any = filterPoses(POSES, { ...EMPTY_FILTER, chakras: [4] });
  const prim = filterPoses(POSES, { ...EMPTY_FILTER, chakras: [4], primaryChakraOnly: true });
  assert.ok(prim.length > 0 && any.length >= prim.length);
  assert.ok(prim.every((p) => p.chakras.primary === 4));
});

test('keresés ékezet nélkül is talál', () => {
  const r = filterPoses(POSES, { ...EMPTY_FILTER, query: 'tadasana' });
  assert.ok(r.some((p) => p.id === 'tadasana'));
  const hu = filterPoses(POSES, { ...EMPTY_FILTER, query: 'harcos' });
  assert.ok(hu.length >= 2);
});

test('minden panasz-minta legalább egy ászanára illik', () => {
  for (const c of CONDITIONS) {
    assert.ok(POSES.some((p) => poseConditions(p).includes(c.id)), c.id);
  }
});

test('figyelmeztetés: jelzett panasz és túl magas szint', () => {
  const sirsasana = POSES.find((p) => /magas vérnyomás/i.test(p.cautions) && p.level === 3) ?? POSES.find((p) => p.level === 3)!;
  let plan = createPlan();
  plan = { ...plan, level: 1, conditions: ['magasvn'] };
  plan = addItem(plan, plan.sections[2].key, newItem(sirsasana));
  plan = addItem(plan, plan.sections[2].key, newItem(byId['tadasana']));
  const w = planWarnings(plan, byId);
  assert.equal(w.length, 1);
  assert.equal(w[0].pose.id, sirsasana.id);
  assert.ok(w[0].levelTooHigh);
});

test('óravázlat: másolás új azonosítókkal, mozgatás', () => {
  let plan = createPlan('Teszt');
  plan = addItem(plan, plan.sections[0].key, newItem(byId['tadasana']));
  const copy = duplicatePlan(plan);
  assert.notEqual(copy.id, plan.id);
  assert.notEqual(copy.sections[0].items[0].key, plan.sections[0].items[0].key);
  assert.equal(poseCount(copy), 1);
  assert.deepEqual(move([1, 2, 3], 0, 1), [2, 1, 3]);
  assert.deepEqual(move([1, 2, 3], 0, -1), [1, 2, 3]);
});

test('minden figura kirajzolható, véges koordinátákkal', () => {
  for (const p of POSES) {
    const s = figureShapes(p.figure);
    assert.ok(!/NaN|Infinity/.test(JSON.stringify(s)), p.id);
    assert.ok(figureSvg(p.figure, { fig: '#000', far: '#888', mat: '#ccc', eye: '#fff', strap: '#a60' }).startsWith('<svg'));
  }
});

test('PDF HTML: cím, szakaszok, jegyzet, escape', () => {
  let plan = { ...createPlan('Reggeli <óra>'), notes: 'Ujjayi légzés' };
  plan = addItem(plan, plan.sections[1].key, { ...newItem(byId['tadasana']), note: 'talajkapcsolat' });
  const html = planHtml(plan);
  assert.ok(html.includes('Reggeli &lt;óra&gt;'));
  assert.ok(html.includes('Bemelegítés'));
  assert.ok(html.includes('talajkapcsolat'));
  assert.ok(html.includes('Ujjayi légzés'));
});
