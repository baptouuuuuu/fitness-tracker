import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { ThemeColors, useTheme } from './ThemeContext';

export const colors: ThemeColors = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  text: '#17212B',
  muted: '#687586',
  primary: '#3867E8',
  primaryLight: '#E7EDFF',
  success: '#168653',
  successLight: '#E4F4EC',
  danger: '#CF4545',
  border: '#E5E9EF',
  warn: '#FFF1D6',
};

export function Screen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.text }]}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.muted, { color: colors.muted }]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  testID?: string;
}) {
  const { colors } = useTheme();
  const bg = { primary: colors.primary, secondary: colors.primaryLight, danger: colors.danger, success: colors.success }[kind];
  const fg = kind === 'secondary' ? colors.primary : '#fff';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 }]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[styles.chipText, { color: colors.text }, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: colors.warn }]}>
      <Text style={[styles.tagText, { color: colors.mode === 'dark' ? '#F5D58A' : '#7A5200' }]}>{label}</Text>
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.bg }, props.style]} />
    </View>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
      <Text style={{ fontSize: 40 }}>🌱</Text>
      <Text style={[styles.title, { fontSize: 18, marginTop: 8 }]}>{title}</Text>
      <Text style={[styles.muted, { textAlign: 'center', marginVertical: 8 }]}>{text}</Text>
      {action}
    </Card>
  );
}

export function Bars({ values, labels, max }: { values: number[]; labels: string[]; max?: number }) {
  const { colors } = useTheme();
  const top = Math.max(max ?? 0, ...values, 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6 }}>
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>{v}</Text>
          <View style={{ width: '70%', height: Math.max(2, (v / top) * 64), backgroundColor: colors.primary, borderRadius: 4 }} />
          <Text style={{ fontSize: 10, color: colors.muted }}>{labels[i]}</Text>
        </View>
      ))}
    </View>
  );
}

export const row: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' };

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  inner: { width: '100%', maxWidth: 760, alignSelf: 'center', gap: 12 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontWeight: '600', fontSize: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  chipText: { color: colors.text, fontSize: 13 },
  tag: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  tagText: { fontSize: 12, color: '#7A5200' },
  label: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
});
