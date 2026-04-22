import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Image, ScrollView, Text, TextInput, View } from "react-native";
import { ChevronLeft, Pencil } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";

import { AppButton } from "../src/components/AppButton";
import { EmptyState } from "../src/components/EmptyState";
import { useInventory } from "../src/hooks/useInventory";
import { colors } from "../src/theme/colors";

export default function ItemDetailScreen() {
  const router = useRouter();
  const { selectedItem, containers, locations, editItem, removeItem } = useInventory();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [qtyText, setQtyText] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedItem) return;
    setName(selectedItem.name);
    setCategory(selectedItem.category);
    setQtyText(String(selectedItem.qty));
    setUnit(selectedItem.unit);
    setNotes(selectedItem.notes ?? "");
    setImageUri(selectedItem.imageUri);
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ padding: 16 }}>
          <EmptyState title="No item selected" description="Open Home tab and tap an item card to view details." />
        </View>
      </SafeAreaView>
    );
  }

  const container = containers.find((entry) => entry.id === selectedItem.containerId);
  const location = container ? locations.find((entry) => entry.id === container.locationId) : undefined;
  const breadcrumb = [location?.name, container?.name].filter(Boolean).join(" > ");
  const headerPath = breadcrumb ? `${breadcrumb} > ...` : "Unknown > ...";

  const onSaveEdit = () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter item name.");
      return;
    }
    editItem(selectedItem.id, name, category, Number(qtyText) || 0, unit, notes, imageUri);
    setIsEditing(false);
    Alert.alert("Saved", "Item details updated.");
  };

  const onPickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access to set item image.");
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
      Alert.alert("Image updated", "Item photo saved locally.");
    } catch {
      Alert.alert("Image error", "Could not save image. Please try again.");
    }
  };

  const onDelete = () => {
    Alert.alert("Delete item?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ChevronLeft color={colors.text} size={18} />
            <Text style={{ color: colors.text, fontWeight: "700" }} onPress={() => router.back()}>
              Back
            </Text>
            <Text style={{ color: colors.textMuted }}>{headerPath}</Text>
          </View>
          <Pencil size={16} color="#1aa9c8" onPress={() => setIsEditing((value) => !value)} />
        </View>

        <View
          style={{
            marginTop: 16,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
          }}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ height: 160, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />
          ) : (
            <View style={{ height: 160, borderRadius: 12, backgroundColor: "#dbe9f8", marginBottom: 12 }} />
          )}
          <Text style={{ color: "#1ca2c3", fontWeight: "700" }}>{breadcrumb || "Unknown path"}</Text>
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
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={qtyText}
                  onChangeText={setQtyText}
                  keyboardType="numeric"
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    width: 90,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    backgroundColor: colors.surfaceSoft,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    color: colors.text,
                  }}
                />
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Unit"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    width: 100,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    backgroundColor: colors.surfaceSoft,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    color: colors.text,
                  }}
                />
              </View>
            ) : (
              <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>Qty:</Text> {selectedItem.qty} {selectedItem.unit}</Text>
            )}
            {isEditing ? (
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder="Category"
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
              <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>Category:</Text> {selectedItem.category}</Text>
            )}
            <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>Barcode:</Text> {selectedItem.barcode ?? "N/A"}</Text>
            <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>Expiry:</Text> {selectedItem.expiryDate ?? "N/A"}</Text>
            <Text style={{ color: colors.text }}><Text style={{ fontWeight: "800" }}>Container:</Text> {container?.name ?? "N/A"}</Text>
          </View>
          <Text style={{ marginTop: 12, fontWeight: "800", color: colors.text }}>Notes:</Text>
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
            <Text style={{ marginTop: 3, color: colors.textMuted }}>{selectedItem.notes || "No notes added."}</Text>
          )}
          <View style={{ marginTop: 16, gap: 10 }}>
            {isEditing ? <AppButton title="Choose Photo" variant="secondary" onPress={onPickImage} /> : null}
            <AppButton title={isEditing ? "Save Details" : "Edit Details"} onPress={isEditing ? onSaveEdit : () => setIsEditing(true)} />
            <AppButton title="Delete Item" variant="danger" onPress={onDelete} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
