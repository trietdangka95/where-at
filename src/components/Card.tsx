import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { colors } from "../theme/colors";

export const Card = ({ children }: PropsWithChildren) => {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
      }}
    >
      {children}
    </View>
  );
};
