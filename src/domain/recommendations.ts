import { diffDays, addDays } from './dates';
import { lastDoneDate, doneLogs } from './stats';
import { AppState, DateKey, Exercise } from './types';

export const RECENCY_CAP_DAYS = 14;
export const TARGET_PER_WEEK = 3;
export const RATE_WINDOW_DAYS = 28;
export const BALANCE_WINDOW_DAYS = 14;

export const WEIGHTS = {
  recency: 0.3,
  weeklyDeficit: 0.2,
  lowCompletionRate: 0.15,
  goalRelevance: 0.25,
  categoryBalance: 0.1,
} as const;

export interface ScoreBreakdown {
  recency: number;
  weeklyDeficit: number;
  lowCompletionRate: number;
  goalRelevance: number;
  categoryBalance: number;
}

export interface Recommendation {
  exercise: Exercise;
  /** Priority score from 0 to 100. */
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  objectiveNames: string[];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function categoryCounts(state: AppState, today: DateKey): Map<string, number> {
  const from = addDays(today, -(BALANCE_WINDOW_DAYS - 1));
  const byId = new Map(state.exercises.map((e) => [e.id, e]));
  const counts = new Map<string, number>();
  for (const e of state.exercises) if (!e.archived) counts.set(e.category, counts.get(e.category) ?? 0);
  for (const l of doneLogs(state)) {
    const ex = byId.get(l.exerciseId);
    if (ex && l.date >= from && l.date <= today) counts.set(ex.category, (counts.get(ex.category) ?? 0) + 1);
  }
  return counts;
}

export function scoreExercise(state: AppState, exercise: Exercise, today: DateKey, catCounts = categoryCounts(state, today)): Recommendation {
  // Recency: 0 when done today, 1 when never done or not done for RECENCY_CAP_DAYS.
  const last = lastDoneDate(state, exercise.id, today);
  const daysSince = last === null ? null : diffDays(last, today);
  const recency = daysSince === null ? 1 : clamp01(daysSince / RECENCY_CAP_DAYS);

  // Frequency over the last 7 days compared to the weekly target.
  const weekFrom = addDays(today, -6);
  const doneDays = new Set(doneLogs(state, exercise.id).filter((l) => l.date <= today).map((l) => l.date));
  const last7 = [...doneDays].filter((d) => d >= weekFrom).length;
  const weeklyDeficit = clamp01(1 - last7 / TARGET_PER_WEEK);

  // Completion rate over the tracked window (shorter for recently created exercises).
  const windowDays = Math.max(1, Math.min(RATE_WINDOW_DAYS, diffDays(exercise.createdAt, today) + 1));
  const windowFrom = addDays(today, -(windowDays - 1));
  const inWindow = [...doneDays].filter((d) => d >= windowFrom).length;
  const expected = Math.max(1, (windowDays * TARGET_PER_WEEK) / 7);
  const lowCompletionRate = clamp01(1 - inWindow / expected);

  // Goal relevance: highest weight among active objectives linked to the exercise.
  const objectives = state.objectives.filter((o) => !o.archived && o.exerciseIds.includes(exercise.id));
  const goalRelevance = objectives.length === 0 ? 0 : Math.max(...objectives.map((o) => o.weight)) / 3;

  // Category balance: categories that were practised less recently score higher.
  const maxCat = Math.max(0, ...catCounts.values());
  const categoryBalance = maxCat === 0 ? 0 : clamp01(1 - (catCounts.get(exercise.category) ?? 0) / maxCat);

  const breakdown: ScoreBreakdown = { recency, weeklyDeficit, lowCompletionRate, goalRelevance, categoryBalance };
  const score =
    100 *
    (WEIGHTS.recency * recency +
      WEIGHTS.weeklyDeficit * weeklyDeficit +
      WEIGHTS.lowCompletionRate * lowCompletionRate +
      WEIGHTS.goalRelevance * goalRelevance +
      WEIGHTS.categoryBalance * categoryBalance);

  const reasons: string[] = [];
  if (daysSince === null) reasons.push('Jamais fait');
  else if (daysSince >= 3) reasons.push(`Pas fait depuis ${daysSince} jours`);
  if (objectives.length > 0 && goalRelevance >= 2 / 3) {
    const top = [...objectives].sort((a, b) => b.weight - a.weight)[0];
    reasons.push(`Objectif : ${top.name}`);
  }
  if (last7 === 0 && daysSince !== null && daysSince < 3) reasons.push('Rien cette semaine');
  else if (weeklyDeficit >= 0.5 && last7 > 0) reasons.push(`${last7}/${TARGET_PER_WEEK} cette semaine`);
  if (categoryBalance >= 0.6) reasons.push('Catégorie délaissée');
  if (lowCompletionRate >= 0.7 && daysSince !== null && reasons.length < 2) reasons.push('Faible régularité');
  if (reasons.length === 0) reasons.push(objectives.length > 0 ? `Objectif : ${objectives[0].name}` : 'Pour garder le rythme');

  return {
    exercise,
    score: Math.round(score * 10) / 10,
    breakdown,
    reasons: reasons.slice(0, 2),
    objectiveNames: objectives.map((o) => o.name),
  };
}

/**
 * Rank active exercises not yet completed on `today`, highest priority first.
 * Ties are broken by name so the output is deterministic.
 */
export function recommend(state: AppState, today: DateKey, limit = 5): Recommendation[] {
  const counts = categoryCounts(state, today);
  return state.exercises
    .filter((e) => !e.archived && state.logs[`${today}|${e.id}`]?.done !== true)
    .map((e) => scoreExercise(state, e, today, counts))
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, limit);
}
