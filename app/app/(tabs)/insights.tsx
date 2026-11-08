import React, { useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { Screen } from "../../src/components/ui/Screen.js";
import { Text } from "../../src/components/ui/Text.js";
import { Card } from "../../src/components/ui/Card.js";
import { EmptyState } from "../../src/components/ui/EmptyState.js";
import { getInsights, MoodSeriesPoint } from "../../src/api/insights.js";
import { colors } from "../../src/theme/colors.js";
import { spacing } from "../../src/theme/spacing.js";

const MOOD_COLOR_MAP: Record<string, string> = {
  great: colors.mood.great,
  good: colors.mood.good,
  okay: colors.mood.okay,
  low: colors.mood.low,
  awful: colors.mood.awful,
};

export default function InsightsScreen(): React.JSX.Element {
  const [range] = useState<7 | 30>(7);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["insights", range],
    queryFn: () => getInsights(range),
  });

  const moodSeries = data?.moodSeries || [];
  const streak = data?.streak?.current ?? 0;
  const longest = data?.streak?.longest ?? 0;
  const sessions = data?.activitySummary?.totalSessions ?? 0;
  const minutes = data?.activitySummary?.totalMinutes ?? 0;

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

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text variant="caption" color={colors.inkSoft}>
              Current Streak
            </Text>
            <Text variant="display" color={colors.primary}>
              {streak}
            </Text>
            <Text variant="caption" color={colors.inkSoft}>
              Best: {longest} days
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

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text variant="h3" color={colors.ink}>
              Mood Trend (Past {range} Days)
            </Text>
          </View>

          {moodSeries.length === 0 && !isLoading ? (
            <EmptyState
              title="No check-ins yet"
              description="Complete daily check-ins to unlock your emotional trends and insights."
            />
          ) : (
            <View style={styles.chartContainer}>
              <Svg width="100%" height={160} viewBox="0 0 320 160">
                <Line x1="20" y1="30" x2="300" y2="30" stroke={colors.primarySoft} strokeWidth="1" />
                <Line x1="20" y1="80" x2="300" y2="80" stroke={colors.primarySoft} strokeWidth="1" />
                <Line x1="20" y1="130" x2="300" y2="130" stroke={colors.primarySoft} strokeWidth="1" />

                {moodSeries.map((point: MoodSeriesPoint, idx: number) => {
                  const x = 30 + (idx * 260) / Math.max(moodSeries.length - 1, 1);
                  const y = 140 - point.score * 24;
                  const color = MOOD_COLOR_MAP[point.mood] || colors.primary;

                  return (
                    <React.Fragment key={point.date + idx}>
                      <Circle cx={x} cy={y} r={7} fill={color} />
                      <SvgText
                        x={x}
                        y={155}
                        fontSize="10"
                        fill={colors.inkSoft}
                        textAnchor="middle"
                      >
                        {point.date.slice(5)}
                      </SvgText>
                    </React.Fragment>
                  );
                })}
              </Svg>
            </View>
          )}
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
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  chartCard: {
    padding: spacing.md,
  },
  chartHeader: {
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});
