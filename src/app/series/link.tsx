import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { getSeries, listPlans, saveSeries, useDb } from '../../lib/store';
import { poseCount } from '../../lib/plan';
import { C } from '../../lib/theme';
import type { Plan } from '../../lib/types';

/** Meglévő óravázlat hozzárendelése egy tematika napjához. */
export default function LinkPlan() {
  const db = useDb();
  const { seriesId, dayKey } = useLocalSearchParams<{ seriesId: string; dayKey: string }>();
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => {
    listPlans(db).then(setPlans);
  }, [db]);

  const pick = async (plan: Plan) => {
    const s = await getSeries(db, seriesId);
    if (s) await saveSeries(db, { ...s, days: s.days.map((d) => (d.key === dayKey ? { ...d, planId: plan.id } : d)) });
    router.back();
  };

  return (
    <FlatList
      data={plans}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text style={st.empty}>Még nincs óravázlatod.</Text>}
      renderItem={({ item: p }) => (
        <Pressable style={({ pressed }) => [st.card, pressed && { opacity: 0.8 }]} onPress={() => pick(p)}>
          <Text style={st.title}>{p.title || 'Névtelen óra'}</Text>
          <Text style={st.meta}>
            {poseCount(p)} ászana{p.theme ? ` · ${p.theme}` : ''}
          </Text>
        </Pressable>
      )}
    />
  );
}

const st = StyleSheet.create({
  empty: { padding: 24, textAlign: 'center', color: C.muted },
  card: { backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.line },
  title: { fontSize: 16, fontWeight: '600', color: C.ink },
  meta: { fontSize: 13, color: C.muted, marginTop: 2 },
});
