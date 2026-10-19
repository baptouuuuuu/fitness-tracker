import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { ExerciseMedia } from '../../components/ExerciseMedia';
import { Bars, Card, EmptyState, Muted, Screen, Tag, Title, colors, row } from '../../components/ui';
import { diffDays, todayKey } from '../../domain/dates';
import { categoryLabel } from '../../domain/templates';
import { computeStreaks, doneDates, doneLogs, lastDoneDate, periodStats, weeklySeries } from '../../domain/stats';
import { scoreExercise } from '../../domain/recommendations';
import { useApp } from '../../store/AppContext';
import { View } from 'react-native';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, ready } = useApp();
  const exercise = state.exercises.find((e) => e.id === id);
  const today = todayKey();

  if (!ready) return <Screen><Muted>Chargement…</Muted></Screen>;
  if (!exercise) return <Screen><EmptyState title="Exercice introuvable" text="Il a peut-être été supprimé." /></Screen>;

  const logs = doneLogs(state, exercise.id).sort((a, b) => b.date.localeCompare(a.date));
  const streaks = computeStreaks(doneDates(state, exercise.id), today);
  const weeks = weeklySeries(state, today, 8, exercise.id);
  const last = lastDoneDate(state, exercise.id, today);
  const month = periodStats(state, `${today.slice(0, 7)}-01`, today, today, exercise.id);
  const rec = scoreExercise(state, exercise, today);
  const objectives = state.objectives.filter((o) => !o.archived && o.exerciseIds.includes(exercise.id));
  const totalMin = logs.reduce((s, l) => s + (l.durationMin ?? 0), 0);

  return (
    <Screen>
      <Stack.Screen options={{ title: exercise.name }} />
      <Card>
        <Title>{exercise.name}</Title>
        <ExerciseMedia exercise={exercise} />
        <View style={[row, { marginTop: 6 }]}>
          <Tag label={categoryLabel(exercise.category)} />
          {objectives.map((o) => <Tag key={o.id} label={`🎯 ${o.name}`} />)}
        </View>
        <Muted>{last ? `Dernière fois : il y a ${diffDays(last, today)} jour(s)` : 'Jamais fait'}</Muted>
        <Muted>Priorité de recommandation : {rec.score}/100</Muted>
      </Card>
      <View style={row}>
        {[
          ['Total', `${logs.length}`],
          ['Série', `${streaks.current} j`],
          ['Record', `${streaks.longest} j`],
          ['Ce mois', `${month.activeDays} j`],
          ['Temps total', `${totalMin} min`],
        ].map(([l, v]) => (
          <Card key={l} style={{ flexGrow: 1, flexBasis: '30%' }}>
            <Muted>{l}</Muted>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{v}</Text>
          </Card>
        ))}
      </View>
      <Card>
        <Title>Progression (8 semaines)</Title>
        <View style={{ height: 8 }} />
        <Bars values={weeks.map((w) => w.completions)} labels={weeks.map((w) => w.from.slice(5))} />
      </Card>
      <Title>Journal</Title>
      {logs.length === 0 ? (
        <EmptyState title="Aucune séance" text="Validez cet exercice depuis l'écran Aujourd'hui pour suivre votre progression." />
      ) : (
        logs.slice(0, 30).map((l) => (
          <Card key={l.date}>
            <Text style={{ fontWeight: '600', color: colors.text }}>{l.date}</Text>
            <Muted>{[l.durationMin && `${l.durationMin} min`, l.sets && `${l.sets} séries`, l.reps && `${l.reps} rép.`].filter(Boolean).join(' · ') || 'Fait'}</Muted>
            {!!l.note && <Text style={{ fontStyle: 'italic', color: colors.muted }}>« {l.note} »</Text>}
          </Card>
        ))
      )}
    </Screen>
  );
}
