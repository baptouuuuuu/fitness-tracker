import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button, Card, Chip, EmptyState, Field, Muted, Screen, Tag, Title, row } from '../../components/ui';
import { useTheme } from '../../components/ThemeContext';
import { CATEGORY_PRESETS, EXERCISE_TEMPLATES, categoryLabel } from '../../domain/templates';
import { Exercise } from '../../domain/types';
import { bodyLabels, datasetCategory, equipmentLabels, searchDataset } from '../../domain/dataset';
import { freeExerciseImage } from '../../domain/freeExerciseMedia';
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
  const { colors } = useTheme();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [query, setQuery] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [bodyweight, setBodyweight] = useState(false);
  const [visible, setVisible] = useState(20);
  const [expanded, setExpanded] = useState<string | null>(null);
  const results = useMemo(() => searchDataset(query, bodyPart, bodyweight ? 'body weight' : ''), [query, bodyPart, bodyweight]);
  const names = new Set(state.exercises.filter((e) => !e.archived).map((e) => e.name.toLowerCase()));
  const active = state.exercises.filter((e) => !e.archived);
  const archived = state.exercises.filter((e) => e.archived);

  return (
    <Screen>
      <Card>
        <Title>Bibliothèque d'exercices</Title>
        <Muted>Explorez 1 324 mouvements et leurs instructions. Les noms du catalogue sont en anglais.</Muted>
        <View style={{ marginTop: 8 }}>
          <Button label={showCatalog ? 'Fermer la bibliothèque' : 'Explorer les exercices'} kind="secondary" onPress={() => setShowCatalog((v) => !v)} />
        </View>
        {showCatalog && (
          <View style={{ marginTop: 10, gap: 8 }}>
            <Field label="Rechercher" value={query} onChangeText={(text) => { setQuery(text); setVisible(20); }} placeholder="Ex : squat, dos, haltères…" />
            <Muted>Zone travaillée</Muted>
            <View style={row}>
              <Chip label="Toutes" selected={!bodyPart} onPress={() => { setBodyPart(''); setVisible(20); }} />
              {Object.entries(bodyLabels).map(([id, label]) => (
                <Chip key={id} label={label} selected={bodyPart === id} onPress={() => { setBodyPart(id); setVisible(20); }} />
              ))}
            </View>
            <View style={row}>
              <Chip label="Poids du corps uniquement" selected={bodyweight} onPress={() => { setBodyweight((v) => !v); setVisible(20); }} />
            </View>
            <Muted>{results.length} résultat(s)</Muted>
            {results.slice(0, visible).map((item) => {
              const existing = state.exercises.find((e) => e.datasetId === item.id || e.name.trim().toLowerCase() === item.name.trim().toLowerCase());
              const photo = freeExerciseImage(item.id);
              return (
                <Card key={item.id}>
                  {photo && <Image source={photo} accessibilityLabel={`Photo : ${item.name}`} style={{ width: 120, height: 100, alignSelf: 'center', borderRadius: 10 }} resizeMode="contain" />}
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                  <Muted>{bodyLabels[item.bodyPart] ?? item.bodyPart} · {equipmentLabels[item.equipment] ?? item.equipment}</Muted>
                  <View style={[row, { marginTop: 8 }]}>
                    <Button label={expanded === item.id ? 'Masquer' : 'Instructions'} kind="secondary" onPress={() => setExpanded(expanded === item.id ? null : item.id)} />
                    <Button label={existing ? existing.archived ? 'Restaurer' : 'Ajouté' : 'Ajouter'} disabled={!!existing && !existing.archived} onPress={() => addExercise({ name: item.name, category: datasetCategory(item), datasetId: item.id })} />
                  </View>
                  {expanded === item.id && item.steps.map((step, index) => (
                    <Text key={index} style={{ color: colors.text, marginTop: 8 }}>{index + 1}. {step}</Text>
                  ))}
                </Card>
              );
            })}
            {results.length === 0 && <Muted>Aucun résultat. Essayez un autre terme ou retirez un filtre.</Muted>}
            {visible < results.length && <Button label="Voir plus" kind="secondary" onPress={() => setVisible((v) => v + 20)} />}
          </View>
        )}
      </Card>
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
