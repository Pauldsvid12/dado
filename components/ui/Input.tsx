import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { COLORS } from '@/lib/core/constants';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        {...props}
        placeholderTextColor={props.placeholderTextColor ?? COLORS.textMuted}
        style={[styles.input, !!error && styles.inputError, style]}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },

  label: { color: COLORS.textSoft, fontWeight: '700' },

  input: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.55)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },

  error: { color: '#FCA5A5', fontWeight: '700', fontSize: 12 },
});