import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, Image, ScrollView, Text, View } from "react-native";
import { MapPin, Package } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import LottieView from "lottie-react-native";

import { EmptyState } from "../../src/components/EmptyState";
import { FadeSlideIn } from "../../src/components/FadeSlideIn";
import { PressableScale } from "../../src/components/PressableScale";
import { SearchBar } from "../../src/components/SearchBar";
import { useInventory } from "../../src/hooks/useInventory";
import { useI18n } from "../../src/i18n/LanguageProvider";
import { colors } from "../../src/theme/colors";

export default function HomeScreen() {
  const { recentItems, containers, locations, chooseItem } = useInventory();
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const totalItems = recentItems.length;
  const bgDriftA = useRef(new Animated.Value(0)).current;
  const bgDriftB = useRef(new Animated.Value(0)).current;

  const findContainer = (containerId: string) =>
    containers.find((container) => container.id === containerId);
  const findLocation = (locationId: string) =>
    locations.find((location) => location.id === locationId);

  const filteredRecentItems = useMemo(
    () =>
      recentItems.filter((item) => {
        const container = findContainer(item.containerId);
        const location = container
          ? findLocation(container.locationId)
          : undefined;
        const keyword =
          `${item.name} ${item.category} ${container?.name ?? ""} ${location?.name ?? ""}`.toLowerCase();
        return keyword.includes(query.toLowerCase());
      }),
    [containers, locations, query, recentItems],
  );

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(bgDriftA, {
          toValue: 1,
          duration: 2300,
          useNativeDriver: true,
        }),
        Animated.timing(bgDriftA, {
          toValue: 0,
          duration: 2300,
          useNativeDriver: true,
        }),
      ]),
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(bgDriftB, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(bgDriftB, {
          toValue: 0,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    );
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [bgDriftA, bgDriftB]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <FadeSlideIn delay={20} fromY={16}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 30, fontWeight: "900", color: colors.text }}
            >
              {t("homeTitle")}
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={60} fromY={12}>
          <View style={{ marginTop: 10 }}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder={t("searchPlaceholder")}
            />
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={110} fromY={18}>
          <View
            style={{
              marginTop: 14,
              borderRadius: 22,
              padding: 18,
              backgroundColor: colors.primaryDark,
              borderWidth: 1,
              borderColor: colors.gold,
              overflow: "hidden",
              shadowColor: "#16280f",
              shadowOpacity: 0.28,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }}
          >
            <Animated.View
              style={{
                position: "absolute",
                width: 190,
                height: 190,
                borderRadius: 95,
                backgroundColor: colors.primary,
                opacity: 0.18,
                top: -80,
                right: -65,
                transform: [
                  {
                    translateX: bgDriftA.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -9],
                    }),
                  },
                  {
                    translateY: bgDriftA.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 7],
                    }),
                  },
                ],
              }}
            />
            <Animated.View
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.gold,
                opacity: 0.22,
                bottom: -48,
                left: -38,
                transform: [
                  {
                    translateX: bgDriftB.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    }),
                  },
                  {
                    translateY: bgDriftB.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 14,
                right: 14,
              }}
            ></View>
            <Text
              style={{
                color: colors.surfaceSoft,
                fontSize: 12,
                letterSpacing: 1.1,
                fontWeight: "700",
              }}
            >
              {t("collectionOverview")}
            </Text>
            <Text
              style={{
                marginTop: 6,
                color: colors.surface,
                fontSize: 24,
                fontWeight: "900",
              }}
            >
              {totalItems} {t("recentItemsCount")}
            </Text>
            <Text
              style={{
                marginTop: 4,
                color: colors.surfaceStrong,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              {t("heroSubtitle")}
            </Text>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={160} fromY={10}>
          <Text
            style={{
              marginTop: 16,
              marginBottom: 10,
              fontSize: 20,
              fontWeight: "800",
              color: colors.text,
            }}
          >
            {t("recentItemsLocal")}
          </Text>
        </FadeSlideIn>

        {filteredRecentItems.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              rowGap: 12,
            }}
          >
            {filteredRecentItems.map((item, index) => {
              const container = findContainer(item.containerId);
              const location = container
                ? findLocation(container.locationId)
                : undefined;
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
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                          height: 170,
                          shadowColor: "#243a1b",
                          shadowOpacity: 0.12,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 5 },
                          elevation: 3,
                        }}
                      >
                        {item.imageUri ? (
                          <Image
                            source={{ uri: item.imageUri }}
                            style={{ height: 90, width: "100%" }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              height: 90,
                              backgroundColor: colors.surfaceStrong,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: 28 }}>📦</Text>
                          </View>
                        )}
                        <View
                          style={{
                            padding: 10,
                            minHeight: 80,
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{ color: colors.text, fontWeight: "800" }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.name}
                          </Text>
                          <View style={{ marginTop: 6, flexDirection: "row", gap: 6 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: colors.surfaceSoft,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <MapPin size={12} color={colors.primaryDark} />
                              <Text
                                style={{ color: colors.textMuted, fontSize: 12, flexShrink: 1 }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {location?.name ?? t("unknown")}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: colors.surfaceSoft,
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Package size={12} color={colors.primaryDark} />
                              <Text
                                style={{ color: colors.textMuted, fontSize: 12, flexShrink: 1 }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {container?.name ?? t("unknown")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </PressableScale>
                  </FadeSlideIn>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title={query.trim() ? t("noMatchingItems") : t("noItemsYet")}
            description={
              query.trim() ? t("noMatchingItemsDesc") : t("noItemsYetDesc")
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
