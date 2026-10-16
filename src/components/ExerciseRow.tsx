import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { DateKey, Exercise, logKey } from '../domain/types';
import { useApp } from '../store/AppContext';
import { LogForm } from './LogForm';
import { Button, Card, colors, row, Tag } from './ui';

export function ExerciseLogRow({ exercise, date, reasons }: { exercise: Exercise; date: DateKey; reasons?: string[] }) {
  const { state, toggleDone, setLog } = useApp();
  const [open, setOpen] = useState(false);
  const entry = state.logs[logKey(exercise.id, date)];
  const done = entry?.done === true;
  const details = [entry?.durationMin && `${entry.durationMin} min`, entry?.sets && `${entry.sets} séries`, entry?.reps && `${entry.reps} rép.`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card style={done ? { backgroundColor: colors.successLight, borderColor: colors.success } : undefined}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Link href={{ pathname: '/exercise/[id]', params: { id: exercise.id } }} style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
            {exercise.name}
          </Link>
          {reasons && reasons.length > 0 && (
            <View style={[row, { marginTop: 4 }]}>
              {reasons.map((r) => (
                <Tag key={r} label={r} />
              ))}
            </View>
          )}
          {done && !!details && <Text style={{ color: colors.muted, marginTop: 4 }}>{details}</Text>}
          {!!entry?.note && <Text style={{ color: colors.muted, marginTop: 2, fontStyle: 'italic' }}>« {entry.note} »</Text>}
        </View>
        <View style={{ gap: 6 }}>
          <Button
            testID={`toggle-${exercise.id}`}
            label={done ? '✓ Fait' : 'Fait'}
            kind={done ? 'success' : 'primary'}
            onPress={() => toggleDone(exercise.id, date)}
          />
          <Button label={open ? 'Fermer' : 'Détails'} kind="secondary" onPress={() => setOpen((o) => !o)} />
        </View>
      </View>
      {open && (
        <LogForm
          entry={entry}
          onCancel={() => setOpen(false)}
          onSave={(input) => {
            setLog(exercise.id, date, input);
            setOpen(false);
          }}
        />
      )}
    </Card>
  );
}
