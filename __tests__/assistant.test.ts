import { matchingExerciseIds, parseAssistantCommand } from '../src/domain/assistant';

describe('chat assistant command parsing', () => {
  it('parses exercise requests and infers a category', () => {
    expect(parseAssistantCommand('Crée un exercice de course à pied')).toEqual({
      type: 'exercise',
      name: 'course à pied',
      category: 'cardio',
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
