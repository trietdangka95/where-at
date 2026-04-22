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

const styleByVariant: Record<Variant, { bg: string; border?: string; text: string }> = {
  primary: { bg: colors.primary, text: "#fff" },
  secondary: { bg: colors.surfaceSoft, border: colors.border, text: colors.text },
  danger: { bg: "#fdecef", border: "#f8c9d1", text: colors.danger },
};

export const AppButton = ({ title, onPress, variant = "primary" }: Props) => {
  const variantStyle = styleByVariant[variant];
  return (
    <PressableScale onPress={onPress}>
      <View
        style={{
          backgroundColor: variantStyle.bg,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: variantStyle.border ? 1 : 0,
          borderColor: variantStyle.border,
        }}
      >
        <Text style={{ color: variantStyle.text, fontWeight: "700" }}>{title}</Text>
      </View>
    </PressableScale>
  );
};
