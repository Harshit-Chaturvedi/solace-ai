import React, { useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen, Text, Card, Button, Chip } from "../../src/components/ui/index.js";
import { SolMascot } from "../../src/components/Sol/index.js";
import { MoodTrendChart } from "../../src/components/insights/MoodTrendChart.js";
import { getInsights } from "../../src/api/insights.js";
import { colors, spacing, radius } from "../../src/theme/index.js";

export default function InsightsScreen(): React.JSX.Element {
  const router = useRouter();
  const [range, setRange] = useState<7 | 30>(7);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["insights", range],
    queryFn: () => getInsights(range),
  });

  const moodSeries = data?.moodSeries || [];
  const streak = data?.streak?.current ?? 0;
  const longest = data?.streak?.longest ?? 0;
  const sessions = data?.activitySummary?.totalSessions ?? 0;
  const minutes = data?.activitySummary?.totalMinutes ?? 0;
  const checkinCount = data?.checkinCount ?? moodSeries.length;
  const emotionCounts = data?.emotionCounts || [];
  const topEmotion = emotionCounts[0]?.emotion;

  let solNoticeText = "";
  if (checkinCount === 0) {
    solNoticeText = `You haven't checked in over the past ${range} days yet. Sol is ready whenever you are.`;
  } else if (checkinCount === 1) {
    solNoticeText = `You checked in once in the last ${range} days${topEmotion ? `, feeling ${topEmotion}` : ""}. Every step forward counts.`;
  } else {
    solNoticeText = `You checked in ${checkinCount} times in the last ${range} days. Your most common feeling was ${topEmotion || "calm"}. Small steps count.`;
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
          />
        }
      >
        <Text variant="h1" color={colors.ink} style={styles.headerTitle}>
          Your Journey
        </Text>

        {/* 7 vs 30 Days Range Switch */}
        <View style={styles.rangeRow}>
          <Chip
            label="Past 7 days"
            selected={range === 7}
            onPress={() => setRange(7)}
          />
          <Chip
            label="Past 30 days"
            selected={range === 30}
            onPress={() => setRange(30)}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text variant="caption" color={colors.inkSoft}>
              Current Streak
            </Text>
            <Text variant="display" color={colors.primary}>
              {streak}
            </Text>
            <Text variant="caption" color={colors.inkSoft}>
              Best: {longest === 1 ? "1 day" : `${longest} days`}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text variant="caption" color={colors.inkSoft}>
              Mindful Minutes
            </Text>
            <Text variant="display" color={colors.mintText}>
              {minutes}
            </Text>
            <Text variant="caption" color={colors.inkSoft}>
              {sessions} sessions
            </Text>
          </Card>
        </View>

        {/* Empty State Call to Action if 0 check-ins */}
        {checkinCount === 0 && !isLoading ? (
          <Card style={styles.emptyCard}>
            <SolMascot size={72} expression="calm" />
            <Text variant="h3" color={colors.ink} style={styles.emptyTitle}>
              No check-ins yet
            </Text>
            <Text variant="body" color={colors.inkSoft} style={styles.emptySubtitle}>
              Take a moment to check in with your heart and start seeing your trends.
            </Text>
            <Button
              title="Do your first check-in"
              onPress={() => router.push("/checkin")}
              style={styles.emptyButton}
            />
          </Card>
        ) : null}

        {/* Mood Trend Chart */}
        <MoodTrendChart range={range} moodSeries={moodSeries} />

        {/* Top Feelings Card */}
        {emotionCounts.length > 0 ? (
          <Card style={styles.sectionCard}>
            <Text variant="small" color={colors.peachText} style={styles.badge}>
              TOP FEELINGS
            </Text>
            <View style={styles.feelingsRow}>
              {emotionCounts.map((item) => (
                <View key={item.emotion} style={styles.feelingPill}>
                  <Text
                    variant="small"
                    color={colors.primaryStrong}
                    style={styles.feelingPillText}
                  >
                    {item.emotion} ({item.count})
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* Sol Noticed Card */}
        <Card style={styles.sectionCard}>
          <Text variant="small" color={colors.mintText} style={styles.badge}>
            SOL NOTICED
          </Text>
          <Text variant="body" color={colors.ink} style={styles.noticeBody}>
            {solNoticeText}
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
  },
  content: {
    paddingVertical: spacing.md,
    paddingBottom: 80,
    gap: spacing.md,
  },
  headerTitle: {
    marginBottom: spacing.xs,
  },
  rangeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  sectionCard: {
    padding: spacing.md,
  },
  badge: {
    marginBottom: spacing.xs,
    letterSpacing: 1,
    flexShrink: 1,
  },
  noticeBody: {
    lineHeight: 22,
    flexShrink: 1,
  },
  feelingsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  feelingPill: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.chip,
  },
  feelingPillText: {
    flexShrink: 1,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyButton: {
    minHeight: 44,
  },
});
