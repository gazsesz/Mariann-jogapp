import { memo, useMemo } from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { FIG_H, FIG_W, FLOOR, figureShapes } from '../lib/figure';
import { FIGURE_COLORS as K } from '../lib/theme';
import type { Figure } from '../lib/types';

const limb = { fill: 'none', strokeWidth: 4.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function PoseFigureImpl({ figure, width = 96 }: { figure: Figure; width?: number }) {
  const s = useMemo(() => figureShapes(figure), [figure]);
  return (
    <Svg width={width} height={(width * FIG_H) / FIG_W} viewBox={`0 0 ${FIG_W} ${FIG_H}`}>
      <Rect x={10} y={FLOOR} width={FIG_W - 20} height={3.5} rx={1.75} fill={K.mat} />
      {s.wallX != null && (
        <Line x1={s.wallX} y1={8} x2={s.wallX} y2={FLOOR} stroke={K.far} strokeWidth={3} strokeLinecap="round" />
      )}
      {s.strap && <Polyline points={s.strap} fill="none" stroke={K.strap} strokeWidth={1.6} strokeDasharray="3 2" />}
      {s.far.map((p, i) => (
        <Polyline key={'f' + i} points={p} stroke={K.far} {...limb} />
      ))}
      <Path d={s.torso} fill="none" stroke={K.fig} strokeWidth={6.5} strokeLinecap="round" />
      <Polyline points={s.neck} stroke={K.fig} {...limb} />
      <Circle cx={s.head.cx} cy={s.head.cy} r={s.head.r} fill={K.fig} />
      {s.eye && <Circle cx={s.eye.cx} cy={s.eye.cy} r={s.eye.r} fill={K.eye} />}
      {s.near.map((p, i) => (
        <Polyline key={'n' + i} points={p} stroke={K.fig} {...limb} />
      ))}
    </Svg>
  );
}

export const PoseFigure = memo(PoseFigureImpl);
