import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, DOT_SIZE } from '@/lib/core/constants';

export const DiceDot = () => (
  <View style={styles.dot} />
);

const styles = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLORS.diceDot,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});