import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ExercisesScreen from '../src/app/(tabs)/exercises';
import TodayScreen from '../src/app/(tabs)/index';
import { AppProvider } from '../src/store/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-router', () => ({
  Link: ({ children }: any) => require('react-native').Text && require('react').createElement(require('react-native').Text, null, children),
  router: { setParams: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

const App = () => (
  <AppProvider>
    <ExercisesScreen />
    <TodayScreen />
  </AppProvider>
);

describe('UI smoke test', () => {
  beforeEach(async () => { await AsyncStorage.clear(); });
  it('shows empty state, then creates an exercise that appears in today recommendations and can be logged', async () => {
    await render(<App />);
    await waitFor(() => expect(screen.getByText('Aucun exercice pour le moment')).toBeTruthy());

    await fireEvent.changeText(screen.getByTestId('exercise-name'), 'Squats');
    await fireEvent.press(screen.getByTestId('exercise-submit'));

    await waitFor(() => expect(screen.getByText('💡 Conseillés')).toBeTruthy());
    expect(screen.getByText('✅ 0/1')).toBeTruthy();

    await fireEvent.press(screen.getAllByTestId(/^toggle-/)[0]);
    await waitFor(() => expect(screen.getByText('✅ 1/1')).toBeTruthy());
    expect(screen.getByText(/Tout est fait/)).toBeTruthy();
  });

  it('finds an exercise in the library, shows instructions and adds it to today', async () => {
    await render(<App />);
    await waitFor(() => expect(screen.getByText('Aucun exercice pour le moment')).toBeTruthy());
    await fireEvent.press(screen.getByText('Explorer les exercices'));
    await fireEvent.changeText(screen.getByPlaceholderText('Ex : squat, dos, haltères…'), '3/4 sit-up');
    await fireEvent.press(screen.getByText('Instructions'));
    expect(screen.getByText(/Allonge-toi sur le dos/)).toBeTruthy();
    await fireEvent.press(screen.getAllByText('Ajouter')[0]);
    expect(screen.getByText('Ajouté')).toBeTruthy();
    expect(screen.getByText('✅ 0/1')).toBeTruthy();
  });
});
