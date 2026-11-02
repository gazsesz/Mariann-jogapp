import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PracticeBrowser } from '../../components/PracticeBrowser';
import { C, WIDE } from '../../lib/theme';
import type { Kind } from '../../lib/types';

/** Elöl az ászanák, sorozatok és légzőgyakorlatok; a mudratár a haladó részben, külön oldalon. */
const SEGMENTS: [Kind, string][] = [
  ['asana', 'Ászanák'],
  ['sequence', 'Sorozatok'],
  ['pranayama', 'Légzés'],
];

export default function PracticeLibrary() {
  const [kind, setKind] = useState<Kind>('asana');
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={st.top}>
        <View style={[st.row, WIDE]}>
          <View style={st.segment} accessibilityRole="tablist">
            {SEGMENTS.map(([k, label]) => (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                style={[st.segBtn, kind === k && st.segActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: kind === k }}
              >
                <Text style={[st.segText, kind === k && st.segTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => router.push('/mudrak')} style={st.more} accessibilityRole="link" accessibilityHint="Haladó: mudratár">
            <Text style={st.moreText}>Mudrák ›</Text>
          </Pressable>
        </View>
      </View>
      <PracticeBrowser
        key={kind}
        kind={kind}
        onSelect={(p) => router.push({ pathname: '/pose/[id]', params: kind === 'asana' ? { id: p.id } : { id: p.id, kind } })}
      />
    </View>
  );
}

const st = StyleSheet.create({
  top: { backgroundColor: C.surface },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10, gap: 8 },
  segment: { flex: 1, flexDirection: 'row', backgroundColor: C.panel, borderRadius: 12, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  segActive: { backgroundColor: C.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  segText: { color: C.muted, fontWeight: '600', fontSize: 14 },
  segTextActive: { color: C.accent },
  more: { paddingHorizontal: 6, paddingVertical: 10 },
  moreText: { color: C.muted, fontSize: 14, fontWeight: '600' },
});
