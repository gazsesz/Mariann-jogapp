import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { POSE_BY_ID } from '../lib/data';
import { listPlans, modifyPlan, savePlan } from '../lib/db';
import { addItem, createPlan, newItem } from '../lib/plan';
import { C } from '../lib/theme';
import type { Plan } from '../lib/types';

/** Egy ászana hozzáadása egy meglévő vagy új óravázlat valamelyik szakaszához. */
export default function AddToPlan() {
  const db = useSQLiteContext();
  const { poseId } = useLocalSearchParams<{ poseId: string }>();
  const pose = POSE_BY_ID[poseId];
  const [plans, setPlans] = useState<Plan[]>([]);
  useFocusEffect(useCallback(() => void listPlans(db).then(setPlans), [db]));

  if (!pose) return <Text style={{ padding: 24 }}>Nem található ászana.</Text>;

  const addTo = async (plan: Plan, sectionKey: string) => {
    await modifyPlan(db, plan.id, (p) => addItem(p, sectionKey, newItem(pose)));
    router.replace({ pathname: '/plan/[id]', params: { id: plan.id } });
  };
  const addToNew = async () => {
    const base = createPlan();
    const main = base.sections[2] ?? base.sections[0];
    const p = await savePlan(db, addItem(base, main.key, newItem(pose)));
    router.replace({ pathname: '/plan/[id]', params: { id: p.id } });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={st.lead}>
        <Text style={{ fontWeight: '700' }}>{pose.hu}</Text> – válaszd ki, melyik óra melyik szakaszába kerüljön.
      </Text>
      <Button label="+ Új óravázlat ezzel az ászanával" onPress={addToNew} style={{ marginVertical: 12 }} />
      {plans.map((p) => (
        <View key={p.id} style={st.card}>
          <Text style={st.title}>{p.title || 'Névtelen óra'}</Text>
          <View style={st.sections}>
            {p.sections.map((s) => (
              <Pressable key={s.key} style={st.section} onPress={() => addTo(p, s.key)}>
                <Text style={st.sectionText}>
                  {s.title} <Text style={{ color: C.muted }}>({s.items.length})</Text>
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  lead: { fontSize: 15, color: C.ink, lineHeight: 21 },
  card: { backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  title: { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 8 },
  sections: { flexDirection: 'row', flexWrap: 'wrap' },
  section: { backgroundColor: C.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginRight: 6, marginBottom: 6 },
  sectionText: { color: C.accent, fontWeight: '600' },
});
