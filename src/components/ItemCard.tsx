import { Animated, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { Package } from "lucide-react-native";

import { colors } from "../theme/colors";
import { motion } from "../theme/motion";

type Props = {
  title: string;
  subtitle: string;
};

export const ItemCard = ({ title, subtitle }: Props) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "#e8f1ff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Package color={colors.primary} size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{title}</Text>
          <Text style={{ marginTop: 2, color: colors.textMuted }}>{subtitle}</Text>
        </View>
      </View>
    </Animated.View>
  );
};
