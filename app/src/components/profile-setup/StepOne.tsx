import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Input, Text } from "../ui/index.js";
import { colors, spacing } from "../../theme/index.js";
import { haptics } from "../../lib/haptics.js";

export const avatarColors = [
  colors.primary,
  colors.mint,
  colors.peach,
  colors.sky,
  colors.mood.okay,
  colors.mood.awful,
];

interface StepOneProps {
  name: string;
  setName: (name: string) => void;
  avatarColor: string;
  setAvatarColor: (col: string) => void;
  onNext: () => void;
}

export function StepOne({
  name,
  setName,
  avatarColor,
  setAvatarColor,
  onNext,
}: StepOneProps) {
  return (
    <Card style={styles.card}>
      <Input
        label="What should Sol call you?"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
      />
      <Text variant="small" color={colors.inkSoft} style={styles.label}>
        Choose Sol&apos;s colour
      </Text>
      <View style={styles.paletteRow}>
        {avatarColors.map((col) => (
          <Pressable
            key={col}
            onPress={() => {
              haptics.select();
              setAvatarColor(col);
            }}
            style={[
              styles.swatch,
              { backgroundColor: col },
              avatarColor === col && styles.swatchSelected,
            ]}
          />
        ))}
      </View>
      <Button title="Next: Set Goals" onPress={onNext} style={styles.actionBtn} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.base },
  label: { marginBottom: spacing.sm },
  paletteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: { borderColor: colors.ink },
  actionBtn: { marginTop: spacing.sm },
});
