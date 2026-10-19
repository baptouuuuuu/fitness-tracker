import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { lastDoneLabel } from '../domain/recommendations';
import { DateKey, Exercise, logKey } from '../domain/types';
import { useApp } from '../store/AppContext';
import { LogForm } from './LogForm';
import { Button, Card, row, Tag } from './ui';
import { useTheme } from './ThemeContext';

export function ExerciseLogRow({ exercise, date, reasons, tileWidth }: { exercise: Exercise; date: DateKey; reasons?: string[]; tileWidth?: number }) {
  const { state, toggleDone, setLog } = useApp();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const entry = state.logs[logKey(exercise.id, date)];
  const done = entry?.done === true;
  const since = lastDoneLabel(state, exercise.id, date);
  const sinceColor = since.days === null || since.days >= 7 ? colors.danger : since.days >= 3 ? colors.primary : colors.muted;
  const details = [entry?.durationMin && `${entry.durationMin} min`, entry?.sets && `${entry.sets} séries`, entry?.reps && `${entry.reps} rép.`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      style={{
        ...(done ? { backgroundColor: colors.successLight, borderColor: colors.success } : {}),
        ...(tileWidth ? { width: tileWidth, aspectRatio: open ? undefined : 1, padding: 12 } : {}),
      }}
    >
      <View style={tileWidth ? { flex: 1, gap: 6 } : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <View style={tileWidth ? undefined : { flex: 1 }}>
          <Link href={{ pathname: '/exercise/[id]', params: { id: exercise.id } }} style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
            {exercise.name}
          </Link>
          {!done && <Text style={{ color: sinceColor, fontSize: 12, marginTop: 2 }}>🕒 {since.label}</Text>}
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
        <View style={tileWidth ? { gap: 4, alignItems: 'stretch' } : { gap: 4, flexDirection: 'row', alignItems: 'center' }}>
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
