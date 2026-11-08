import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../src/components/ui/Screen.js";
import { Text } from "../../src/components/ui/Text.js";
import { Button } from "../../src/components/ui/Button.js";
import { Card } from "../../src/components/ui/Card.js";
import { Chip } from "../../src/components/ui/Chip.js";
import { getMe, updateMe, deleteMe, UserProfile } from "../../src/api/auth.js";
import { useAuthStore } from "../../src/store/auth.js";
import { colors } from "../../src/theme/colors.js";
import { spacing, radius } from "../../src/theme/spacing.js";
import { haptics } from "../../src/lib/haptics.js";
import { SolMascot } from "../../src/components/Sol/SolMascot.js";

const TONES: Array<"gentle" | "cheerful" | "direct"> = ["gentle", "cheerful", "direct"];

export default function ProfileTab(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const updateToneMutation = useMutation({
    mutationFn: (companionTone: "gentle" | "cheerful" | "direct") => updateMe({ companionTone }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
      haptics.select();
    },
  });

  const handleSignOut = async () => {
    haptics.tap();
    await logout();
    router.replace("/(auth)/login" as any); // expo-router route
  };

  const handleDeleteAccount = () => {
    haptics.warn();
    Alert.alert(
      "Delete Account",
      "Are you sure? This will permanently delete your check-ins, conversations, and all personal data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMe();
              await logout();
              router.replace("/(auth)/login" as any); // expo-router route
            } catch {
              Alert.alert("Error", "Unable to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  const currentTone = user?.companionTone || "gentle";

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SolMascot size={72} expression="calm" />
          <Text variant="h1" color={colors.ink} style={styles.name}>
            {user?.name || "Your Profile"}
          </Text>
          <Text variant="body" color={colors.inkSoft}>
            {user?.email}
          </Text>
        </View>

        <Card style={styles.section}>
          <Text variant="bodyBold" color={colors.ink} style={styles.sectionTitle}>
            Sol's Personality Tone
          </Text>
          <View style={styles.toneRow}>
            {TONES.map((tone) => (
              <Chip
                key={tone}
                label={tone.charAt(0).toUpperCase() + tone.slice(1)}
                selected={currentTone === tone}
                onPress={() => updateToneMutation.mutate(tone)}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text variant="bodyBold" color={colors.ink} style={styles.sectionTitle}>
            Preferences & Data
          </Text>
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => {
              haptics.tap();
              router.push("/memories" as any); // expo-router route
            }}
            activeOpacity={0.7}
          >
            <Text variant="body" color={colors.ink}>
              Sol's Memory Settings
            </Text>
            <Text variant="bodyBold" color={colors.primaryStrong}>
              ›
            </Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.navRow}
            onPress={() => {
              haptics.tap();
              router.push("/reminders" as any); // expo-router route
            }}
            activeOpacity={0.7}
          >
            <Text variant="body" color={colors.ink}>
              Daily Reminders
            </Text>
            <Text variant="bodyBold" color={colors.primaryStrong}>
              ›
            </Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text variant="bodyBold" color={colors.ink} style={styles.sectionTitle}>
            Crisis & Helplines
          </Text>
          <Text variant="caption" color={colors.inkSoft} style={styles.helpText}>
            Solace is an AI wellness companion and is not a medical device. If you are
            experiencing a medical or emergency crisis, please call emergency services.
          </Text>
          <TouchableOpacity
            style={styles.helplineBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              haptics.tap();
              Linking.openURL("tel:14416");
            }}
            activeOpacity={0.7}
          >
            <Text variant="bodyBold" color={colors.dangerText}>
              Tele-MANAS Helpline (14416)
            </Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            title="Sign Out"
            variant="secondary"
            onPress={handleSignOut}
            style={styles.btn}
          />
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={styles.deleteLink}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text variant="small" color={colors.dangerText}>
              Delete Account & All Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
  },
  content: {
    paddingVertical: spacing.md,
    paddingBottom: 80,
    gap: spacing.md,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  name: {
    marginTop: spacing.sm,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  toneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primarySoft,
    marginVertical: spacing.xs,
  },
  helpText: {
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  helplineBtn: {
    minHeight: 48,
    justifyContent: "center",
  },
  actionButtons: {
    marginTop: spacing.md,
    alignItems: "center",
    gap: spacing.md,
  },
  btn: {
    width: "100%",
  },
  deleteLink: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
