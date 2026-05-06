import { Text, View } from "react-native";
import type { PropsWithChildren } from "react";

import { colors } from "../theme/colors";
import { PressableScale } from "./PressableScale";

type Variant = "primary" | "secondary" | "danger";

type Props = PropsWithChildren<{
  title: string;
  onPress?: () => void;
  variant?: Variant;
}>;

export const AppButton = ({ title, onPress, variant = "primary" }: Props) => {
  const styleByVariant: Record<Variant, { bg: string; border?: string; text: string; shadow: string }> = {
    primary: { bg: colors.primary, text: colors.onPrimary, shadow: colors.primaryDark },
    secondary: { bg: colors.surfaceSoft, border: colors.border, text: colors.primaryDark, shadow: colors.primaryDark },
    danger: { bg: "#f7dfdf", border: "#eab7be", text: colors.danger, shadow: colors.danger },
  };
  const variantStyle = styleByVariant[variant];
  return (
    <PressableScale onPress={onPress}>
      <View
        style={{
          backgroundColor: variantStyle.bg,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderWidth: variantStyle.border ? 1 : 0,
          borderColor: variantStyle.border,
          shadowColor: variantStyle.shadow,
          shadowOpacity: variant === "primary" ? 0.22 : 0.07,
          shadowRadius: variant === "primary" ? 10 : 6,
          shadowOffset: { width: 0, height: 5 },
          elevation: variant === "primary" ? 5 : 1,
        }}
      >
        <Text style={{ color: variantStyle.text, fontWeight: "800", textAlign: "center", letterSpacing: 0.2 }}>{title}</Text>
      </View>
    </PressableScale>
  );
};
