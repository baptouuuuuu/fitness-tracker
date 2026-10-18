import { parseAssistantResponse, requestAssistantCommand } from '../src/domain/assistant';

describe('Mammouth assistant response validation', () => {
  it('accepts a valid exercise response and defaults unknown categories safely', () => {
    expect(
      parseAssistantResponse(
        '{"type":"exercise","name":"Yoga","category":"unknown","reply":"Je propose Yoga."}',
        [],
      ),
    ).toEqual({
      type: 'exercise',
      name: 'Yoga',
      category: 'other',
      reply: 'Je propose Yoga.',
    });
  });

  it('links only existing exercises named exactly by the response', () => {
    expect(
      parseAssistantResponse(
        '```json\n{"type":"objective","name":"Courir 5 km","weight":3,"exerciseNames":["Course à pied","Inventé"],"reply":"Je propose cet objectif."}\n```',
        [{ id: 'run', name: 'Course à pied' }],
      ),
    ).toEqual({
      type: 'objective',
      name: 'Courir 5 km',
      weight: 3,
      exerciseIds: ['run'],
      reply: 'Je propose cet objectif.',
    });
  });

  it('rejects invalid JSON and unsupported actions', () => {
    expect(() => parseAssistantResponse('pas du JSON', [])).toThrow('JSON exploitable');
    expect(() => parseAssistantResponse('{"type":"delete","reply":"ok"}', [])).toThrow('non pris en charge');
  });

  it('calls Mammouth with the supplied key and parses its chat completion', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: '{"type":"exercise","name":"Marche","category":"cardio","reply":"Je propose la marche."}',
          },
        }],
      }),
    } as Response);

    await expect(requestAssistantCommand('not-a-real-key', 'Je veux marcher', [])).resolves.toMatchObject({
      type: 'exercise',
      name: 'Marche',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.mammouth.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: ['Bearer', 'not-a-real-key'].join(' ') }),
      }),
    );
    fetchMock.mockRestore();
  });

  it('provides a useful error for rejected API keys', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 401 } as Response);
    await expect(requestAssistantCommand('not-a-real-key', 'Créer un exercice', [])).rejects.toThrow(
      'Clé API Mammouth invalide',
    );
    fetchMock.mockRestore();
  });
});
