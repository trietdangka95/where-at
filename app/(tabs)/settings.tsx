import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { useDispatch } from "react-redux";

import { AppButton } from "../../src/components/AppButton";
import { FadeSlideIn } from "../../src/components/FadeSlideIn";
import { PressableScale } from "../../src/components/PressableScale";
import { useToast } from "../../src/components/ToastProvider";
import { useReducedMotion } from "../../src/hooks/useReducedMotion";
import { useI18n } from "../../src/i18n/LanguageProvider";
import { resetInventory } from "../../src/slices/inventorySlice";
import type { AppDispatch } from "../../src/store/store";
import { colorPalettes, colors, type ThemeScheme } from "../../src/theme/colors";
import { useThemePreference } from "../../src/theme/ThemeProvider";

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { language, setLanguage, t } = useI18n();
  const { themeScheme, setThemeScheme } = useThemePreference();
  const reducedMotionEnabled = useReducedMotion();

  const themeOptions: Array<{ scheme: ThemeScheme; label: string; preview: string[] }> = [
    { scheme: "green", label: t("themeGreenDefault"), preview: ["#79c412", "#d4e9b8", "#334c1f"] },
    { scheme: "oceanGold", label: t("themeOceanGold"), preview: ["#394d6a", "#2c3c55", "#f2b006"] },
    { scheme: "violet", label: t("themeViolet"), preview: ["#504d9c", "#160c3d", "#aa5dc6"] },
    { scheme: "pinkLotus", label: t("themePinkLotus"), preview: ["#e04a91", "#9c1f5d", "#ff72b3"] },
  ];

  const onResetData = () => {
    Alert.alert(t("resetConfirmTitle"), t("resetConfirmDesc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("resetLocalData"),
        style: "destructive",
        onPress: () => {
          dispatch(resetInventory());
          showToast(t("resetDone"), "success");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
        <FadeSlideIn delay={20}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>
            {t("settings")}
          </Text>
        </FadeSlideIn>

        <FadeSlideIn delay={70}>
          <View
            style={{
              marginTop: 14,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              gap: 8,
              shadowColor: "#253b1b",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              {t("appInfo")}
            </Text>
            <Text style={{ color: colors.textMuted }}>{t("appName")}</Text>
            <Text style={{ color: colors.textMuted }}>
              {t("version")}: {Constants.expoConfig?.version ?? "dev"}
            </Text>
            <Text style={{ color: colors.textMuted }}>{t("storage")}</Text>
            <Text style={{ color: colors.textMuted }}>
              {t("reduceMotion")}:{" "}
              {reducedMotionEnabled ? t("onReduced") : t("offReduced")}
            </Text>
            <Text
              style={{ marginTop: 2, color: colors.text, fontWeight: "800" }}
            >
              {t("language")}
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <AppButton
                title={t("english")}
                variant={language === "en" ? "primary" : "secondary"}
                onPress={() => setLanguage("en")}
              />
              <AppButton
                title={t("vietnamese")}
                variant={language === "vi" ? "primary" : "secondary"}
                onPress={() => setLanguage("vi")}
              />
            </View>
            <Text style={{ marginTop: 2, color: colors.text, fontWeight: "800" }}>
              {t("themeColor")}
            </Text>
            <View style={{ gap: 8 }}>
              {themeOptions.map((option) => {
                const palette = colorPalettes[option.scheme];
                const selected = themeScheme === option.scheme;
                return (
                  <PressableScale key={option.scheme} onPress={() => void setThemeScheme(option.scheme)}>
                    <View
                      style={{
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? palette.primary : colors.border,
                        backgroundColor: colors.surfaceSoft,
                        borderRadius: 12,
                        padding: 10,
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: colors.text, fontWeight: "700" }}>
                        {selected ? "✓ " : ""}
                        {option.label}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {option.preview.map((swatch) => (
                          <View
                            key={swatch}
                            style={{ flex: 1, height: 14, borderRadius: 999, backgroundColor: swatch }}
                          />
                        ))}
                      </View>
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={110}>
          <View
            style={{
              marginTop: 12,
              backgroundColor: colors.surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              gap: 10,
              shadowColor: "#253b1b",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              {t("data")}
            </Text>
            <Text style={{ color: colors.textMuted }}>
              {t("exportImportLater")}
            </Text>
            <AppButton
              title={t("resetLocalData")}
              variant="danger"
              onPress={onResetData}
            />
          </View>
        </FadeSlideIn>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
