import { recommend, scoreExercise } from '../src/domain/recommendations';
import { build, TODAY } from '../test-utils/helpers';

describe('recommendation scoring', () => {
  it('ranks an exercise not done for a long time above one done yesterday', () => {
    const s = build([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], { done: [['a', '2025-03-01'], ['b', '2025-03-11']] });
    const ids = recommend(s, TODAY).map((r) => r.exercise.id);
    expect(ids).toEqual(['a', 'b']);
  });

  it('treats never-done exercises as maximum recency', () => {
    const s = build([{ id: 'a', name: 'A' }]);
    const r = scoreExercise(s, s.exercises[0], TODAY);
    expect(r.breakdown.recency).toBe(1);
    expect(r.reasons).toContain('Jamais fait');
  });

  it('boosts exercises linked to high-weight objectives', () => {
    const s = build([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], {
      objectives: [{ id: 'o', name: 'Dos', weight: 3, exerciseIds: ['b'] }],
      done: [['a', '2025-03-10'], ['b', '2025-03-10']],
    });
    const recs = recommend(s, TODAY);
    expect(recs[0].exercise.id).toBe('b');
    expect(recs[0].reasons).toContain('Objectif : Dos');
  });

  it('ignores archived objectives', () => {
    let s = build([{ id: 'a', name: 'A' }], { objectives: [{ id: 'o', name: 'Dos', weight: 3, exerciseIds: ['a'] }] });
    s = { ...s, objectives: s.objectives.map((o) => ({ ...o, archived: true })) };
    expect(scoreExercise(s, s.exercises[0], TODAY).breakdown.goalRelevance).toBe(0);
  });

  it('ranks frequent exercises lower than rarely done ones (completion rate)', () => {
    const frequent = ['03-06', '03-08', '03-10', '03-11'].map((d) => ['a', `2025-${d}`] as [string, string]);
    const s = build([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], { done: [...frequent, ['b', '2025-03-11']] });
    const a = scoreExercise(s, s.exercises[0], TODAY);
    const b = scoreExercise(s, s.exercises[1], TODAY);
    expect(a.breakdown.weeklyDeficit).toBe(0);
    expect(a.breakdown.lowCompletionRate).toBeLessThan(b.breakdown.lowCompletionRate);
    expect(b.score).toBeGreaterThan(a.score);
  });

  it('favours neglected categories', () => {
    const s = build(
      [{ id: 'a', name: 'A', category: 'strength' }, { id: 'b', name: 'B', category: 'mobility' }, { id: 'c', name: 'C', category: 'strength' }],
      { done: [['c', '2025-03-10'], ['c', '2025-03-11']] },
    );
    const recs = scoreExercise(s, s.exercises[1], TODAY);
    expect(recs.breakdown.categoryBalance).toBe(1);
    expect(scoreExercise(s, s.exercises[0], TODAY).breakdown.categoryBalance).toBe(0);
  });

  it('excludes exercises already done today and archived ones, and honours the limit', () => {
    let s = build([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }], { done: [['a', TODAY]] });
    s = { ...s, exercises: s.exercises.map((e) => (e.id === 'b' ? { ...e, archived: true } : e)) };
    expect(recommend(s, TODAY).map((r) => r.exercise.id)).toEqual(['c']);
    const many = build(Array.from({ length: 8 }, (_, i) => ({ id: `e${i}`, name: `E${i}` })));
    expect(recommend(many, TODAY, 3)).toHaveLength(3);
  });

  it('is deterministic and keeps scores within 0..100', () => {
    const s = build([{ id: 'b', name: 'B' }, { id: 'a', name: 'A' }], { objectives: [{ id: 'o', name: 'X', weight: 3, exerciseIds: ['a', 'b'] }] });
    const r1 = recommend(s, TODAY);
    expect(r1.map((r) => r.exercise.id)).toEqual(['a', 'b']); // tie broken by name
    expect(recommend(s, TODAY)).toEqual(r1);
    for (const r of r1) expect(r.score).toBeLessThanOrEqual(100);
  });

  it('returns an empty list with no exercises', () => {
    expect(recommend(build([]), TODAY)).toEqual([]);
  });
});
