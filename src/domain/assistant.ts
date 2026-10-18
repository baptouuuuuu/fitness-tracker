import { CATEGORY_PRESETS } from './templates';

export type AssistantCommand =
  | { type: 'exercise'; name: string; category: string; reply: string }
  | { type: 'objective'; name: string; weight: 1 | 2 | 3; exerciseIds: string[]; reply: string }
  | { type: 'clarification'; reply: string };

export interface AssistantExercise {
  id: string;
  name: string;
}

const MODEL = 'mammouth-recommended';
const API_URL = 'https://api.mammouth.ai/v1/chat/completions';
const CATEGORIES = [...CATEGORY_PRESETS.map((category) => category.id), 'other'];

const SYSTEM_PROMPT = `Tu es l'assistant d'une application de suivi sportif. À partir de la demande en français, propose la création d'un seul exercice ou d'un seul objectif. Ne prétends pas avoir effectué la création. Réponds uniquement avec un objet JSON valide, sans Markdown, ayant cette forme :
{"type":"exercise","name":"Course à pied","category":"cardio","reply":"Je propose d'ajouter Course à pied."}
ou
{"type":"objective","name":"Courir 5 km","weight":2,"exerciseNames":["Course à pied"],"reply":"Je propose cet objectif."}
ou
{"type":"clarification","reply":"Veux-tu créer un exercice ou un objectif ?"}
type doit être "exercise", "objective" ou "clarification". Pour un exercice, category doit être l'un de ${CATEGORIES.join(', ')}. Pour un objectif, weight doit être 1, 2 ou 3 et exerciseNames ne doit contenir que des noms pris exactement dans la liste fournie, ou être vide. Garde un nom concis et une réponse en français. Si la demande ne permet pas de comprendre quoi créer, demande une précision en renvoyant une clarification, sans inventer de nom.`;

function parseJson(content: string): unknown {
  const unwrapped = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = unwrapped.indexOf('{');
  const end = unwrapped.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('La réponse de l’IA ne contient pas de résultat JSON exploitable.');
  try {
    return JSON.parse(unwrapped.slice(start, end + 1));
  } catch {
    throw new Error('La réponse de l’IA est invalide. Réessaie avec une demande plus précise.');
  }
}

export function parseAssistantResponse(content: string, exercises: AssistantExercise[]): AssistantCommand {
  const value = parseJson(content);
  if (!value || typeof value !== 'object') throw new Error('La réponse de l’IA est invalide.');

  const result = value as Record<string, unknown>;
  const reply = typeof result.reply === 'string' ? result.reply.trim().slice(0, 400) : '';
  if (!reply) throw new Error('La réponse de l’IA ne contient pas de message valide.');
  if (result.type === 'clarification') return { type: 'clarification', reply };
  if (result.type !== 'exercise' && result.type !== 'objective') {
    throw new Error('L’IA a renvoyé un type de création non pris en charge.');
  }

  const name = typeof result.name === 'string' ? result.name.trim().replace(/\s+/g, ' ') : '';
  if (!name || name.length > 100) throw new Error('La réponse de l’IA ne contient pas de nom valide.');

  if (result.type === 'exercise') {
    const category = typeof result.category === 'string' && CATEGORIES.includes(result.category)
      ? result.category
      : 'other';
    return { type: 'exercise', name, category, reply };
  }

  if (result.type === 'objective') {
    const weight = result.weight === 1 || result.weight === 3 ? result.weight : 2;
    const names = Array.isArray(result.exerciseNames)
      ? result.exerciseNames.filter((exerciseName): exerciseName is string => typeof exerciseName === 'string')
      : [];
    const exerciseIds = exercises
      .filter((exercise) => names.some((exerciseName) => exerciseName.toLocaleLowerCase() === exercise.name.toLocaleLowerCase()))
      .map((exercise) => exercise.id);
    return { type: 'objective', name, weight, exerciseIds: [...new Set(exerciseIds)], reply };
  }

  throw new Error('L’IA a renvoyé un type de création non pris en charge.');
}

export async function requestAssistantCommand(
  apiKey: string,
  request: string,
  exercises: AssistantExercise[],
): Promise<AssistantCommand> {
  if (!apiKey.trim()) throw new Error('Ajoute ta clé API Mammouth pour discuter avec l’assistant.');
  if (!request.trim() || request.length > 1000) {
    throw new Error('Le message doit contenir entre 1 et 1000 caractères.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: ['Bearer', apiKey].join(' '),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 400,
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            demande: request,
            exercicesExistants: exercises.map(({ name }) => name),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Clé API Mammouth invalide ou sans accès. Vérifie ta clé et tes crédits.');
    }
    if (response.status === 429) throw new Error('Limite API atteinte. Réessaie plus tard ou vérifie tes crédits.');
    throw new Error(`L’API Mammouth a répondu avec une erreur (${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('La réponse de l’API Mammouth est illisible.');
  }

  const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('L’API Mammouth n’a pas renvoyé de réponse exploitable.');
  return parseAssistantResponse(content, exercises);
}
