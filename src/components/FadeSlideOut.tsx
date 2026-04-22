import type { PropsWithChildren } from "react";
import { Animated } from "react-native";
import { useEffect, useRef } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { motion } from "../theme/motion";

type Props = PropsWithChildren<{
  delay?: number;
  fromY?: number;
}>;

export const FadeSlideOut = ({ children, delay = 0, fromY = 12 }: Props) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;
  const reducedMotionEnabled = useReducedMotion();

  useEffect(() => {
    if (reducedMotionEnabled) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.normal,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, reducedMotionEnabled, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
};
