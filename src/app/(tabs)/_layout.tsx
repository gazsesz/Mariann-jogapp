import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { C } from '../../lib/theme';

function PoseIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Circle cx={12} cy={4.5} r={2.2} fill={color as string} />
      <Path d="M12 8v6M5 9.5l7 1.5 7-1.5M12 14l-4.5 6M12 14l4.5 6" stroke={color as string} strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function MudraIcon({ color }: { color: ColorValue }) {
  const c = color as string;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Circle cx={10} cy={13} r={4.5} stroke={c} strokeWidth={2} fill="none" />
      <Path d="M14 10l5-5M15 13l6-3M14.5 16l5 2" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function BreathIcon({ color }: { color: ColorValue }) {
  const c = color as string;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path d="M3 8c3-3 6-3 9 0s6 3 9 0M3 13c3-3 6-3 9 0s6 3 9 0M3 18c3-3 6-3 9 0s6 3 9 0" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function PlanIcon({ color }: { color: ColorValue }) {
  const c = color as string;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path d="M6 3h12v18H6z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" />
      <Line x1={9} y1={8} x2={15} y2={8} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={9} y1={12} x2={15} y2={12} stroke={c} strokeWidth={2} strokeLinecap="round" />
      <Line x1={9} y1={16} x2={13} y2={16} stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        headerStyle: { backgroundColor: C.surface },
        headerTitleStyle: { color: C.ink },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Ászanatár', tabBarLabel: 'Ászanák', tabBarIcon: PoseIcon }} />
      <Tabs.Screen name="mudrak" options={{ title: 'Mudratár', tabBarLabel: 'Mudrák', tabBarIcon: MudraIcon }} />
      <Tabs.Screen name="pranayamak" options={{ title: 'Pránájámák', tabBarLabel: 'Pránájáma', tabBarIcon: BreathIcon }} />
      <Tabs.Screen name="plans" options={{ title: 'Óravázlataim', tabBarLabel: 'Óráim', tabBarIcon: PlanIcon }} />
    </Tabs>
  );
}
