import React from 'react';
import { Image } from 'react-native';
import { mediaForExercise } from '../domain/media';

export function ExerciseMedia({ exercise, size = 160 }: { exercise: { name: string; category: string }; size?: number }) {
  const m = mediaForExercise(exercise);
  return (
    <Image
      testID="exercise-media"
      source={m.source}
      accessibilityLabel={m.kind === 'gif' ? `Démonstration : ${exercise.name}` : `Muscles ciblés : ${m.muscleLabel}`}
      style={{ width: size, height: size, borderRadius: 12, alignSelf: 'center', marginTop: 8 }}
      resizeMode="contain"
    />
  );
}
