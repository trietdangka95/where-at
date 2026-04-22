import { Tabs, useRouter } from "expo-router";
import { House, Layers, Plus, QrCode, Settings } from "lucide-react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator, Pressable, View } from "react-native";

import { colors } from "../../src/theme/colors";
import { persistor, store } from "../../src/store/store";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        }
        persistor={persistor}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: {
              fontSize: 11,
            },
            tabBarItemStyle: {
              paddingTop: 4,
            },
            tabBarStyle: {
              borderTopColor: colors.border,
              backgroundColor: "#fff",
              height: 68,
              paddingBottom: 8,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="inventory"
            options={{
              title: "Inventory",
              tabBarIcon: ({ color, size }) => <Layers color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="add"
            options={{
              title: "",
              tabBarLabel: "",
              tabBarButton: (props) => (
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Pressable
                    {...props}
                    onPress={() => {
                      router.push("/(tabs)/scan");
                    }}
                    style={{
                      marginTop: -10,
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: colors.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOpacity: 0.18,
                      shadowOffset: { width: 0, height: 4 },
                      shadowRadius: 8,
                    }}
                  >
                    <Plus color="#fff" size={22} />
                  </Pressable>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="scan"
            options={{
              title: "Scan",
              tabBarIcon: ({ color, size }) => <QrCode color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
            }}
          />
        </Tabs>
      </PersistGate>
    </Provider>
  );
}
