import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Card, Text, Button } from "../ui/index.js";
import { colors, spacing } from "../../theme/index.js";
import type { HomeData } from "../../api/home.js";

const moodEmojis: Record<string, string> = {
  great: "😊",
  good: "🙂",
  okay: "😐",
  low: "😔",
  awful: "🌧️",
};

export function CheckinCard({ todayMood }: { todayMood: HomeData["todayMood"] }) {
  const router = useRouter();

  if (todayMood) {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text variant="h3">Today&apos;s Check-in</Text>
          <Text variant="body">{moodEmojis[todayMood.mood] || "✨"}</Text>
        </View>
        <Text variant="body" color={colors.inkSoft}>
          You felt {todayMood.mood} today.
        </Text>
        {todayMood.solReply ? (
          <Text variant="small" color={colors.primary} style={styles.solReply}>
            Sol: &ldquo;{todayMood.solReply}&rdquo;
          </Text>
        ) : null}
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text variant="h3" style={styles.cardTitle}>
        How are you feeling right now?
      </Text>
      <Text variant="body" color={colors.inkSoft} style={styles.cardSubtitle}>
        Take a moment to check in with your heart.
      </Text>
      <View style={styles.facesRow}>
        {["great", "good", "okay", "low", "awful"].map((m) => (
          <Pressable
            key={m}
            onPress={() => router.push("/checkin")}
            style={styles.faceBtn}
          >
            <Text variant="h2">{moodEmojis[m]}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

export function AffirmationCard({ text }: { text: string }) {
  return (
    <Card style={styles.card}>
      <Text variant="small" color={colors.peach} style={styles.badge}>
        DAILY AFFIRMATION
      </Text>
      <Text variant="bodyBold" style={styles.affirmationText}>
        &ldquo;{text}&rdquo;
      </Text>
    </Card>
  );
}

export function SuggestionCard({
  suggestion,
}: {
  suggestion: HomeData["suggestion"];
}) {
  const router = useRouter();

  const handleAction = () => {
    if (suggestion.action.type === "breathing") {
      router.push("/breathe");
    } else {
      router.push("/checkin");
    }
  };

  return (
    <Card style={styles.card}>
      <Text variant="small" color={colors.mint} style={styles.badge}>
        SOL SUGGESTS
      </Text>
      <Text variant="h3" style={styles.suggestionTitle}>
        {suggestion.title}
      </Text>
      <Text variant="body" color={colors.inkSoft} style={styles.suggestionReason}>
        {suggestion.reason}
      </Text>
      <Button
        title="Start Now"
        variant="secondary"
        onPress={handleAction}
        style={styles.suggestionBtn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.base },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  cardTitle: { marginBottom: spacing.xs },
  cardSubtitle: { marginBottom: spacing.md },
  facesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.xs,
  },
  faceBtn: { padding: spacing.xs },
  solReply: { marginTop: spacing.sm, fontStyle: "italic" },
  badge: { marginBottom: spacing.xs, letterSpacing: 1 },
  affirmationText: { marginTop: spacing.xs, lineHeight: 24 },
  suggestionTitle: { marginBottom: spacing.xs },
  suggestionReason: { marginBottom: spacing.md },
  suggestionBtn: { alignSelf: "flex-start" },
});
