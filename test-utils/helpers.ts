import { addExercise, addObjective, setLog } from '../src/domain/state';
import { AppState, DateKey, emptyState } from '../src/domain/types';

export const TODAY: DateKey = '2025-03-12'; // a Wednesday

export function build(
  exercises: { id: string; name: string; category?: string; createdAt?: DateKey }[],
  opts: { objectives?: { id: string; name: string; weight: 1 | 2 | 3; exerciseIds: string[] }[]; done?: [string, DateKey][] } = {},
): AppState {
  let s = emptyState();
  for (const e of exercises) s = addExercise(s, { name: e.name, category: e.category ?? 'strength' }, e.createdAt ?? '2025-01-01', e.id);
  for (const o of opts.objectives ?? []) s = addObjective(s, o, '2025-01-01', o.id);
  for (const [id, date] of opts.done ?? []) s = setLog(s, id, date, { done: true }, 1);
  return s;
}
