import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

export const colors = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  text: '#1B2430',
  muted: '#6B7686',
  primary: '#2F6BFF',
  primaryLight: '#E3ECFF',
  success: '#1FA463',
  successLight: '#DDF5E8',
  danger: '#D64545',
  border: '#E1E5EC',
  warn: '#FFF1D6',
};

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
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
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.input, props.style]} />
    </View>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
      <Text style={{ fontSize: 40 }}>🌱</Text>
      <Text style={[styles.title, { fontSize: 18, marginTop: 8 }]}>{title}</Text>
      <Text style={[styles.muted, { textAlign: 'center', marginVertical: 8 }]}>{text}</Text>
      {action}
    </Card>
  );
}

export function Bars({ values, labels, max }: { values: number[]; labels: string[]; max?: number }) {
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
  screenContent: { padding: 16, paddingBottom: 48 },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: 12 },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontWeight: '600', fontSize: 14 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  chipText: { color: colors.text, fontSize: 13 },
  tag: { backgroundColor: colors.warn, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 12, color: '#7A5200' },
  label: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, fontSize: 15, color: colors.text, backgroundColor: '#fff' },
});
