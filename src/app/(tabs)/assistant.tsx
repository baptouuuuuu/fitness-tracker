import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Card, Muted, Screen, Title, colors, row } from '../../components/ui';
import { AssistantCommand, requestAssistantCommand } from '../../domain/assistant';
import { categoryLabel } from '../../domain/templates';
import { useApp } from '../../store/AppContext';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

const welcomeMessage =
  'Bonjour ! Décris ce que tu veux créer, par exemple « Je veux courir 5 km » ou « Ajoute un exercice de course à pied ».';

export default function AssistantScreen() {
  const { state, addExercise, addObjective } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: welcomeMessage }]);
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingCommand, setPendingCommand] = useState<AssistantCommand | null>(null);

  const sendMessage = async (text = input) => {
    const request = text.trim();
    if (!request || busy) return;
    if (!apiKey.trim()) {
      setError('Ajoute ta clé API Mammouth pour discuter avec l’assistant.');
      return;
    }

    setError('');
    setPendingCommand(null);
    setMessages((current) => [...current, { role: 'user', text: request }]);
    setInput('');
    setBusy(true);
    try {
      const exercises = state.exercises
        .filter((exercise) => !exercise.archived)
        .map(({ id, name }) => ({ id, name }));
      const command = await requestAssistantCommand(apiKey.trim(), request, exercises);
      setMessages((current) => [...current, { role: 'assistant', text: command.reply }]);
      if (command.type !== 'clarification') setPendingCommand(command);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de contacter Mammouth AI.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCommand = () => {
    if (!pendingCommand) return;
    if (pendingCommand.type === 'exercise') {
      const existing = state.exercises.find(
        (exercise) => exercise.name.toLocaleLowerCase() === pendingCommand.name.toLocaleLowerCase(),
      );
      addExercise({ name: pendingCommand.name, category: pendingCommand.category });
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: existing
            ? `L’exercice « ${existing.name} » existe déjà${existing.archived ? ' et a été restauré' : ''}.`
            : `L’exercice « ${pendingCommand.name} » a été ajouté.`,
        },
      ]);
    } else {
      const existing = state.objectives.find(
        (objective) => objective.name.toLocaleLowerCase() === pendingCommand.name.toLocaleLowerCase(),
      );
      if (existing) {
        setMessages((current) => [
          ...current,
          { role: 'assistant', text: `L’objectif « ${existing.name} » existe déjà.` },
        ]);
      } else {
        addObjective({
          name: pendingCommand.name,
          weight: pendingCommand.weight,
          exerciseIds: pendingCommand.exerciseIds,
        });
        setMessages((current) => [
          ...current,
          { role: 'assistant', text: `L’objectif « ${pendingCommand.name} » a été créé.` },
        ]);
      }
    }
    setPendingCommand(null);
  };

  return (
    <Screen>
      <Card>
        <Title>Assistant IA Mammouth</Title>
        <Muted>Ta clé reste en mémoire le temps de cette session. Elle n’est pas enregistrée.</Muted>
        <TextInput
          accessibilityLabel="Clé API Mammouth"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Colle ta clé API Mammouth"
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            color: colors.text,
            marginTop: 8,
          }}
        />
        <Muted>
          Le message et les noms de tes exercices actifs sont envoyés à Mammouth AI. Sur le web, l’accès dépend aussi de son autorisation CORS.
        </Muted>
        {!!apiKey && (
          <View style={[row, { marginTop: 8 }]}>
            <Button label="Effacer la clé" kind="secondary" onPress={() => setApiKey('')} />
          </View>
        )}
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
          {busy && <Muted>L’IA réfléchit…</Muted>}
        </ScrollView>
      </Card>
      {!!pendingCommand && (
        <Card>
          <Title>Confirmer la création</Title>
          <Muted>
            {pendingCommand.type === 'exercise'
              ? `Exercice : ${pendingCommand.name} · ${categoryLabel(pendingCommand.category)}`
              : `Objectif : ${pendingCommand.name} · priorité ${pendingCommand.weight} · ${pendingCommand.exerciseIds.length} exercice(s) lié(s)`}
          </Muted>
          <View style={[row, { marginTop: 8 }]}>
            <Button label="Créer" onPress={confirmCommand} />
            <Button label="Annuler" kind="secondary" onPress={() => setPendingCommand(null)} />
          </View>
        </Card>
      )}
      {!!error && (
        <Card>
          <Text accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Text>
        </Card>
      )}
      <Card>
        <TextInput
          accessibilityLabel="Message à l’assistant"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => void sendMessage()}
          placeholder="Ex. : Je veux courir 5 km"
          placeholderTextColor={colors.muted}
          returnKeyType="send"
          editable={!busy}
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
        <Button label="Envoyer" onPress={() => void sendMessage()} disabled={!input.trim() || busy} />
      </Card>
    </Screen>
  );
}
