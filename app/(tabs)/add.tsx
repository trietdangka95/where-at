import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { Camera, ImagePlus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { FadeSlideIn } from "../../src/components/FadeSlideIn";
import { LottieStatusOverlay } from "../../src/components/LottieStatusOverlay";
import { PressableScale } from "../../src/components/PressableScale";
import { useToast } from "../../src/components/ToastProvider";
import { useInventory } from "../../src/hooks/useInventory";
import { useI18n } from "../../src/i18n/LanguageProvider";
import { colors } from "../../src/theme/colors";
import { createId } from "../../src/utils/common";

export default function AddTabScreen() {
  const router = useRouter();
  const { resetAt } = useLocalSearchParams<{ resetAt?: string }>();
  const { showToast } = useToast();
  const { t } = useI18n();
  const { containers, createItem } = useInventory();

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(containers[0]?.id ?? null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const selectedStillExists = containers.some((container) => container.id === selectedContainerId);
    if ((!selectedContainerId || !selectedStillExists) && containers[0]?.id) {
      setSelectedContainerId(containers[0].id);
    }
  }, [containers, selectedContainerId]);

  const selectedContainer = useMemo(
    () => containers.find((container) => container.id === selectedContainerId),
    [containers, selectedContainerId]
  );

  const resetForm = () => {
    setItemName("");
    setCategory("");
    setExpiryDate("");
    setCapturedImageUri(undefined);
    setSelectedContainerId(containers[0]?.id ?? null);
  };

  useEffect(() => {
    if (!resetAt) return;
    resetForm();
  }, [resetAt]);

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("cameraPermissionDenied"), t("cameraPermissionDesc"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ["images"],
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setCapturedImageUri(result.assets[0].uri);
    showToast(t("imageUpdated"), "success");
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("permissionNeeded"), t("permissionPhotoDesc"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ["images"],
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    setCapturedImageUri(result.assets[0].uri);
    showToast(t("imageUpdated"), "success");
  };

  const openImagePickerOptions = () => {
    Alert.alert(t("choosePhoto"), "Choose image source", [
      { text: "Camera", onPress: () => void pickFromCamera() },
      { text: "Album", onPress: () => void pickFromLibrary() },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const saveItem = async () => {
    if (isSaving) return;
    if (!selectedContainerId) {
      Alert.alert(t("noContainer"), t("noContainerDesc"));
      return;
    }
    if (!itemName.trim()) {
      Alert.alert(t("missingName"), t("enterItemName"));
      return;
    }

    setIsSaving(true);
    try {
      const itemId = createId();
      let localImageUri: string | undefined;
      if (capturedImageUri) {
        try {
          const { saveImageForItem } = await import("../../src/services/imageService");
          localImageUri = await saveImageForItem(itemId, capturedImageUri);
        } catch {
          Alert.alert(t("imageUnavailable"), t("imageUnavailableDesc"));
        }
      }

      createItem(selectedContainerId, itemName, category, 1, "item", expiryDate.trim() || undefined, localImageUri, itemId);
      setIsSaving(false);
      setShowSuccess(true);
      showToast(localImageUri ? t("itemCreatedWithImage") : t("itemCreatedSuccess"), "success");
      await new Promise((resolve) => setTimeout(resolve, 700));
      setShowSuccess(false);
      resetForm();
      router.replace("/(tabs)");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <LottieStatusOverlay visible={isSaving} mode="loading" />
      <LottieStatusOverlay visible={showSuccess} mode="success" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <FadeSlideIn delay={20}>
          <Text style={{ fontSize: 23, fontWeight: "800", color: colors.text }}>{t("addNewItem")}</Text>
        </FadeSlideIn>

        <View
          style={{
            marginTop: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            minHeight: 160,
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          }}
        >
          {capturedImageUri ? (
            <Image source={{ uri: capturedImageUri }} style={{ width: "100%", height: 150, borderRadius: 12 }} resizeMode="cover" />
          ) : (
            <View style={{ alignItems: "center" }}>
              <ImagePlus size={36} color={colors.primary} />
              <Text style={{ marginTop: 8, color: colors.textMuted }}>{t("noPhotoYet")}</Text>
            </View>
          )}
          <View style={{ marginTop: 12, width: "100%" }}>
            <AppButton title={t("choosePhoto")} variant="secondary" onPress={openImagePickerOptions} />
          </View>
        </View>

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "700" }}>{t("containers")} *</Text>
        <View style={{ marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {containers.map((container) => (
            <PressableScale key={container.id} onPress={() => setSelectedContainerId(container.id)}>
              <View
                style={{
                  backgroundColor: selectedContainerId === container.id ? colors.surfaceStrong : colors.surfaceSoft,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: selectedContainerId === container.id ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedContainerId === container.id ? colors.primaryDark : colors.textMuted,
                    fontWeight: "700",
                  }}
                >
                  {container.name}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>

        <Text style={{ marginTop: 14, color: colors.text, fontWeight: "700" }}>{t("itemNameRequired")}</Text>
        <TextInput
          value={itemName}
          onChangeText={setItemName}
          placeholder={t("itemName")}
          placeholderTextColor={colors.textMuted}
          style={{
            marginTop: 6,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors.text,
          }}
        />

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "700" }}>{t("details")}</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder={t("categoryOptional")}
          placeholderTextColor={colors.textMuted}
          style={{
            marginTop: 6,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors.text,
          }}
        />
        <Text style={{ marginTop: 10, color: colors.text, fontWeight: "700" }}>{t("expiryLabel")} ({t("details").toLowerCase()} optional)</Text>
        <TextInput
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          style={{
            marginTop: 6,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors.text,
          }}
        />
        <View style={{ marginTop: 14 }}>
          <AppButton title={t("createItem")} onPress={() => void saveItem()} />
        </View>
          <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Camera size={16} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted }}>
              {selectedContainer ? `${t("willSaveTo")}: ${selectedContainer.name}` : t("selectContainerBeforeSaving")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
