import React from "react";
import { View, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { Text } from "../ui/Text.js";
import { colors } from "../../theme/colors.js";
import { spacing, radius } from "../../theme/spacing.js";
import { haptics } from "../../lib/haptics.js";

export function SupportCard(): React.JSX.Element {
  const handleCallTeleManas = () => {
    haptics.tap();
    Linking.openURL("tel:14416");
  };

  const handleCallEmergency = () => {
    haptics.tap();
    Linking.openURL("tel:112");
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="caption" color={colors.danger} style={styles.badge}>
          Support & Safety
        </Text>
      </View>
      <Text variant="h3" color={colors.ink} style={styles.title}>
        We are here for you
      </Text>
      <Text variant="body" color={colors.inkSoft} style={styles.body}>
        If you are feeling overwhelmed or having thoughts of harming yourself,
        please speak with a trained professional right now. Caring, confidential
        help is available.
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCallTeleManas}
          activeOpacity={0.8}
        >
          <Text variant="small" color={colors.surface} style={styles.boldText}>
            Call Tele-MANAS (14416)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleCallEmergency}
          activeOpacity={0.8}
        >
          <Text variant="small" color={colors.ink} style={styles.boldText}>
            Emergency Services (112)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.danger,
    borderRadius: radius.card,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  header: {
    marginBottom: spacing.xs,
  },
  badge: {
    textTransform: "uppercase",
  },
  title: {
    marginBottom: spacing.xs,
  },
  body: {
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.danger,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  boldText: {
    fontWeight: "700",
  },
});
