import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Screen, Text, Card, Skeleton } from "../../src/components/ui/index.js";
import { SolMascot, type SolExpression } from "../../src/components/Sol/index.js";
import { colors, spacing } from "../../src/theme/index.js";
import { getHomeData } from "../../src/api/home.js";
import {
  CheckinCard,
  AffirmationCard,
  SuggestionCard,
} from "../../src/components/home/HomeCards.js";

export default function HomeScreen() {
  const router = useRouter();

  const handleOpenCheckin = () => {
    router.push("/checkin");
  };

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["homeData"],
    queryFn: getHomeData,
  });

  const hour = new Date().getHours();
  const gradient =
    hour >= 5 && hour < 17 ? colors.gradients.dawn : colors.gradients.dusk;

  let solExpression: SolExpression = "calm";
  if (data?.todayMood) {
    const mood = data.todayMood.mood;
    if (mood === "great") solExpression = "excited";
    else if (mood === "good") solExpression = "happy";
    else if (mood === "low" || mood === "awful") solExpression = "concerned";
  }

  return (
    <Screen gradient={gradient} noPadding>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header with Greeting, Streak Pill & Sol */}
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.streakPill}>
              <Text variant="caption">🔥</Text>
              <Text variant="caption" color={colors.primary} style={styles.streakText}>
                {data?.streak?.current || 0} day streak
              </Text>
            </View>
          </View>

          <View style={styles.greetingRow}>
            <View style={styles.greetingTextContainer}>
              <Text variant="h1" style={styles.greeting}>
                {data?.greeting || "Good day"}
              </Text>
              <Text variant="body" color={colors.inkSoft}>
                Sol is right here with you.
              </Text>
            </View>
            <SolMascot size={80} expression={solExpression} />
          </View>
        </View>

        {/* Content Cards */}
        <View style={styles.body}>
          {isLoading ? (
            <View>
              <Card style={styles.cardSkeleton}>
                <Skeleton height={24} width="70%" style={styles.skeletonSpacing} />
                <Skeleton height={16} width="90%" style={styles.skeletonSpacing} />
                <Skeleton height={40} width="100%" />
              </Card>
              <Card style={styles.cardSkeleton}>
                <Skeleton height={18} width="40%" style={styles.skeletonSpacing} />
                <Skeleton height={20} width="85%" />
              </Card>
            </View>
          ) : data ? (
            <View>
              <CheckinCard todayMood={data.todayMood} />
              <AffirmationCard text={data.affirmation} />
              <SuggestionCard suggestion={data.suggestion} />

              {/* Quick Actions Row */}
              <View style={styles.quickActionsContainer}>
                <Text variant="small" color={colors.inkSoft} style={styles.quickActionsLabel}>
                  QUICK RITUALS
                </Text>
                <View style={styles.quickActionsRow}>
                  {data.quickActions.map((qa) => (
                    <Pressable
                      key={qa.id}
                      onPress={() => router.push(qa.route as never)}
                      style={styles.quickActionPill}
                    >
                      <Text variant="small" color={colors.ink}>
                        {qa.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: spacing.xs,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
  },
  streakText: {
    marginLeft: spacing.xs,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  greeting: {
    marginBottom: spacing.xs,
  },
  body: {
    paddingHorizontal: spacing.screenPadding,
  },
  cardSkeleton: {
    marginBottom: spacing.base,
  },
  skeletonSpacing: {
    marginBottom: spacing.sm,
  },
  quickActionsContainer: {
    marginTop: spacing.md,
  },
  quickActionsLabel: {
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickActionPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
});
