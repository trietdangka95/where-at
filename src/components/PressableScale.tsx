import type { PropsWithChildren } from "react";
import { Animated, Pressable } from "react-native";
import { useRef } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { motion } from "../theme/motion";

type Props = PropsWithChildren<{
  onPress?: () => void;
}>;

export const PressableScale = ({ children, onPress }: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const reducedMotionEnabled = useReducedMotion();

  const animateTo = (value: number) => {
    if (reducedMotionEnabled) {
      scale.setValue(value);
      return;
    }
    Animated.timing(scale, {
      toValue: value,
      duration: motion.duration.fast,
      easing: value < 1 ? motion.easing.exit : motion.easing.enter,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={() => animateTo(motion.scale.tap)} onPressOut={() => animateTo(1)}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
