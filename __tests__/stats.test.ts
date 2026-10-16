import { addDays, startOfWeek } from '../src/domain/dates';
import { completionsByDate, computeStreaks, doneDates, monthStats, weekStats, weeklySeries } from '../src/domain/stats';
import { build, TODAY } from '../test-utils/helpers';

describe('dates', () => {
  it('computes Monday as start of week', () => {
    expect(startOfWeek('2025-03-12')).toBe('2025-03-10');
    expect(startOfWeek('2025-03-16')).toBe('2025-03-10');
  });
  it('adds days across DST and month boundaries', () => {
    expect(addDays('2025-03-30', 1)).toBe('2025-03-31');
    expect(addDays('2025-03-01', -1)).toBe('2025-02-28');
  });
});

describe('streaks', () => {
  it('counts the current streak ending today', () => {
    expect(computeStreaks(new Set(['2025-03-10', '2025-03-11', '2025-03-12']), TODAY)).toEqual({ current: 3, longest: 3 });
  });
  it('keeps the streak alive when only yesterday is done', () => {
    expect(computeStreaks(new Set(['2025-03-10', '2025-03-11']), TODAY).current).toBe(2);
  });
  it('resets when a day is missed and tracks the longest streak', () => {
    const s = computeStreaks(new Set(['2025-03-01', '2025-03-02', '2025-03-03', '2025-03-04', '2025-03-12']), TODAY);
    expect(s).toEqual({ current: 1, longest: 4 });
    expect(computeStreaks(new Set(['2025-03-09']), TODAY).current).toBe(0);
  });
});

describe('period metrics', () => {
  const s = build([{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], {
    done: [['a', '2025-03-10'], ['b', '2025-03-10'], ['a', '2025-03-12'], ['a', '2025-03-03']],
  });
  it('computes weekly consistency over elapsed days only', () => {
    const w = weekStats(s, TODAY);
    expect(w).toMatchObject({ from: '2025-03-10', completions: 3, activeDays: 2, elapsedDays: 3 });
    expect(w.consistency).toBeCloseTo(2 / 3);
  });
  it('computes previous weeks and series ordering', () => {
    expect(weekStats(s, TODAY, 1).completions).toBe(1);
    const series = weeklySeries(s, TODAY, 3);
    expect(series.map((x) => x.completions)).toEqual([0, 1, 3]);
  });
  it('computes monthly stats and per-exercise filters', () => {
    expect(monthStats(s, '2025-03-01', TODAY, '2025-03-31').activeDays).toBe(3);
    expect(weekStats(s, TODAY, 0, 'b').completions).toBe(1);
  });
  it('builds a per-day completion map', () => {
    const m = completionsByDate(s, '2025-03-09', '2025-03-12');
    expect(m).toEqual({ '2025-03-09': 0, '2025-03-10': 2, '2025-03-11': 0, '2025-03-12': 1 });
    expect(doneDates(s).size).toBe(3);
  });
});
