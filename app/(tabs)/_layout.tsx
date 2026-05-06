import { Tabs, useRouter } from "expo-router";
import { House, Layers, Plus, QrCode, Settings } from "lucide-react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  View,
} from "react-native";

import { useI18n } from "../../src/i18n/LanguageProvider";
import { colorPalettes } from "../../src/theme/colors";
import { useThemePreference } from "../../src/theme/ThemeProvider";
import { persistor, store } from "../../src/store/store";

export default function TabLayout() {
  const router = useRouter();
  const { t } = useI18n();
  const { themeScheme } = useThemePreference();
  const palette = colorPalettes[themeScheme];
  const tabBarActiveTintColor =
    themeScheme === "oceanGold" ? palette.gold : themeScheme === "violet" ? palette.accent : palette.primary;
  const tabBarInactiveTintColor =
    themeScheme === "oceanGold" || themeScheme === "violet" ? palette.textMuted : palette.textMuted;
  const pulseA = useRef(new Animated.Value(0)).current;
  const pulseB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.timing(pulseA, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(pulseB, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loopA.start();
    loopB.start();
    return () => {
      loopA.stop();
      loopB.stop();
      pulseA.stopAnimation();
      pulseB.stopAnimation();
      pulseA.setValue(0);
      pulseB.setValue(0);
    };
  }, [pulseA, pulseB]);

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.bg,
            }}
          >
            <ActivityIndicator color={palette.primary} />
          </View>
        }
        persistor={persistor}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor,
            tabBarInactiveTintColor,
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "600",
            },
            tabBarItemStyle: {
              paddingTop: 2,
            },
            tabBarStyle: {
              borderTopColor: palette.border,
              borderTopWidth: 1,
              backgroundColor: palette.surfaceSoft,
              height: 76,
              paddingBottom: 10,
              paddingTop: 8,
              shadowColor: palette.primaryDark,
              shadowOpacity: 0.16,
              shadowOffset: { width: 0, height: -2 },
              shadowRadius: 10,
              elevation: 10,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t("homeTitle"),
              tabBarIcon: ({ color, size }) => (
                <House color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="inventory"
            options={{
              title: t("myInventory"),
              tabBarIcon: ({ color, size }) => (
                <Layers color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="add"
            options={{
              title: "",
              tabBarLabel: "",
              tabBarButton: ({
                accessibilityLabel,
                accessibilityState,
                onLongPress,
                onPressIn,
                onPressOut,
                testID,
              }) => (
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: 1,
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      borderWidth: 2,
                      borderColor: palette.primary,
                      opacity: pulseA.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.42, 0],
                      }),
                      transform: [
                        {
                          scale: pulseA.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.62],
                          }),
                        },
                      ],
                    }}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: 1,
                      width: 40,
                      height: 40,
                      borderRadius: 30,
                      borderWidth: 2,
                      borderColor: palette.accent,
                      opacity: pulseB.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.35, 0],
                      }),
                      transform: [
                        {
                          scale: pulseB.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.9],
                          }),
                        },
                      ],
                    }}
                  />
                  <Pressable
                    onPress={() => {
                      router.push({
                        pathname: "/(tabs)/add",
                        params: { resetAt: String(Date.now()) },
                      });
                    }}
                    onLongPress={onLongPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    accessibilityRole="button"
                    accessibilityState={accessibilityState}
                    accessibilityLabel={accessibilityLabel}
                    testID={testID}
                    hitSlop={12}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      backgroundColor: palette.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: palette.surface,
                      shadowColor: palette.primaryDark,
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 5 },
                      elevation: 6,
                    }}
                  >
                    <Plus color={palette.onPrimary} size={24} />
                  </Pressable>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="scan"
            options={{
              title: t("scanBarcode"),
              tabBarIcon: ({ color, size }) => (
                <QrCode color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: t("settings"),
              tabBarIcon: ({ color, size }) => (
                <Settings color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </PersistGate>
    </Provider>
  );
}
