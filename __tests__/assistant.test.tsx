import { matchingExerciseIds, parseAssistantCommand } from '../src/domain/assistant';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import AssistantScreen from '../src/app/(tabs)/assistant';
import ObjectivesScreen from '../src/app/(tabs)/objectives';
import { AppProvider } from '../src/store/AppContext';

describe('chat assistant command parsing', () => {
  it('parses exercise requests and infers a category', () => {
    expect(parseAssistantCommand('Crée un exercice de course à pied')).toEqual({
      type: 'exercise',
      name: 'course à pied',
      category: 'cardio',
    });
  });

  describe('chat assistant creation flow', () => {
    it('creates an exercise and a linked objective from chat messages', async () => {
      await render(
        <AppProvider>
          <AssistantScreen />
          <ObjectivesScreen />
        </AppProvider>,
      );
      const input = screen.getByLabelText('Message à l’assistant');

      await fireEvent.changeText(input, 'Crée un exercice de pompes');
      await fireEvent.press(screen.getByText('Envoyer'));
      await waitFor(() => expect(screen.getByText('C’est noté, l’exercice « pompes » a été ajouté.')).toBeTruthy());

      await fireEvent.changeText(input, 'Crée un objectif pour faire 10 pompes');
      await fireEvent.press(screen.getByText('Envoyer'));
      await waitFor(() => expect(screen.getByText('faire 10 pompes')).toBeTruthy());
      expect(screen.getAllByText('pompes').length).toBeGreaterThan(0);
    });
  });

  it('parses objective requests and associates related exercises', () => {
    const command = parseAssistantCommand('Crée un objectif pour faire 10 pompes');
    expect(command).toMatchObject({ type: 'objective', name: 'faire 10 pompes', weight: 2 });
    expect(matchingExerciseIds(command!.name, [{ id: 'pushups', name: 'Pompes' }])).toEqual(['pushups']);
  });

  it('rejects empty and underspecified requests', () => {
    expect(parseAssistantCommand('')).toBeNull();
    expect(parseAssistantCommand('Créer un exercice')).toBeNull();
  });
});
