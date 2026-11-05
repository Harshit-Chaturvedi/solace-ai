import React from "react";
import { StyleSheet } from "react-native";
import { Screen, Text } from "../src/components/ui/index.js";
import { colors } from "../src/theme/index.js";

export default function CheckinScreen() {
  return (
    <Screen style={styles.center}>
      <Text variant="h2">Daily Check-in</Text>
      <Text variant="body" color={colors.inkSoft}>
        Check-in flow coming up in Phase 6
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
