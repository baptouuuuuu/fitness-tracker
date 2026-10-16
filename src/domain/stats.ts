import { addDays, dateRange, diffDays, startOfWeek } from './dates';
import { AppState, DateKey, LogEntry } from './types';

export function doneLogs(state: AppState, exerciseId?: string): LogEntry[] {
  return Object.values(state.logs).filter((l) => l.done && (exerciseId === undefined || l.exerciseId === exerciseId));
}

/** Distinct days with at least one completed exercise (optionally for one exercise). */
export function doneDates(state: AppState, exerciseId?: string): Set<DateKey> {
  return new Set(doneLogs(state, exerciseId).map((l) => l.date));
}

export interface Streaks {
  current: number;
  longest: number;
}

/**
 * Current streak counts consecutive active days ending today, or yesterday if
 * today has not been logged yet (so the streak is not lost mid-day).
 */
export function computeStreaks(dates: Set<DateKey>, today: DateKey): Streaks {
  let current = 0;
  let cursor = dates.has(today) ? today : addDays(today, -1);
  while (dates.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  const sorted = [...dates].filter((d) => d <= today).sort();
  let longest = 0;
  let run = 0;
  let prev: DateKey | null = null;
  for (const d of sorted) {
    run = prev !== null && diffDays(prev, d) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

export interface PeriodStats {
  from: DateKey;
  to: DateKey;
  /** Number of completed exercise logs in the period. */
  completions: number;
  activeDays: number;
  /** Days elapsed in the period up to today (inclusive). */
  elapsedDays: number;
  /** activeDays / elapsedDays, in [0, 1]. */
  consistency: number;
}

export function periodStats(state: AppState, from: DateKey, to: DateKey, today: DateKey, exerciseId?: string): PeriodStats {
  const end = to < today ? to : today;
  const elapsedDays = Math.max(0, diffDays(from, end) + 1);
  const logs = doneLogs(state, exerciseId).filter((l) => l.date >= from && l.date <= end);
  const activeDays = new Set(logs.map((l) => l.date)).size;
  return {
    from,
    to,
    completions: logs.length,
    activeDays,
    elapsedDays,
    consistency: elapsedDays === 0 ? 0 : activeDays / elapsedDays,
  };
}

export function weekStats(state: AppState, today: DateKey, weeksAgo = 0, exerciseId?: string): PeriodStats {
  const from = addDays(startOfWeek(today), -7 * weeksAgo);
  return periodStats(state, from, addDays(from, 6), today, exerciseId);
}

export function monthStats(state: AppState, monthStart: DateKey, today: DateKey, monthEnd: DateKey, exerciseId?: string): PeriodStats {
  return periodStats(state, monthStart, monthEnd, today, exerciseId);
}

/** Weekly stats, oldest first, ending with the current week. */
export function weeklySeries(state: AppState, today: DateKey, weeks: number, exerciseId?: string): PeriodStats[] {
  return Array.from({ length: weeks }, (_, i) => weekStats(state, today, weeks - 1 - i, exerciseId));
}

/** Number of completed exercises per day, for heatmap/calendar display. */
export function completionsByDate(state: AppState, from: DateKey, to: DateKey): Record<DateKey, number> {
  const out: Record<DateKey, number> = {};
  for (const d of dateRange(from, to)) out[d] = 0;
  for (const l of doneLogs(state)) if (l.date >= from && l.date <= to) out[l.date] += 1;
  return out;
}

export function lastDoneDate(state: AppState, exerciseId: string, upTo: DateKey): DateKey | null {
  let last: DateKey | null = null;
  for (const l of doneLogs(state, exerciseId)) {
    if (l.date <= upTo && (last === null || l.date > last)) last = l.date;
  }
  return last;
}
