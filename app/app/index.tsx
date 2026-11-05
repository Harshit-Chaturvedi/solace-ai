import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Text, Button } from "../src/components/ui/index.js";
import { colors, spacing } from "../src/theme/index.js";

export default function Index() {
  const router = useRouter();

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Text variant="display" center style={styles.title}>
          Solace
        </Text>
        <Text variant="body" color={colors.inkSoft} center style={styles.subtitle}>
          A gentle place for your mind
        </Text>
        <Button
          title="Open Dev Kit"
          onPress={() => router.push("/dev-kit")}
          style={styles.button}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xxl,
  },
  button: {
    width: "100%",
  },
});
