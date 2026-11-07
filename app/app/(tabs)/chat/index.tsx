import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Screen } from "../../../src/components/ui/Screen.js";
import { Text } from "../../../src/components/ui/Text.js";
import { Button } from "../../../src/components/ui/Button.js";
import { EmptyState } from "../../../src/components/ui/EmptyState.js";
import { colors } from "../../../src/theme/colors.js";
import { spacing } from "../../../src/theme/spacing.js";
import { haptics } from "../../../src/lib/haptics.js";
import {
  getConversations,
  deleteConversation,
  ConversationItem,
} from "../../../src/api/chat.js";

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function ChatListScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStartNewChat = () => {
    haptics.select();
    router.push("/chat/new" as any); // expo-router route
  };

  const handleDelete = (id: string, title: string) => {
    haptics.warn();
    Alert.alert("Delete Conversation", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const renderRightActions = (item: ConversationItem) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(item._id, item.title)}
      >
        <Text variant="small" color={colors.surface} style={styles.deleteActionText}>
          Delete
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ConversationItem }) => {
    return (
      <ReanimatedSwipeable
        renderRightActions={() => renderRightActions(item)}
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => {
            haptics.select();
            router.push(`/chat/${item._id}` as any); // expo-router route
          }}
          activeOpacity={0.7}
        >
          <View style={styles.itemHeader}>
            <View style={styles.titleRow}>
              {item.mood ? <View style={styles.moodDot} /> : null}
              <Text variant="h3" color={colors.ink} style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <Text variant="caption" color={colors.inkSoft}>
              {formatRelativeTime(item.lastMessageAt)}
            </Text>
          </View>
          <Text variant="body" color={colors.inkSoft} numberOfLines={2}>
            {item.lastMessagePreview || "Empty conversation"}
          </Text>
        </TouchableOpacity>
      </ReanimatedSwipeable>
    );
  };

  return (
    <Screen noPadding style={styles.screen}>
      <View style={styles.header}>
        <Text variant="h1" color={colors.ink}>
          Conversations
        </Text>
        <Button
          title="+ New"
          variant="primary"
          onPress={handleStartNewChat}
          style={styles.newButton}
        />
      </View>

      {conversations.length === 0 && !isLoading ? (
        <EmptyState
          title="No chats yet"
          description="Sol is ready whenever you are. Start a conversation to reflect, vent, or find calm."
          actionTitle="Start a conversation"
          onAction={handleStartNewChat}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
  },
  newButton: {
    paddingHorizontal: spacing.md,
    minHeight: 38,
  },
  list: {
    paddingVertical: spacing.sm,
    paddingBottom: 80,
  },
  itemCard: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.xs,
  },
  title: {
    flex: 1,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 85,
  },
  deleteActionText: {
    fontWeight: "700",
  },
});
