import Svg, { Circle, Path } from 'react-native-svg';
import { C } from '../lib/theme';
import type { Kind } from '../lib/types';

/** Jelkép a mudrákhoz (összeérő ujjak köre), a pránájámákhoz (légzéshullámok) és a sorozatokhoz (körforgás). */
export function KindIcon({ kind, size = 48, color = C.fig }: { kind: Exclude<Kind, 'asana'>; size?: number; color?: string }) {
  if (kind === 'sequence') {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Path d="M38 20 A15 15 0 0 0 11 15" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M10 28 A15 15 0 0 0 37 33" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M11 7 L11 15 L19 15 M37 41 L37 33 L29 33" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }
  if (kind === 'mudra') {
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Circle cx={20} cy={26} r={9} stroke={color} strokeWidth={3} fill="none" />
        <Path d="M27 20 L38 9 M29 26 L42 20 M28 31 L40 34" stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Circle cx={20} cy={26} r={2.5} fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {[14, 24, 34].map((y, i) => (
        <Path
          key={y}
          d={`M6 ${y} C 12 ${y - 6}, 18 ${y - 6}, 24 ${y} S 36 ${y + 6}, 42 ${y}`}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={i === 1 ? 1 : 0.55}
        />
      ))}
    </Svg>
  );
}
