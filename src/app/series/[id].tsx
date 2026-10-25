import * as Print from 'expo-print';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BalanceBars } from '../../components/BalanceBars';
import { Button, SectionTitle } from '../../components/ui';
import { dominantElements, planBalance } from '../../lib/analysis';
import { confirm, notify } from '../../lib/confirm';
import { DATA, ELEMENT_BY_ID, POSE_BY_ID } from '../../lib/data';
import { getSeries, listPlans, savePlan, saveSeries, useDb } from '../../lib/store';
import { seriesHtml } from '../../lib/pdf';
import { move, poseCount } from '../../lib/plan';
import { newSeriesDay, planForDay } from '../../lib/series';
import { C } from '../../lib/theme';
import type { Plan, Series, SeriesDay } from '../../lib/types';

const SAVED_NOTE =
  Platform.OS === 'web'
    ? 'A változások automatikusan mentődnek ebben a böngészőben.'
    : 'A változások automatikusan mentődnek a telefonra.';

async function exportPdf(series: Series, plans: Map<string, Plan>) {
  const html = seriesHtml(series, plans);
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: series.title });
  } else {
    await Print.printAsync({ uri });
  }
}

export default function SeriesEditor() {
  const db = useDb();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [plans, setPlans] = useState<Map<string, Plan>>(new Map());
  const [missing, setMissing] = useState(false);

  // Fókuszkor újratöltés: a napokhoz tartozó óravázlatok közben változhattak.
  useFocusEffect(
    useCallback(() => {
      getSeries(db, id).then((s) => (s ? setSeries(s) : setMissing(true)));
      listPlans(db).then((ps) => setPlans(new Map(ps.map((p) => [p.id, p]))));
    }, [db, id]),
  );

  const ref = useRef<Series | null>(null);
  ref.current = series;
  const update = useCallback(
    (f: (s: Series) => Series) => {
      if (!ref.current) return;
      const next = f(ref.current);
      ref.current = next;
      setSeries(next);
      saveSeries(db, next).catch((e) => notify('Mentési hiba', String(e)));
    },
    [db],
  );

  const weekElements = useMemo(() => {
    const counts: Record<string, number> = {};
    series?.days.forEach((d) => {
      const p = d.planId ? plans.get(d.planId) : undefined;
      if (!p) return;
      const b = planBalance(p, POSE_BY_ID).elements;
      for (const k in b) counts[k] = (counts[k] ?? 0) + b[k];
    });
    return counts;
  }, [series, plans]);

  if (missing) return <Text style={{ padding: 24 }}>Ez a tematika már nem létezik.</Text>;
  if (!series) return null;

  const updateDay = (key: string, patch: Partial<SeriesDay>) =>
    update((s) => ({ ...s, days: s.days.map((d) => (d.key === key ? { ...d, ...patch } : d)) }));

  const createDayPlan = async (index: number) => {
    const p = await savePlan(db, planForDay(series, index));
    updateDay(series.days[index].key, { planId: p.id });
    router.push({ pathname: '/plan/[id]', params: { id: p.id } });
  };

  const removeDay = async (d: SeriesDay, i: number) => {
    if (d.planId && !(await confirm('Nap törlése', `A(z) ${i + 1}. nap törlődik. A hozzá tartozó óravázlat megmarad.`))) return;
    update((s) => ({ ...s, days: s.days.filter((x) => x.key !== d.key) }));
  };

  const hasAnyPlan = series.days.some((d) => d.planId && plans.has(d.planId));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen
        options={{
          title: series.title || 'Tematika',
          headerRight: Platform.OS === 'web' ? undefined : () => (
            <Pressable onPress={() => exportPdf(series, plans).catch((e) => notify('PDF hiba', String(e)))} hitSlop={8}>
              <Text style={st.headerBtn}>PDF</Text>
            </Pressable>
          ),
        }}
      />
      <TextInput
        style={st.titleInput}
        value={series.title}
        onChangeText={(title) => update((s) => ({ ...s, title }))}
        placeholder="A tematika címe"
        placeholderTextColor={C.muted}
      />
      <TextInput
        style={[st.input, { minHeight: 60, textAlignVertical: 'top' }]}
        value={series.theme}
        onChangeText={(theme) => update((s) => ({ ...s, theme }))}
        placeholder="A téma, amit a napok kibontanak"
        placeholderTextColor={C.muted}
        multiline
      />

      {hasAnyPlan && (
        <>
          <SectionTitle>Az öt elem a héten (elsődleges elemek)</SectionTitle>
          <BalanceBars rows={DATA.elements} counts={weekElements} />
        </>
      )}

      <SectionTitle>Napok</SectionTitle>
      {series.days.map((d, i) => {
        const plan = d.planId ? plans.get(d.planId) : undefined;
        const dom = plan ? dominantElements(planBalance(plan, POSE_BY_ID).elements) : [];
        return (
          <View key={d.key} style={st.day}>
            <View style={st.dayHead}>
              <View style={st.dayNum}>
                <Text style={st.dayNumText}>{i + 1}.</Text>
              </View>
              <TextInput
                style={st.dayTitle}
                value={d.title}
                onChangeText={(title) => updateDay(d.key, { title })}
                placeholder={`${i + 1}. nap címe`}
                placeholderTextColor={C.muted}
              />
              <IconBtn label="↑" onPress={() => update((s) => ({ ...s, days: move(s.days, i, -1) }))} />
              <IconBtn label="↓" onPress={() => update((s) => ({ ...s, days: move(s.days, i, 1) }))} />
              <IconBtn label="✕" onPress={() => removeDay(d, i)} />
            </View>
            <TextInput
              style={[st.small, { marginTop: 6, minHeight: 58, textAlignVertical: 'top' }]}
              value={d.focus}
              onChangeText={(focus) => updateDay(d.key, { focus })}
              placeholder="A nap fókusza, szándéka"
              placeholderTextColor={C.muted}
              multiline
            />
            {plan ? (
              <Pressable style={st.plan} onPress={() => router.push({ pathname: '/plan/[id]', params: { id: plan.id } })}>
                <View style={{ flex: 1 }}>
                  <Text style={st.planTitle}>{plan.title || 'Névtelen óra'}</Text>
                  <Text style={st.planMeta}>
                    {poseCount(plan)} ászana
                    {plan.durationMin ? ` · ${plan.durationMin} perc` : ''}
                    {dom.length ? ` · ${dom.map((e) => ELEMENT_BY_ID[e]?.name).join(', ')}` : ''}
                  </Text>
                </View>
                <Text style={st.open}>Megnyitás ›</Text>
              </Pressable>
            ) : (
              <View style={st.planActions}>
                <Button kind="secondary" label="+ Óravázlat ehhez a naphoz" onPress={() => createDayPlan(i)} style={{ flex: 1 }} />
                <Button
                  kind="ghost"
                  label="Meglévő…"
                  onPress={() => router.push({ pathname: '/series/link', params: { seriesId: series.id, dayKey: d.key } })}
                />
              </View>
            )}
            {plan && (
              <Pressable onPress={() => updateDay(d.key, { planId: null })} hitSlop={6}>
                <Text style={st.unlink}>Óravázlat leválasztása a napról</Text>
              </Pressable>
            )}
          </View>
        );
      })}
      <Button kind="ghost" label="+ Nap hozzáadása" onPress={() => update((s) => ({ ...s, days: [...s.days, newSeriesDay()] }))} />

      <SectionTitle>Jegyzetek</SectionTitle>
      <TextInput
        style={[st.input, { minHeight: 80, textAlignVertical: 'top' }]}
        value={series.notes}
        onChangeText={(notes) => update((s) => ({ ...s, notes }))}
        placeholder="Zene, olvasmány, házi feladat a résztvevőknek…"
        placeholderTextColor={C.muted}
        multiline
      />
      {Platform.OS !== 'web' && (
        <Button
          label="PDF heti áttekintés"
          onPress={() => exportPdf(series, plans).catch((e) => notify('PDF hiba', String(e)))}
          style={{ marginTop: 16 }}
        />
      )}
      <Text style={st.saved}>{SAVED_NOTE}</Text>
    </ScrollView>
  );
}

function IconBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => [st.iconBtn, pressed && { backgroundColor: C.panel }]}>
      <Text style={st.iconBtnText}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  headerBtn: { color: C.accent, fontWeight: '700', fontSize: 16, paddingHorizontal: 8 },
  titleInput: { fontSize: 22, fontWeight: '700', color: C.ink, paddingVertical: 6, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: C.line },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    color: C.ink,
    marginBottom: 6,
  },
  day: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.line, padding: 10, marginBottom: 10 },
  dayHead: { flexDirection: 'row', alignItems: 'center' },
  dayNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  dayNumText: { color: C.accent, fontWeight: '700' },
  dayTitle: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '600', color: C.ink, paddingVertical: 4 },
  small: {
    backgroundColor: C.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: C.ink,
    borderWidth: 1,
    borderColor: C.line,
  },
  plan: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: C.accentSoft, borderRadius: 10, padding: 10 },
  planTitle: { fontSize: 15, fontWeight: '600', color: C.ink },
  planMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
  open: { color: C.accent, fontWeight: '700', marginLeft: 8 },
  planActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  unlink: { color: C.muted, fontSize: 12, marginTop: 6, textAlign: 'right' },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  iconBtnText: { fontSize: 16, color: C.muted },
  saved: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 10 },
});
