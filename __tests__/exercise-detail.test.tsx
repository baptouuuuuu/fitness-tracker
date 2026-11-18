import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ExerciseDetail from '../src/app/exercise/[id]';
import { todayKey } from '../src/domain/dates';
import { addExercise } from '../src/domain/state';
import { emptyState, logKey } from '../src/domain/types';
import { loadState, saveState } from '../src/storage/persistence';
import { AppProvider } from '../src/store/AppContext';

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: 'a' }),
}));

it('shows instructions and records a session from the exercise detail', async () => {
  await AsyncStorage.clear();
  await saveState(addExercise(emptyState(), { name: '3/4 sit-up', category: 'strength', datasetId: '0001' }, todayKey(), 'a'));
  await render(<AppProvider><ExerciseDetail /></AppProvider>);
  await waitFor(() => expect(screen.getByText('Comment réaliser cet exercice')).toBeTruthy());
  expect(screen.getByLabelText('Photo de démonstration : 3/4 sit-up')).toBeTruthy();
  await fireEvent.press(screen.getByText('Enregistrer la séance'));
  await fireEvent.changeText(screen.getByPlaceholderText('3'), '3');
  await fireEvent.changeText(screen.getByPlaceholderText('12'), '12');
  await fireEvent.press(screen.getByText('💾 Enregistrer'));
  await waitFor(() => expect(screen.getByText('Exercice enregistré aujourd’hui.')).toBeTruthy());
  await waitFor(async () => expect((await loadState()).logs[logKey('a', todayKey())]).toMatchObject({ done: true, sets: 3, reps: 12 }));
});
