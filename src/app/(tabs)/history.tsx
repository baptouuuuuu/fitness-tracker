import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BodyFigure } from '../../components/BodyFigure';
import { musclesForExercise } from '../../domain/media';
import { Bars, Button, Card, EmptyState, Muted, Screen, Title, row } from '../../components/ui';
import { useTheme } from '../../components/ThemeContext';
import { addDays, addMonths, daysInMonth, longDateLabel, monthLabel, startOfMonth, todayKey } from '../../domain/dates';
import { completionsByDate, computeStreaks, doneDates, periodStats, weeklySeries } from '../../domain/stats';
import { useApp } from '../../store/AppContext';

const pct = (n: number) => `${Math.round(n * 100)}%`;

function intensity(n: number, colors: ReturnType<typeof useTheme>['colors']): string {
  if (n === 0) return colors.bg;
  if (n === 1) return colors.successLight;
  if (n === 2) return colors.success;
  return colors.success;
}

export default function HistoryScreen() {
  const { state } = useApp();
  const { colors, mode } = useTheme();
  const today = todayKey();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState<string | null>(null);

  const monthEnd = addDays(month, daysInMonth(month) - 1);
  const byDate = completionsByDate(state, month, monthEnd);
  const leading = (new Date(`${month}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(leading).fill(null), ...Object.keys(byDate)];
  const streaks = computeStreaks(doneDates(state), today);
  const weeks = weeklySeries(state, today, 8);
  const thisWeek = weeks[weeks.length - 1];
  const monthStat = periodStats(state, month, monthEnd, today);
  const dayLogs = selected ? Object.values(state.logs).filter((l) => l.date === selected && l.done) : [];
  const dayMuscles = dayLogs.flatMap((l) => {
    const ex = state.exercises.find((e) => e.id === l.exerciseId);
    return ex ? musclesForExercise(ex) : [];
  });
  const nameOf = (id: string) => state.exercises.find((e) => e.id === id)?.name ?? '?';

  if (state.exercises.length === 0) {
    return <Screen><EmptyState title="Pas encore d'historique" text="Ajoutez des exercices et validez-les au quotidien pour voir vos statistiques ici." /></Screen>;
  }

  return (
    <Screen>
      <View style={row}>
        {[
          ['🔥', 'Série actuelle', `${streaks.current} j`],
          ['🏆', 'Meilleure série', `${streaks.longest} j`],
          ['📆', 'Cette semaine', `${thisWeek.activeDays}/${thisWeek.elapsedDays} j · ${pct(thisWeek.consistency)}`],
          ['🗓️', monthLabel(month), `${monthStat.activeDays}/${monthStat.elapsedDays} j · ${pct(monthStat.consistency)}`],
        ].map(([icon, label, value]) => (
          <Card key={label} style={{ flexGrow: 1, flexBasis: '45%' }}>
            <Muted>{icon} {label}</Muted>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{value}</Text>
          </Card>
        ))}
      </View>

      <Card>
        <Title>Exercices terminés par semaine</Title>
        <View style={{ height: 8 }} />
        <Bars values={weeks.map((w) => w.completions)} labels={weeks.map((w) => w.from.slice(5))} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button label="◀" kind="secondary" onPress={() => setMonth(addMonths(month, -1))} />
          <Title>{monthLabel(month)}</Title>
          <Button label="▶" kind="secondary" disabled={month >= startOfMonth(today)} onPress={() => setMonth(addMonths(month, 1))} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <Text key={i} style={{ width: `${100 / 7}%`, textAlign: 'center', color: colors.muted }}>{d}</Text>
          ))}
          {cells.map((d, i) => (
            <View key={i} style={{ width: `${100 / 7}%`, padding: 2 }}>
              {d && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSelected(d)}
                  style={{ aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: intensity(byDate[d], colors), borderWidth: d === today ? 2 : selected === d ? 2 : 0, borderColor: colors.primary, opacity: d > today ? 0.4 : 1 }}
                >
                  <Text style={{ color: byDate[d] > 1 ? (mode === 'dark' ? '#10151C' : '#fff') : colors.text, fontSize: 12 }}>{Number(d.slice(8))}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </Card>

      {selected && (
        <Card>
          <Title>{longDateLabel(selected)}</Title>
          {dayLogs.length === 0 ? <Muted>Aucun exercice validé ce jour-là.</Muted> : dayLogs.map((l) => (
            <Text key={l.exerciseId} style={{ color: colors.text, marginTop: 4 }}>
              ✓ {nameOf(l.exerciseId)}{l.durationMin ? ` · ${l.durationMin} min` : ''}{l.sets && l.reps ? ` · ${l.sets}×${l.reps}` : l.sets ? ` · ${l.sets} séries` : l.reps ? ` · ${l.reps} rép.` : ''}{l.note ? ` — ${l.note}` : ''}
            </Text>
          ))}
          {dayMuscles.length > 0 && <View style={{ marginTop: 8 }}><BodyFigure muscles={dayMuscles} height={110} testID="day-body" /></View>}
          {selected <= today && (
            <View style={{ marginTop: 10 }}>
              <Button label="Modifier ce jour" kind="secondary" onPress={() => router.navigate({ pathname: '/', params: { date: selected } })} />
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}
