import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "../../theme/index.js";

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noShadow?: boolean;
}

export function Card({ children, style, noShadow = false }: CardProps) {
  return (
    <View style={[styles.card, !noShadow && shadows.soft, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.base,
  },
});
