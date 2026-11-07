import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../src/components/ui/Screen.js";
import { Text } from "../../src/components/ui/Text.js";
import { MessageBubble } from "../../src/components/chat/MessageBubble.js";
import { Composer } from "../../src/components/chat/Composer.js";
import { TypingSol } from "../../src/components/Sol/TypingSol.js";
import { RenameModal } from "../../src/components/chat/RenameModal.js";
import { ChatHeader } from "../../src/components/chat/ChatHeader.js";
import {
  getMessages,
  sendMessage,
  renameConversation,
  deleteConversation,
  MessageItem,
} from "../../src/api/chat.js";
import { colors } from "../../src/theme/colors.js";
import { spacing, radius } from "../../src/theme/spacing.js";
import { haptics } from "../../src/lib/haptics.js";

const QUICK_PROMPTS = [
  "I'm feeling a bit anxious today",
  "Help me unwind before bed",
  "Can we do a quick check-in?",
];

export default function ChatScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id: string; title?: string }>();
  const conversationId = params.id;

  const [title, setTitle] = useState(params.title || "Conversation");
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageItem[]>([]);

  const { data: serverMessages = [], isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendMessage(conversationId, text),
    onMutate: async (text: string) => {
      const optimisticMsg: MessageItem = {
        _id: "temp-" + Date.now(),
        conversationId,
        role: "user",
        sender: "user",
        content: text,
        createdAt: new Date().toISOString(),
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
    onError: () => {
      setOptimisticMessages([]);
      haptics.warn();
      Alert.alert("Message failed", "Unable to reach Sol. Please try again.");
    },
  });

  const allMessages = useMemo(() => {
    return [...serverMessages, ...optimisticMessages];
  }, [serverMessages, optimisticMessages]);

  const invertedMessages = useMemo(() => {
    return [...allMessages].reverse();
  }, [allMessages]);

  const handleSend = (text: string) => {
    sendMutation.mutate(text);
  };

  const handleRename = () => {
    setIsRenameOpen(true);
  };

  const handleSaveRename = async (newTitle: string) => {
    setIsRenameOpen(false);
    setTitle(newTitle);
    await renameConversation(conversationId, newTitle);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const handleDelete = () => {
    haptics.warn();
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteConversation(conversationId);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          router.replace("/(tabs)/chat" as any); // expo-router route
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
    <Screen noPadding style={styles.screen}>
      <ChatHeader
        title={title}
        onRename={Platform.OS === "ios" ? handleRename : undefined}
        onDelete={handleDelete}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                  <TouchableOpacity
                    key={prompt}
                    style={styles.quickChip}
                    onPress={() => handleSend(prompt)}
                  >
                    <Text variant="caption" color={colors.primary}>
                      {prompt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : undefined
          }
        />

        <Composer onSend={handleSend} disabled={sendMutation.isPending} />
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
  screen: {
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  typingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "flex-start",
  },
  quickPrompts: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  quickTitle: {
    marginBottom: spacing.xs,
  },
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
