import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { applyColorScheme, type ThemeScheme } from "./colors";

const THEME_SCHEME_STORAGE_KEY = "whereat_theme_scheme";

type ThemeContextValue = {
  themeScheme: ThemeScheme;
  setThemeScheme: (scheme: ThemeScheme) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [themeScheme, setThemeSchemeState] = useState<ThemeScheme>("green");

  useEffect(() => {
    const restoreThemeScheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_SCHEME_STORAGE_KEY);
        if (stored === "green" || stored === "oceanGold" || stored === "violet" || stored === "pinkLotus") {
          setThemeSchemeState(stored);
        }
      } catch {
        // Ignore read failures and keep default theme.
      }
    };
    void restoreThemeScheme();
  }, []);

  useEffect(() => {
    applyColorScheme(themeScheme);
  }, [themeScheme]);

  const setThemeScheme = useCallback(async (scheme: ThemeScheme) => {
    setThemeSchemeState(scheme);
    try {
      await AsyncStorage.setItem(THEME_SCHEME_STORAGE_KEY, scheme);
    } catch {
      // Ignore storage failures; in-memory theme still changes.
    }
  }, []);

  const value = useMemo(
    () => ({ themeScheme, setThemeScheme }),
    [themeScheme, setThemeScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View key={themeScheme} style={{ flex: 1 }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useThemePreference = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemePreference must be used within ThemeProvider");
  return context;
};
