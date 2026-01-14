import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATION_DURATION } from '@/lib/core/constants';

export const useDiceAnimation = (isRolling: boolean) => {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRolling) {
      //lanzamiento
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: ANIMATION_DURATION / 4,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: (ANIMATION_DURATION * 3) / 4,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.parallel([
            Animated.timing(rotateX, {
              toValue: 1,
              duration: ANIMATION_DURATION,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(rotateY, {
              toValue: 1,
              duration: ANIMATION_DURATION * 0.8,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(rotateZ, {
              toValue: 1,
              duration: ANIMATION_DURATION * 1.2,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 1 }
        ),
      ]).start();
    } else {
      // Reset suave
      Animated.parallel([
        Animated.timing(rotateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateZ, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isRolling]);

  return {
    rotateX: rotateX.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '1080deg'],
    }),
    rotateY: rotateY.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '720deg'],
    }),
    rotateZ: rotateZ.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    }),
    scale,
    opacity,
  };
};