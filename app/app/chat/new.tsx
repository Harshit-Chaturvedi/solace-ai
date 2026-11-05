import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Screen } from "../../src/components/ui/Screen.js";
import { Text } from "../../src/components/ui/Text.js";
import { Button } from "../../src/components/ui/Button.js";
import { TypingSol } from "../../src/components/Sol/TypingSol.js";
import { createConversation } from "../../src/api/chat.js";
import { colors } from "../../src/theme/colors.js";
import { spacing } from "../../src/theme/spacing.js";

export default function NewChatScreen(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mood?: string;
    note?: string;
    firstMessage?: string;
  }>();

  const [error, setError] = useState<string | null>(null);

  const initChat = async () => {
    try {
      setError(null);
      const seed = params.mood ? { mood: params.mood, note: params.note } : undefined;
      const conv = await createConversation({
        firstMessage: params.firstMessage,
        seed,
      });
      router.replace(`/chat/${conv._id}` as any); // expo-router route
    } catch {
      setError("Unable to start conversation. Please try again.");
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  return (
    <Screen style={styles.container}>
      <View style={styles.center}>
        {error ? (
          <View style={styles.errorBox}>
            <Text variant="h3" color={colors.danger} style={styles.errorText}>
              {error}
            </Text>
            <Button title="Try Again" onPress={initChat} />
            <Button
              title="Go Back"
              variant="secondary"
              onPress={() => router.back()}
              style={styles.backButton}
            />
          </View>
        ) : (
          <View style={styles.loadingBox}>
            <TypingSol />
            <Text variant="body" color={colors.inkSoft} style={styles.loadingText}>
              Starting conversation with Sol...
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingBox: {
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.sm,
  },
  errorBox: {
    alignItems: "center",
    gap: spacing.md,
  },
  errorText: {
    textAlign: "center",
  },
  backButton: {
    marginTop: spacing.xs,
  },
});
