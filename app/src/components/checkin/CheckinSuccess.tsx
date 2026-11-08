import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Text } from "../ui/index.js";
import { SolMascot } from "../Sol/index.js";
import { SupportCard } from "../chat/SupportCard.js";
import { colors, spacing } from "../../theme/index.js";
import type { PostMoodResponse } from "../../api/mood.js";

export function CheckinSuccess({
  result,
  tint,
  mood,
  note,
}: {
  result: PostMoodResponse | null;
  tint?: string;
  mood?: string;
  note?: string;
}) {
  const router = useRouter();

  const handleTalkWithSol = () => {
    const params: Record<string, string> = {};
    if (mood) params.mood = mood;
    if (note && note.trim()) params.note = note.trim();
    router.replace({ pathname: "/chat/new", params } as any); // expo-router route
  };

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

      {result?.flagged === "crisis" ? (
        <View style={styles.supportContainer}>
          <SupportCard />
        </View>
      ) : null}

      {result?.solReply ? (
        <Card style={styles.solBubble}>
          <Text variant="body" color={colors.primary}>
            &ldquo;{result.solReply}&rdquo;
          </Text>
        </Card>
      ) : null}

      <Button
        title="Talk about it with Sol"
        onPress={handleTalkWithSol}
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  streakBadgeText: {
    marginLeft: spacing.xs,
  },
  supportContainer: {
    width: "100%",
    marginBottom: spacing.md,
  },
  solBubble: {
    width: "100%",
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
  },
  actionBtn: {
    width: "100%",
    marginBottom: spacing.md,
  },
  secondaryBtn: {
    width: "100%",
  },
});
