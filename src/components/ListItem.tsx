import type { PropsWithChildren, ReactNode } from "react";
import { Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  right?: ReactNode;
}>;

export const ListItem = ({ title, subtitle, right }: Props) => {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>{title}</Text>
        {subtitle ? <Text style={{ marginTop: 2, color: colors.textMuted }}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
};
