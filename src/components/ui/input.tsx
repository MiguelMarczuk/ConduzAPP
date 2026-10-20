import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { UI } from "@/constants/theme";
import { Icon, type IconName } from "./icon";

type InputProps = TextInputProps & {
  label?: string;
  icon?: string;
  leadingIcon?: IconName;
  error?: string;
  isPassword?: boolean;
};

export function Input({
  label,
  icon,
  leadingIcon,
  error,
  isPassword,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [hidden, setHidden] = useState(!!isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.container,
          {
            backgroundColor: focused ? theme.surface : "#FAFBFE",
            borderColor: error
              ? theme.danger
              : focused
                ? theme.primary
                : theme.border,
          },
        ]}
      >
        {icon ? <ThemedText style={styles.icon}>{icon}</ThemedText> : null}
        {leadingIcon ? (
          <Icon name={leadingIcon} size={19} color={theme.textSecondary} />
        ) : null}
        <TextInput
          accessibilityLabel={label || rest.placeholder}
          style={[
            styles.input,
            { color: theme.text },
            rest.multiline && { minHeight: 104, textAlignVertical: "top" },
            style,
          ]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={hidden}
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
            onPress={() => setHidden((h) => !h)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={hidden ? "eye" : "lock"}
              size={19}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <ThemedText style={[styles.error, { color: theme.danger }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: UI.radius.control,
    paddingHorizontal: 14,
    gap: 8,
  },
  icon: { fontSize: 16 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 13,
    fontSize: 15,
  },
  error: { fontSize: 12, marginLeft: 4 },
});
