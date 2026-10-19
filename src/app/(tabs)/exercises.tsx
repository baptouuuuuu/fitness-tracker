import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, Chip, EmptyState, Field, Muted, Screen, Tag, Title, row } from '../../components/ui';
import { useTheme } from '../../components/ThemeContext';
import { CATEGORY_PRESETS, EXERCISE_TEMPLATES, categoryLabel } from '../../domain/templates';
import { Exercise } from '../../domain/types';
import { useApp } from '../../store/AppContext';

function ExerciseForm({ initial, onSubmit, onCancel, submitLabel }: { initial?: Exercise; onSubmit: (name: string, category: string) => void; onCancel?: () => void; submitLabel: string }) {
  const { colors } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'strength');
  return (
    <View>
      <Field label="Nom" value={name} onChangeText={setName} placeholder="Ex : Pompes" testID="exercise-name" />
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>Catégorie</Text>
      <View style={[row, { marginBottom: 10 }]}>
        {CATEGORY_PRESETS.map((c) => (
          <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
        ))}
      </View>
      <Field label="Ou catégorie personnalisée" value={CATEGORY_PRESETS.some((c) => c.id === category) ? '' : category} onChangeText={setCategory} placeholder="Ex : Yoga" />
      <View style={row}>
        <Button
          testID="exercise-submit"
          label={submitLabel}
          disabled={!name.trim()}
          onPress={() => {
            onSubmit(name, category);
            if (!initial) setName('');
          }}
        />
        {onCancel && <Button label="Annuler" kind="secondary" onPress={onCancel} />}
      </View>
    </View>
  );
}

function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const { updateExercise, deleteExercise } = useApp();
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <Card style={exercise.archived ? { opacity: 0.6 } : undefined}>
      {editing ? (
        <ExerciseForm
          initial={exercise}
          submitLabel="Enregistrer"
          onCancel={() => setEditing(false)}
          onSubmit={(name, category) => {
            updateExercise(exercise.id, { name, category });
            setEditing(false);
          }}
        />
      ) : (
        <>
          <Link href={{ pathname: '/exercise/[id]', params: { id: exercise.id } }} style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {exercise.name}
          </Link>
          <View style={[row, { marginVertical: 6 }]}>
            <Tag label={categoryLabel(exercise.category)} />
            {exercise.archived && <Tag label="Archivé" />}
          </View>
          <View style={row}>
            <Button label="Modifier" kind="secondary" onPress={() => setEditing(true)} />
            <Button label={exercise.archived ? 'Restaurer' : 'Archiver'} kind="secondary" onPress={() => updateExercise(exercise.id, { archived: !exercise.archived })} />
            {confirm ? (
              <>
                <Button label="Confirmer la suppression" kind="danger" onPress={() => deleteExercise(exercise.id)} />
                <Button label="Non" kind="secondary" onPress={() => setConfirm(false)} />
              </>
            ) : (
              <Button label="Supprimer" kind="danger" onPress={() => setConfirm(true)} />
            )}
          </View>
        </>
      )}
    </Card>
  );
}

export default function ExercisesScreen() {
  const { state, addExercise } = useApp();
  const [showTemplates, setShowTemplates] = useState(false);
  const names = new Set(state.exercises.filter((e) => !e.archived).map((e) => e.name.toLowerCase()));
  const active = state.exercises.filter((e) => !e.archived);
  const archived = state.exercises.filter((e) => e.archived);

  return (
    <Screen>
      <Card>
        <Title>Nouvel exercice</Title>
        <View style={{ height: 8 }} />
        <ExerciseForm submitLabel="Ajouter" onSubmit={(name, category) => addExercise({ name, category })} />
      </Card>

      <Card>
        <Button label={showTemplates ? 'Masquer les recommandations' : 'Choisir parmi les recommandations'} kind="secondary" onPress={() => setShowTemplates((v) => !v)} />
        {showTemplates && (
          <View style={{ marginTop: 10, gap: 10 }}>
            {CATEGORY_PRESETS.map((c) => (
              <View key={c.id}>
                <Muted>{c.label}</Muted>
                <View style={[row, { marginTop: 4 }]}>
                  {EXERCISE_TEMPLATES.filter((t) => t.category === c.id).map((t) => (
                    <Chip
                      key={t.id}
                      label={names.has(t.name.toLowerCase()) ? `✓ ${t.name}` : `+ ${t.name}`}
                      selected={names.has(t.name.toLowerCase())}
                      onPress={() => addExercise({ name: t.name, category: t.category })}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Title>Mes exercices ({active.length})</Title>
      {active.length === 0 && <EmptyState title="Aucun exercice" text="Créez votre premier exercice ci-dessus ou ajoutez-en depuis les recommandations." />}
      {active.map((e) => <ExerciseItem key={e.id} exercise={e} />)}
      {archived.length > 0 && (
        <>
          <Title>Archivés</Title>
          {archived.map((e) => <ExerciseItem key={e.id} exercise={e} />)}
        </>
      )}
    </Screen>
  );
}
