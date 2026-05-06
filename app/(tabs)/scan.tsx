import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import { FadeSlideIn } from "../../src/components/FadeSlideIn";
import { useI18n } from "../../src/i18n/LanguageProvider";
import { colors } from "../../src/theme/colors";

export default function ScanScreen() {
  const { t } = useI18n();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
      >
        <FadeSlideIn delay={20}>
          <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text }}>
            {t("scanBarcode")}
          </Text>
          <Text style={{ marginTop: 8, color: colors.textMuted }}>
            QR flow is TODO. We will define this flow later.
          </Text>
        </FadeSlideIn>
        <FadeSlideIn delay={70}>
          <View
            style={{
              marginTop: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              padding: 14,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "700" }}>
              Use `+` button for now: capture photo, enter item info, and save.
            </Text>
          </View>
        </FadeSlideIn>
      </ScrollView>
    </SafeAreaView>
  );
}
