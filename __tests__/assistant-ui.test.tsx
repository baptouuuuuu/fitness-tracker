import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import AssistantScreen from '../src/app/(tabs)/assistant';
import { AppProvider } from '../src/store/AppContext';

describe('Mammouth assistant UI', () => {
  afterEach(() => jest.restoreAllMocks());

  it('asks for an API key and requires confirmation before creating an exercise', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"type":"exercise","name":"Course à pied","category":"cardio","reply":"Je propose d’ajouter Course à pied."}',
          },
        }],
      }),
    } as Response);

    await render(
      <AppProvider>
        <AssistantScreen />
      </AppProvider>,
    );

    const messageInput = screen.getByLabelText('Message à l’assistant');
    await fireEvent.changeText(messageInput, 'Ajoute la course à pied');
    await fireEvent.press(screen.getByText('Envoyer'));
    expect(screen.getByText('Ajoute ta clé API Mammouth pour discuter avec l’assistant.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Clé API Mammouth'), 'not-a-real-key');
    await fireEvent.press(screen.getByText('Envoyer'));
    await waitFor(() => expect(screen.getByText('Confirmer la création')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('L’exercice « Course à pied » a été ajouté.')).toBeNull();

    await fireEvent.press(screen.getByText('Créer'));
    expect(screen.getByText('L’exercice « Course à pied » a été ajouté.')).toBeTruthy();
  });
});
