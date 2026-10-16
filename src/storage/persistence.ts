import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDateKey } from '../domain/dates';
import { AppState, emptyState, LogEntry, logKey } from '../domain/types';

export const STORAGE_KEY = 'fitness-tracker/state';
/** Bump when the persisted shape changes and add a step to `MIGRATIONS`. */
export const SCHEMA_VERSION = 1;

export interface Envelope {
  version: number;
  data: unknown;
}

/** `MIGRATIONS[n]` upgrades data from version n to n + 1. */
export type Migration = (data: any) => any;
export const MIGRATIONS: Record<number, Migration> = {
  // Version 0 (unversioned legacy payload) stored logs as an array.
  0: (data) => ({ ...data, logs: Array.isArray(data?.logs) ? data.logs : Object.values(data?.logs ?? {}) }),
};

/** Brings a raw persisted payload to the current schema; never throws. */
export function migrate(raw: unknown, migrations: Record<number, Migration> = MIGRATIONS, target = SCHEMA_VERSION): AppState {
  if (!raw || typeof raw !== 'object') return emptyState();
  const env = raw as Partial<Envelope>;
  let version = typeof env.version === 'number' ? env.version : 0;
  let data: any = typeof env.version === 'number' ? env.data : raw;
  if (version > target) return sanitize(data);
  try {
    while (version < target) {
      data = (migrations[version] ?? ((d) => d))(data);
      version += 1;
    }
  } catch {
    return emptyState();
  }
  return sanitize(data);
}

/** Drops malformed records so a corrupted store can never crash the UI. */
export function sanitize(data: any): AppState {
  if (!data || typeof data !== 'object') return emptyState();
  const exercises = (Array.isArray(data.exercises) ? data.exercises : [])
    .filter((e: any) => e && typeof e.id === 'string' && typeof e.name === 'string')
    .map((e: any) => ({
      id: e.id,
      name: e.name,
      category: typeof e.category === 'string' && e.category ? e.category : 'other',
      archived: e.archived === true,
      createdAt: isDateKey(e.createdAt) ? e.createdAt : '1970-01-01',
    }));
  const ids = new Set(exercises.map((e: { id: string }) => e.id));
  const objectives = (Array.isArray(data.objectives) ? data.objectives : [])
    .filter((o: any) => o && typeof o.id === 'string' && typeof o.name === 'string')
    .map((o: any) => ({
      id: o.id,
      name: o.name,
      weight: o.weight === 1 || o.weight === 3 ? o.weight : 2,
      exerciseIds: (Array.isArray(o.exerciseIds) ? o.exerciseIds : []).filter((i: unknown) => typeof i === 'string' && ids.has(i)),
      archived: o.archived === true,
      createdAt: isDateKey(o.createdAt) ? o.createdAt : '1970-01-01',
    }));
  const rawLogs: any[] = Array.isArray(data.logs) ? data.logs : Object.values(data.logs ?? {});
  const logs: Record<string, LogEntry> = {};
  const num = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : undefined);
  for (const l of rawLogs) {
    if (!l || !ids.has(l.exerciseId) || !isDateKey(l.date)) continue;
    logs[logKey(l.exerciseId, l.date)] = {
      exerciseId: l.exerciseId,
      date: l.date,
      done: l.done === true,
      note: typeof l.note === 'string' && l.note ? l.note : undefined,
      durationMin: num(l.durationMin),
      reps: num(l.reps),
      sets: num(l.sets),
      updatedAt: typeof l.updatedAt === 'number' ? l.updatedAt : 0,
    };
  }
  return { exercises, objectives, logs };
}

export async function loadState(): Promise<AppState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? migrate(JSON.parse(json)) : emptyState();
  } catch {
    return emptyState();
  }
}

export async function saveState(state: AppState): Promise<void> {
  const env: Envelope = { version: SCHEMA_VERSION, data: state };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(env));
}
