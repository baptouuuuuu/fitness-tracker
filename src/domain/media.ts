import catalog from '../../assets/exercises/catalog.json';
import { GIFS, MUSCLE_IMAGES } from './mediaRegistry';

export interface ExerciseMedia {
  /** 'gif' when a demo exists, otherwise an illustration of the targeted muscle group. */
  kind: 'gif' | 'muscle';
  source: number;
  muscle: string;
  muscleLabel: string;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const BY_NAME = new Map(Object.entries(catalog.exercises).map(([id, e]) => [norm(e.name), id]));
const groups = catalog.muscleGroups as Record<string, string>;
const defaults = catalog.categoryDefaultMuscle as Record<string, string>;

export function templateIdForName(name: string): string | undefined {
  return BY_NAME.get(norm(name));
}

export function mediaForExercise(exercise: { name: string; category: string }): ExerciseMedia {
  const tid = templateIdForName(exercise.name);
  const known = tid ? (catalog.exercises as Record<string, { muscle: string }>)[tid] : undefined;
  const muscle = known?.muscle ?? defaults[exercise.category] ?? 'full-body';
  const muscleLabel = groups[muscle] ?? muscle;
  if (tid && GIFS[tid]) return { kind: 'gif', source: GIFS[tid], muscle, muscleLabel };
  return { kind: 'muscle', source: MUSCLE_IMAGES[muscle] ?? MUSCLE_IMAGES['full-body'], muscle, muscleLabel };
}
