import { StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';

/** Vízszintes sávdiagram, pl. csakra- vagy elem-egyensúlyhoz. */
export function BalanceBars({
  rows,
  counts,
}: {
  rows: { id: string | number; name: string; color: string }[];
  counts: Record<string, number>;
}) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <View>
      {rows.map((r) => {
        const n = counts[r.id] ?? 0;
        return (
          <View key={r.id} style={st.row}>
            <Text style={st.label}>{r.name}</Text>
            <View style={st.track}>
              <View style={{ width: `${(n / max) * 100}%`, backgroundColor: r.color, height: 10, borderRadius: 5 }} />
            </View>
            <Text style={st.count}>{n}</Text>
          </View>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { width: 120, fontSize: 13, color: C.ink },
  track: { flex: 1, backgroundColor: C.panel, height: 10, borderRadius: 5, overflow: 'hidden' },
  count: { width: 28, textAlign: 'right', fontSize: 13, color: C.muted },
});
