import type { PropsWithChildren, ReactNode } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useEffect, useRef } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { colors } from "../theme/colors";
import { motion } from "../theme/motion";

type Props = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}>;

export const BottomSheetPanel = ({ visible, title, onClose, footer, children }: Props) => (
  <BottomSheetPanelInner visible={visible} title={title} onClose={onClose} footer={footer}>
    {children}
  </BottomSheetPanelInner>
);

const BottomSheetPanelInner = ({ visible, title, onClose, footer, children }: Props) => {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(32)).current;
  const reducedMotionEnabled = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    if (reducedMotionEnabled) {
      backdropOpacity.setValue(1);
      sheetTranslateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: motion.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, reducedMotionEnabled, sheetTranslateY, visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{
          opacity: backdropOpacity,
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateY: sheetTranslateY }],
          marginTop: "auto",
          backgroundColor: colors.surface,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          gap: 12,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 4,
              borderRadius: 999,
              backgroundColor: "#d6deea",
              marginBottom: 8,
            }}
          />
          <Text style={{ color: colors.text, fontWeight: "800", fontSize: 16 }}>{title}</Text>
        </View>
        <View>{children}</View>
        {footer ? <View>{footer}</View> : null}
      </Animated.View>
    </Modal>
  );
};
