import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../../theme/index.js";

export interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: readonly [string, string, ...string[]];
  edges?: Edge[];
  noPadding?: boolean;
}

export function Screen({
  children,
  style,
  gradient,
  edges = ["top", "left", "right"],
  noPadding = false,
}: ScreenProps) {
  const content = (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );

  if (gradient) {
    return (
      <LinearGradient colors={gradient} style={styles.container}>
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.container, styles.bg]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: spacing.screenPadding,
  },
});
