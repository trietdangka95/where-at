import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ChevronRight, House, Building2, Warehouse } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppButton } from "../../src/components/AppButton";
import { BottomSheetPanel } from "../../src/components/BottomSheetPanel";
import { EmptyState } from "../../src/components/EmptyState";
import { PressableScale } from "../../src/components/PressableScale";
import { SearchBar } from "../../src/components/SearchBar";
import { useInventory } from "../../src/hooks/useInventory";
import { selectContainersByLocation, selectItemsByContainer } from "../../src/slices/inventorySlice";
import { colors } from "../../src/theme/colors";
import { DEFAULT_UNITS } from "../../src/utils/constants";

export default function InventoryScreen() {
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
  const [category, setCategory] = useState("General");
  const [qtyText, setQtyText] = useState("1");
  const [unit, setUnit] = useState("pcs");

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(locations[0]?.id ?? null);
  const containers = useSelector(
    useMemo(
      () => (selectedLocationId ? selectContainersByLocation(selectedLocationId) : () => []),
      [selectedLocationId]
    )
  );
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const items = useSelector(
    useMemo(
      () => (selectedContainerId ? selectItemsByContainer(selectedContainerId) : () => []),
      [selectedContainerId]
    )
  );

  const addLocation = () => {
    if (!locationName.trim()) {
      Alert.alert("Missing name", "Please enter a location name.");
      return;
    }
    createLocation(locationName);
    setLocationName("");
    Alert.alert("Saved", "Location added.");
  };

  const addContainer = () => {
    if (!selectedLocationId) {
      Alert.alert("Choose location", "Select a location before adding container.");
      return;
    }
    if (!containerName.trim()) {
      Alert.alert("Missing name", "Please enter a container name.");
      return;
    }
    createContainer(selectedLocationId, containerName, null);
    setContainerName("");
    Alert.alert("Saved", "Container added.");
  };

  const addItem = () => {
    if (!selectedContainerId) {
      Alert.alert("Choose container", "Select a container before adding item.");
      return;
    }
    if (!itemName.trim()) {
      Alert.alert("Missing name", "Please enter an item name.");
      return;
    }
    createItem(selectedContainerId, itemName, category, Number(qtyText) || 0, unit);
    setItemName("");
    setQtyText("1");
    Alert.alert("Saved", "Item added.");
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

  const closeItemEditSheet = () => {
    setEditingItemId(null);
    setItemName("");
    setCategory("General");
    setQtyText("1");
    setUnit("pcs");
  };

  const saveItemEdit = () => {
    if (!editingItemId) return;
    if (!itemName.trim()) {
      Alert.alert("Missing name", "Please enter an item name.");
      return;
    }
    editItem(editingItemId, itemName, category, Number(qtyText) || 0, unit);
    closeItemEditSheet();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 27, fontWeight: "900", color: colors.text }}>My Inventory</Text>
        <Text style={{ marginTop: 4, marginBottom: 16, color: colors.textMuted }}>Local-only hierarchy map</Text>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search locations, containers, items..." />

        <View style={{ gap: 10, marginBottom: 16 }}>
          <TextInput
            value={locationName}
            onChangeText={setLocationName}
            placeholder="New location name"
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
          <AppButton title="+ Add Location" onPress={addLocation} />
        </View>

        {filteredLocations.length === 0 ? (
          <EmptyState title="No location found" description="Create or search another location name." />
        ) : null}

        {filteredLocations.map((location) => (
          <View
            key={location.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 10,
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
                      backgroundColor: "#e4f1ff",
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
                      {
                        containers.filter((container) => container.locationId === location.id).length
                      }{" "}
                      containers
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
                  <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>Edit</Text>
                </PressableScale>
                <PressableScale
                  onPress={() =>
                    Alert.alert("Delete location?", "This also deletes all children.", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => removeLocation(location.id) },
                    ])
                  }
                >
                  <Text style={{ color: colors.danger, fontWeight: "700" }}>Delete</Text>
                </PressableScale>
              </View>
            </View>
          </View>
        ))}
        {editingLocationId ? (
          <View style={{ marginBottom: 16 }}>
            <AppButton
              title="Save Location Edit"
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
            <Text style={{ marginBottom: 8, fontSize: 16, color: colors.text, fontWeight: "700" }}>Containers</Text>
            <View style={{ gap: 10, marginBottom: 10 }}>
              <TextInput
                value={containerName}
                onChangeText={setContainerName}
                placeholder="New container name"
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
              <AppButton title="+ Add Container" onPress={addContainer} variant="secondary" />
            </View>

            {filteredContainers.length === 0 ? (
              <EmptyState title="No container found" description="Add a container for selected location." />
            ) : null}

            {filteredContainers.map((container) => (
              <View
                key={container.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 8,
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
                      <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>Edit</Text>
                    </PressableScale>
                    <PressableScale onPress={() => removeContainer(container.id)}>
                      <Text style={{ color: colors.danger, fontWeight: "700" }}>Delete</Text>
                    </PressableScale>
                  </View>
                </View>
              </View>
            ))}
            {editingContainerId ? (
              <AppButton
                title="Save Container Edit"
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
            <Text style={{ marginBottom: 8, fontSize: 16, color: colors.text, fontWeight: "700" }}>Items</Text>

            <View style={{ gap: 10, marginBottom: 10 }}>
              <TextInput
                value={itemName}
                onChangeText={setItemName}
                placeholder="Item name"
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
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Category"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    flex: 1,
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
                  value={qtyText}
                  keyboardType="numeric"
                  onChangeText={setQtyText}
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    width: 80,
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
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Unit"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    width: 80,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.text,
                  }}
                />
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
              <AppButton title="+ Add Item" onPress={addItem} />
            </View>

            {filteredItems.length === 0 ? (
              <EmptyState title="No item found" description="Create an item inside selected container." />
            ) : null}

            {filteredItems.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ color: colors.text, fontWeight: "700" }}>{item.name}</Text>
                  <Text style={{ color: colors.textMuted }}>
                    {item.qty} {item.unit} - {item.category}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <PressableScale
                    onPress={() => {
                      chooseItem(item.id);
                      router.push("/item-detail");
                    }}
                  >
                    <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>View</Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => {
                      setEditingItemId(item.id);
                      setItemName(item.name);
                      setCategory(item.category);
                      setQtyText(String(item.qty));
                      setUnit(item.unit);
                    }}
                  >
                    <Text style={{ color: colors.primaryDark, fontWeight: "700" }}>Edit</Text>
                  </PressableScale>
                  <PressableScale onPress={() => removeItem(item.id)}>
                    <Text style={{ color: colors.danger, fontWeight: "700" }}>Delete</Text>
                  </PressableScale>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
      <BottomSheetPanel
        visible={Boolean(editingItemId)}
        title="Edit Item"
        onClose={closeItemEditSheet}
        footer={
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <AppButton title="Cancel" variant="secondary" onPress={closeItemEditSheet} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton title="Save" onPress={saveItemEdit} />
            </View>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <TextInput
            value={itemName}
            onChangeText={setItemName}
            placeholder="Item name"
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
            placeholder="Category"
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
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={qtyText}
              keyboardType="numeric"
              onChangeText={setQtyText}
              placeholder="Qty"
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
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
              value={unit}
              onChangeText={setUnit}
              placeholder="Unit"
              placeholderTextColor={colors.textMuted}
              style={{
                flex: 1,
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
        </View>
      </BottomSheetPanel>
    </SafeAreaView>
  );
}
