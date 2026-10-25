import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Tag } from '../../components/ui';
import { confirm } from '../../lib/confirm';
import { levelName } from '../../lib/data';
import { deletePlan, listPlans, savePlan } from '../../lib/db';
import { fold } from '../../lib/filters';
import { createPlan, duplicatePlan, poseCount } from '../../lib/plan';
import { C } from '../../lib/theme';
import type { Plan } from '../../lib/types';

export default function PlansScreen() {
  const db = useSQLiteContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [query, setQuery] = useState('');

  const reload = useCallback(() => {
    listPlans(db).then(setPlans);
  }, [db]);
  useFocusEffect(reload);

  const shown = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return plans;
    return plans.filter((p) => fold([p.title, p.theme, ...p.tags].join(' ')).includes(q));
  }, [plans, query]);

  const create = async () => {
    const p = await savePlan(db, createPlan());
    router.push({ pathname: '/plan/[id]', params: { id: p.id } });
  };
  const duplicate = async (p: Plan) => {
    await savePlan(db, duplicatePlan(p));
    reload();
  };
  const remove = async (p: Plan) => {
    if (await confirm('Óravázlat törlése', `Biztosan törlöd: „${p.title}”?`)) {
      await deletePlan(db, p.id);
      reload();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={st.bar}>
        <TextInput
          style={st.search}
          placeholder="Keresés címre, témára, címkére"
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={setQuery}
        />
        <Button label="+ Új óra" onPress={create} />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <Text style={st.empty}>
            {plans.length
              ? 'Nincs találat.'
              : 'Még nincs óravázlatod. Hozz létre egyet az „Új óra” gombbal, vagy egy ászana lapjáról add hozzá.'}
          </Text>
        }
        renderItem={({ item: p }) => (
          <Pressable
            style={({ pressed }) => [st.card, pressed && { opacity: 0.8 }]}
            onPress={() => router.push({ pathname: '/plan/[id]', params: { id: p.id } })}
          >
            <Text style={st.title}>{p.title || 'Névtelen óra'}</Text>
            {!!p.theme && <Text style={st.theme}>{p.theme}</Text>}
            <Text style={st.meta}>
              {poseCount(p)} ászana
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
        )}
      />
    </View>
  );
}

const st = StyleSheet.create({
  bar: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line },
  search: {
    flex: 1,
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
  title: { fontSize: 17, fontWeight: '700', color: C.ink },
  theme: { fontSize: 14, color: C.ink, marginTop: 2 },
  meta: { fontSize: 13, color: C.muted, marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, marginRight: -8, marginBottom: -6 },
});
