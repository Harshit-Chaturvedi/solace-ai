import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import Svg, { Path } from "react-native-svg";
import { Screen, Text, EmptyState } from "../src/components/ui/index.js";
import { ReminderCard } from "../src/components/reminders/ReminderCard.js";
import { CustomReminderModal } from "../src/components/reminders/CustomReminderModal.js";
import {
  getReminders,
  updateReminder,
  deleteReminder,
  createReminder,
  ReminderItem,
} from "../src/api/reminders.js";
import {
  syncReminders,
  requestNotificationPermissions,
  setupNotificationChannel,
} from "../src/lib/notifications.js";
import { colors, spacing, radius } from "../src/theme/index.js";
import { haptics } from "../src/lib/haptics.js";

const PRESET_REMINDERS = [
  { type: "checkin" as const, title: "Hi, it's Sol", body: "How's your heart today? Take a minute to check in.", time: "09:00" },
  { type: "breathe" as const, title: "Pause with me", body: "One minute of slow breathing?", time: "14:00" },
  { type: "affirmation" as const, title: "A little something for you", body: "Your affirmation for today is ready.", time: "21:00" },
];

export default function RemindersScreen(): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    Notifications.getPermissionsAsync().then(({ status }) => {
      setHasPermission(status === "granted");
    }).catch(() => setHasPermission(false));
  }, []);

  const { data: reminders = [], isLoading } = useQuery({ queryKey: ["reminders"], queryFn: getReminders });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => updateReminder(id, { enabled }),
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
    setHasPermission(granted);
    if (!granted) {
      Alert.alert("Notifications Disabled", "Please enable notifications in phone settings to receive gentle reminders.");
      return;
    }
    addPresetMutation.mutate({ ...preset, enabled: true });
  };

  const handleSaveCustom = async (data: { title: string; time: string; body: string }) => {
    setIsCustomOpen(false);
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    if (!granted) {
      Alert.alert("Notifications Disabled", "Please enable notifications in phone settings to receive gentle reminders.");
      return;
    }
    addPresetMutation.mutate({ ...data, type: "checkin", enabled: true });
  };

  const handleSendTest = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    if (!granted) {
      Alert.alert("Permission Needed", "Please enable notifications in phone settings to receive reminders.");
      return;
    }
    await setupNotificationChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hi, it's Sol",
        body: "How's your heart today? Take a minute to check in.",
        color: colors.primary,
        data: { url: "/checkin" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
        channelId: "checkin",
      },
    });
    haptics.success();
    Alert.alert("Test reminder scheduled", "Notification will arrive in 5 seconds!");
  };

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18L9 12L15 6" stroke={colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text variant="h3" color={colors.ink}>Reminders</Text>
        <TouchableOpacity onPress={() => setIsCustomOpen(true)} style={styles.backBtn} activeOpacity={0.7}>
          <Text variant="bodyBold" color={colors.primary}>+ Add</Text>
        </TouchableOpacity>
      </View>

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
        ListHeaderComponent={
          hasPermission === false ? (
            <View style={styles.permissionBanner}>
              <Text variant="caption" color={colors.danger} center>
                Notifications are disabled. Enable them in your phone's Settings to receive reminders.
              </Text>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <EmptyState title="No reminders yet" description="Set a gentle nudge to check in, breathe, or reflect throughout your day." />
            </View>
          ) : undefined
        }
        ListFooterComponent={
          <View style={styles.presetsSection}>
            <Text variant="small" color={colors.inkSoft} style={styles.sectionTitle}>Suggested Presets</Text>
            {PRESET_REMINDERS.map((preset) => (
              <TouchableOpacity key={preset.title} style={styles.presetItem} onPress={() => handleAddPreset(preset)} activeOpacity={0.7}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text variant="bodyBold" color={colors.ink}>{preset.title} ({preset.time})</Text>
                  <Text variant="caption" color={colors.inkSoft}>{preset.body}</Text>
                </View>
                <Text variant="bodyBold" color={colors.primary}>+ Add</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.testBtn} onPress={handleSendTest} activeOpacity={0.7}>
              <Text
                variant="bodyBold"
                color={colors.primary}
                center
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                maxFontSizeMultiplier={1.2}
              >
                Send test notification (5s)
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={[styles.list, { paddingBottom: 40 }]}
      />
      <CustomReminderModal visible={isCustomOpen} onClose={() => setIsCustomOpen(false)} onSave={handleSaveCustom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.primarySoft },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  permissionBanner: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger, padding: spacing.sm, borderRadius: radius.md, marginVertical: spacing.xs },
  list: { paddingVertical: spacing.sm },
  emptyContainer: { paddingVertical: spacing.lg },
  presetsSection: { paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.primarySoft },
  sectionTitle: { marginBottom: spacing.sm },
  presetItem: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.primarySoft },
  testBtn: { backgroundColor: colors.surface, paddingVertical: 12, paddingHorizontal: 16, minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary, marginTop: spacing.xs, justifyContent: "center", alignItems: "center" },
});
