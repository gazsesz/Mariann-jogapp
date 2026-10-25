import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { saveSeries, useDb } from '../../lib/store';
import { createSeries, SERIES_TEMPLATES } from '../../lib/series';
import { C } from '../../lib/theme';

/** Új tematika indítása sablonból. */
export default function NewSeries() {
  const db = useDb();
  const start = async (templateId: string) => {
    const s = await saveSeries(db, createSeries(templateId));
    router.replace({ pathname: '/series/[id]', params: { id: s.id } });
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={st.lead}>Miből induljon a tematika? A napok címe és fókusza utána szabadon átírható.</Text>
      {SERIES_TEMPLATES.map((t) => (
        <Pressable key={t.id} style={({ pressed }) => [st.card, pressed && { opacity: 0.8 }]} onPress={() => start(t.id)}>
          <Text style={st.title}>{t.name}</Text>
          <Text style={st.desc}>{t.description}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  lead: { fontSize: 15, color: C.ink, lineHeight: 21, marginBottom: 12 },
  card: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  title: { fontSize: 17, fontWeight: '700', color: C.accent },
  desc: { fontSize: 14, color: C.muted, marginTop: 4, lineHeight: 20 },
});
