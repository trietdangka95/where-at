import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronRight, House, Building2, Warehouse } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { BottomSheetPanel } from "../../src/components/BottomSheetPanel";
import { EmptyState } from "../../src/components/EmptyState";
import { FadeSlideIn } from "../../src/components/FadeSlideIn";
import { PressableScale } from "../../src/components/PressableScale";
import { SearchBar } from "../../src/components/SearchBar";
import { useToast } from "../../src/components/ToastProvider";
import { useInventory } from "../../src/hooks/useInventory";
import { useI18n } from "../../src/i18n/LanguageProvider";
import { selectAllContainers, selectContainersByLocation, selectItemsByContainer } from "../../src/slices/inventorySlice";
import { colors } from "../../src/theme/colors";

const EMPTY_LIST: never[] = [];

export default function InventoryScreen() {
  const { showToast } = useToast();
  const { t } = useI18n();
  const {
    locations,
    createLocation,
    createContainer,
    createItem,
    editLocation,
    editContainer,
    editItem,
    chooseItem,
    removeLocation,
    removeContainer,
    removeItem,
  } = useInventory();
  const router = useRouter();

  const [locationName, setLocationName] = useState("");
  const [containerName, setContainerName] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const containers = useSelector(
    useMemo(
      () => (selectedLocationId ? selectContainersByLocation(selectedLocationId) : () => EMPTY_LIST),
      [selectedLocationId]
    )
  );
  const allContainers = useSelector(selectAllContainers);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const items = useSelector(
    useMemo(
      () => (selectedContainerId ? selectItemsByContainer(selectedContainerId) : () => EMPTY_LIST),
      [selectedContainerId]
    )
  );

  const addLocation = () => {
    if (!locationName.trim()) {
      Alert.alert(t("missingName"), t("enterLocationName"));
      return;
    }
    createLocation(locationName);
    setLocationName("");
    showToast(t("locationAdded"), "success");
  };

  const addContainer = () => {
    if (!selectedLocationId) {
      Alert.alert(t("chooseLocation"), t("selectLocationFirst"));
      return;
    }
    if (!containerName.trim()) {
      Alert.alert(t("missingName"), t("enterContainerName"));
      return;
    }
    createContainer(selectedLocationId, containerName, null);
    setContainerName("");
    showToast(t("containerAdded"), "success");
  };

  const addItem = () => {
    if (!selectedContainerId) {
      Alert.alert(t("chooseContainer"), t("selectContainerFirst"));
      return;
    }
    if (!itemName.trim()) {
      Alert.alert(t("missingName"), t("enterItemName"));
      return;
    }
    createItem(selectedContainerId, itemName, category, 1, "item");
    setItemName("");
    showToast(t("itemAdded"), "success");
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredContainers = containers.filter((container) =>
    container.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredItems = items.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())
  );
  const containerCountByLocation = useMemo(() => {
    const countMap: Record<string, number> = {};
    allContainers.forEach((container) => {
      countMap[container.locationId] = (countMap[container.locationId] ?? 0) + 1;
    });
    return countMap;
  }, [allContainers]);

  const closeItemEditSheet = () => {
    setEditingItemId(null);
    setItemName("");
    setCategory("");
  };

  const saveItemEdit = () => {
    if (!editingItemId) return;
    if (!itemName.trim()) {
      Alert.alert(t("missingName"), t("enterItemName"));
      return;
    }
    editItem(editingItemId, itemName, category, 1, "item");
    closeItemEditSheet();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <FadeSlideIn delay={20}>
          <Text style={{ fontSize: 27, fontWeight: "900", color: colors.text }}>{t("myInventory")}</Text>
          <Text style={{ marginTop: 4, marginBottom: 16, color: colors.textMuted }}>{t("localHierarchy")}</Text>
        </FadeSlideIn>
        <FadeSlideIn delay={60}>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t("searchInventoryPlaceholder")} />
        </FadeSlideIn>

        <FadeSlideIn delay={90}>
          <View style={{ gap: 10, marginBottom: 16, marginTop: 12 }}>
          <TextInput
            value={locationName}
            onChangeText={setLocationName}
            placeholder={t("newLocationName")}
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
            }}
          />
          <AppButton title={t("addLocation")} onPress={addLocation} />
          </View>
        </FadeSlideIn>

        {filteredLocations.length === 0 ? (
          <EmptyState title={t("noLocationFound")} description={t("noLocationFoundDesc")} />
        ) : null}

        {filteredLocations.map((location, index) => (
          <FadeSlideIn key={location.id} delay={130 + index * 30}>
            <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 10,
              shadowColor: "#263d1d",
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <PressableScale onPress={() => setSelectedLocationId(location.id)}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: colors.surfaceStrong,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {location.name.toLowerCase().includes("office") ? (
                      <Building2 size={18} color={colors.primary} />
                    ) : location.name.toLowerCase().includes("garage") ? (
                      <Warehouse size={18} color={colors.primary} />
                    ) : (
                      <House size={18} color={colors.primary} />
                    )}
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
                      {selectedLocationId === location.id ? "✓ " : ""}
                      {location.name}
                    </Text>
                    <Text style={{ color: colors.textMuted, marginTop: 1 }}>
                      {(() => {
                        const count = containerCountByLocation[location.id] ?? 0;
                        return `${count} ${count === 1 ? t("containerSingle") : t("containerPlural")}`;
                      })()}
                    </Text>
                  </View>
                </View>
              </PressableScale>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <ChevronRight color={colors.textMuted} size={16} />
                <PressableScale
                  onPress={() => {
                    setEditingLocationId(location.id);
                    setLocationName(location.name);
                  }}
                >
                  <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>{t("edit")}</Text>
                </PressableScale>
                <PressableScale
                  onPress={() =>
                    Alert.alert(t("deleteLocation"), t("deleteLocationChildren"), [
                      { text: t("cancel"), style: "cancel" },
                      { text: t("delete"), style: "destructive", onPress: () => removeLocation(location.id) },
                    ])
                  }
                >
                  <Text style={{ color: colors.danger, fontWeight: "700" }}>{t("delete")}</Text>
                </PressableScale>
              </View>
            </View>
            </View>
          </FadeSlideIn>
        ))}
        {editingLocationId ? (
          <View style={{ marginBottom: 16 }}>
            <AppButton
              title={t("saveLocationEdit")}
              onPress={() => {
                const target = locations.find((location) => location.id === editingLocationId);
                if (!target) return;
                editLocation(target.id, locationName);
                setEditingLocationId(null);
                setLocationName("");
              }}
            />
          </View>
        ) : null}

        {selectedLocationId ? (
          <View style={{ marginTop: 8 }}>
            <Text style={{ marginBottom: 8, fontSize: 16, color: colors.text, fontWeight: "700" }}>{t("containers")}</Text>
            <View style={{ gap: 10, marginBottom: 10 }}>
              <TextInput
                value={containerName}
                onChangeText={setContainerName}
                placeholder={t("newContainerName")}
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.text,
                }}
              />
              <AppButton title={t("addContainer")} onPress={addContainer} variant="secondary" />
            </View>

            {filteredContainers.length === 0 ? (
              <EmptyState title={t("noContainerFound")} description={t("noContainerFoundDesc")} />
            ) : null}

            {filteredContainers.map((container, index) => (
              <FadeSlideIn key={container.id} delay={100 + index * 25}>
                <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 8,
                  shadowColor: "#263d1d",
                  shadowOpacity: 0.08,
                  shadowRadius: 7,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <PressableScale onPress={() => setSelectedContainerId(container.id)}>
                    <Text style={{ color: colors.text, fontWeight: "700" }}>
                      {selectedContainerId === container.id ? "✓ " : ""}
                      {container.name}
                    </Text>
                  </PressableScale>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <PressableScale
                      onPress={() => {
                        setEditingContainerId(container.id);
                        setContainerName(container.name);
                      }}
                    >
                      <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>{t("edit")}</Text>
                    </PressableScale>
                    <PressableScale onPress={() => removeContainer(container.id)}>
                      <Text style={{ color: colors.danger, fontWeight: "700" }}>{t("delete")}</Text>
                    </PressableScale>
                  </View>
                </View>
                </View>
              </FadeSlideIn>
            ))}
            {editingContainerId ? (
              <AppButton
                title={t("saveContainerEdit")}
                onPress={() => {
                  const target = containers.find((container) => container.id === editingContainerId);
                  if (!target) return;
                  editContainer(target.id, containerName, target.parentId);
                  setEditingContainerId(null);
                  setContainerName("");
                }}
                variant="secondary"
              />
            ) : null}
          </View>
        ) : null}

        {selectedContainerId ? (
          <View style={{ marginTop: 10 }}>
            <Text style={{ marginBottom: 8, fontSize: 16, color: colors.text, fontWeight: "700" }}>{t("items")}</Text>

            <View style={{ gap: 10, marginBottom: 10 }}>
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder={t("itemName")}
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.text,
                }}
              />
              <TextInput
                value={category}
                onChangeText={setCategory}
                placeholder={t("details")}
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.text,
                }}
              />
              <AppButton title={t("addItem")} onPress={addItem} />
            </View>

            {filteredItems.length === 0 ? (
              <EmptyState title={t("noItemFound")} description={t("noItemFoundDesc")} />
            ) : null}

            {filteredItems.map((item, index) => (
              <FadeSlideIn key={item.id} delay={110 + index * 22}>
                <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  shadowColor: "#263d1d",
                  shadowOpacity: 0.08,
                  shadowRadius: 7,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 1,
                }}
              >
                <View>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{item.name}</Text>
                  <Text style={{ color: colors.textMuted }}>{item.category || t("noNotes")}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <PressableScale
                    onPress={() => {
                      chooseItem(item.id);
                      router.push("/item-detail");
                    }}
                  >
                    <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>{t("view")}</Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => {
                      setEditingItemId(item.id);
                      setItemName(item.name);
                      setCategory(item.category);
                    }}
                  >
                    <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>{t("edit")}</Text>
                  </PressableScale>
                  <PressableScale onPress={() => removeItem(item.id)}>
                    <Text style={{ color: colors.danger, fontWeight: "700" }}>{t("delete")}</Text>
                  </PressableScale>
                </View>
                </View>
              </FadeSlideIn>
            ))}
          </View>
        ) : null}
      </ScrollView>
      </KeyboardAvoidingView>
      <BottomSheetPanel
        visible={Boolean(editingItemId)}
        title={t("editItemTitle")}
        onClose={closeItemEditSheet}
        footer={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <AppButton title={t("cancel")} variant="secondary" onPress={closeItemEditSheet} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton title={t("save")} onPress={saveItemEdit} />
            </View>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <TextInput
            value={itemName}
            onChangeText={setItemName}
            placeholder={t("itemName")}
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
            }}
          />
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder={t("category")}
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: colors.text,
            }}
          />
        </View>
      </BottomSheetPanel>
    </SafeAreaView>
  );
}
