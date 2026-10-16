import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, Chip, EmptyState, Field, Muted, Screen, Tag, Title, colors, row } from '../../components/ui';
import { OBJECTIVE_TEMPLATES } from '../../domain/templates';
import { Objective } from '../../domain/types';
import { useApp } from '../../store/AppContext';

const WEIGHT_LABELS = { 1: 'Faible', 2: 'Moyenne', 3: 'Haute' } as const;

function ObjectiveForm({ initial, onSubmit, onCancel, submitLabel }: { initial?: Objective; onSubmit: (name: string, weight: 1 | 2 | 3, ids: string[]) => void; onCancel?: () => void; submitLabel: string }) {
  const { state } = useApp();
  const [name, setName] = useState(initial?.name ?? '');
  const [weight, setWeight] = useState<1 | 2 | 3>(initial?.weight ?? 2);
  const [ids, setIds] = useState<string[]>(initial?.exerciseIds ?? []);
  const toggle = (id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const active = state.exercises.filter((e) => !e.archived);
  return (
    <View>
      <Field label="Nom de l'objectif" value={name} onChangeText={setName} placeholder="Ex : Faire le grand écart" testID="objective-name" />
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>Priorité</Text>
      <View style={[row, { marginBottom: 10 }]}>
        {([1, 2, 3] as const).map((w) => (
          <Chip key={w} label={WEIGHT_LABELS[w]} selected={weight === w} onPress={() => setWeight(w)} />
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>Exercices liés</Text>
      {active.length === 0 ? (
        <Muted>Ajoutez d&apos;abord des exercices pour pouvoir les lier.</Muted>
      ) : (
        <View style={[row, { marginBottom: 10 }]}>
          {active.map((e) => (
            <Chip key={e.id} label={e.name} selected={ids.includes(e.id)} onPress={() => toggle(e.id)} />
          ))}
        </View>
      )}
      <View style={row}>
        <Button
          testID="objective-submit"
          label={submitLabel}
          disabled={!name.trim()}
          onPress={() => {
            onSubmit(name, weight, ids);
            if (!initial) {
              setName('');
              setIds([]);
            }
          }}
        />
        {onCancel && <Button label="Annuler" kind="secondary" onPress={onCancel} />}
      </View>
    </View>
  );
}

function ObjectiveItem({ objective }: { objective: Objective }) {
  const { state, updateObjective, deleteObjective } = useApp();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const linked = state.exercises.filter((e) => objective.exerciseIds.includes(e.id));
  return (
    <Card style={objective.archived ? { opacity: 0.6 } : undefined}>
      {editing ? (
        <ObjectiveForm
          initial={objective}
          submitLabel="Enregistrer"
          onCancel={() => setEditing(false)}
          onSubmit={(name, weight, exerciseIds) => {
            updateObjective(objective.id, { name, weight, exerciseIds });
            setEditing(false);
          }}
        />
      ) : (
        <>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{objective.name}</Text>
          <View style={[row, { marginVertical: 6 }]}>
            <Tag label={`Priorité ${WEIGHT_LABELS[objective.weight].toLowerCase()}`} />
            {objective.archived && <Tag label="Archivé" />}
          </View>
          <Muted>{linked.length ? linked.map((e) => e.name).join(', ') : 'Aucun exercice lié'}</Muted>
          <View style={[row, { marginTop: 8 }]}>
            <Button label="Modifier" kind="secondary" onPress={() => setEditing(true)} />
            <Button label={objective.archived ? 'Restaurer' : 'Archiver'} kind="secondary" onPress={() => updateObjective(objective.id, { archived: !objective.archived })} />
            {confirm ? (
              <>
                <Button label="Confirmer la suppression" kind="danger" onPress={() => deleteObjective(objective.id)} />
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

export default function ObjectivesScreen() {
  const { state, addObjective, addObjectiveFromTemplate } = useApp();
  const names = new Set(state.objectives.filter((o) => !o.archived).map((o) => o.name.toLowerCase()));
  const active = state.objectives.filter((o) => !o.archived);
  const archived = state.objectives.filter((o) => o.archived);
  return (
    <Screen>
      <Card>
        <Title>Nouvel objectif</Title>
        <View style={{ height: 8 }} />
        <ObjectiveForm submitLabel="Ajouter" onSubmit={(name, weight, exerciseIds) => addObjective({ name, weight, exerciseIds })} />
      </Card>
      <Card>
        <Muted>Suggestions (crée aussi les exercices associés)</Muted>
        <View style={[row, { marginTop: 8 }]}>
          {OBJECTIVE_TEMPLATES.map((t) => (
            <Chip
              key={t.id}
              label={names.has(t.name.toLowerCase()) ? `✓ ${t.name}` : `+ ${t.name}`}
              selected={names.has(t.name.toLowerCase())}
              onPress={() => addObjectiveFromTemplate(t)}
            />
          ))}
        </View>
      </Card>
      <Title>Mes objectifs ({active.length})</Title>
      {active.length === 0 && <EmptyState title="Aucun objectif" text="Définissez ce que vous voulez accomplir : l'application recommandera les exercices utiles." />}
      {active.map((o) => <ObjectiveItem key={o.id} objective={o} />)}
      {archived.length > 0 && (
        <>
          <Title>Archivés</Title>
          {archived.map((o) => <ObjectiveItem key={o.id} objective={o} />)}
        </>
      )}
    </Screen>
  );
}
