import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Tag } from '../../components/ui';
import { confirm } from '../../lib/confirm';
import { levelName } from '../../lib/data';
import { deletePlan, deleteSeries, listPlans, listSeries, savePlan, useDb } from '../../lib/store';
import { fold } from '../../lib/filters';
import { createPlan, duplicatePlan, countLabel } from '../../lib/plan';
import { seriesIndex } from '../../lib/series';
import { C, WIDE } from '../../lib/theme';
import type { Plan, Series } from '../../lib/types';

type Mode = 'orak' | 'tematikak';

export default function PlansScreen() {
  const db = useDb();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('orak');

  const reload = useCallback(() => {
    listPlans(db).then(setPlans);
    listSeries(db).then(setSeries);
  }, [db]);
  useFocusEffect(reload);

  const bySeries = useMemo(() => seriesIndex(series), [series]);
  const planById = useMemo(() => new Map(plans.map((p) => [p.id, p])), [plans]);
  const q = fold(query.trim());

  const shownPlans = useMemo(() => {
    if (!q) return plans;
    return plans.filter((p) =>
      fold([p.title, p.theme, ...p.tags, bySeries.get(p.id)?.series.title ?? ''].join(' ')).includes(q),
    );
  }, [plans, q, bySeries]);
  const shownSeries = useMemo(() => {
    if (!q) return series;
    return series.filter((s) => fold([s.title, s.theme, ...s.days.map((d) => d.title)].join(' ')).includes(q));
  }, [series, q]);

  const create = async () => {
    if (mode === 'tematikak') {
      router.push('/series/new');
      return;
    }
    const p = await savePlan(db, createPlan());
    router.push({ pathname: '/plan/[id]', params: { id: p.id } });
  };
  const duplicate = async (p: Plan) => {
    await savePlan(db, duplicatePlan(p));
    reload();
  };
  const remove = async (p: Plan) => {
    const inSeries = bySeries.get(p.id);
    const extra = inSeries ? `\n\nA(z) „${inSeries.series.title}” tematika ${inSeries.day + 1}. napjáról is lekerül.` : '';
    if (await confirm('Óravázlat törlése', `Biztosan törlöd: „${p.title}”?${extra}`)) {
      await deletePlan(db, p.id);
      reload();
    }
  };
  const removeSeries = async (s: Series) => {
    if (await confirm('Tematika törlése', `Biztosan törlöd: „${s.title}”? A napokhoz tartozó óravázlatok megmaradnak.`)) {
      await deleteSeries(db, s.id);
      reload();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={st.top}>
        <View style={WIDE}>
          <View style={st.segment}>
            {(
              [
                ['orak', `Órák (${plans.length})`],
                ['tematikak', `Tematikák (${series.length})`],
              ] as [Mode, string][]
            ).map(([m, label]) => (
              <Pressable key={m} onPress={() => setMode(m)} style={[st.segBtn, mode === m && st.segActive]} accessibilityRole="tab">
                <Text style={[st.segText, mode === m && st.segTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={st.bar}>
            <TextInput
              style={st.search}
              placeholder={mode === 'orak' ? 'Keresés címre, témára, címkére' : 'Keresés tematikára, napra'}
              placeholderTextColor={C.muted}
              value={query}
              onChangeText={setQuery}
            />
            <Button label={mode === 'orak' ? '+ Új óra' : '+ Új tematika'} onPress={create} />
          </View>
        </View>
      </View>

      {mode === 'orak' ? (
        <FlatList
          data={shownPlans}
          keyExtractor={(p) => p.id}
          contentContainerStyle={[{ padding: 12 }, WIDE]}
          ListEmptyComponent={
            <Text style={st.empty}>
              {plans.length
                ? 'Nincs találat.'
                : 'Még nincs óravázlatod. Hozz létre egyet az „Új óra” gombbal, vagy egy ászana, mudra, pránájáma lapjáról add hozzá.'}
            </Text>
          }
          renderItem={({ item: p }) => {
            const s = bySeries.get(p.id);
            return (
              <Pressable
                style={({ pressed }) => [st.card, pressed && { opacity: 0.8 }]}
                onPress={() => router.push({ pathname: '/plan/[id]', params: { id: p.id } })}
              >
                {s && (
                  <Text style={st.seriesBadge}>
                    {s.series.title} · {s.day + 1}. nap
                  </Text>
                )}
                <Text style={st.title}>{p.title || 'Névtelen óra'}</Text>
                {!!p.theme && <Text style={st.theme}>{p.theme}</Text>}
                <Text style={st.meta}>
                  {countLabel(p)}
                  {p.durationMin ? ` · ${p.durationMin} perc` : ''}
                  {p.level ? ` · ${levelName(p.level)}` : ''}
                  {' · '}
                  módosítva {new Date(p.updatedAt).toLocaleDateString('hu-HU')}
                </Text>
                {p.tags.length > 0 && (
                  <View style={st.tags}>
                    {p.tags.map((t) => (
                      <Tag key={t} label={t} tone="gold" />
                    ))}
                  </View>
                )}
                <View style={st.actions}>
                  <Button kind="ghost" label="Másolat" onPress={() => duplicate(p)} />
                  <Button kind="ghost" label="Törlés" onPress={() => remove(p)} />
                </View>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={shownSeries}
          keyExtractor={(s) => s.id}
          contentContainerStyle={[{ padding: 12 }, WIDE]}
          ListEmptyComponent={
            <Text style={st.empty}>
              {series.length
                ? 'Nincs találat.'
                : 'A tematikával egy témát több napra bonthatsz le (pl. egy hét), és minden naphoz óravázlatot készíthetsz. Kezdd az „Új tematika” gombbal.'}
            </Text>
          }
          renderItem={({ item: s }) => {
            const done = s.days.filter((d) => d.planId && planById.has(d.planId)).length;
            return (
              <Pressable
                style={({ pressed }) => [st.card, pressed && { opacity: 0.8 }]}
                onPress={() => router.push({ pathname: '/series/[id]', params: { id: s.id } })}
              >
                <Text style={st.title}>{s.title || 'Névtelen tematika'}</Text>
                {!!s.theme && <Text style={st.theme}>{s.theme}</Text>}
                <Text style={st.meta}>
                  {s.days.length} nap · {done} óravázlat kész
                </Text>
                <View style={st.days}>
                  {s.days.map((d, i) => {
                    const ok = !!d.planId && planById.has(d.planId);
                    return (
                      <View key={d.key} style={[st.dayDot, ok && st.dayDotDone]}>
                        <Text style={[st.dayDotText, ok && { color: '#fff' }]}>{i + 1}</Text>
                      </View>
                    );
                  })}
                </View>
                <View style={st.actions}>
                  <Button kind="ghost" label="Törlés" onPress={() => removeSeries(s)} />
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  top: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line },
  segment: { flexDirection: 'row', marginHorizontal: 10, marginTop: 10, backgroundColor: C.bg, borderRadius: 10, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segActive: { backgroundColor: C.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  segText: { color: C.muted, fontWeight: '600' },
  segTextActive: { color: C.accent },
  bar: { flexDirection: 'row', padding: 10, gap: 8 },
  search: {
    flex: 1,
    minWidth: 0,
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    color: C.ink,
    borderWidth: 1,
    borderColor: C.line,
  },
  empty: { padding: 24, textAlign: 'center', color: C.muted, lineHeight: 21 },
  card: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  seriesBadge: { fontSize: 12, fontWeight: '700', color: C.gold, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  title: { fontSize: 17, fontWeight: '700', color: C.ink },
  theme: { fontSize: 14, color: C.ink, marginTop: 2 },
  meta: { fontSize: 13, color: C.muted, marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  days: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  dayDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center' },
  dayDotDone: { backgroundColor: C.accent },
  dayDotText: { fontSize: 13, fontWeight: '700', color: C.muted },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, marginRight: -8, marginBottom: -6 },
});
