import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/lib/core/constants';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const GlassCard: React.FC<Props> = ({ children, style }) => (
  <View style={[styles.container, style]}>
    <View style={styles.backdrop} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.card,
  },
});