import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { UI } from "@/constants/theme";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgrounds: Record<ButtonVariant, string> = {
    primary: theme.primary,
    secondary: theme.surface,
    outline: "transparent",
    danger: theme.danger,
  };
  const textColors: Record<ButtonVariant, string> = {
    primary: "#FFFFFF",
    secondary: theme.primary,
    outline: theme.primary,
    danger: "#FFFFFF",
  };
  const borderColors: Record<ButtonVariant, string> = {
    primary: theme.primary,
    secondary: theme.border,
    outline: theme.primary,
    danger: theme.danger,
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        styles.base,
        {
          backgroundColor: backgrounds[variant],
          borderColor: borderColors[variant],
          borderWidth: variant === "secondary" || variant === "outline" ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <ThemedText style={[styles.text, { color: textColors[variant] }]}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: UI.radius.control,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: UI.type.button,
    textAlign: "center",
    fontWeight: "700",
  },
});
