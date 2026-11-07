import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Text } from "../../src/components/ui/index.js";
import { SolMascot } from "../../src/components/Sol/index.js";
import { colors, spacing } from "../../src/theme/index.js";
import { updateMe } from "../../src/api/auth.js";
import { createReminder } from "../../src/api/reminders.js";
import { syncReminders, requestNotificationPermissions } from "../../src/lib/notifications.js";
import { useAuthStore } from "../../src/store/auth.js";
import { haptics } from "../../src/lib/haptics.js";
import { StepOne } from "../../src/components/profile-setup/StepOne.js";
import { StepTwo } from "../../src/components/profile-setup/StepTwo.js";
import {
  StepThree,
  type Tone,
} from "../../src/components/profile-setup/StepThree.js";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(user?.name || "");
  const [avatarColor, setAvatarColor] = useState(
    user?.avatarColor || colors.primary,
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    user?.goals || [],
  );
  const [tone, setTone] = useState<Tone>(user?.companionTone || "gentle");
  const [checkinTime, setCheckinTime] = useState(user?.checkinTime || "09:00");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const updated = await updateMe({
        name: name.trim() || undefined,
        avatarColor,
        goals: selectedGoals,
        companionTone: tone,
        checkinTime,
        onboardingDone: true,
      });
      setUser(updated);
      let granted = false;
      try {
        granted = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Gentle reminders",
            "Allow notifications so Sol can check in with you?",
            [
              { text: "Not now", style: "cancel", onPress: () => resolve(false) },
              {
                text: "Allow",
                onPress: async () => {
                  const res = await requestNotificationPermissions();
                  resolve(res);
                },
              },
            ],
            { cancelable: false },
          );
        });
      } catch {
        granted = false;
      }

      if (granted) {
        try {
          const defaultRem = await createReminder({
            type: "checkin",
            title: "Daily Check-in",
            body: "How is your heart doing today? Take a moment with Sol.",
            time: checkinTime || "09:00",
            enabled: true,
          });
          await syncReminders([defaultRem]);
        } catch {
          // Non-blocking
        }
      }
      haptics.success();
      router.replace("/(tabs)/home");
    } catch {
      setErrorMsg("Could not save profile. Please try again.");
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
        <View style={styles.header}>
          <SolMascot
            size={90}
            expression={step === 1 ? "happy" : step === 2 ? "calm" : "excited"}
            moodTint={avatarColor}
          />
          <Text variant="h1" center style={styles.title}>
            {step === 1
              ? "Tell us about you"
              : step === 2
                ? "What brings you here?"
                : "Meet your companion"}
          </Text>
          <Text variant="body" color={colors.inkSoft} center style={styles.subtitle}>
            Step {step} of 3
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text variant="small" color={colors.danger} center>
              {errorMsg}
            </Text>
          </View>
        ) : null}

        {step === 1 && (
          <StepOne
            name={name}
            setName={setName}
            avatarColor={avatarColor}
            setAvatarColor={setAvatarColor}
            onNext={() => {
              if (!name.trim()) {
                setErrorMsg("Please enter your name");
                return;
              }
              setErrorMsg(null);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepTwo
            selectedGoals={selectedGoals}
            toggleGoal={toggleGoal}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepThree
            tone={tone}
            setTone={setTone}
            checkinTime={checkinTime}
            setCheckinTime={setCheckinTime}
            loading={loading}
            onFinish={handleFinish}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  errorBanner: {
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.danger,
  },
});
