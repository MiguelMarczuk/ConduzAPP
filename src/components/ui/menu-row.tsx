import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText as Text } from "@/components/themed-text";
import { Icon, type IconName } from "./icon";
import { UI } from "@/constants/theme";

export function MenuRow({
  title,
  icon,
  onPress,
  expanded,
}: {
  title: string;
  icon: IconName;
  onPress: () => void;
  expanded?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={onPress}
      style={s.row}
    >
      <View style={s.icon}>
        <Icon name={icon} size={20} />
      </View>
      <Text style={s.title}>{title}</Text>
      <View style={expanded ? { transform: [{ rotate: "90deg" }] } : undefined}>
        <Icon name="chevron" size={17} color={UI.color.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  row: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: UI.color.border,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: UI.color.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontWeight: "600", fontSize: UI.type.body },
});
