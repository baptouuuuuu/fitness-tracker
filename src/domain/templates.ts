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
  { id: 'glute-bridge', name: 'Pont fessier', category: 'strength' },
  { id: 'dips', name: 'Dips (chaise)', category: 'strength' },
  { id: 'deadlift', name: 'Soulevé de terre roumain', category: 'strength' },
  { id: 'calf-raise', name: 'Montées sur pointes (mollets)', category: 'strength' },
  { id: 'crunch', name: 'Crunchs', category: 'strength' },
  { id: 'superman', name: 'Superman (lombaires)', category: 'strength' },
  { id: 'burpees', name: 'Burpees', category: 'strength' },
  { id: 'wall-angels', name: 'Wall angels', category: 'mobility' },
  { id: 'ankle', name: 'Mobilité des chevilles', category: 'mobility' },
  { id: 'worlds-greatest', name: 'World’s greatest stretch', category: 'mobility' },
  { id: 'neck-mobility', name: 'Mobilité des cervicales', category: 'mobility' },
  { id: 'wrist', name: 'Mobilité des poignets', category: 'mobility' },
  { id: 'calf-stretch', name: 'Étirement mollets', category: 'stretching' },
  { id: 'chest-stretch', name: 'Étirement des pectoraux', category: 'stretching' },
  { id: 'glute-stretch', name: 'Étirement des fessiers (pigeon)', category: 'stretching' },
  { id: 'adductors', name: 'Étirement des adducteurs', category: 'stretching' },
  { id: 'child-pose', name: 'Posture de l’enfant', category: 'stretching' },
  { id: 'triceps-stretch', name: 'Étirement des triceps', category: 'stretching' },
  { id: 'neck-stretch', name: 'Étirement de la nuque', category: 'stretching' },
  { id: 'lats-stretch', name: 'Étirement des dorsaux', category: 'stretching' },
  { id: 'jumping-jacks', name: 'Jumping jacks', category: 'cardio' },
  { id: 'running', name: 'Course à pied', category: 'cardio' },
  { id: 'stairs', name: 'Montée d’escaliers', category: 'cardio' },
  { id: 'swimming', name: 'Natation', category: 'cardio' },
  { id: 'mountain-climbers', name: 'Mountain climbers', category: 'cardio' },
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
