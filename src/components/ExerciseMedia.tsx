import React from 'react';
import { Image, View } from 'react-native';
import { mediaForExercise } from '../domain/media';
import { BodyFigure } from './BodyFigure';

export function ExerciseMedia({ exercise, size = 160 }: { exercise: { name: string; category: string }; size?: number }) {
  const m = mediaForExercise(exercise);
  if (m.kind === 'gif') {
    return (
      <Image
        testID="exercise-media"
        source={m.source}
        accessibilityLabel={`Démonstration : ${exercise.name}`}
        style={{ width: size, height: size, borderRadius: 12, alignSelf: 'center', marginTop: 8 }}
        resizeMode="contain"
      />
    );
  }
  return (
    <View testID="exercise-media" style={{ marginTop: 8 }}>
      <BodyFigure muscles={m.muscles} height={size} />
    </View>
  );
}
