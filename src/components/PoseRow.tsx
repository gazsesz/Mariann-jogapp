import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CHAKRA_BY_ID, levelName } from '../lib/data';
import { C } from '../lib/theme';
import type { Pose } from '../lib/types';
import { PoseFigure } from './PoseFigure';

function PoseRowImpl({ pose, onPress, right }: { pose: Pose; onPress: () => void; right?: React.ReactNode }) {
  const ch = CHAKRA_BY_ID[pose.chakras.primary];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.row, pressed && { backgroundColor: C.panel }]}>
      <View style={st.fig}>
        <PoseFigure figure={pose.figure} width={76} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={st.hu}>{pose.hu}</Text>
        <Text style={st.sk}>{pose.sanskrit}</Text>
        <View style={st.meta}>
          <Text style={st.metaText}>{levelName(pose.level)}</Text>
          {ch && <View style={[st.dot, { backgroundColor: ch.color }]} />}
          {ch && <Text style={st.metaText}>{ch.name}</Text>}
        </View>
      </View>
      {right}
    </Pressable>
  );
}

export const PoseRow = memo(PoseRowImpl);

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
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 12, color: C.muted, marginRight: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
});
