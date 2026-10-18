import { CATEGORY_PRESETS } from './templates';

export interface AssistantCommand {
  type: 'exercise' | 'objective';
  name: string;
  category?: string;
  weight?: 1 | 2 | 3;
}

const simplify = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const cleanName = (value: string) =>
  value
    .trim()
    .replace(/^[\s:,-]+|[\s.!?,;:]+$/g, '')
    .replace(/\s+/g, ' ');

const categoryFor = (name: string) => {
  const value = simplify(name);
  if (/course|courir|marche|velo|natation|cardio|corde|burpee|escaliers/.test(value)) return 'cardio';
  if (/mobilite|rotation|chat-vache|yoga/.test(value)) return 'mobility';
  if (/etirement|souplesse|stretch|grand ecart/.test(value)) return 'stretching';
  return CATEGORY_PRESETS[0].id;
};

export function parseAssistantCommand(message: string): AssistantCommand | null {
  const text = message.trim();
  if (!text) return null;

  const objective = /objectif|but|progresser|reussir|atteindre|ameliorer|apprendre/.test(simplify(text));
  const type = objective ? 'objective' : 'exercise';
  const keyword = objective ? 'objectif' : '(?:exercice|activite|mouvement|seance)';
  const explicit = new RegExp(
    `(?:${keyword})\\s+(?:(?:de|du|des|d['’]|pour)\\s+|[:,-]\\s*)?(.+)$`,
    'i',
  ).exec(text);
  let name = explicit?.[1];

  if (!name && objective) {
    name = text.replace(
      /^(?:(?:bonjour|salut)[, ]+)?(?:(?:je veux|je voudrais|j'aimerais|je souhaite|aide-moi a|peux-tu|pourrais-tu)\s+)?(?:(?:creer|ajouter|definir)\s+)?/i,
      '',
    );
    name = name.replace(/^un objectif\s+(?:de|pour)\s+/i, '');
  } else if (!name && !objective) {
    name = text.replace(
      /^(?:(?:bonjour|salut)[, ]+)?(?:(?:je veux|je voudrais|j'aimerais|je souhaite)\s+)?(?:(?:creer|ajouter|faire)\s+)?/i,
      '',
    );
    name = name.replace(/^(?:un|une|des)\s+(?:nouvel?\s+)?(?:exercice|activite|mouvement)\s+(?:de|pour)\s+/i, '');
  }

  const cleaned = cleanName(name ?? '');
  if (cleaned.length < 2 || /^(?:un|une|des|de|du|pour)$/i.test(cleaned)) return null;

  return objective
    ? { type, name: cleaned, weight: /priorite haute|important/i.test(simplify(text)) ? 3 : 2 }
    : { type, name: cleaned, category: categoryFor(cleaned) };
}

export function matchingExerciseIds(name: string, exercises: { id: string; name: string }[]): string[] {
  const words = simplify(name).match(/[a-z0-9]+/g)?.filter((word) => word.length > 3) ?? [];
  if (!words.length) return [];
  return exercises
    .filter((exercise) => {
      const exerciseName = simplify(exercise.name);
      return words.some((word) => exerciseName.includes(word) || word.includes(exerciseName));
    })
    .map((exercise) => exercise.id);
}
