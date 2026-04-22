import { AccessibilityInfo } from "react-native";
import { useEffect, useState } from "react";

export const useReducedMotion = () => {
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const enabled = await AccessibilityInfo.isReduceMotionEnabled();
        if (mounted) setReducedMotionEnabled(enabled);
      } catch {
        if (mounted) setReducedMotionEnabled(false);
      }
    };

    void load();

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      setReducedMotionEnabled(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotionEnabled;
};
