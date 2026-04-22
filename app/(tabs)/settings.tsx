import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { useDispatch } from "react-redux";

import { AppButton } from "../../src/components/AppButton";
import { useReducedMotion } from "../../src/hooks/useReducedMotion";
import { resetInventory } from "../../src/slices/inventorySlice";
import type { AppDispatch } from "../../src/store/store";
import { colors } from "../../src/theme/colors";

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const reducedMotionEnabled = useReducedMotion();

  const onResetData = () => {
    Alert.alert("Reset all local data?", "This removes all locations, containers, and items on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          dispatch(resetInventory());
          Alert.alert("Reset complete", "All local inventory data has been cleared.");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text }}>Settings</Text>
        <Text style={{ marginTop: 4, color: colors.textMuted }}>Local-only app configuration</Text>

        <View
          style={{
            marginTop: 14,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 8,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "800" }}>App Info</Text>
          <Text style={{ color: colors.textMuted }}>Name: WhereAt?</Text>
          <Text style={{ color: colors.textMuted }}>Version: {Constants.expoConfig?.version ?? "dev"}</Text>
          <Text style={{ color: colors.textMuted }}>Storage: On-device only (no cloud sync)</Text>
          <Text style={{ color: colors.textMuted }}>
            Reduce Motion: {reducedMotionEnabled ? "On (animations reduced)" : "Off"}
          </Text>
        </View>

        <View
          style={{
            marginTop: 12,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "800" }}>Data</Text>
          <Text style={{ color: colors.textMuted }}>
            Export/import will be added later. For now, you can clear all local inventory data.
          </Text>
          <AppButton title="Reset Local Data" variant="danger" onPress={onResetData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
