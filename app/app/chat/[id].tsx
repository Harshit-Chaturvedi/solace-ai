import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNetInfo } from "@react-native-community/netinfo";
import { Screen, Text } from "../../src/components/ui/index.js";
import { MessageBubble } from "../../src/components/chat/MessageBubble.js";
import { Composer } from "../../src/components/chat/Composer.js";
import { TypingSol } from "../../src/components/Sol/TypingSol.js";
import { RenameModal } from "../../src/components/chat/RenameModal.js";
import { ChatHeader } from "../../src/components/chat/ChatHeader.js";
import {
  getMessages, sendMessage, renameConversation, deleteConversation, MessageItem,
} from "../../src/api/chat.js";
import { colors, spacing, radius } from "../../src/theme/index.js";
import { haptics } from "../../src/lib/haptics.js";

const QUICK_PROMPTS = [
  "I'm feeling a bit anxious today",
  "Help me unwind before bed",
  "Can we do a quick check-in?",
];

type ChatMessage = MessageItem & { failed?: boolean };

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const conversationId = params.id;
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  const [title, setTitle] = useState(params.title || "Conversation");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  const { data: serverMessages = [], isLoading, refetch } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  });

  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        refetch();
      }
    }, [conversationId, refetch])
  );

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(conversationId, text),
    onMutate: async (text: string) => {
      const optimisticMsg: ChatMessage = {
        _id: "temp-" + Date.now(),
        conversationId,
        role: "user",
        sender: "user",
        content: text,
        createdAt: new Date().toISOString(),
        failed: false,
      };
      setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    },
    onSuccess: (data) => {
      setOptimisticMessages([]);
      queryClient.setQueryData<MessageItem[]>(
        ["messages", conversationId],
        (old = []) => [...old, data.userMessage, data.assistantMessage]
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (_err, text) => {
      setOptimisticMessages((prev) =>
        prev.map((m) => (m.content === text ? { ...m, failed: true } : m))
      );
      haptics.warn();
    },
  });

  const allMessages = useMemo(() => {
    const pending = optimisticMessages.filter(
      (opt) =>
        !serverMessages.some(
          (sm) =>
            sm.content === opt.content &&
            (sm.role === "user" || sm.sender === "user")
        )
    );
    return [...serverMessages, ...pending];
  }, [serverMessages, optimisticMessages]);

  const invertedMessages = useMemo(() => {
    return [...allMessages].reverse();
  }, [allMessages]);

  const handleSend = (text: string) => sendMutation.mutate(text);

  const handleRetry = async (text: string) => {
    try {
      const latest = await queryClient.fetchQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => getMessages(conversationId),
      });
      const alreadySaved = latest.some(
        (m) =>
          (m.role === "user" || m.sender === "user") && m.content === text
      );
      if (alreadySaved) {
        setOptimisticMessages((prev) => prev.filter((m) => m.content !== text));
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        return;
      }
    } catch {
      // pre-fetch failed, continue with retry
    }
    setOptimisticMessages((prev) => prev.filter((m) => m.content !== text));
    sendMutation.mutate(text);
  };

  const handleSaveRename = async (newTitle: string) => {
    const oldTitle = title;
    setIsRenameOpen(false);
    setTitle(newTitle);
    try {
      await renameConversation(conversationId, newTitle);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      setTitle(oldTitle);
      Alert.alert("Error", "Could not rename conversation. Please try again.");
    }
  };

  const handleDelete = () => {
    haptics.warn();
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteConversation(conversationId);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            router.replace("/(tabs)/chat" as any); // expo-router route
          } catch {
            Alert.alert("Error", "Could not delete conversation. Please try again.");
          }
        },
      },
    ]);
  };

  const newestAssistantId = useMemo(() => {
    for (let i = allMessages.length - 1; i >= 0; i--) {
      if ((allMessages[i].role || allMessages[i].sender) === "assistant") {
        return allMessages[i]._id;
      }
    }
    return null;
  }, [allMessages]);

  return (
    <Screen noPadding edges={["top", "left", "right", "bottom"]} style={styles.screen}>
      <ChatHeader
        title={title}
        onRename={() => setIsRenameOpen(true)}
        onDelete={handleDelete}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={invertedMessages}
          keyExtractor={(item) => item._id}
          inverted
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isNewest={item._id === newestAssistantId}
              onRetry={handleRetry}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            sendMutation.isPending ? (
              <View style={styles.typingContainer}>
                <TypingSol />
              </View>
            ) : undefined
          }
          ListFooterComponent={
            allMessages.length <= 1 && !isLoading ? (
              <View style={styles.quickPrompts}>
                <Text variant="caption" color={colors.inkSoft} style={styles.quickTitle}>
                  Quick suggestions:
                </Text>
                {QUICK_PROMPTS.map((prompt) => (
                  <TouchableOpacity key={prompt} style={styles.quickChip} onPress={() => handleSend(prompt)}>
                    <Text variant="caption" color={colors.primary} numberOfLines={2}>
                      {prompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : undefined
          }
        />

        <Composer
          onSend={handleSend}
          disabled={sendMutation.isPending || isOffline}
          placeholder={isOffline ? "You are offline..." : "Message Sol..."}
        />
      </KeyboardAvoidingView>
      <RenameModal
        visible={isRenameOpen}
        initialTitle={title}
        onClose={() => setIsRenameOpen(false)}
        onSave={handleSaveRename}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.bg },
  container: { flex: 1 },
  listContent: { paddingVertical: spacing.md },
  typingContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: "flex-start" },
  quickPrompts: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  quickTitle: { marginBottom: spacing.xs },
  quickChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
});
