import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Sandwich } from 'lucide-react-native';
import { COLORS } from '@/lib/core/constants';
import { BurgerCanvas } from '@/components/models3d/BurgerCanvas';

const PARTS = [
    { id: 'panabajo', label: 'Pan abajo', source: require('@/assets/models/burger/panabajo.glb') },
    { id: 'carne', label: 'Carne', source: require('@/assets/models/burger/carne.glb') },
    { id: 'queso', label: 'Queso', source: require('@/assets/models/burger/queso.glb') },
    { id: 'tomates', label: 'Tomates', source: require('@/assets/models/burger/tomates.glb') },
    { id: 'lechuga', label: 'Lechuga', source: require('@/assets/models/burger/lechuga.glb') },
    { id: 'panarriba', label: 'Pan arriba', source: require('@/assets/models/burger/panarriba.glb') },
  ];  

export default function BurgerScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#0F172A', '#1E293B', '#334155']} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={COLORS.primary} />
        </Pressable>

        <View style={styles.headerTitle}>
          <Sandwich size={22} color={COLORS.primary} />
          <Text style={styles.title}>Hamburguesa 3D</Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <BurgerCanvas parts={PARTS} style={{ marginTop: 14 }} autoRotate />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  subtitle: { marginTop: 10, color: '#94A3B8' },
  note: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  noteText: { color: '#94A3B8' },
});
