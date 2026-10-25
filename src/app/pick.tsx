import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PoseBrowser } from '../components/PoseBrowser';
import { Button } from '../components/ui';
import { getPlan, modifyPlan, useDb } from '../lib/store';
import { addItem, newItem } from '../lib/plan';
import { C } from '../lib/theme';
import type { Pose } from '../lib/types';

/** Ászanák kiválasztása egy óravázlat adott szakaszába (többet is egymás után). */
export default function PickPoses() {
  const db = useDb();
  const { planId, sectionKey } = useLocalSearchParams<{ planId: string; sectionKey: string }>();
  const [sectionTitle, setSectionTitle] = useState('');
  const [added, setAdded] = useState<Record<string, number>>({});
  const total = Object.values(added).reduce((a, b) => a + b, 0);

  useEffect(() => {
    getPlan(db, planId).then((p) => setSectionTitle(p?.sections.find((s) => s.key === sectionKey)?.title ?? ''));
  }, [db, planId, sectionKey]);

  const add = async (p: Pose) => {
    await modifyPlan(db, planId, (plan) => addItem(plan, sectionKey, newItem(p)));
    setAdded((a) => ({ ...a, [p.id]: (a[p.id] ?? 0) + 1 }));
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: sectionTitle ? `Hozzáadás: ${sectionTitle}` : 'Ászanák hozzáadása' }} />
      <PoseBrowser
        onSelect={add}
        renderRight={(p) => (
          <View style={st.right}>
            <Pressable onPress={() => router.push({ pathname: '/pose/[id]', params: { id: p.id } })} hitSlop={8}>
              <Text style={st.info}>ⓘ</Text>
            </Pressable>
            <View style={[st.plus, added[p.id] ? { backgroundColor: C.accent } : null]}>
              <Text style={[st.plusText, added[p.id] ? { color: '#fff' } : null]}>
                {added[p.id] ? `✓${added[p.id] > 1 ? added[p.id] : ''}` : '+'}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={st.footer}>
        <Text style={st.footerText}>{total ? `${total} ászana hozzáadva` : 'Koppints egy ászanára a hozzáadáshoz'}</Text>
        <Button label="Kész" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  right: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { fontSize: 22, color: C.muted },
  plus: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  plusText: { color: C.accent, fontSize: 18, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  footerText: { color: C.muted, flex: 1 },
});
