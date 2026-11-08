import React from "react";
import { View, StyleSheet, FlatList, Switch, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { Screen } from "../src/components/ui/Screen.js";
import { Text } from "../src/components/ui/Text.js";
import { Button } from "../src/components/ui/Button.js";
import { EmptyState } from "../src/components/ui/EmptyState.js";
import { getMemories, deleteMemory, clearAllMemories, MemoryItem } from "../src/api/memories.js";
import { getMe, updateMe, type UserProfile } from "../src/api/auth.js";
import { colors } from "../src/theme/colors.js";
import { spacing, radius } from "../src/theme/spacing.js";
import { haptics } from "../src/lib/haptics.js";

const CATEGORY_LABELS: Record<string, string> = {
  life_event: "Life event",
  preference: "Preference",
  struggle: "Struggle",
  goal: "Goal",
  person: "Person",
};

export default function MemoriesScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: getMemories,
  });

  const toggleConsentMutation = useMutation({
    mutationFn: (memoryEnabled: boolean) => updateMe({ memoryEnabled }),
    onMutate: async (memoryEnabled: boolean) => {
      await queryClient.cancelQueries({ queryKey: ["me"] });
      const previousUser = queryClient.getQueryData<UserProfile>(["me"]);
      if (previousUser) {
        queryClient.setQueryData(["me"], { ...previousUser, memoryEnabled });
      }
      haptics.tap();
      return { previousUser };
    },
    onError: (_err, _val, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["me"], context.previousUser);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
    },
  });

  const deleteSingleMutation = useMutation({
    mutationFn: (id: string) => deleteMemory(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<MemoryItem[]>(["memories"], (old = []) =>
        old.filter((m) => m._id !== deletedId)
      );
      haptics.warn();
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: clearAllMemories,
    onSuccess: () => {
      queryClient.setQueryData<MemoryItem[]>(["memories"], []);
      haptics.warn();
    },
  });

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Memories",
      "Are you sure you want Sol to forget everything saved from your conversations?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearAllMutation.mutate(),
        },
      ]
    );
  };

  const isEnabled = user?.memoryEnabled ?? true;

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
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
        <Text variant="h3" color={colors.ink}>
          Sol's Memory
        </Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.consentCard}>
        <View style={styles.consentInfo}>
          <Text variant="bodyBold" color={colors.ink}>
            Remember details across conversations
          </Text>
          <Text variant="caption" color={colors.inkSoft}>
            Sol saves key facts (like your goals and stress triggers) to offer deeper support.
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={(val) => toggleConsentMutation.mutate(val)}
          trackColor={{ false: colors.primarySoft, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>

      <View style={styles.listHeader}>
        <Text variant="small" color={colors.inkSoft}>
          Saved Memories ({memories.length})
        </Text>
        {memories.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
            <Text variant="caption" color={colors.dangerText}>
              Clear all
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {memories.length === 0 && !isLoading ? (
        <EmptyState
          title="No memories yet"
          description="As you chat with Sol, important insights and personal context will be remembered here."
        />
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(m) => m._id}
          renderItem={({ item }) => (
            <View style={styles.memoryCard}>
              <View style={styles.memoryContent}>
                <Text variant="caption" color={colors.primary} style={styles.categoryBadge}>
                  {CATEGORY_LABELS[item.category || ""] || "Insight"}
                </Text>
                <Text variant="body" color={colors.ink}>
                  {item.text}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteSingleMutation.mutate(item._id)}
                style={styles.deleteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 6L5 20M5 6L19 20"
                    stroke={colors.inkSoft}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
  },
  backBtn: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center" },
  consentCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  consentInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  list: {
    paddingVertical: spacing.xs,
    paddingBottom: 40,
  },
  memoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  memoryContent: {
    flex: 1,
  },
  categoryBadge: {
    textTransform: "uppercase",
    marginBottom: 2,
  },
  deleteBtn: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center", marginLeft: spacing.xs },
});
