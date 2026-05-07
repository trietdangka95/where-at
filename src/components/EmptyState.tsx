import { Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  title: string;
  description: string;
};

export const EmptyState = ({ title, description }: Props) => {
  return (
    <View
      style={{
        borderRadius: 18,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 16,
        shadowColor: "#2b4120",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "700" }}>{title}</Text>
      <Text style={{ marginTop: 4, color: colors.textMuted }}>{description}</Text>
    </View>
  );
};
