import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, StatusBar} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Dices,  RotateCcw, Loader2, Clock, Smartphone, AlertTriangle} from 'lucide-react-native';
import { useAccelerometer } from '@/lib/modules/sensors/accelerometer/useAccelerometer';
import { isShaking, getShakeIntensity } from '@/lib/core/logic/motion';
import { rollDice } from '@/lib/core/logic/dice';
import { DiceFace } from '@/components/molecules/DiceFace';
import { ShakeIndicator } from '@/components/molecules/ShakeIndicator';
import { GlassCard } from '@/components/atoms/GlassCard';
import { useDiceAnimation } from '@/hooks/useDiceAnimation';
import { COLORS, COOLDOWN_TIME } from '@/lib/core/constants';

export default function DiceGameScreen() {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [canRoll, setCanRoll] = useState(true);

  const { data, isAvailable } = useAccelerometer();
  const animations = useDiceAnimation(isRolling);
  const intensity = getShakeIntensity(data);

  const particlesAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isShaking(data) && canRoll && !isRolling) {
      handleRoll();
    }
  }, [data, canRoll, isRolling]);

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

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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

    setTimeout(() => {
      const newValue = rollDice();
      setDiceValue(newValue);
      setRollCount((prev) => prev + 1);
      setIsRolling(false);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => setCanRoll(true), COOLDOWN_TIME);
    }, 800);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDiceValue(1);
    setRollCount(0);
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  //componente de estado
  const renderStatusIndicator = () => {
    if (isRolling) {
      return (
        <View style={styles.statusContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Loader2 size={24} color={COLORS.primary} strokeWidth={2.5} />
          </Animated.View>
          <Text style={styles.instruction}>Rolling...</Text>
        </View>
      );
    }

    if (!canRoll) {
      return (
        <View style={styles.statusContainer}>
          <Clock size={24} color={COLORS.warning} strokeWidth={2.5} />
          <Text style={styles.instruction}>Wait a moment...</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Smartphone size={24} color={COLORS.success} strokeWidth={2.5} />
        <Text style={styles.instruction}>Shake to roll!</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Dices size={32} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.title}>Magic Dice</Text>
          </View>
          <Pressable onPress={handleReset} style={styles.resetButton}>
            <RotateCcw size={24} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Stats */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rolls</Text>
              <Text style={styles.statValue}>{rollCount}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Last</Text>
              <Text style={styles.statValue}>{diceValue}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Dice Container */}
        <View style={styles.diceContainer}>
          <Animated.View
            style={[
              styles.diceWrapper,
              {
                transform: [
                  { rotateX: animations.rotateX },
                  { rotateY: animations.rotateY },
                  { rotateZ: animations.rotateZ },
                  { scale: animations.scale },
                ],
                opacity: animations.opacity,
              },
            ]}
          >
            <DiceFace value={diceValue} />
          </Animated.View>

          {/* Particles Effect */}
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

        {/* Shake Indicator */}
        <View style={styles.indicatorContainer}>
          <ShakeIndicator intensity={intensity} />
          {renderStatusIndicator()}
        </View>

        {/* Manual Roll Button */}
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
            <Text style={styles.rollButtonText}>Roll Manually</Text>
          </LinearGradient>
        </Pressable>

        {/* Sensor Status */}
        {!isAvailable && (
          <View style={styles.warningContainer}>
            <AlertTriangle size={20} color={COLORS.warning} strokeWidth={2.5} />
            <Text style={styles.warning}>Accelerometer not available</Text>
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
  },
  diceWrapper: {
    position: 'relative',
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