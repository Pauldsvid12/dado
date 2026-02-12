import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/lib/core/constants';

type ButtonVariant = 'primary' | 'outline';

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  style?: ViewStyle;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  iconLeft,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          styles.outline,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <View style={styles.row}>
          {loading ? <ActivityIndicator color={COLORS.text} /> : iconLeft}
          <Text style={styles.outlineText}>{loading ? '...' : title}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.primaryShadow,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primaryGradient}
      >
        <View style={styles.row}>
          {loading ? <ActivityIndicator color={COLORS.text} /> : iconLeft}
          <Text style={styles.primaryText}>{loading ? 'Cargando...' : title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 18,
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },

  primaryShadow: {
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },

  primaryGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },

  primaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  outline: {
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  outlineText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.65 },
});