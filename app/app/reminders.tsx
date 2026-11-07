import React, { useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { Screen } from "../src/components/ui/Screen.js";
import { Text } from "../src/components/ui/Text.js";
import { EmptyState } from "../src/components/ui/EmptyState.js";
import { ReminderCard } from "../src/components/reminders/ReminderCard.js";
import { CustomReminderModal } from "../src/components/reminders/CustomReminderModal.js";
import {
  getReminders,
  updateReminder,
  deleteReminder,
  createReminder,
  ReminderItem,
} from "../src/api/reminders.js";
import { syncReminders, requestNotificationPermissions } from "../src/lib/notifications.js";
import { colors } from "../src/theme/colors.js";
import { spacing, radius } from "../src/theme/spacing.js";
import { haptics } from "../src/lib/haptics.js";

const PRESET_REMINDERS = [
  {
    type: "checkin" as const,
    title: "Morning check-in",
    body: "How is your heart today? Sol is here whenever you need.",
    time: "09:00",
  },
  {
    type: "breathe" as const,
    title: "Midday pause",
    body: "Take 2 minutes to breathe and reset.",
    time: "14:00",
  },
  {
    type: "affirmation" as const,
    title: "Evening reflection",
    body: "A gentle thought before you rest.",
    time: "21:00",
  },
];

export default function RemindersScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: getReminders,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      updateReminder(id, { enabled }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ReminderItem[]>(["reminders"], (old = []) => {
        const next = old.map((r) => (r._id === updated._id ? updated : r));
        syncReminders(next);
        return next;
      });
      haptics.tap();
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteReminder,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ReminderItem[]>(["reminders"], (old = []) => {
        const next = old.filter((r) => r._id !== deletedId);
        syncReminders(next);
        return next;
      });
      haptics.warn();
    },
  });

  const addPresetMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: (created) => {
      queryClient.setQueryData<ReminderItem[]>(["reminders"], (old = []) => {
        const next = [...old, created];
        syncReminders(next);
        return next;
      });
      haptics.success();
    },
  });

  const handleAddPreset = async (preset: (typeof PRESET_REMINDERS)[0]) => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your phone settings to receive gentle reminders."
      );
      return;
    }
    addPresetMutation.mutate({ ...preset, enabled: true });
  };

  const handleSaveCustom = async (data: { title: string; time: string; body: string }) => {
    setIsCustomOpen(false);
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        "Notifications Disabled",
        "Please enable notifications in your phone settings to receive gentle reminders."
      );
      return;
    }
    addPresetMutation.mutate({ ...data, type: "checkin", enabled: true });
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke={colors.ink}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text variant="h3" color={colors.ink}>
          Reminders
        </Text>
        <TouchableOpacity
          onPress={() => setIsCustomOpen(true)}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text variant="bodyBold" color={colors.primary}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      {reminders.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No reminders yet"
            description="Set a gentle nudge to check in, breathe, or reflect throughout your day."
          />
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(r) => r._id}
          renderItem={({ item }) => (
            <ReminderCard
              item={item}
              onToggle={(enabled) => toggleMutation.mutate({ id: item._id, enabled })}
              onDelete={() => deleteMut.mutate(item._id)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.presetsSection}>
        <Text variant="small" color={colors.inkSoft} style={styles.sectionTitle}>
          Suggested Presets
        </Text>
        {PRESET_REMINDERS.map((preset) => (
          <TouchableOpacity
            key={preset.title}
            style={styles.presetItem}
            onPress={() => handleAddPreset(preset)}
            activeOpacity={0.7}
          >
            <View>
              <Text variant="bodyBold" color={colors.ink}>
                {preset.title} ({preset.time})
              </Text>
              <Text variant="caption" color={colors.inkSoft}>
                {preset.body}
              </Text>
            </View>
            <Text variant="bodyBold" color={colors.primary}>
              + Add
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CustomReminderModal
        visible={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        onSave={handleSaveCustom}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primarySoft,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  list: {
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    paddingVertical: spacing.lg,
  },
  presetsSection: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primarySoft,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  presetItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
});
