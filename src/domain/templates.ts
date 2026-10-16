export interface CategoryPreset {
  id: string;
  label: string;
}

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { id: 'strength', label: 'Musculation' },
  { id: 'mobility', label: 'Mobilité' },
  { id: 'stretching', label: 'Étirements' },
  { id: 'cardio', label: 'Cardio' },
];

export function categoryLabel(category: string): string {
  return CATEGORY_PRESETS.find((c) => c.id === category)?.label ?? category;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: string;
}

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  { id: 'pushups', name: 'Pompes', category: 'strength' },
  { id: 'squats', name: 'Squats', category: 'strength' },
  { id: 'lunges', name: 'Fentes', category: 'strength' },
  { id: 'pullups', name: 'Tractions', category: 'strength' },
  { id: 'plank', name: 'Gainage (planche)', category: 'strength' },
  { id: 'side-plank', name: 'Gainage latéral', category: 'strength' },
  { id: 'rows', name: 'Rowing (dos)', category: 'strength' },
  { id: 'hip-90-90', name: 'Mobilité hanches 90/90', category: 'mobility' },
  { id: 'cat-cow', name: 'Chat-vache', category: 'mobility' },
  { id: 'thoracic', name: 'Rotation thoracique', category: 'mobility' },
  { id: 'shoulder-circles', name: "Cercles d'épaules", category: 'mobility' },
  { id: 'hamstring', name: 'Étirement ischio-jambiers', category: 'stretching' },
  { id: 'quad', name: 'Étirement quadriceps', category: 'stretching' },
  { id: 'hip-flexor', name: 'Étirement psoas', category: 'stretching' },
  { id: 'shoulder-stretch', name: 'Étirement des épaules', category: 'stretching' },
  { id: 'walk', name: 'Marche rapide', category: 'cardio' },
  { id: 'jump-rope', name: 'Corde à sauter', category: 'cardio' },
  { id: 'cycling', name: 'Vélo', category: 'cardio' },
];

export interface ObjectiveTemplate {
  id: string;
  name: string;
  weight: 1 | 2 | 3;
  exerciseTemplateIds: string[];
}

export const OBJECTIVE_TEMPLATES: ObjectiveTemplate[] = [
  { id: 'back', name: 'Renforcer le dos', weight: 2, exerciseTemplateIds: ['rows', 'pullups', 'cat-cow', 'plank'] },
  { id: 'hips', name: 'Mobilité des hanches', weight: 2, exerciseTemplateIds: ['hip-90-90', 'hip-flexor', 'lunges'] },
  { id: 'flex', name: 'Gagner en souplesse', weight: 1, exerciseTemplateIds: ['hamstring', 'quad', 'shoulder-stretch'] },
  { id: 'core', name: 'Gainage et abdos', weight: 2, exerciseTemplateIds: ['plank', 'side-plank'] },
  { id: 'cardio', name: 'Endurance / cardio santé', weight: 3, exerciseTemplateIds: ['walk', 'jump-rope', 'cycling'] },
  { id: 'upper', name: 'Haut du corps', weight: 2, exerciseTemplateIds: ['pushups', 'pullups', 'shoulder-circles'] },
];
