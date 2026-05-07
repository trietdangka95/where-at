import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

import { colors } from "../theme/colors";

type ToastType = "success" | "info" | "danger";

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const bgByType: Record<ToastType, string> = {
  success: "#1f9d55",
  info: colors.primaryDark,
  danger: colors.danger,
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((nextMessage: string, nextType: ToastType = "info") => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMessage(nextMessage);
    setType(nextType);
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();

    hideTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -8, duration: 140, useNativeDriver: true }),
      ]).start(() => {
        setVisible(false);
      });
    }, 2000);
  }, [opacity, translateY]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible ? (
        <View pointerEvents="none" style={{ position: "absolute", top: 62, left: 16, right: 16, zIndex: 9999 }}>
          <Animated.View
            style={{
              opacity,
              transform: [{ translateY }],
              backgroundColor: bgByType[type],
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>{message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

