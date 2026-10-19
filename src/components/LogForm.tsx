import React, { useState } from 'react';
import { View } from 'react-native';
import { LogInput } from '../domain/state';
import { LogEntry } from '../domain/types';
import { Button, Field, row } from './ui';

const toNum = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(',', '.')));
const str = (n?: number) => (n === undefined ? '' : String(n));

export function LogForm({ entry, onSave, onCancel }: { entry?: LogEntry; onSave: (input: LogInput) => void; onCancel: () => void }) {
  const [note, setNote] = useState(entry?.note ?? '');
  const [duration, setDuration] = useState(str(entry?.durationMin));
  const [sets, setSets] = useState(str(entry?.sets));
  const [reps, setReps] = useState(str(entry?.reps));

  return (
    <View style={{ marginTop: 6 }}>
      <View style={row}>
        <View style={{ flex: 1, minWidth: 90 }}>
          <Field label="⏱️ min" keyboardType="numeric" value={duration} onChangeText={setDuration} placeholder="10" />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <Field label="🔁 Séries" keyboardType="numeric" value={sets} onChangeText={setSets} placeholder="3" />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <Field label="💪 Reps" keyboardType="numeric" value={reps} onChangeText={setReps} placeholder="12" />
        </View>
      </View>
      <Field label="📝 Note" value={note} onChangeText={setNote} placeholder="Ressenti, charge, remarque…" />
      <View style={row}>
        <Button
          label="💾 Enregistrer"
          kind="success"
          onPress={() => onSave({ done: true, note, durationMin: toNum(duration), sets: toNum(sets), reps: toNum(reps) })}
        />
        <Button label="Annuler" kind="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}
