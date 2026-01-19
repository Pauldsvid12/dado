import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { 
  Dices, 
  RotateCcw, 
  Loader2, 
  Clock, 
  Smartphone, 
  AlertTriangle 
} from 'lucide-react-native';

// Módulos y Lógica
import { useAccelerometer } from '@/lib/modules/sensors/accelerometer/useAccelerometer';
import { Scene3D } from '@/components/models3d/Scene3D';
import { ShakeIndicator } from '@/components/molecules/ShakeIndicator';
import { GlassCard } from '@/components/atoms/GlassCard';
import { COLORS, COOLDOWN_TIME } from '@/lib/core/constants';

// Lógica local para el dado (con el truco del 9)
const rollDiceLogic = () => {
  const result = Math.floor(Math.random() * 6) + 1;
  // Si sale 3, devolvemos 9 para coincidir con tu modelo
  return result === 3 ? 9 : result;
};

// Función auxiliar para intensidad de shake (si no tienes el hook 'isShaking' separado)
const getShakeIntensity = (data: { x: number; y: number; z: number }) => {
  return Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
};

export default function DiceGameScreen() {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [canRoll, setCanRoll] = useState(true);

  // Acelerómetro
  const { data, isAvailable } = useAccelerometer();
  const intensity = getShakeIntensity(data);

  // Animaciones
  const particlesAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Efecto de Shake
  useEffect(() => {
    // Umbral de shake (ajustable)
    const isShaking = intensity > 1.8; 

    if (isShaking && canRoll && !isRolling && isAvailable) {
      handleRoll();
    }
  }, [data, canRoll, isRolling, isAvailable, intensity]);

  // Animación de carga (spinner)
  useEffect(() => {
    if (isRolling) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [isRolling]);

  const handleRoll = () => {
    if (!canRoll) return;

    setCanRoll(false);
    setIsRolling(true);

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Animación de partículas
    Animated.sequence([
      Animated.timing(particlesAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(particlesAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Generar resultado y actualizar estado
    setTimeout(() => {
      const newValue = rollDiceLogic();
      setDiceValue(newValue);
      setRollCount((prev) => prev + 1);
      setIsRolling(false);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setTimeout(() => setCanRoll(true), COOLDOWN_TIME);
    }, 1000); // 1 segundo coincide con tu animación 3D
  };

  const handleReset = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDiceValue(1);
    setRollCount(0);
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Renderizado del indicador de estado
  const renderStatusIndicator = () => {
    if (isRolling) {
      return (
        <View style={styles.statusContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Loader2 size={24} color={COLORS.primary} strokeWidth={2.5} />
          </Animated.View>
          <Text style={styles.instruction}>Lanzando...</Text>
        </View>
      );
    }

    if (!canRoll) {
      return (
        <View style={styles.statusContainer}>
          <Clock size={24} color={COLORS.warning} strokeWidth={2.5} />
          <Text style={styles.instruction}>Espera un momento...</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        {isAvailable ? (
          <>
            <Smartphone size={24} color={COLORS.success} strokeWidth={2.5} />
            <Text style={styles.instruction}>¡Agita para lanzar!</Text>
          </>
        ) : (
          <Text style={styles.instruction}>Listo para lanzar</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.gradient}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Dices size={32} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.title}>Dado Mágico</Text>
          </View>
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <RotateCcw size={24} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Estadísticas */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lanzamientos</Text>
              <Text style={styles.statValue}>{rollCount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Último</Text>
              <Text style={styles.statValue}>{diceValue}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Contenedor del Dado 3D */}
        <View style={styles.diceContainer}>
          <Scene3D
            isRolling={isRolling}
            diceValue={diceValue}
            onAnimationComplete={() => {
              // Callback opcional si necesitas sincronizar algo exacto
            }}
          />

          {/* Efecto de Partículas */}
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  transform: [
                    {
                      translateX: particlesAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.cos((i * Math.PI) / 4) * 100],
                      }),
                    },
                    {
                      translateY: particlesAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.sin((i * Math.PI) / 4) * 100],
                      }),
                    },
                  ],
                  opacity: particlesAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1, 0],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {/* Indicador de Agitación / Estado */}
        <View style={styles.indicatorContainer}>
          {isAvailable && <ShakeIndicator intensity={intensity} />}
          {renderStatusIndicator()}
        </View>

        {/* Botón de Lanzamiento Manual */}
        <Pressable
          onPress={handleRoll}
          disabled={!canRoll || isRolling}
          style={({ pressed }) => [
            styles.rollButton,
            (pressed || !canRoll || isRolling) && styles.rollButtonDisabled,
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rollButtonGradient}
          >
            <Dices size={20} color="#FFF" strokeWidth={2.5} />
            <Text style={styles.rollButtonText}>
              {isRolling ? 'Lanzando...' : 'Lanzar Manualmente'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Aviso de Sensor no disponible */}
        {!isAvailable && (
          <View style={styles.warningContainer}>
            <AlertTriangle size={20} color={COLORS.warning} strokeWidth={2.5} />
            <Text style={styles.warning}>Acelerómetro no disponible</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resetButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  statsCard: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  diceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: 300, // Asegura espacio para el modelo 3D
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  indicatorContainer: {
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  instruction: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rollButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  rollButtonDisabled: {
    opacity: 0.5,
  },
  rollButtonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  rollButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warning: {
    textAlign: 'center',
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '600',
  },
});
