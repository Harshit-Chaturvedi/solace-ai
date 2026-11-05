import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { Screen } from "../src/components/ui/Screen.js";
import { Text } from "../src/components/ui/Text.js";
import { Button } from "../src/components/ui/Button.js";
import { SolMascot } from "../src/components/Sol/SolMascot.js";
import { getTodayAffirmation, logActivity } from "../src/api/activities.js";
import { colors } from "../src/theme/colors.js";
import { spacing, radius } from "../src/theme/spacing.js";
import { haptics } from "../src/lib/haptics.js";

export default function AffirmationScreen(): React.JSX.Element {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["affirmation", "today"],
    queryFn: getTodayAffirmation,
  });

  const affirmationText =
    data?.text ||
    data?.affirmation ||
    "You are doing better than you give yourself credit for. Take a deep breath.";

  const handleShare = async () => {
    haptics.tap();
    try {
      await Share.share({
        message: `"${affirmationText}" — Solace AI`,
      });
    } catch {
      // ignore share dismissal
    }
  };

  const handleSave = async () => {
    haptics.success();
    setSaved(true);
    try {
      await logActivity({
        type: "affirmation",
        durationSeconds: 30,
        meta: { affirmation: affirmationText },
      });
    } catch {
      // ignore network errors
    }
  };

  return (
    <Screen gradient={colors.gradients.dawn} style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text variant="caption" color={colors.inkSoft} style={styles.badge}>
          Daily Solace
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.mascot}>
          <SolMascot size={90} expression="calm" />
        </View>

        <View style={styles.card}>
          <Text variant="display" color={colors.primary} style={styles.quoteMark}>
            “
          </Text>
          <Text variant="h2" color={colors.ink} style={styles.quoteText}>
            {affirmationText}
          </Text>
          <Text variant="caption" color={colors.inkSoft} style={styles.author}>
            — {data?.author || "Sol"} • {data?.date || "Today"}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={saved ? "Saved to Heart" : "Save Affirmation"}
            variant="primary"
            onPress={handleSave}
            disabled={saved}
            style={styles.actionBtn}
          />
          <Button
            title="Share"
            variant="secondary"
            onPress={handleShare}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  mascot: {
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    width: "100%",
    alignItems: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteMark: {
    fontSize: 48,
    lineHeight: 48,
    marginBottom: -10,
  },
  quoteText: {
    textAlign: "center",
    lineHeight: 32,
    marginBottom: spacing.md,
  },
  author: {
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xxl,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
  },
});
