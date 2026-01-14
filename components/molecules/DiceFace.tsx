import { COLORS, DICE_SIZE, DOT_SIZE } from '@/lib/core/constants'; // ← Agregado DOT_SIZE
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DiceDot } from '../atoms/DiceDot';

type Props = {
  value: number;
};

const dotPatterns = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

export const DiceFace: React.FC<Props> = ({ value }) => {
  const pattern = dotPatterns[value as keyof typeof dotPatterns] || [];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.row}>
            {[0, 1, 2].map((col) => {
              const hasDot = pattern.some(([r, c]) => r === row && c === col);
              return (
                <View key={col} style={styles.cell}>
                  {hasDot && <DiceDot />}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    backgroundColor: COLORS.diceBg,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  grid: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: DOT_SIZE + 8,  // ← Ahora funciona
    height: DOT_SIZE + 8, // ← Ahora funciona
    justifyContent: 'center',
    alignItems: 'center',
  },
});
