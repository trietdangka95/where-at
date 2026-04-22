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
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 16,
      }}
    >
      <Text style={{ color: colors.text, fontWeight: "700" }}>{title}</Text>
      <Text style={{ marginTop: 4, color: colors.textMuted }}>{description}</Text>
    </View>
  );
};
