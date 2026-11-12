import records from '../../assets/exercises/dataset.json';

export interface DatasetExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  steps: string[];
}

export const DATASET: DatasetExercise[] = records;
const byId = new Map(DATASET.map((exercise) => [exercise.id, exercise]));

export const bodyLabels: Record<string, string> = {
  waist: 'Abdominaux', 'upper legs': 'Cuisses', back: 'Dos', 'lower legs': 'Mollets',
  chest: 'Pectoraux', 'upper arms': 'Bras', cardio: 'Cardio', shoulders: 'Épaules',
  'lower arms': 'Avant-bras', neck: 'Nuque',
};

export const equipmentLabels: Record<string, string> = {
  'body weight': 'Poids du corps', cable: 'Poulie', 'leverage machine': 'Machine',
  assisted: 'Assisté', 'medicine ball': 'Médecine-ball', 'stability ball': 'Ballon',
  band: 'Élastique', barbell: 'Barre', rope: 'Corde', dumbbell: 'Haltères',
  'ez barbell': 'Barre EZ', 'sled machine': 'Machine à traîneau',
  'upper body ergometer': 'Ergomètre bras', kettlebell: 'Kettlebell',
  'olympic barbell': 'Barre olympique', weighted: 'Avec charge', 'bosu ball': 'Bosu',
  'resistance band': 'Bande de résistance', roller: 'Rouleau', 'skierg machine': 'SkiErg',
  hammer: 'Marteau', 'smith machine': 'Cadre guidé', 'wheel roller': 'Roue abdominale',
  'stationary bike': "Vélo d'appartement", tire: 'Pneu', 'trap bar': 'Barre hexagonale',
  'elliptical machine': 'Vélo elliptique', 'stepmill machine': 'Machine à escaliers',
};

const muscles: Record<string, string> = {
  waist: 'core', 'upper legs': 'legs', back: 'back', 'lower legs': 'calves',
  chest: 'chest', 'upper arms': 'arms', cardio: 'cardio', shoulders: 'shoulders',
  'lower arms': 'arms', neck: 'neck',
};

export const datasetExercise = (id?: string) => id ? byId.get(id) : undefined;
export const datasetMuscle = (exercise: DatasetExercise) => muscles[exercise.bodyPart] ?? 'full-body';
export const datasetCategory = (exercise: DatasetExercise) => exercise.bodyPart === 'cardio' ? 'cardio' : 'strength';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const aliases: Record<string, string> = {
  pompe: 'push-up', pompes: 'push-up', traction: 'pull-up', tractions: 'pull-up',
  fente: 'lunge', fentes: 'lunge', planche: 'plank', gainage: 'plank',
  abdos: 'abs', crunchs: 'crunch',
};

export function searchDataset(query: string, bodyPart: string, equipment: string): DatasetExercise[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean).map((term) => aliases[term] ?? term);
  return DATASET.filter((exercise) => {
    if (bodyPart && exercise.bodyPart !== bodyPart) return false;
    if (equipment && exercise.equipment !== equipment) return false;
    const text = normalize([exercise.name, exercise.target, bodyLabels[exercise.bodyPart], equipmentLabels[exercise.equipment]].join(' '));
    return terms.every((term) => text.includes(term));
  });
}
