import React from "react";
import { View, StyleSheet } from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { Text } from "./Text.js";
import { colors } from "../../theme/colors.js";
import { spacing } from "../../theme/spacing.js";

export function OfflineBanner(): React.JSX.Element | null {
  const netInfo = useNetInfo();

  if (netInfo.isConnected === null || netInfo.isConnected === true) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text variant="caption" color={colors.surface} center style={styles.text}>
        You are offline. Solace will sync when connection returns.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerStrong,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  text: {
    fontWeight: "600",
  },
});
