import { StyleSheet, View, ViewProps } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { UI } from "@/constants/theme";

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    ...UI.shadow,
    borderRadius: UI.radius.card,
    borderWidth: 1,
    padding: UI.space.lg,
  },
});
