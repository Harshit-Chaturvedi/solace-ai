import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, Text } from "../../src/components/ui/index.js";
import { colors } from "../../src/theme/index.js";

export default function ChatTab() {
  return (
    <Screen style={styles.center}>
      <Text variant="h2">Chat with Sol</Text>
      <Text variant="body" color={colors.inkSoft}>Coming up in Phase 8</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: "center", alignItems: "center" },
});
