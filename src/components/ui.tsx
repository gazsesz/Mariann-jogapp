import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C } from '../lib/theme';

export function Chip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[s.chip, active && { backgroundColor: C.accent, borderColor: C.accent }]}
    >
      {color && <View style={[s.dot, { backgroundColor: color }]} />}
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'warn' | 'gold' }) {
  const bg = tone === 'warn' ? C.warnSoft : tone === 'gold' ? C.goldSoft : C.panel;
  const fg = tone === 'warn' ? C.warn : tone === 'gold' ? C.gold : C.muted;
  return (
    <View style={[s.tag, { backgroundColor: bg }]}>
      <Text style={[s.tagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const bg = kind === 'primary' ? C.accent : kind === 'danger' ? C.warnSoft : kind === 'ghost' ? 'transparent' : C.accentSoft;
  const fg = kind === 'primary' ? '#fff' : kind === 'danger' ? C.warn : C.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 }, style]}
    >
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Kapcsolósor néhány nézet között (pl. Órák / Tematikák). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.segment}>
      {options.map(([v, label]) => (
        <Pressable key={v} onPress={() => onChange(v)} style={[s.segBtn, value === v && s.segActive]} accessibilityRole="tab">
          <Text style={[s.segText, value === v && s.segTextActive]} numberOfLines={1}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

export const s = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { fontSize: 14, color: C.ink },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 4, marginBottom: 4 },
  tagText: { fontSize: 12 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '600' },
  segment: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 10, padding: 3 },
  segBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8, alignItems: 'center' },
  segActive: { backgroundColor: C.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  segText: { color: C.muted, fontWeight: '600' },
  segTextActive: { color: C.accent },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
});
