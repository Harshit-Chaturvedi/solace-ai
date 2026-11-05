import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SolMascot, type SolExpression } from "../Sol/index.js";
import { Text } from "../ui/index.js";
import { colors, spacing } from "../../theme/index.js";

export type MoodKey = "great" | "good" | "okay" | "low" | "awful";

export const moodConfig: Record<
  MoodKey,
  { label: string; expression: SolExpression; tint: string }
> = {
  great: { label: "Great", expression: "excited", tint: colors.mood.great },
  good: { label: "Good", expression: "happy", tint: colors.mood.good },
  okay: { label: "Okay", expression: "calm", tint: colors.mood.okay },
  low: { label: "Low", expression: "concerned", tint: colors.mood.low },
  awful: { label: "Heavy", expression: "sleepy", tint: colors.mood.awful },
};

interface MoodSelectorProps {
  selectedMood: MoodKey;
  onSelectMood: (m: MoodKey) => void;
}

export function MoodSelector({
  selectedMood,
  onSelectMood,
}: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.moodCenter}>
        <SolMascot
          size={120}
          expression={moodConfig[selectedMood].expression}
          moodTint={moodConfig[selectedMood].tint}
        />
        <Text variant="h2" style={styles.moodLabel}>
          {moodConfig[selectedMood].label}
        </Text>
      </View>

      <View style={styles.facesRow}>
        {(["great", "good", "okay", "low", "awful"] as MoodKey[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => onSelectMood(m)}
            style={[
              styles.moodChoice,
              selectedMood === m && styles.moodChoiceSelected,
            ]}
          >
            <View
              style={[
                styles.moodIndicator,
                { backgroundColor: moodConfig[m].tint },
              ]}
            />
            <Text
              variant="caption"
              color={selectedMood === m ? colors.primary : colors.inkSoft}
            >
              {moodConfig[m].label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
  moodCenter: { alignItems: "center", marginBottom: spacing.xl },
  moodLabel: { marginTop: spacing.md },
  facesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: spacing.xxl,
  },
  moodChoice: {
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: spacing.md,
  },
  moodChoiceSelected: { backgroundColor: colors.primarySoft },
  moodIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
});
