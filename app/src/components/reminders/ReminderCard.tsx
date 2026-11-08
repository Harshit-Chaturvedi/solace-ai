import React from "react";
import { View, StyleSheet, Switch, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Text } from "../ui/Text.js";
import { ReminderItem } from "../../api/reminders.js";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";

interface ReminderCardProps {
  item: ReminderItem;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}

export function ReminderCard({ item, onToggle, onDelete }: ReminderCardProps): React.JSX.Element {
  return (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.timeRow}>
          <Text variant="h2" color={colors.ink}>
            {item.time}
          </Text>
          <Text variant="caption" color={colors.primary} style={styles.typeBadge}>
            {item.type}
          </Text>
        </View>
        <Text variant="bodyBold" color={colors.ink}>
          {item.title}
        </Text>
        <Text variant="caption" color={colors.inkSoft}>
          {item.body}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <Switch
          value={item.enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.primarySoft, true: colors.primary }}
          thumbColor={colors.surface}
        />
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6"
              stroke={colors.dangerText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  cardInfo: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  typeBadge: {
    textTransform: "uppercase",
  },
  cardActions: {
    alignItems: "center",
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  deleteBtn: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
