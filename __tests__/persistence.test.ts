import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadState, migrate, saveState, SCHEMA_VERSION, STORAGE_KEY } from '../src/storage/persistence';
import { setLog } from '../src/domain/state';
import { build, TODAY } from '../test-utils/helpers';

describe('persistence', () => {
  beforeEach(() => AsyncStorage.clear());

  it('round-trips state through storage', async () => {
    const s = setLog(build([{ id: 'a', name: 'A' }]), 'a', TODAY, { done: true, note: 'ok' });
    await saveState(s);
    expect(await loadState()).toEqual(s);
  });

  it('returns empty state for missing or corrupt data', async () => {
    expect((await loadState()).exercises).toEqual([]);
    await AsyncStorage.setItem(STORAGE_KEY, '{not json');
    expect((await loadState()).exercises).toEqual([]);
    expect(migrate(null).logs).toEqual({});
  });

  it('migrates legacy unversioned data (logs as array)', () => {
    const legacy = {
      exercises: [{ id: 'a', name: 'A', category: 'strength', createdAt: '2025-01-01' }],
      objectives: [],
      logs: [{ exerciseId: 'a', date: TODAY, done: true }],
    };
    const s = migrate(legacy);
    expect(s.logs[`${TODAY}|a`].done).toBe(true);
  });

  it('runs chained migrations in order and sanitizes bad records', () => {
    const calls: number[] = [];
    const s = migrate(
      { version: 1, data: { exercises: [{ id: 'a', name: 'A' }, { bad: true }], objectives: [{ id: 'o', name: 'O', exerciseIds: ['a', 'zzz'] }], logs: { x: { exerciseId: 'ghost', date: TODAY } } } },
      { 1: (d) => { calls.push(1); return d; }, 2: (d) => { calls.push(2); return d; } },
      3,
    );
    expect(calls).toEqual([1, 2]);
    expect(s.exercises).toHaveLength(1);
    expect(s.objectives[0].exerciseIds).toEqual(['a']);
    expect(s.logs).toEqual({});
  });

  it('writes the current schema version', async () => {
    await saveState(build([]));
    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!).version).toBe(SCHEMA_VERSION);
  });
});
