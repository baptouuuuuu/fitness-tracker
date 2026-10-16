import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ExercisesScreen from '../src/app/(tabs)/exercises';
import TodayScreen from '../src/app/(tabs)/index';
import { AppProvider } from '../src/store/AppContext';

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
  it('shows empty state, then creates an exercise that appears in today recommendations and can be logged', async () => {
    await render(<App />);
    await waitFor(() => expect(screen.getByText('Aucun exercice pour le moment')).toBeTruthy());

    await fireEvent.changeText(screen.getByTestId('exercise-name'), 'Squats');
    await fireEvent.press(screen.getByTestId('exercise-submit'));

    await waitFor(() => expect(screen.getByText('Recommandés')).toBeTruthy());
    expect(screen.getByText('Jamais fait')).toBeTruthy();
    expect(screen.getByText('✅ 0/1 fait(s)')).toBeTruthy();

    await fireEvent.press(screen.getAllByText('Fait')[0]);
    await waitFor(() => expect(screen.getByText('✅ 1/1 fait(s)')).toBeTruthy());
    expect(screen.getByText(/Tout est fait/)).toBeTruthy();
  });
});
