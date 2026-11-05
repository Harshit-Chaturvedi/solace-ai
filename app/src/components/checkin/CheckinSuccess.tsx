import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Text } from "../ui/index.js";
import { SolMascot } from "../Sol/index.js";
import { colors, spacing } from "../../theme/index.js";
import type { PostMoodResponse } from "../../api/mood.js";

export function CheckinSuccess({
  result,
  tint,
}: {
  result: PostMoodResponse | null;
  tint?: string;
}) {
  const router = useRouter();

  return (
    <View style={styles.successContainer}>
      <SolMascot size={120} expression="happy" moodTint={tint} />
      <Text variant="h1" center style={styles.successTitle}>
        Check-in Complete!
      </Text>

      <View style={styles.streakBadge}>
        <Text variant="caption">🔥</Text>
        <Text variant="bodyBold" color={colors.primary} style={styles.streakBadgeText}>
          {result?.streak.current || 1} Day Streak
        </Text>
      </View>

      {result?.solReply ? (
        <Card style={styles.solBubble}>
          <Text variant="body" color={colors.primary}>
            &ldquo;{result.solReply}&rdquo;
          </Text>
        </Card>
      ) : null}

      <Button
        title="Talk about it with Sol"
        onPress={() => router.replace("/(tabs)/home")}
        style={styles.actionBtn}
      />
      <Button
        title="Back to Home"
        variant="secondary"
        onPress={() => router.replace("/(tabs)/home")}
        style={styles.secondaryBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  successTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginBottom: spacing.xl,
  },
  streakBadgeText: {
    marginLeft: spacing.xs,
  },
  solBubble: {
    width: "100%",
    backgroundColor: colors.primarySoft,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  secondaryBtn: {
    width: "100%",
  },
});
