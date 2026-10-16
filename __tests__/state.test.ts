import {
  addExercise, addObjectiveFromTemplate, deleteExercise, setLog, toggleDone, updateExercise,
} from '../src/domain/state';
import { OBJECTIVE_TEMPLATES } from '../src/domain/templates';
import { emptyState } from '../src/domain/types';
import { build, TODAY } from '../test-utils/helpers';

describe('state transformations', () => {
  it('adds exercises, ignoring blanks and duplicates', () => {
    let s = addExercise(emptyState(), { name: '  Pompes ', category: 'strength' }, TODAY, 'x');
    s = addExercise(s, { name: 'pompes', category: 'strength' }, TODAY);
    s = addExercise(s, { name: '   ', category: 'strength' }, TODAY);
    expect(s.exercises).toHaveLength(1);
    expect(s.exercises[0].name).toBe('Pompes');
  });

  it('restores an archived exercise when re-added', () => {
    let s = build([{ id: 'a', name: 'A' }]);
    s = updateExercise(s, 'a', { archived: true });
    s = addExercise(s, { name: 'A', category: 'strength' }, TODAY);
    expect(s.exercises[0].archived).toBe(false);
  });

  it('upserts logs and removes empty undone logs', () => {
    let s = build([{ id: 'a', name: 'A' }]);
    s = setLog(s, 'a', TODAY, { done: true, note: ' good ', durationMin: 10.4, sets: 3, reps: -2 });
    expect(s.logs[`${TODAY}|a`]).toMatchObject({ done: true, note: 'good', durationMin: 10, sets: 3, reps: undefined });
    s = toggleDone(s, 'a', TODAY);
    expect(s.logs[`${TODAY}|a`].done).toBe(false);
    s = setLog(s, 'a', TODAY, { done: false });
    expect(Object.keys(s.logs)).toHaveLength(0);
  });

  it('ignores logs for unknown exercises', () => {
    const s = build([]);
    expect(setLog(s, 'nope', TODAY, { done: true })).toBe(s);
  });

  it('deleting an exercise cleans logs and objective links', () => {
    let s = build([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], {
      objectives: [{ id: 'o', name: 'O', weight: 2, exerciseIds: ['a', 'b'] }],
      done: [['a', TODAY], ['b', TODAY]],
    });
    s = deleteExercise(s, 'a');
    expect(s.exercises.map((e) => e.id)).toEqual(['b']);
    expect(s.objectives[0].exerciseIds).toEqual(['b']);
    expect(Object.keys(s.logs)).toEqual([`${TODAY}|b`]);
  });

  it('creates an objective from a template with its exercises, idempotently', () => {
    const t = OBJECTIVE_TEMPLATES[0];
    let s = addObjectiveFromTemplate(emptyState(), t, TODAY);
    expect(s.objectives).toHaveLength(1);
    expect(s.objectives[0].exerciseIds).toHaveLength(t.exerciseTemplateIds.length);
    const again = addObjectiveFromTemplate(s, t, TODAY);
    expect(again.objectives).toHaveLength(1);
    expect(again.exercises).toHaveLength(s.exercises.length);
  });
});
