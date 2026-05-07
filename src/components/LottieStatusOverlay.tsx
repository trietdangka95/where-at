import { Modal, Text, View } from "react-native";
import LottieView from "lottie-react-native";

import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  mode: "loading" | "success";
  loadingText?: string;
  successText?: string;
};

const LOADING_ANIMATION = require("../../assets/lottie/loading.json");
const SUCCESS_ANIMATION = require("../../assets/lottie/success.json");

export const LottieStatusOverlay = ({ visible, mode, loadingText = "Saving...", successText = "Saved!" }: Props) => {
  const text = mode === "loading" ? loadingText : successText;
  const source = mode === "loading" ? LOADING_ANIMATION : SUCCESS_ANIMATION;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(8, 16, 30, 0.35)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 26,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 260,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 18,
            alignItems: "center",
            gap: 8,
          }}
        >
          <LottieView
            source={source}
            autoPlay
            loop={mode === "loading"}
            style={{ width: 120, height: 120 }}
            renderMode="AUTOMATIC"
          />
          <Text style={{ color: colors.text, fontWeight: "700" }}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

