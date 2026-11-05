import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors, spacing } from "../../theme/index.js";
import { Text } from "./Text.js";
import { Button } from "./Button.js";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  actionTitle,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      <Text variant="h2" center style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text
          variant="body"
          color={colors.inkSoft}
          center
          style={styles.description}
        >
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: spacing.base,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  button: {
    minWidth: 160,
  },
});
