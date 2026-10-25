import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { DATA } from '../lib/data';
import { EMPTY_FILTER, toggle, type PoseFilter } from '../lib/filters';
import { C } from '../lib/theme';
import { Button, Chip, SectionTitle } from './ui';

export function FilterPanel({
  filter,
  onChange,
  resultCount,
  onClose,
}: {
  filter: PoseFilter;
  onChange: (f: PoseFilter) => void;
  resultCount: number;
  onClose: () => void;
}) {
  const set = (patch: Partial<PoseFilter>) => onChange({ ...filter, ...patch });
  return (
    <View style={st.wrap}>
      <ScrollView contentContainerStyle={st.content}>
        <Text style={st.hint}>Egy szemponton belül bármelyik egyezés elég, a szempontok együtt szűkítenek.</Text>

        <SectionTitle>Kategória</SectionTitle>
        <View style={st.row}>
          {DATA.categories.map((c) => (
            <Chip key={c.id} label={c.name} active={filter.categories.includes(c.id)}
              onPress={() => set({ categories: toggle(filter.categories, c.id) })} />
          ))}
        </View>

        <SectionTitle>Szint</SectionTitle>
        <View style={st.row}>
          {[1, 2, 3].map((lv) => (
            <Chip key={lv} label={DATA.levels[String(lv)]} active={filter.levels.includes(lv)}
              onPress={() => set({ levels: toggle(filter.levels, lv) })} />
          ))}
        </View>

        <SectionTitle>Irányzat</SectionTitle>
        <View style={st.row}>
          {DATA.traditions.map((t) => (
            <Chip key={t.id} label={t.name} active={filter.traditions.includes(t.id)}
              onPress={() => set({ traditions: toggle(filter.traditions, t.id) })} />
          ))}
        </View>

        <SectionTitle>Csakra</SectionTitle>
        <View style={st.row}>
          {DATA.chakras.map((c) => (
            <Chip key={c.id} label={`${c.id}. ${c.name}`} color={c.color} active={filter.chakras.includes(c.id)}
              onPress={() => set({ chakras: toggle(filter.chakras, c.id) })} />
          ))}
        </View>
        <View style={st.switchRow}>
          <Switch value={filter.primaryChakraOnly} onValueChange={(v) => set({ primaryChakraOnly: v })} />
          <Text style={st.switchText}>Csak az elsődleges csakra számítson</Text>
        </View>

        <SectionTitle>Hatásterület</SectionTitle>
        <View style={st.row}>
          {DATA.benefitAreas.map((b) => (
            <Chip key={b.id} label={b.name} active={filter.benefits.includes(b.id)}
              onPress={() => set({ benefits: toggle(filter.benefits, b.id) })} />
          ))}
        </View>
      </ScrollView>
      <View style={st.footer}>
        <Button kind="secondary" label="Törlés" onPress={() => onChange({ ...EMPTY_FILTER, query: filter.query })} />
        <Button label={`${resultCount} ászana mutatása`} onPress={onClose} style={{ flex: 1, marginLeft: 8 }} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 24 },
  hint: { color: C.muted, fontSize: 13 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  switchText: { marginLeft: 8, color: C.ink, fontSize: 14 },
  footer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.surface },
});
