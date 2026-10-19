import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from './ThemeContext';

type Side = 'front' | 'back';
type Part = { m: string; sides: Side[]; box: [number, number, number, number]; round?: number };

// Minimalist human silhouette on a 100x200 grid: [left, top, width, height].
// Limbs are drawn as left + right pairs so symmetric muscles are always highlighted on both sides.
const PARTS: Part[] = [
  { m: 'head', sides: ['front', 'back'], box: [38, 0, 24, 26], round: 12 },
  { m: 'neck', sides: ['front', 'back'], box: [44, 26, 12, 8], round: 4 },
  { m: 'shoulders', sides: ['front', 'back'], box: [22, 34, 18, 14], round: 7 },
  { m: 'shoulders', sides: ['front', 'back'], box: [60, 34, 18, 14], round: 7 },
  { m: 'chest', sides: ['front'], box: [40, 36, 20, 20], round: 5 },
  { m: 'back', sides: ['back'], box: [40, 36, 20, 30], round: 5 },
  { m: 'core', sides: ['front'], box: [41, 58, 18, 28], round: 5 },
  { m: 'glutes', sides: ['back'], box: [40, 68, 20, 18], round: 7 },
  { m: 'arms', sides: ['front', 'back'], box: [12, 48, 11, 52], round: 5 },
  { m: 'arms', sides: ['front', 'back'], box: [77, 48, 11, 52], round: 5 },
  { m: 'legs', sides: ['front', 'back'], box: [40, 88, 9, 54], round: 4 },
  { m: 'legs', sides: ['front', 'back'], box: [51, 88, 9, 54], round: 4 },
  { m: 'calves', sides: ['front', 'back'], box: [40, 146, 9, 48], round: 4 },
  { m: 'calves', sides: ['front', 'back'], box: [51, 146, 9, 48], round: 4 },
];
const ALL = ['neck', 'shoulders', 'chest', 'back', 'core', 'glutes', 'arms', 'legs', 'calves'];
const WHOLE = new Set(['full-body', 'cardio', 'joints']);

function Figure({ side, active, height }: { side: Side; active: Set<string>; height: number }) {
  const { colors } = useTheme();
  const k = height / 200;
  const box: ViewStyle = { width: 100 * k, height };
  return (
    <View style={box}>
      {PARTS.filter((p) => p.sides.includes(side)).map((p, i) => {
        const on = active.has(p.m);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.box[0] * k,
              top: p.box[1] * k,
              width: p.box[2] * k,
              height: p.box[3] * k,
              borderRadius: (p.round ?? 4) * k,
              backgroundColor: on ? colors.primary : colors.border,
            }}
          />
        );
      })}
    </View>
  );
}

/** Front + back silhouette with the given muscle groups highlighted. */
export function BodyFigure({ muscles, height = 120, testID = 'body-figure' }: { muscles: string[]; height?: number; testID?: string }) {
  const active = new Set<string>(muscles.some((m) => WHOLE.has(m)) ? ALL : muscles);
  return (
    <View testID={testID} accessibilityLabel={`Muscles : ${[...active].join(', ')}`} style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
      <Figure side="front" active={active} height={height} />
      <Figure side="back" active={active} height={height} />
    </View>
  );
}
