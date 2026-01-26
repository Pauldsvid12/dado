import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BurgerProvider, useBurger } from '@/context/BurgerContext'; // Importa el provider
import { BurgerCanvas } from '@/components/models3d/BurgerCanvas';
import { IngredientType } from '@/types/burger';
import { COLORS } from '@/lib/core/constants';

const BurgerBuilder = () => {
  const { ingredients, addIngredient, resetBurger } = useBurger();

  const CONTROLS: { type: IngredientType; label: string; color: string }[] = [
    { type: 'carne', label: 'Carne', color: '#8D6E63' },
    { type: 'queso', label: 'Queso', color: '#FFD54F' },
    { type: 'lechuga', label: 'Lechuga', color: '#66BB6A' },
    { type: 'tomates', label: 'Tomate', color: '#EF5350' },
    { type: 'panarriba', label: 'Pan Top', color: '#D7CCC8' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Visualizador 3D */}
      <View style={styles.canvasContainer}>
        <BurgerCanvas ingredients={ingredients} style={{ flex: 1 }} />
      </View>
      {/* Controles */}
      <View style={styles.controls}>
        <Text style={styles.controlsTitle}>Arma tu Hamburguesa</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonsRow}>
          {CONTROLS.map((btn) => (
            <Pressable
              key={btn.type}
              onPress={() => addIngredient(btn.type)}
              style={[styles.ingButton, { backgroundColor: btn.color }]}
            >
              <Text style={styles.ingBtnText}>+ {btn.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={resetBurger} style={[styles.ingButton, { backgroundColor: COLORS.error }]}>
            <Text style={styles.ingBtnText}>Reiniciar</Text>
          </Pressable>
        </ScrollView>
        <Text style={styles.summary}>
          Capas actuales: {ingredients.length}
        </Text>
      </View>
    </View>
  );
};
//pantalla principal
export default function BurgerScreen() {
  return (
    <BurgerProvider>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <BurgerBuilder />
      </LinearGradient>
    </BurgerProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  canvasContainer: { flex: 0.7 },
  controls: { flex: 0.3, padding: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  controlsTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  buttonsRow: { flexDirection: 'row', gap: 10 },
  ingButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    height: 45,
    justifyContent: 'center',
  },
  ingBtnText: { color: '#000', fontWeight: 'bold' },
  summary: { color: '#AAA', marginTop: 10, textAlign: 'center' },
});