import { StyleSheet, View } from "react-native";
import { ThemedText as Text } from "@/components/themed-text";
import { UI } from "@/constants/theme";

export type BadgeTone =
  "primary" | "success" | "warning" | "danger" | "neutral";
const tones = {
  primary: [UI.color.primarySoft, UI.color.primary],
  success: [UI.color.successSoft, UI.color.successText],
  warning: [UI.color.warningSoft, UI.color.warningText],
  danger: [UI.color.dangerSoft, UI.color.dangerText],
  neutral: [UI.color.background, UI.color.textSecondary],
};
export function Badge({
  title,
  tone = "primary",
}: {
  title: string;
  tone?: BadgeTone;
}) {
  const [backgroundColor, color] = tones[tone];
  return (
    <View style={[s.badge, { backgroundColor }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.text, { color }]}>{title}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: UI.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: "100%",
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 11, lineHeight: 16, fontWeight: "700", flexShrink: 1 },
});
