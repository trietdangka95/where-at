export type ThemeScheme = "green" | "oceanGold" | "violet" | "pinkLotus";

export type ColorTokens = {
  bg: string;
  surface: string;
  surfaceSoft: string;
  surfaceStrong: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  accent: string;
  gold: string;
  danger: string;
  border: string;
};

export const colorPalettes: Record<ThemeScheme, ColorTokens> = {
  green: {
    bg: "#e8f1cc",
    surface: "#f6fbe8",
    surfaceSoft: "#e8f3d8",
    surfaceStrong: "#d4e9b8",
    text: "#1a320c",
    textMuted: "#496039",
    primary: "#79c412",
    primaryDark: "#334c1f",
    onPrimary: "#13220b",
    accent: "#496039",
    gold: "#b78628",
    danger: "#e24a5a",
    border: "#a7bf88",
  },
  oceanGold: {
    bg: "#f6f0e3",
    surface: "#f9f4e7",
    surfaceSoft: "#ece2cd",
    surfaceStrong: "#d7c39f",
    text: "#121b28",
    textMuted: "#455a76",
    primary: "#394d6a",
    primaryDark: "#2c3c55",
    onPrimary: "#f9f4e7",
    accent: "#d79005",
    gold: "#f2b006",
    danger: "#d76545",
    border: "#bda57b",
  },
  violet: {
    bg: "#efe9f8",
    surface: "#f7f1ff",
    surfaceSoft: "#e7dbfa",
    surfaceStrong: "#d5c0f3",
    text: "#07031c",
    textMuted: "#463688",
    primary: "#504d9c",
    primaryDark: "#160c3d",
    onPrimary: "#f7f1ff",
    accent: "#aa5dc6",
    gold: "#a760da",
    danger: "#c7426f",
    border: "#9178bb",
  },
  pinkLotus: {
    bg: "#fff0f6",
    surface: "#fff7fb",
    surfaceSoft: "#ffe5f1",
    surfaceStrong: "#ffc8df",
    text: "#3d1026",
    textMuted: "#8a3b61",
    primary: "#e04a91",
    primaryDark: "#9c1f5d",
    onPrimary: "#fff7fb",
    accent: "#ff72b3",
    gold: "#ff9ec9",
    danger: "#d93a63",
    border: "#e8a8c8",
  },
};

export const colors: ColorTokens = { ...colorPalettes.green };

export const applyColorScheme = (scheme: ThemeScheme) => {
  Object.assign(colors, colorPalettes[scheme]);
};
