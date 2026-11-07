import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { colors } from '../theme/colors.js';

export interface ReminderSyncItem {
  _id?: string;
  type?: 'checkin' | 'breathe' | 'affirmation' | 'reflection';
  title: string;
  body: string;
  time: string; // HH:MM
  days?: number[];
  enabled: boolean;
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Gentle reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.primary,
    });
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

function getUrlForType(type?: string): string {
  switch (type) {
    case 'breathe':
      return '/breathe';
    case 'affirmation':
      return '/affirmation';
    case 'reflection':
      return '/chat/new';
    case 'checkin':
    default:
      return '/checkin';
  }
}

export async function syncReminders(reminders: ReminderSyncItem[]): Promise<void> {
  await setupNotificationChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;

    const [hourStr, minuteStr] = reminder.time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) continue;

    const url = getUrlForType(reminder.type);

    if (reminder.days && reminder.days.length > 0 && reminder.days.length < 7) {
      for (const day of reminder.days) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.body,
            data: { url },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: day + 1,
            hour,
            minute,
            channelId: 'reminders',
          },
        });
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: { url },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'reminders',
        },
      });
    }
  }
}
