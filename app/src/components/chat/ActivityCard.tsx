import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "../ui/Text.js";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";
import { haptics } from "../../lib/haptics.js";
import { ActivitySuggestion } from "../../api/chat.js";

interface ActivityCardProps {
  suggestion: ActivitySuggestion;
}

export function ActivityCard({ suggestion }: ActivityCardProps): React.JSX.Element {
  const router = useRouter();

  const handlePress = () => {
    haptics.select();
    const p = suggestion.params || suggestion.payload;
    switch (suggestion.type) {
      case "breathing":
      case "breathe": {
        const pattern = (p?.pattern as string) || "box";
        const minutes = (p?.minutes as number) || 2;
        router.push(`/breathe?pattern=${pattern}&minutes=${minutes}` as any); // expo-router route
        break;
      }
      case "affirmation":
        router.push("/affirmation" as any); // expo-router route
        break;
      case "checkin":
        router.push("/checkin" as any); // expo-router route
        break;
      default:
        break;
    }
  };

  const getBadgeLabel = () => {
    switch (suggestion.type) {
      case "breathing":
      case "breathe":
        return "Breathing Exercise";
      case "affirmation":
        return "Daily Affirmation";
      case "checkin":
        return "Daily Check-in";
      default:
        return "Recommended Activity";
    }
  };

  return (
    <View style={styles.card}>
      <Text variant="caption" color={colors.primary} style={styles.badge}>
        {getBadgeLabel()}
      </Text>
      <Text variant="bodyBold" color={colors.ink} style={styles.title}>
        {suggestion.title || "Take a moment for yourself"}
      </Text>
      {suggestion.description ? (
        <Text variant="small" color={colors.inkSoft} style={styles.description}>
          {suggestion.description}
        </Text>
      ) : null}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text variant="small" color={colors.surface} style={styles.actionText}>
          Start Activity
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  badge: {
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  actionText: {
    fontWeight: "700",
  },
});
