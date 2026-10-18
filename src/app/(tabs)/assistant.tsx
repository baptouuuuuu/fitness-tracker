import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Card, Muted, Screen, Title, colors, row } from '../../components/ui';
import { matchingExerciseIds, parseAssistantCommand } from '../../domain/assistant';
import { useApp } from '../../store/AppContext';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

const welcomeMessage =
  'Bonjour ! Décris ce que tu veux ajouter, par exemple « Crée un exercice de course à pied » ou « Crée un objectif pour faire 10 pompes ».';

export default function AssistantScreen() {
  const { state, addExercise, addObjective } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: welcomeMessage }]);
  const [input, setInput] = useState('');

  const sendMessage = (text = input) => {
    const request = text.trim();
    if (!request) return;

    const command = parseAssistantCommand(request);
    let response = 'Je n’ai pas compris. Dis-moi si tu veux créer un exercice ou un objectif, et précise son nom.';
    if (command?.type === 'exercise') {
      const existing = state.exercises.find((exercise) => exercise.name.toLowerCase() === command.name.toLowerCase());
      addExercise({ name: command.name, category: command.category ?? 'strength' });
      response = existing
        ? `L’exercice « ${existing.name} » existe déjà${existing.archived ? ' et a été restauré' : ''}.`
        : `C’est noté, l’exercice « ${command.name} » a été ajouté.`;
    } else if (command?.type === 'objective') {
      const existing = state.objectives.find((objective) => objective.name.toLowerCase() === command.name.toLowerCase());
      if (existing) {
        response = `L’objectif « ${existing.name} » existe déjà.`;
      } else {
        const exerciseIds = matchingExerciseIds(
          command.name,
          state.exercises.filter((exercise) => !exercise.archived),
        );
        addObjective({ name: command.name, weight: command.weight ?? 2, exerciseIds });
        response = `L’objectif « ${command.name} » a été créé${exerciseIds.length ? ' et lié aux exercices correspondants' : ''}.`;
      }
    }

    setMessages((current) => [...current, { role: 'user', text: request }, { role: 'assistant', text: response }]);
    setInput('');
  };

  return (
    <Screen>
      <Card>
        <Title>Assistant IA</Title>
        <Muted>Crée un exercice ou un objectif en le décrivant simplement.</Muted>
      </Card>
      <Card>
        <ScrollView style={{ height: 300 }} contentContainerStyle={{ gap: 10 }} keyboardShouldPersistTaps="handled">
          {messages.map((message, index) => (
            <View
              key={`${message.role}-${index}`}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? colors.primaryLight : colors.bg,
                borderRadius: 12,
                padding: 10,
                maxWidth: '90%',
              }}
            >
              <Text style={{ color: colors.text }}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
      </Card>
      <Card>
        <TextInput
          accessibilityLabel="Message à l’assistant"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
          placeholder="Ex. : Ajoute un exercice de marche"
          placeholderTextColor={colors.muted}
          returnKeyType="send"
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            color: colors.text,
            minHeight: 42,
            marginBottom: 8,
          }}
        />
        <Button label="Envoyer" onPress={() => sendMessage()} disabled={!input.trim()} />
      </Card>
      <Card>
        <Muted>Exemples</Muted>
        <View style={[row, { marginTop: 8 }]}>
          <Button kind="secondary" label="Créer un exercice de course à pied" onPress={() => sendMessage('Créer un exercice de course à pied')} />
          <Button kind="secondary" label="Créer un objectif pour faire 10 pompes" onPress={() => sendMessage('Créer un objectif pour faire 10 pompes')} />
        </View>
      </Card>
    </Screen>
  );
}
