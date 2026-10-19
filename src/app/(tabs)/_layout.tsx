import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { ThemeToggle } from '../../components/ui';
import { useTheme } from '../../components/ThemeContext';

const icon = (e: string) => () => <Text style={{ fontSize: 18 }}>{e}</Text>;

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerRight: () => <ThemeToggle />,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Aujourd'hui", tabBarIcon: icon('📅') }} />
      <Tabs.Screen name="exercises" options={{ title: 'Exercices', tabBarIcon: icon('🏋️') }} />
      <Tabs.Screen name="objectives" options={{ title: 'Objectifs', tabBarIcon: icon('🎯') }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant IA', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="history" options={{ title: 'Historique', tabBarIcon: icon('📊') }} />
    </Tabs>
  );
}
