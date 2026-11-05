import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "../ui/index.js";
import { spacing } from "../../theme/index.js";

export type Tone = "gentle" | "cheerful" | "direct";

interface StepThreeProps {
  tone: Tone;
  setTone: (tone: Tone) => void;
  checkinTime: string;
  setCheckinTime: (time: string) => void;
  loading: boolean;
  onFinish: () => void;
}

const times = ["08:00", "09:00", "12:00", "20:00", "21:30"];

export function StepThree({
  tone,
  setTone,
  checkinTime,
  setCheckinTime,
  loading,
  onFinish,
}: StepThreeProps) {
  return (
    <Card style={styles.card}>
      <Text variant="bodyBold" style={styles.cardHeading}>
        Sol&apos;s personality tone:
      </Text>
      <View style={styles.toneRow}>
        {(["gentle", "cheerful", "direct"] as Tone[]).map((t) => (
          <Chip
            key={t}
            label={t.charAt(0).toUpperCase() + t.slice(1)}
            selected={tone === t}
            onPress={() => setTone(t)}
            style={styles.chipSpacing}
          />
        ))}
      </View>

      <Text variant="bodyBold" style={styles.cardHeading}>
        Daily check-in reminder time:
      </Text>
      <View style={styles.timeRow}>
        {times.map((tm) => (
          <Chip
            key={tm}
            label={tm}
            selected={checkinTime === tm}
            onPress={() => setCheckinTime(tm)}
            style={styles.chipSpacing}
          />
        ))}
      </View>

      <Button
        title="Complete Setup"
        onPress={onFinish}
        loading={loading}
        style={styles.actionBtn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.base },
  cardHeading: { marginBottom: spacing.md },
  toneRow: { flexDirection: "row", marginBottom: spacing.lg },
  timeRow: {
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
