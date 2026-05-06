import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator, View } from "react-native";

import { ToastProvider } from "../src/components/ToastProvider";
import { LanguageProvider } from "../src/i18n/LanguageProvider";
import { colors } from "../src/theme/colors";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { persistor, store } from "../src/store/store";

export default function RootLayout() {
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
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
              </Stack>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
