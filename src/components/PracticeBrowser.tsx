import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { KINDS } from '../lib/data';
import { activeFilterCount, EMPTY_FILTER, filterPoses, type PoseFilter } from '../lib/filters';
import { C, WIDE } from '../lib/theme';
import type { Kind, Practice } from '../lib/types';
import { FilterPanel } from './FilterPanel';
import { PracticeRow } from './PracticeRow';

/** Kereshető, szűrhető ászana-, mudra- vagy pránájáma-lista kategóriánként csoportosítva. */
export function PracticeBrowser({
  kind = 'asana',
  onSelect,
  renderRight,
}: {
  kind?: Kind;
  onSelect: (p: Practice) => void;
  renderRight?: (p: Practice) => React.ReactNode;
}) {
  const info = KINDS[kind];
  const [filter, setFilter] = useState<PoseFilter>(EMPTY_FILTER);
  const [showFilters, setShowFilters] = useState(false);
  const results = useMemo(() => filterPoses(info.items, filter), [info, filter]);
  const sections = useMemo(
    () =>
      info.categories
        .map((c) => ({ key: c.id, title: c.name, data: results.filter((p) => p.category === c.id) }))
        .filter((s) => s.data.length),
    [info, results],
  );
  const n = activeFilterCount(filter);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={st.barOuter}>
        <View style={[st.bar, WIDE]}>
          <TextInput
            style={st.search}
            placeholder="Keresés (magyar, szanszkrit vagy angol név)"
            placeholderTextColor={C.muted}
            value={filter.query}
            onChangeText={(query) => setFilter({ ...filter, query })}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={[st.filterBtn, (n > 0 || showFilters) && { backgroundColor: C.accent }]}
            accessibilityRole="button"
          >
            <Text style={[st.filterBtnText, (n > 0 || showFilters) && { color: '#fff' }]}>
              Szűrők{n ? ` (${n})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>
      {showFilters ? (
        <FilterPanel kind={kind} filter={filter} onChange={setFilter} resultCount={results.length} onClose={() => setShowFilters(false)} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(p) => p.id}
          stickySectionHeadersEnabled
          initialNumToRender={12}
          renderSectionHeader={({ section }) => (
            <Text style={st.header}>
              {section.title} <Text style={st.headerCount}>{section.data.length}</Text>
            </Text>
          )}
          renderItem={({ item }) => <PracticeRow practice={item} kind={kind} onPress={() => onSelect(item)} right={renderRight?.(item)} />}
          ListHeaderComponent={
            <Text style={st.count}>
              {results.length} / {info.items.length} {info.label.toLowerCase()}
              {n > 0 ? ' a szűrők alapján' : ''}
            </Text>
          }
          ListEmptyComponent={<Text style={st.empty}>Nincs a szűrőknek megfelelő találat.</Text>}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={WIDE}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  barOuter: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line },
  bar: { flexDirection: 'row', padding: 10, gap: 8 },
  search: {
    flex: 1,
    minWidth: 0,
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    color: C.ink,
    borderWidth: 1,
    borderColor: C.line,
  },
  filterBtn: { paddingHorizontal: 14, justifyContent: 'center', borderRadius: 10, backgroundColor: C.accentSoft },
  filterBtnText: { color: C.accent, fontWeight: '600', fontSize: 15 },
  header: {
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 6,
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  headerCount: { color: C.muted, fontWeight: '400' },
  count: { paddingHorizontal: 12, paddingTop: 10, color: C.muted, fontSize: 13 },
  empty: { padding: 24, textAlign: 'center', color: C.muted },
});
