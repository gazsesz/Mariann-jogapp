import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PracticeBrowser } from '../components/PracticeBrowser';
import { Button, Segmented } from '../components/ui';
import { KIND_LIST, KINDS } from '../lib/data';
import { addItem, newItem } from '../lib/plan';
import { getPlan, modifyPlan, useDb } from '../lib/store';
import { C, WIDE } from '../lib/theme';
import type { Kind, Practice } from '../lib/types';

/** Ászanák, mudrák, pránájámák kiválasztása egy óravázlat adott szakaszába (többet is egymás után). */
export default function PickPractices() {
  const db = useDb();
  const { planId, sectionKey } = useLocalSearchParams<{ planId: string; sectionKey: string }>();
  const [sectionTitle, setSectionTitle] = useState('');
  const [kind, setKind] = useState<Kind>('asana');
  const [added, setAdded] = useState<Record<string, number>>({});
  const total = Object.values(added).reduce((a, b) => a + b, 0);

  useEffect(() => {
    getPlan(db, planId).then((p) => setSectionTitle(p?.sections.find((s) => s.key === sectionKey)?.title ?? ''));
  }, [db, planId, sectionKey]);

  const add = async (p: Practice) => {
    await modifyPlan(db, planId, (plan) => addItem(plan, sectionKey, newItem(p, kind)));
    const k = `${kind}:${p.id}`;
    setAdded((a) => ({ ...a, [k]: (a[k] ?? 0) + 1 }));
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: sectionTitle ? `Hozzáadás: ${sectionTitle}` : 'Hozzáadás' }} />
      <View style={st.top}>
        <View style={WIDE}>
          <Segmented
            options={KIND_LIST.map((k) => [k, k === 'asana' ? 'Ászanák' : k === 'mudra' ? 'Mudrák' : 'Pránájáma'] as [Kind, string])}
            value={kind}
            onChange={setKind}
          />
        </View>
      </View>
      <PracticeBrowser
        key={kind}
        kind={kind}
        onSelect={add}
        renderRight={(p) => {
          const n = added[`${kind}:${p.id}`];
          return (
            <View style={st.right}>
              <Pressable onPress={() => router.push({ pathname: '/pose/[id]', params: { id: p.id, kind } })} hitSlop={8}>
                <Text style={st.info}>ⓘ</Text>
              </Pressable>
              <View style={[st.plus, n ? { backgroundColor: C.accent } : null]}>
                <Text style={[st.plusText, n ? { color: '#fff' } : null]}>{n ? `✓${n > 1 ? n : ''}` : '+'}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={st.footer}>
        <Text style={st.footerText}>
          {total ? `${total} gyakorlat hozzáadva` : `Koppints egy ${KINDS[kind].label.toLowerCase()} sorára a hozzáadáshoz`}
        </Text>
        <Button label="Kész" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  top: { padding: 10, paddingBottom: 0, backgroundColor: C.surface },
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
