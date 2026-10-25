import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { KINDS } from '../lib/data';
import { listPlans, modifyPlan, savePlan, useDb } from '../lib/store';
import { addItem, createPlan, newItem } from '../lib/plan';
import { C, WIDE } from '../lib/theme';
import type { Kind, Plan } from '../lib/types';

/** Egy ászana, mudra vagy pránájáma hozzáadása egy meglévő vagy új óravázlat valamelyik szakaszához. */
export default function AddToPlan() {
  const db = useDb();
  const params = useLocalSearchParams<{ poseId: string; kind?: Kind }>();
  const kind: Kind = params.kind && params.kind in KINDS ? params.kind : 'asana';
  const pose = KINDS[kind].byId[params.poseId];
  const [plans, setPlans] = useState<Plan[]>([]);
  useFocusEffect(useCallback(() => void listPlans(db).then(setPlans), [db]));

  if (!pose) return <Text style={{ padding: 24 }}>Nem található.</Text>;

  const addTo = async (plan: Plan, sectionKey: string) => {
    await modifyPlan(db, plan.id, (p) => addItem(p, sectionKey, newItem(pose, kind)));
    router.replace({ pathname: '/plan/[id]', params: { id: plan.id } });
  };
  const addToNew = async () => {
    const base = createPlan();
    // ászana a fő részbe, mudra és pránájáma a ráhangolódásba
    const main = (kind === 'asana' ? base.sections[2] : base.sections[0]) ?? base.sections[0];
    const p = await savePlan(db, addItem(base, main.key, newItem(pose, kind)));
    router.replace({ pathname: '/plan/[id]', params: { id: p.id } });
  };

  return (
    <ScrollView contentContainerStyle={[{ padding: 16 }, WIDE]}>
      <Text style={st.lead}>
        <Text style={{ fontWeight: '700' }}>{pose.hu}</Text> – válaszd ki, melyik óra melyik szakaszába kerüljön.
      </Text>
      <Button label="+ Új óravázlat ezzel" onPress={addToNew} style={{ marginVertical: 12 }} />
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
