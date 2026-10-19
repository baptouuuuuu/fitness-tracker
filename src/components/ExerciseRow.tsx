import { Link } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { lastDoneLabel } from '../domain/recommendations';
import { DateKey, Exercise, logKey } from '../domain/types';
import { useApp } from '../store/AppContext';
import { useTheme } from './ThemeContext';

const categoryIcon = (c: string) => ({ strength: '💪', cardio: '🏃', stretching: '🧘', mobility: '🤸' } as Record<string, string>)[c] ?? '🏋️';

const reasonIcon = (r: string) => (r.startsWith('Objectif') ? '🎯' : r === 'Jamais fait' ? '🆕' : r.startsWith('Pas fait') ? '⏳' : '💡');

export function ExerciseLogRow({ exercise, date, reasons, tileWidth }: { exercise: Exercise; date: DateKey; reasons?: string[]; tileWidth: number }) {
  const { state, toggleDone } = useApp();
  const { colors } = useTheme();
  const entry = state.logs[logKey(exercise.id, date)];
  const done = entry?.done === true;
  const since = lastDoneLabel(state, exercise.id, date);
  const status = since.days === null ? '🆕' : since.days === 0 ? '' : `🕒 ${since.days}j`;
  const icons = [...new Set((reasons ?? []).map(reasonIcon))].join(' ');
  const details = [entry?.durationMin && `${entry.durationMin}′`, entry?.sets && entry?.reps ? `${entry.sets}×${entry.reps}` : entry?.sets ? `${entry.sets}s` : entry?.reps ? `${entry.reps}r` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <View
      style={{
        width: tileWidth,
        height: tileWidth,
        borderRadius: 16,
        borderWidth: 1,
        padding: 8,
        backgroundColor: done ? colors.successLight : colors.card,
        borderColor: done ? colors.success : colors.border,
        borderWidth: done ? 2 : 1,
        opacity: done ? 0.85 : 1,
        justifyContent: 'space-between',
      }}
    >
      <Link href={{ pathname: '/exercise/[id]', params: { id: exercise.id } }} numberOfLines={3} style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
        {exercise.name}
      </Link>
      <Pressable
        testID={`toggle-${exercise.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${done ? 'Annuler' : 'Valider'} ${exercise.name}`}
        onPress={() => toggleDone(exercise.id, date)}
        style={{ alignItems: 'center' }}
      >
        <Text style={{ fontSize: 30 }}>{categoryIcon(exercise.category)}</Text>
      </Pressable>
      <Text numberOfLines={1} style={{ fontSize: done ? 12 : 16, color: done ? colors.success : colors.muted, textAlign: 'center' }}>
        {done ? details || ' ' : [status, icons].filter(Boolean).join(' ') || ' '}
      </Text>
    </View>
  );
}
