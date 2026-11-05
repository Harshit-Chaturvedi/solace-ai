import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "../ui/index.js";
import { spacing } from "../../theme/index.js";

export const availableGoals = [
  "Reduce stress",
  "Sleep better",
  "Feel happier",
  "Build habits",
  "Manage anxiety",
  "Be kinder to myself",
];

interface StepTwoProps {
  selectedGoals: string[];
  toggleGoal: (goal: string) => void;
  onNext: () => void;
}

export function StepTwo({ selectedGoals, toggleGoal, onNext }: StepTwoProps) {
  return (
    <Card style={styles.card}>
      <Text variant="bodyBold" style={styles.cardHeading}>
        Choose what you&apos;d like to focus on:
      </Text>
      <View style={styles.chipGrid}>
        {availableGoals.map((g) => (
          <Chip
            key={g}
            label={g}
            selected={selectedGoals.includes(g)}
            onPress={() => toggleGoal(g)}
            style={styles.chipSpacing}
          />
        ))}
      </View>
      <Button
        title="Next: Tone & Reminders"
        onPress={onNext}
        style={styles.actionBtn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.base },
  cardHeading: { marginBottom: spacing.md },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.xl,
  },
  chipSpacing: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionBtn: { marginTop: spacing.sm },
});
