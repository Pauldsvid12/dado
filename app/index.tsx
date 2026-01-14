import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dices, Smartphone, Zap } from 'lucide-react-native';
import { COLORS } from '@/lib/core/constants';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Dices size={80} color={COLORS.primary} strokeWidth={2} />
        <Text style={styles.title}>Dado Mágico</Text>
        <Text style={styles.subtitle}>Agita para lanzar • Física en tiempo real</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Smartphone size={24} color={COLORS.primary} />
            <Text style={styles.featureText}>Acelerómetro</Text>
          </View>
          <View style={styles.feature}>
            <Zap size={24} color={COLORS.secondary} />
            <Text style={styles.featureText}>Física en Tiempo Real</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/games/dice')}
          style={styles.button}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Comenzar a Lanzar</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
  },
  features: {
    flexDirection: 'row',
    gap: 32,
    marginVertical: 48,
  },
  feature: {
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
});