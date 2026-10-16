import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { ExerciseLogRow } from '../../components/ExerciseRow';
import { Button, Card, EmptyState, Muted, Screen, Title, colors, row } from '../../components/ui';
import { addDays, isDateKey, longDateLabel, todayKey } from '../../domain/dates';
import { recommend } from '../../domain/recommendations';
import { computeStreaks, doneDates } from '../../domain/stats';
import { useApp } from '../../store/AppContext';

export default function TodayScreen() {
  const { state, ready } = useApp();
  const params = useLocalSearchParams<{ date?: string }>();
  const today = todayKey();
  const date = isDateKey(params.date) && params.date <= today ? params.date : today;
  const setDate = (d: string) => {
    router.setParams({ date: d });
  };

  const active = state.exercises.filter((e) => !e.archived);
  const recs = useMemo(() => recommend(state, date, 5), [state, date]);
  const recIds = new Set(recs.map((r) => r.exercise.id));
  const others = active.filter((e) => !recIds.has(e.id));
  const doneCount = active.filter((e) => state.logs[`${date}|${e.id}`]?.done).length;
  const streak = computeStreaks(doneDates(state), today).current;

  if (!ready) return <Screen><Muted>Chargement…</Muted></Screen>;

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button label="◀" kind="secondary" onPress={() => setDate(addDays(date, -1))} />
          <View style={{ alignItems: 'center' }}>
            <Title>{date === today ? "Aujourd'hui" : longDateLabel(date)}</Title>
            {date === today && <Muted>{longDateLabel(date)}</Muted>}
          </View>
          <Button label="▶" kind="secondary" disabled={date >= today} onPress={() => setDate(addDays(date, 1))} />
        </View>
        <View style={[row, { justifyContent: 'center', marginTop: 6 }]}>
          <Text style={{ color: colors.text }}>✅ {doneCount}/{active.length} fait(s)</Text>
          <Text style={{ color: colors.text }}>🔥 Série : {streak} jour(s)</Text>
        </View>
      </Card>

      {active.length === 0 ? (
        <EmptyState
          title="Aucun exercice pour le moment"
          text="Ajoutez vos propres exercices ou choisissez parmi les modèles recommandés pour commencer."
          action={<Link href="/exercises" style={{ color: colors.primary, fontWeight: '600' }}>Ajouter des exercices</Link>}
        />
      ) : (
        <>
          <Title>Recommandés</Title>
          {recs.length === 0 ? (
            <Card><Text style={{ color: colors.success, fontWeight: '600' }}>🎉 Tout est fait pour ce jour, bravo !</Text></Card>
          ) : (
            recs.map((r) => <ExerciseLogRow key={r.exercise.id} exercise={r.exercise} date={date} reasons={r.reasons} />)
          )}
          {others.length > 0 && (
            <>
              <Title>Autres exercices</Title>
              {others.map((e) => <ExerciseLogRow key={e.id} exercise={e} date={date} />)}
            </>
          )}
        </>
      )}
    </Screen>
  );
}
