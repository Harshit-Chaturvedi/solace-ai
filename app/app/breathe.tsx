import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { Screen } from "../src/components/ui/Screen.js";
import { Text } from "../src/components/ui/Text.js";
import { Button } from "../src/components/ui/Button.js";
import { BreathingCircle } from "../src/components/breathe/BreathingCircle.js";
import { logActivity } from "../src/api/activities.js";
import { colors } from "../src/theme/colors.js";
import { spacing, radius } from "../src/theme/spacing.js";
import { haptics } from "../src/lib/haptics.js";
import { SolMascot } from "../src/components/Sol/SolMascot.js";

type PatternType = "box" | "478" | "calm";

interface Step {
  label: string;
  phase: "inhale" | "hold" | "exhale" | "rest";
  seconds: number;
}

const PATTERNS: Record<PatternType, Step[]> = {
  box: [
    { label: "Inhale", phase: "inhale", seconds: 4 },
    { label: "Hold", phase: "hold", seconds: 4 },
    { label: "Exhale", phase: "exhale", seconds: 4 },
    { label: "Hold", phase: "hold", seconds: 4 },
  ],
  478: [
    { label: "Inhale", phase: "inhale", seconds: 4 },
    { label: "Hold", phase: "hold", seconds: 7 },
    { label: "Exhale", phase: "exhale", seconds: 8 },
  ],
  calm: [
    { label: "Inhale", phase: "inhale", seconds: 4 },
    { label: "Exhale", phase: "exhale", seconds: 6 },
  ],
};

export default function BreatheScreen(): React.JSX.Element {
  useKeepAwake();
  const router = useRouter();
  const params = useLocalSearchParams<{ pattern?: string; minutes?: string }>();

  const selectedPattern: PatternType =
    params.pattern === "478" || params.pattern === "calm" ? params.pattern : "box";
  const targetMinutes = Math.max(Number(params.minutes) || 2, 1);
  const targetTotalSeconds = targetMinutes * 60;

  const steps = PATTERNS[selectedPattern];
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeftInStep, setSecondsLeftInStep] = useState(steps[0].seconds);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (isPaused || isFinished) return;

    const timer = setInterval(() => {
      setElapsedTotal((prev) => {
        const next = prev + 1;
        if (next >= targetTotalSeconds) {
          finishSession(next);
        }
        return next;
      });

      setSecondsLeftInStep((prev) => {
        if (prev <= 1) {
          haptics.tap();
          setStepIndex((idx) => {
            const nextIdx = (idx + 1) % steps.length;
            setSecondsLeftInStep(steps[nextIdx].seconds);
            return nextIdx;
          });
          return steps[(stepIndex + 1) % steps.length].seconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isFinished, stepIndex, steps, targetTotalSeconds]);

  const finishSession = async (totalSeconds: number) => {
    setIsFinished(true);
    haptics.success();
    try {
      await logActivity({
        type: "breathing",
        durationSeconds: totalSeconds,
        meta: { pattern: selectedPattern },
      });
    } catch {
      // ignore network errors on finish
    }
  };

  const handleEndEarly = () => {
    finishSession(elapsedTotal);
  };

  if (isFinished) {
    return (
      <Screen style={styles.centerScreen}>
        <View style={styles.successCard}>
          <SolMascot size={100} expression="calm" />
          <Text variant="h1" color={colors.ink} style={styles.successTitle}>
            Breathing Complete
          </Text>
          <Text variant="body" color={colors.inkSoft} style={styles.successBody}>
            You spent {Math.max(Math.round(elapsedTotal / 60), 1)} minute(s) centering
            yourself. Carry this stillness with you.
          </Text>
          <Button
            title="Done"
            onPress={() => router.back()}
            style={styles.doneButton}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEndEarly} activeOpacity={0.7}>
          <Text variant="bodyMedium" color={colors.inkSoft}>
            End
          </Text>
        </TouchableOpacity>
        <Text variant="h3" color={colors.ink}>
          {selectedPattern.toUpperCase()} Breathing
        </Text>
        <TouchableOpacity
          onPress={() => setIsPaused((p) => !p)}
          activeOpacity={0.7}
        >
          <Text variant="bodyMedium" color={colors.primary}>
            {isPaused ? "Resume" : "Pause"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <Text variant="display" color={colors.ink} style={styles.stepLabel}>
          {currentStep.label}
        </Text>
        <Text variant="h2" color={colors.primary} style={styles.countdown}>
          {secondsLeftInStep}s
        </Text>

        <BreathingCircle
          phase={currentStep.phase}
          durationSeconds={currentStep.seconds}
        />

        <Text variant="caption" color={colors.inkSoft}>
          {Math.floor(elapsedTotal / 60)}:
          {(elapsedTotal % 60).toString().padStart(2, "0")} / {targetMinutes}:00
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
  },
  centerScreen: {
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    marginBottom: spacing.xs,
  },
  countdown: {
    marginBottom: spacing.md,
  },
  successCard: {
    alignItems: "center",
    padding: spacing.xl,
  },
  successTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  successBody: {
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  doneButton: {
    minWidth: 160,
  },
});
