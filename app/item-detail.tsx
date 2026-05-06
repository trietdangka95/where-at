import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeft, Pencil } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "../src/components/AppButton";
import { EmptyState } from "../src/components/EmptyState";
import { FadeSlideIn } from "../src/components/FadeSlideIn";
import { useToast } from "../src/components/ToastProvider";
import { useInventory } from "../src/hooks/useInventory";
import { useI18n } from "../src/i18n/LanguageProvider";
import { colors } from "../src/theme/colors";

export default function ItemDetailScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useI18n();
  const { selectedItem, containers, locations, editItem, removeItem } = useInventory();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);

  useEffect(() => {
    if (!selectedItem) return;
    setName(selectedItem.name);
    setCategory(selectedItem.category);
    setExpiryDate(selectedItem.expiryDate ?? "");
    setNotes(selectedItem.notes ?? "");
    setImageUri(selectedItem.imageUri);
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ padding: 16 }}>
          <EmptyState title={t("noItemSelected")} description={t("noItemSelectedDesc")} />
        </View>
      </SafeAreaView>
    );
  }

  const container = containers.find((entry) => entry.id === selectedItem.containerId);

  const onSaveEdit = () => {
    if (!name.trim()) {
      Alert.alert(t("missingName"), t("enterItemName"));
      return;
    }
    editItem(selectedItem.id, name, category, 1, "item", notes, expiryDate.trim() || undefined, imageUri);
    setIsEditing(false);
    showToast(t("itemUpdated"), "success");
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t("permissionNeeded"), t("permissionPhotoDesc"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    try {
      const { saveImageForItem } = await import("../src/services/imageService");
      const localImageUri = await saveImageForItem(selectedItem.id, result.assets[0].uri);
      setImageUri(localImageUri);
      showToast(t("imageUpdated"), "success");
    } catch {
      Alert.alert(t("imageError"), t("imageErrorDesc"));
    }
  };

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
    try {
      const { saveImageForItem } = await import("../src/services/imageService");
      const localImageUri = await saveImageForItem(selectedItem.id, result.assets[0].uri);
      setImageUri(localImageUri);
      showToast(t("imageUpdated"), "success");
    } catch {
      Alert.alert(t("imageError"), t("imageErrorDesc"));
    }
  };

  const onPickImage = () => {
    Alert.alert(t("choosePhoto"), "Choose image source", [
      { text: "Camera", onPress: () => void pickFromCamera() },
      { text: "Album", onPress: () => void pickFromLibrary() },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const onDelete = () => {
    Alert.alert(t("deleteItemConfirm"), t("deleteItemDesc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteAction"),
        style: "destructive",
        onPress: () => {
          removeItem(selectedItem.id);
          router.replace("/(tabs)");
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingRight: 8 }}
            >
              <ChevronLeft color={colors.text} size={20} />
              <Text style={{ color: colors.text, fontWeight: "700" }}>
                {t("back")}
              </Text>
            </Pressable>
            <Pencil size={16} color={colors.accent} onPress={() => setIsEditing((value) => !value)} />
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={70} fromY={16}>
          <View
          style={{
            marginTop: 16,
            backgroundColor: colors.surface,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            shadowColor: "#253a1b",
            shadowOpacity: 0.11,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          {imageUri ? (
            <Pressable onPress={() => setIsImagePreviewVisible(true)}>
              <Image source={{ uri: imageUri }} style={{ height: 160, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />
            </Pressable>
          ) : (
            <View
              style={{
                height: 160,
                borderRadius: 12,
                marginBottom: 12,
                backgroundColor: colors.surfaceStrong,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 40 }}>📦</Text>
              <Text style={{ marginTop: 8, color: colors.primaryDark, fontWeight: "700" }}>{t("noPhotoYet")}</Text>
            </View>
          )}
          <Text style={{ color: colors.accent, fontWeight: "700" }}>
            {container?.name ?? t("uncategorized")}
          </Text>
          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={{
                marginTop: 6,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                backgroundColor: colors.surfaceSoft,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.text,
                fontWeight: "800",
                fontSize: 22,
              }}
            />
          ) : (
            <Text style={{ marginTop: 4, color: colors.text, fontWeight: "900", fontSize: 28 }}>{selectedItem.name}</Text>
          )}
          <View style={{ marginTop: 12, gap: 7 }}>
            {isEditing ? (
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder={t("details")}
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceSoft,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  color: colors.text,
                }}
              />
            ) : (
              <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>{t("details")}:</Text> {selectedItem.category || t("noNotes")}</Text>
            )}
            {isEditing ? (
              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  backgroundColor: colors.surfaceSoft,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  color: colors.text,
                }}
              />
            ) : null}
            <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>{t("barcode")}:</Text> {selectedItem.barcode ?? t("na")}</Text>
            <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>{t("expiryLabel")}</Text> {selectedItem.expiryDate ?? t("na")}</Text>
            <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>{t("containerLabel")}</Text> {container?.name ?? t("na")}</Text>
          </View>
          <Text style={{ marginTop: 12, fontWeight: "800", color: colors.text }}>{t("notes")}</Text>
          {isEditing ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes"
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                marginTop: 6,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                backgroundColor: colors.surfaceSoft,
                minHeight: 70,
                textAlignVertical: "top",
                paddingHorizontal: 10,
                paddingVertical: 8,
                color: colors.text,
              }}
            />
          ) : (
            <Text style={{ marginTop: 3, color: colors.textMuted }}>{selectedItem.notes || t("noNotes")}</Text>
          )}
          <View style={{ marginTop: 16, gap: 10 }}>
            {isEditing ? <AppButton title={t("choosePhoto")} variant="secondary" onPress={onPickImage} /> : null}
            <AppButton title={isEditing ? t("saveDetails") : t("editDetails")} onPress={isEditing ? onSaveEdit : () => setIsEditing(true)} />
            <AppButton title={t("deleteItem")} variant="danger" onPress={onDelete} />
          </View>
          </View>
        </FadeSlideIn>
      </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={isImagePreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImagePreviewVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            paddingHorizontal: 14,
          }}
        >
          <Pressable
            style={{ position: "absolute", top: 56, right: 18, zIndex: 2 }}
            onPress={() => setIsImagePreviewVisible(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{t("cancel")}</Text>
          </Pressable>
          <Pressable style={{ flex: 1, justifyContent: "center" }} onPress={() => setIsImagePreviewVisible(false)}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                resizeMode="contain"
                style={{ width: "100%", height: "78%" }}
              />
            ) : null}
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
