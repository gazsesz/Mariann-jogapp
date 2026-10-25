import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PracticeThumb } from '../../components/PracticeRow';
import { Button, SectionTitle, Tag } from '../../components/ui';
import { CONDITION_BY_ID, poseConditions } from '../../lib/cautions';
import { BENEFIT_BY_ID, categoryName, CHAKRA_BY_ID, ELEMENT_BY_ID, KINDS, levelName, TRADITION_BY_ID } from '../../lib/data';
import { C, WIDE } from '../../lib/theme';
import type { Kind, Technique } from '../../lib/types';

/** Ászana, mudra vagy pránájáma adatlapja (a `kind` paraméter dönti el, alapból ászana). */
export default function PracticeDetail() {
  const params = useLocalSearchParams<{ id: string; kind?: Kind }>();
  const kind: Kind = params.kind && params.kind in KINDS ? params.kind : 'asana';
  const p = KINDS[kind].byId[params.id];
  if (!p) return <Text style={{ padding: 24 }}>Nem található.</Text>;
  const t = p as Technique;
  const primary = CHAKRA_BY_ID[p.chakras.primary];
  const conds = poseConditions(p);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[st.content, WIDE]}>
      <Stack.Screen options={{ title: p.hu }} />
      <View style={st.figure}>
        <PracticeThumb practice={p} kind={kind} width={240} />
      </View>
      <Text style={st.hu}>{p.hu}</Text>
      <Text style={st.sk}>
        {p.sanskrit} · {p.en}
      </Text>
      <View style={st.tags}>
        {kind !== 'asana' && <Tag label={KINDS[kind].label} tone="gold" />}
        <Tag label={categoryName(kind, p.category)} />
        <Tag label={levelName(p.level)} />
        {(p.traditions ?? []).map((tr) => (
          <Tag key={tr} label={TRADITION_BY_ID[tr]?.name ?? tr} />
        ))}
      </View>
      {(!!t.pattern || !!t.duration) && (
        <View style={st.facts}>
          {!!t.pattern && (
            <Text style={st.body}>
              <Text style={{ fontWeight: '700' }}>Ritmus: </Text>
              {t.pattern}
            </Text>
          )}
          {!!t.duration && (
            <Text style={st.body}>
              <Text style={{ fontWeight: '700' }}>Ajánlott: </Text>
              {t.duration}
            </Text>
          )}
        </View>
      )}

      <Button
        label="Hozzáadás óravázlathoz"
        onPress={() => router.push({ pathname: '/add-to-plan', params: { poseId: p.id, kind } })}
        style={{ marginTop: 12 }}
      />

      <SectionTitle>Végrehajtás</SectionTitle>
      {p.steps.map((s, i) => (
        <Text key={i} style={st.step}>
          {i + 1}. {s}
        </Text>
      ))}

      <SectionTitle>Hatások</SectionTitle>
      <Text style={st.body}>{p.benefits}</Text>
      <View style={[st.tags, { marginTop: 8 }]}>
        {p.benefitAreas.map((b) => (
          <Tag key={b} label={BENEFIT_BY_ID[b]?.name ?? b} tone="gold" />
        ))}
      </View>

      <SectionTitle>Csakrák</SectionTitle>
      {primary && (
        <View style={st.chakraRow}>
          <View style={[st.dot, { backgroundColor: primary.color }]} />
          <Text style={st.body}>
            <Text style={{ fontWeight: '700' }}>{primary.name}</Text> ({primary.sanskrit}) – elsődleges
          </Text>
        </View>
      )}
      {p.chakras.secondary.map((cid) => {
        const c = CHAKRA_BY_ID[cid];
        return c ? (
          <View key={cid} style={st.chakraRow}>
            <View style={[st.dot, { backgroundColor: c.color }]} />
            <Text style={st.body}>{c.name} ({c.sanskrit})</Text>
          </View>
        ) : null;
      })}
      {!!p.chakras.note && <Text style={[st.body, st.muted]}>{p.chakras.note}</Text>}

      <SectionTitle>Öt elem</SectionTitle>
      {[p.elements.primary, ...p.elements.secondary].map((eid, i) => {
        const e = ELEMENT_BY_ID[eid];
        return e ? (
          <View key={eid} style={st.chakraRow}>
            <View style={[st.dot, { backgroundColor: e.color }]} />
            <Text style={[st.body, { flex: 1 }]}>
              <Text style={{ fontWeight: i === 0 ? '700' : '400' }}>{e.name}</Text> ({e.sanskrit}){i === 0 ? ' – elsődleges' : ''}
              {i === 0 ? <Text style={{ color: C.muted }}>{'\n'}{e.quality}</Text> : null}
            </Text>
          </View>
        ) : null;
      })}

      <SectionTitle>Ellenjavallatok, óvatosság</SectionTitle>
      <View style={st.warnBox}>
        <Text style={[st.body, { color: C.warn }]}>{p.cautions}</Text>
        {conds.length > 0 && (
          <View style={[st.tags, { marginTop: 8 }]}>
            {conds.map((c) => (
              <Tag key={c} label={CONDITION_BY_ID[c].name} tone="warn" />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  figure: { alignItems: 'center', backgroundColor: C.panel, borderRadius: 16, paddingVertical: 8 },
  hu: { fontSize: 24, fontWeight: '700', color: C.ink, marginTop: 14 },
  sk: { fontSize: 15, color: C.muted, fontStyle: 'italic', marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  step: { fontSize: 15, color: C.ink, lineHeight: 22, marginBottom: 6 },
  body: { fontSize: 15, color: C.ink, lineHeight: 22 },
  muted: { color: C.muted, marginTop: 4 },
  chakraRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  facts: { marginTop: 10, backgroundColor: C.accentSoft, borderRadius: 12, padding: 12, gap: 4 },
  warnBox: { backgroundColor: C.warnSoft, borderRadius: 12, padding: 12 },
});
