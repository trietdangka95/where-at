import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Linking, ScrollView, Text, TextInput, View } from "react-native";
import { Barcode, Camera as CameraIcon, ImagePlus } from "lucide-react-native";
import { CameraView, Camera, type BarcodeScanningResult } from "expo-camera";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { PressableScale } from "../../src/components/PressableScale";
import { useInventory } from "../../src/hooks/useInventory";
import { lookupBarcodeProduct } from "../../src/services/openFoodFacts";
import { colors } from "../../src/theme/colors";
import { createId } from "../../src/utils/common";
import { DEFAULT_UNITS } from "../../src/utils/constants";

export default function ScanScreen() {
  const router = useRouter();
  const { containers, createItem } = useInventory();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  const [barcode, setBarcode] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("General");
  const [qtyText, setQtyText] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(containers[0]?.id ?? null);
  const [apiImageUrl, setApiImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedContainerId && containers[0]?.id) {
      setSelectedContainerId(containers[0].id);
    }
  }, [containers, selectedContainerId]);

  const selectedContainer = useMemo(
    () => containers.find((container) => container.id === selectedContainerId),
    [containers, selectedContainerId]
  );

  const askPermissionAndScan = async () => {
    const result = await Camera.requestCameraPermissionsAsync();
    const granted = result.status === "granted";
    setHasPermission(granted);
    if (!granted) {
      Alert.alert("Camera permission denied", "Please allow camera access to scan barcode.", [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    setIsScanning(true);
  };

  const applyLookup = async (code: string) => {
    setIsLookupLoading(true);
    const data = await lookupBarcodeProduct(code);
    setIsLookupLoading(false);

    if (!data) {
      Alert.alert("Lookup unavailable", "Could not fetch product info. You can still add item manually.");
      return;
    }

    if (data.name) setItemName(data.name);
    if (data.brand && category === "General") setCategory(data.brand);
    setApiImageUrl(data.imageUrl);

    Alert.alert("Pre-filled", "Product data loaded. Please review before saving.");
  };

  const onBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    setIsScanning(false);
    setBarcode(data);
    void applyLookup(data);
  };

  const saveItem = async () => {
    if (!selectedContainerId) {
      Alert.alert("No container", "Please create or choose a container in Inventory first.", [
        { text: "Cancel", style: "cancel" },
        { text: "Go Inventory", onPress: () => router.push("/(tabs)/inventory") },
      ]);
      return;
    }
    if (!itemName.trim()) {
      Alert.alert("Missing name", "Please enter item name.");
      return;
    }

    const itemId = createId();
    let localImageUri: string | undefined;
    if (apiImageUrl) {
      try {
        const { saveRemoteImageForItem } = await import("../../src/services/imageService");
        localImageUri = await saveRemoteImageForItem(itemId, apiImageUrl);
      } catch {
        Alert.alert(
          "Image unavailable",
          "Could not save product image locally. Item will still be created without image."
        );
      }
    }

    createItem(selectedContainerId, itemName, category, Number(qtyText) || 0, unit, localImageUri, itemId);
    Alert.alert(
      "Item added",
      localImageUri
        ? "Item created and product image saved locally."
        : "Item created successfully."
    );
    setBarcode("");
    setItemName("");
    setCategory("General");
    setQtyText("1");
    setUnit("pcs");
    setApiImageUrl(undefined);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 23, fontWeight: "800", color: colors.text }}>Add New Item</Text>
          <Text style={{ color: "#8ac6d7", fontWeight: "700" }}>
            {isLookupLoading ? "Searching..." : barcode ? "Scanned" : "Manual"}
          </Text>
        </View>

        {isScanning ? (
          <View
            style={{
              marginTop: 18,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
              minHeight: 220,
              backgroundColor: "#000",
            }}
          >
            <CameraView
              onBarcodeScanned={onBarcodeScanned}
              style={{ width: "100%", height: 220 }}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
              }}
            />
          </View>
        ) : (
          <View
            style={{
              marginTop: 18,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              minHeight: 160,
              alignItems: "center",
              justifyContent: "center",
              borderStyle: "dashed",
              paddingHorizontal: 16,
            }}
          >
            <ImagePlus size={36} color="#149ecf" />
            <Text style={{ marginTop: 8, color: colors.textMuted, textAlign: "center" }}>
              Scan barcode to pre-fill item info or type manually.
            </Text>
            <View style={{ marginTop: 12, width: "100%" }}>
              <AppButton title="Scan Barcode" variant="secondary" onPress={askPermissionAndScan} />
            </View>
          </View>
        )}

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "700" }}>Container *</Text>
        <View style={{ marginTop: 6, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {containers.map((container) => (
            <PressableScale key={container.id} onPress={() => setSelectedContainerId(container.id)}>
              <View
                style={{
                  backgroundColor: selectedContainerId === container.id ? "#e1edff" : colors.surfaceSoft,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: selectedContainerId === container.id ? "#adc9f9" : colors.border,
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
          {containers.length === 0 ? (
            <Text style={{ color: colors.textMuted }}>No containers yet. Add one in Inventory tab.</Text>
          ) : null}
        </View>

        <Text style={{ marginTop: 14, color: colors.text, fontWeight: "700" }}>Item Name *</Text>
        <TextInput
          value={itemName}
          onChangeText={setItemName}
          placeholder="e.g., Corn Flakes"
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
        <Text style={{ marginTop: 8, color: colors.textMuted }}>
          Barcode: {barcode || "Not scanned"} {hasPermission === false ? "(permission denied)" : ""}
        </Text>
        <View style={{ marginTop: 10 }}>
          <AppButton title="Scan Barcode & Auto-Fill" variant="secondary" onPress={askPermissionAndScan} />
        </View>

        <Text style={{ marginTop: 12, color: colors.text, fontWeight: "700" }}>Details</Text>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Category (optional)"
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
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TextInput
            value={qtyText}
            onChangeText={setQtyText}
            placeholder="Quantity *"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
            }}
          />
          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="Unit"
            placeholderTextColor={colors.textMuted}
            style={{
              width: 110,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              backgroundColor: colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
            }}
          />
        </View>
        <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {DEFAULT_UNITS.map((unitOption) => (
            <PressableScale key={unitOption} onPress={() => setUnit(unitOption)}>
              <View
                style={{
                  backgroundColor: unit === unitOption ? "#e1edff" : colors.surfaceSoft,
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: unit === unitOption ? "#adc9f9" : colors.border,
                }}
              >
                <Text
                  style={{
                    color: unit === unitOption ? colors.primaryDark : colors.textMuted,
                    fontWeight: "700",
                    textTransform: "lowercase",
                  }}
                >
                  {unitOption}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>

        {apiImageUrl ? (
          <Text style={{ marginTop: 10, color: colors.textMuted }}>
            OpenFoodFacts image found and previewable online.
          </Text>
        ) : null}

        <View style={{ marginTop: 14 }}>
          <AppButton title="Create Item" onPress={() => void saveItem()} />
        </View>
        <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Barcode size={16} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted }}>
            {selectedContainer ? `Will save to: ${selectedContainer.name}` : "Select a container before saving."}
          </Text>
        </View>
        <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <CameraIcon size={16} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted }}>If lookup fails, manual create still works.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
