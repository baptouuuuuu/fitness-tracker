export type DateKey = string; // YYYY-MM-DD (local calendar day)

export interface Exercise {
  id: string;
  name: string;
  category: string;
  archived: boolean;
  createdAt: DateKey;
}

export interface Objective {
  id: string;
  name: string;
  /** Importance of the objective, 1 (low) to 3 (high). */
  weight: 1 | 2 | 3;
  exerciseIds: string[];
  archived: boolean;
  createdAt: DateKey;
}

export interface LogEntry {
  exerciseId: string;
  date: DateKey;
  done: boolean;
  note?: string;
  durationMin?: number;
  reps?: number;
  sets?: number;
  updatedAt: number;
}

export interface AppState {
  exercises: Exercise[];
  objectives: Objective[];
  /** Keyed by `logKey(exerciseId, date)`. */
  logs: Record<string, LogEntry>;
}

export const logKey = (exerciseId: string, date: DateKey): string => `${date}|${exerciseId}`;

export const emptyState = (): AppState => ({ exercises: [], objectives: [], logs: {} });
