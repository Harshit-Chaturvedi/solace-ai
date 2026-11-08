import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Screen, Text, Button, Card, Input, Chip } from "../src/components/ui/index.js";
import { colors, spacing } from "../src/theme/index.js";
import { submitCheckin, type PostMoodResponse } from "../src/api/mood.js";
import { haptics } from "../src/lib/haptics.js";
import {
  MoodSelector,
  moodConfig,
  type MoodKey,
} from "../src/components/checkin/MoodSelector.js";
import { CheckinSuccess } from "../src/components/checkin/CheckinSuccess.js";

const emotionOptions = [
  "Anxious",
  "Grateful",
  "Tired",
  "Hopeful",
  "Overwhelmed",
  "Peaceful",
  "Lonely",
  "Motivated",
  "Stressed",
  "Content",
];

export default function CheckinScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3 | "success">(1);
  const [selectedMood, setSelectedMood] = useState<MoodKey>("good");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostMoodResponse | null>(null);

  const handleSelectMood = (m: MoodKey) => {
    haptics.select();
    setSelectedMood(m);
  };

  const handleToggleEmotion = (em: string) => {
    haptics.select();
    setSelectedEmotions((prev) =>
      prev.includes(em)
        ? prev.filter((item) => item !== em)
        : prev.length < 5
          ? [...prev, em]
          : prev,
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitCheckin({
        mood: selectedMood,
        emotions: selectedEmotions,
        note: note.trim() || undefined,
      });
      setResult(res);
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ["homeData"] });
      setStep("success");
    } catch {
      // error saving checkin
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step !== "success" ? (
          <View>
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()} hitSlop={12}>
                <Text variant="bodyBold" color={colors.inkSoft}>
                  Cancel
                </Text>
              </Pressable>
              <Text variant="small" color={colors.inkSoft}>
                Step {step} of 3
              </Text>
            </View>

            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text variant="h1" center style={styles.title}>
                  How are you right now?
                </Text>
                <Text variant="body" color={colors.inkSoft} center style={styles.subtitle}>
                  Choose the face that matches your feelings today.
                </Text>

                <MoodSelector
                  selectedMood={selectedMood}
                  onSelectMood={handleSelectMood}
                />

                <Button
                  title="Next: Name Emotions"
                  onPress={() => setStep(2)}
                  style={styles.actionBtn}
                />
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text variant="h1" center style={styles.title}>
                  What words fit best?
                </Text>
                <Text variant="body" color={colors.inkSoft} center style={styles.subtitle}>
                  Select up to 5 emotions you are feeling.
                </Text>

                <Card style={styles.card}>
                  <View style={styles.chipGrid}>
                    {emotionOptions.map((em) => (
                      <Chip
                        key={em}
                        label={em}
                        selected={selectedEmotions.includes(em)}
                        onPress={() => handleToggleEmotion(em)}
                        style={styles.chipSpacing}
                      />
                    ))}
                  </View>
                </Card>

                <Button
                  title="Next: Add a Note"
                  onPress={() => setStep(3)}
                  style={styles.actionBtn}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text variant="h1" center style={styles.title}>
                  Anything on your mind?
                </Text>
                <Text variant="body" color={colors.inkSoft} center style={styles.subtitle}>
                  Jot down an optional thought or reflection.
                </Text>

                <Card style={styles.card}>
                  <Input
                    label="Optional note"
                    placeholder="e.g. Big presentation tomorrow, hoping it goes well..."
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                  />
                </Card>

                <Button
                  title="Save Check-in"
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.actionBtn}
                />
              </View>
            )}
          </View>
        ) : (
          <CheckinSuccess
            result={result}
            tint={moodConfig[selectedMood].tint}
            mood={selectedMood}
            note={note}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingVertical: spacing.base, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  stepContainer: { alignItems: "center" },
  title: { marginBottom: spacing.xs, paddingHorizontal: spacing.sm },
  subtitle: { marginBottom: spacing.lg, width: "100%", paddingHorizontal: spacing.sm },
  card: { width: "100%", marginBottom: spacing.xl },
  chipGrid: { flexDirection: "row", flexWrap: "wrap" },
  chipSpacing: { marginRight: spacing.sm, marginBottom: spacing.sm },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  actionBtn: { width: "100%", marginBottom: spacing.sm },
});
