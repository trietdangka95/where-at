import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ScrollView, Text, View } from "react-native";
import { Bell, Search } from "lucide-react-native";
import { useRouter } from "expo-router";

import { EmptyState } from "../../src/components/EmptyState";
import { FadeSlideIn } from "../../src/components/FadeSlideIn";
import { PressableScale } from "../../src/components/PressableScale";
import { SearchBar } from "../../src/components/SearchBar";
import { useInventory } from "../../src/hooks/useInventory";
import { colors } from "../../src/theme/colors";

export default function HomeScreen() {
  const { recentItems, containers, locations, chooseItem } = useInventory();
  const router = useRouter();

  const findContainer = (containerId: string) => containers.find((container) => container.id === containerId);
  const findLocation = (locationId: string) => locations.find((location) => location.id === locationId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 30, fontWeight: "900", color: colors.text }}>WhereAt?</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Search size={18} color={colors.text} />
            <Bell size={18} color={colors.text} />
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <SearchBar value="" onChangeText={() => undefined} placeholder="Search items, containers, or locations..." />
        </View>

        <Text style={{ marginTop: 14, marginBottom: 10, fontSize: 20, fontWeight: "800", color: colors.text }}>
          Recent Items (Local Only)
        </Text>

        {recentItems.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
            {recentItems.map((item, index) => {
              const container = findContainer(item.containerId);
              const location = container ? findLocation(container.locationId) : undefined;
              return (
                <View key={item.id} style={{ width: "48%" }}>
                  <FadeSlideIn delay={index * 30}>
                    <PressableScale
                      onPress={() => {
                        chooseItem(item.id);
                        router.push("/item-detail");
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: colors.surface,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                        }}
                      >
                        {item.imageUri ? (
                          <Image source={{ uri: item.imageUri }} style={{ height: 90, width: "100%" }} resizeMode="cover" />
                        ) : (
                          <View
                            style={{
                              height: 90,
                              backgroundColor: "#d6e7ff",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: 28 }}>📦</Text>
                          </View>
                        )}
                        <View style={{ padding: 10 }}>
                          <Text style={{ color: colors.text, fontWeight: "800" }}>{item.name}</Text>
                          <Text style={{ color: colors.textMuted, marginTop: 2 }}>
                            {location?.name ?? "Unknown"} {'>'} {container?.name ?? "Unknown"}
                          </Text>
                        </View>
                      </View>
                    </PressableScale>
                  </FadeSlideIn>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState title="No items yet" description='Tap "+" from Inventory to add your first item.' />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
