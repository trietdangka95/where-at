import { Easing } from "react-native";

export const motion = {
  duration: {
    fast: 120,
    normal: 200,
    slow: 280,
  },
  easing: {
    enter: Easing.out(Easing.cubic),
    exit: Easing.in(Easing.cubic),
    emphasis: Easing.bezier(0.2, 0.8, 0.2, 1),
  },
  scale: {
    tap: 0.96,
  },
};
