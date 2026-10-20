/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#142449",
    background: "#F5F7FC",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#5F6E89",
    primary: "#0046DC",
    primaryDark: "#082C7E",
    surface: "#FFFFFF",
    backgroundApp: "#F5F7FC",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    border: "#E5EAF4",
  },
  dark: {
    text: "#ffffff",
    background: "#0B1120",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#94A3B8",
    primary: "#3B6DF5",
    primaryDark: "#1E56F0",
    surface: "#161B29",
    backgroundApp: "#0B1120",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    border: "#26304A",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// Identidade compartilhada pelas telas do MVP e seus componentes.
export const UI = {
  color: {
    ...Colors.light,
    primarySoft: "#EDF3FF",
    primaryLight: "#BCD2FF",
    successSoft: "#EAF7F1",
    successText: "#187552",
    warningSoft: "#FFF5E5",
    warningText: "#8B590B",
    dangerSoft: "#FFF0F0",
    dangerText: "#B73545",
  },
  radius: { small: 10, control: 12, card: 18, large: 24, pill: 999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  type: { caption: 12, body: 14, button: 15, section: 18, title: 24 },
  contentWidth: 760,
  shadow: {
    shadowColor: "#19356A",
    shadowOpacity: 0.045,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;
