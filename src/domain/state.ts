import { EXERCISE_TEMPLATES, ObjectiveTemplate } from './templates';
import { AppState, DateKey, Exercise, LogEntry, Objective, logKey } from './types';

let counter = 0;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export interface ExerciseInput {
  name: string;
  category: string;
}

export interface ObjectiveInput {
  name: string;
  weight: 1 | 2 | 3;
  exerciseIds: string[];
}

export interface LogInput {
  done: boolean;
  note?: string;
  durationMin?: number;
  reps?: number;
  sets?: number;
}

const clean = (s: string) => s.trim().replace(/\s+/g, ' ');
const sameName = (a: string, b: string) => clean(a).toLowerCase() === clean(b).toLowerCase();

export function addExercise(state: AppState, input: ExerciseInput, today: DateKey, id = newId('ex')): AppState {
  const name = clean(input.name);
  if (!name) return state;
  const existing = state.exercises.find((e) => sameName(e.name, name));
  if (existing) {
    return existing.archived ? updateExercise(state, existing.id, { archived: false }) : state;
  }
  const exercise: Exercise = { id, name, category: clean(input.category) || 'other', archived: false, createdAt: today };
  return { ...state, exercises: [...state.exercises, exercise] };
}

export function updateExercise(state: AppState, id: string, patch: Partial<ExerciseInput & { archived: boolean }>): AppState {
  return {
    ...state,
    exercises: state.exercises.map((e) => {
      if (e.id !== id) return e;
      const name = patch.name !== undefined ? clean(patch.name) || e.name : e.name;
      const category = patch.category !== undefined ? clean(patch.category) || e.category : e.category;
      return { ...e, name, category, archived: patch.archived ?? e.archived };
    }),
  };
}

/** Permanently removes an exercise, its logs and its objective links. */
export function deleteExercise(state: AppState, id: string): AppState {
  const logs: Record<string, LogEntry> = {};
  for (const [k, l] of Object.entries(state.logs)) if (l.exerciseId !== id) logs[k] = l;
  return {
    exercises: state.exercises.filter((e) => e.id !== id),
    objectives: state.objectives.map((o) => ({ ...o, exerciseIds: o.exerciseIds.filter((x) => x !== id) })),
    logs,
  };
}

export function addObjective(state: AppState, input: ObjectiveInput, today: DateKey, id = newId('ob')): AppState {
  const name = clean(input.name);
  if (!name) return state;
  const objective: Objective = {
    id,
    name,
    weight: input.weight,
    exerciseIds: validIds(state, input.exerciseIds),
    archived: false,
    createdAt: today,
  };
  return { ...state, objectives: [...state.objectives, objective] };
}

function validIds(state: AppState, ids: string[]): string[] {
  const known = new Set(state.exercises.map((e) => e.id));
  return [...new Set(ids)].filter((i) => known.has(i));
}

export function updateObjective(state: AppState, id: string, patch: Partial<ObjectiveInput & { archived: boolean }>): AppState {
  return {
    ...state,
    objectives: state.objectives.map((o) => {
      if (o.id !== id) return o;
      return {
        ...o,
        name: patch.name !== undefined ? clean(patch.name) || o.name : o.name,
        weight: patch.weight ?? o.weight,
        exerciseIds: patch.exerciseIds ? validIds(state, patch.exerciseIds) : o.exerciseIds,
        archived: patch.archived ?? o.archived,
      };
    }),
  };
}

export function deleteObjective(state: AppState, id: string): AppState {
  return { ...state, objectives: state.objectives.filter((o) => o.id !== id) };
}

/** Creates an objective from a template, creating any missing template exercises. */
export function addObjectiveFromTemplate(state: AppState, template: ObjectiveTemplate, today: DateKey): AppState {
  let next = state;
  const ids: string[] = [];
  for (const tid of template.exerciseTemplateIds) {
    const t = EXERCISE_TEMPLATES.find((x) => x.id === tid);
    if (!t) continue;
    next = addExercise(next, { name: t.name, category: t.category }, today);
    const ex = next.exercises.find((e) => sameName(e.name, t.name));
    if (ex) ids.push(ex.id);
  }
  const existing = next.objectives.find((o) => sameName(o.name, template.name));
  if (existing) {
    return updateObjective(next, existing.id, { archived: false, exerciseIds: [...existing.exerciseIds, ...ids] });
  }
  return addObjective(next, { name: template.name, weight: template.weight, exerciseIds: ids }, today);
}

const positive = (n: number | undefined) => (n !== undefined && Number.isFinite(n) && n > 0 ? Math.round(n) : undefined);

/** Creates, updates or removes (when empty and not done) the log of an exercise for a day. */
export function setLog(state: AppState, exerciseId: string, date: DateKey, input: LogInput, now = Date.now()): AppState {
  if (!state.exercises.some((e) => e.id === exerciseId)) return state;
  const key = logKey(exerciseId, date);
  const note = input.note?.trim() || undefined;
  const entry: LogEntry = {
    exerciseId,
    date,
    done: input.done,
    note,
    durationMin: positive(input.durationMin),
    reps: positive(input.reps),
    sets: positive(input.sets),
    updatedAt: now,
  };
  const logs = { ...state.logs };
  const empty = !entry.done && !entry.note && !entry.durationMin && !entry.reps && !entry.sets;
  if (empty) delete logs[key];
  else logs[key] = entry;
  return { ...state, logs };
}

export function toggleDone(state: AppState, exerciseId: string, date: DateKey, now = Date.now()): AppState {
  const current = state.logs[logKey(exerciseId, date)];
  return setLog(state, exerciseId, date, { ...(current ?? {}), done: !current?.done }, now);
}
