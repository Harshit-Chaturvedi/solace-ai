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
          <Text variant="h3" style={styles.cardHeaderTitle}>
            Today&apos;s Check-in
          </Text>
          <Text variant="body">{moodEmojis[todayMood.mood] || "✨"}</Text>
        </View>
        <Text variant="body" color={colors.inkSoft} style={styles.cardBodyText}>
          You felt {todayMood.mood} today.
        </Text>
        {todayMood.solReply ? (
          <Text
            variant="small"
            color={colors.primary}
            numberOfLines={4}
            style={styles.solReply}
          >
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
      <Text variant="small" color={colors.peachText} style={styles.badge}>
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
    } else if (suggestion.action.type === "chat") {
      router.push({ pathname: "/chat/new", params: { mood: "low" } } as any); // expo-router route
    } else {
      router.push("/checkin");
    }
  };

  return (
    <Card style={styles.card}>
      <Text variant="small" color={colors.mintText} style={styles.badge}>
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
  cardHeaderTitle: {
    flex: 1,
    flexShrink: 1,
    marginRight: spacing.xs,
  },
  cardBodyText: {
    flexShrink: 1,
  },
  cardTitle: { marginBottom: spacing.xs, flexShrink: 1 },
  cardSubtitle: { marginBottom: spacing.md, flexShrink: 1 },
  facesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.xs,
  },
  faceBtn: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xs,
    flexShrink: 1,
  },
  solReply: { marginTop: spacing.sm, fontStyle: "italic", flexShrink: 1 },
  badge: { marginBottom: spacing.xs, letterSpacing: 1, flexShrink: 1 },
  affirmationText: { marginTop: spacing.xs, lineHeight: 24, flexShrink: 1 },
  suggestionTitle: { marginBottom: spacing.xs, flexShrink: 1 },
  suggestionReason: { marginBottom: spacing.md, flexShrink: 1 },
  suggestionBtn: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
});
