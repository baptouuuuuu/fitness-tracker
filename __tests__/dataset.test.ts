import { DATASET, datasetExercise, datasetMuscle, searchDataset } from '../src/domain/dataset';
import { addExercise, updateExercise } from '../src/domain/state';
import { emptyState } from '../src/domain/types';
import { migrate } from '../src/storage/persistence';

describe('exercise library', () => {
  it('searches and filters offline data using French labels and English names', () => {
    expect(DATASET.length).toBe(1324);
    expect(searchDataset('pectoraux', 'chest', 'body weight').length).toBeGreaterThan(0);
    expect(searchDataset('push-up', 'chest', 'body weight').some((item) => item.id === '0662')).toBe(true);
    expect(searchDataset('pompes', 'chest', 'body weight').some((item) => item.id === '0662')).toBe(true);
    expect(searchDataset('push-up', 'back', '').some((item) => item.id === '0662')).toBe(false);
    expect(datasetExercise('0662')?.steps.length).toBeGreaterThan(0);
    expect(datasetMuscle(datasetExercise('0662')!)).toBe('chest');
  });

  it('preserves the dataset link through edits, restoration and persistence', () => {
    let state = addExercise(emptyState(), { name: 'push-up', category: 'strength', datasetId: '0662' }, '2026-01-01', 'a');
    state = updateExercise(state, 'a', { name: 'Pompes', archived: true });
    state = migrate({ version: 1, data: state });
    state = addExercise(state, { name: 'push-up', category: 'strength', datasetId: '0662' }, '2026-01-02');
    expect(state.exercises).toHaveLength(1);
    expect(state.exercises[0]).toMatchObject({ name: 'Pompes', datasetId: '0662', archived: false });
  });
});
