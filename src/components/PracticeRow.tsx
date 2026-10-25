import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CHAKRA_BY_ID, ELEMENT_BY_ID, isPose, isSequence, levelName, POSE_BY_ID } from '../lib/data';
import { C } from '../lib/theme';
import type { Kind, Practice } from '../lib/types';
import { KindIcon } from './KindIcon';
import { PoseFigure } from './PoseFigure';

/** Sorozatnál a jellegzetes (középső) póz figurája, jelzés a sorozatról. */
export const signaturePose = (flow: { pose: string }[]) => POSE_BY_ID[flow[Math.floor((flow.length - 1) / 2)]?.pose];

/** Az ászana figurája, a sorozat jellegzetes póza, vagy a mudra/pránájáma jelképe. */
export function PracticeThumb({ practice, kind, width = 76 }: { practice: Practice; kind: Kind; width?: number }) {
  if (isPose(practice)) return <PoseFigure figure={practice.figure} width={width} />;
  const h = (width * 112) / 140;
  const sig = isSequence(practice) ? signaturePose(practice.flow) : undefined;
  if (sig) {
    return (
      <View style={{ width, height: h }}>
        <PoseFigure figure={sig.figure} width={width} />
        <View style={[st.badge, { width: h * 0.36, height: h * 0.36, borderRadius: h * 0.18 }]}>
          <KindIcon kind="sequence" size={h * 0.3} color={C.accent} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ width, height: h, alignItems: 'center', justifyContent: 'center' }}>
      <KindIcon kind={kind === 'asana' ? 'mudra' : kind} size={h * 0.8} />
    </View>
  );
}

function PracticeRowImpl({
  practice,
  kind,
  onPress,
  right,
}: {
  practice: Practice;
  kind: Kind;
  onPress: () => void;
  right?: React.ReactNode;
}) {
  const ch = CHAKRA_BY_ID[practice.chakras.primary];
  const el = ELEMENT_BY_ID[practice.elements.primary];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.row, pressed && { backgroundColor: C.panel }]}>
      <View style={st.fig}>
        <PracticeThumb practice={practice} kind={kind} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={st.hu}>{practice.hu}</Text>
        <Text style={st.sk}>{practice.sanskrit}</Text>
        <View style={st.meta}>
          <Text style={st.metaText}>{levelName(practice.level)}</Text>
          {ch && <View style={[st.dot, { backgroundColor: ch.color }]} />}
          {ch && <Text style={st.metaText}>{ch.name}</Text>}
          {el && <View style={[st.dot, { backgroundColor: el.color }]} />}
          {el && <Text style={st.metaText}>{el.name}</Text>}
        </View>
      </View>
      {right}
    </Pressable>
  );
}

export const PracticeRow = memo(PracticeRowImpl);

const st = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
  },
  fig: { backgroundColor: C.panel, borderRadius: 10, marginRight: 12, padding: 2 },
  hu: { fontSize: 16, fontWeight: '600', color: C.ink },
  sk: { fontSize: 13, color: C.muted, fontStyle: 'italic', marginTop: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  metaText: { fontSize: 12, color: C.muted, marginRight: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  badge: { position: 'absolute', right: 0, top: 0, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
});
