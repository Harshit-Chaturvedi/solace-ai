import React from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import { colors, radius, spacing } from "../../theme/index.js";
import { haptics } from "../../lib/haptics.js";
import { Text } from "./Text.js";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  const handlePress = () => {
    haptics.select();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}
    >
      <Text
        variant="small"
        color={selected ? colors.primary : colors.inkSoft}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.chip,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
  },
});
