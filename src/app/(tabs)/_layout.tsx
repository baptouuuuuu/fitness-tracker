import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

const icon = (e: string) => () => <Text style={{ fontSize: 18 }}>{e}</Text>;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name="index" options={{ title: "Aujourd'hui", tabBarIcon: icon('📅') }} />
      <Tabs.Screen name="exercises" options={{ title: 'Exercices', tabBarIcon: icon('🏋️') }} />
      <Tabs.Screen name="objectives" options={{ title: 'Objectifs', tabBarIcon: icon('🎯') }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant IA', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="history" options={{ title: 'Historique', tabBarIcon: icon('📊') }} />
    </Tabs>
  );
}
