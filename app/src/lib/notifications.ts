import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { colors } from '../theme/colors.js';

export interface ReminderSyncItem {
  _id?: string;
  type?: 'checkin' | 'breathe' | 'affirmation' | 'reflection' | 'selfcare' | 'custom';
  title: string;
  body: string;
  time: string; // HH:MM
  days?: number[];
  enabled: boolean;
}

export const NOTIFICATION_CHANNELS = {
  checkin: {
    id: 'checkin',
    name: "Sol's gentle check-ins",
    description: 'Gentle prompts to check in with how you are feeling.',
    importance: Notifications.AndroidImportance.HIGH,
  },
  affirmation: {
    id: 'affirmation',
    name: 'Daily affirmations',
    description: 'Your daily positive affirmation from Sol.',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
  breathing: {
    id: 'breathing',
    name: 'Breathing breaks',
    description: 'Short breathing exercises to reset and find calm.',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
  selfcare: {
    id: 'selfcare',
    name: 'Self-care nudges',
    description: 'Gentle self-care reminders.',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
  custom: {
    id: 'custom',
    name: 'Your reminders',
    description: 'Personal reminders you set for yourself.',
    importance: Notifications.AndroidImportance.DEFAULT,
  },
} as const;

export const DEFAULT_SOL_COPY: Record<string, { title: string; body: string }> = {
  checkin: {
    title: "Hi, it's Sol",
    body: "How's your heart today? Take a minute to check in.",
  },
  affirmation: {
    title: "A little something for you",
    body: "Your affirmation for today is ready.",
  },
  breathe: {
    title: "Pause with me",
    body: "One minute of slow breathing?",
  },
  breathing: {
    title: "Pause with me",
    body: "One minute of slow breathing?",
  },
  selfcare: {
    title: "Be kind to yourself",
    body: "A small act of self-care is waiting.",
  },
  custom: {
    title: "Gentle reminder",
    body: "Sol is here whenever you need a moment.",
  },
};

export function getChannelIdForType(type?: string): string {
  switch (type) {
    case 'checkin':
      return 'checkin';
    case 'affirmation':
      return 'affirmation';
    case 'breathe':
    case 'breathing':
      return 'breathing';
    case 'selfcare':
      return 'selfcare';
    default:
      return 'custom';
  }
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const channelConfigs = [
        NOTIFICATION_CHANNELS.checkin,
        NOTIFICATION_CHANNELS.affirmation,
        NOTIFICATION_CHANNELS.breathing,
        NOTIFICATION_CHANNELS.selfcare,
        NOTIFICATION_CHANNELS.custom,
        // Legacy fallback channel
        {
          id: 'reminders',
          name: 'Gentle reminders',
          description: 'Solace reminder notifications',
          importance: Notifications.AndroidImportance.HIGH,
        },
      ];

      for (const config of channelConfigs) {
        await Notifications.setNotificationChannelAsync(config.id, {
          name: config.name,
          description: config.description,
          importance: config.importance,
          vibrationPattern: [0, 150, 120, 150],
          lightColor: colors.primary,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          sound: 'default',
        });
      }
    } catch {
      // Non-blocking in Expo Go environment
    }
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

function getUrlForType(type?: string): string {
  switch (type) {
    case 'breathe':
    case 'breathing':
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
  try {
    await setupNotificationChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Non-blocking
  }

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;

    const [hourStr, minuteStr] = reminder.time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) continue;

    const url = getUrlForType(reminder.type);
    const channelId = getChannelIdForType(reminder.type);

    const defaultCopy = DEFAULT_SOL_COPY[reminder.type || ''] || DEFAULT_SOL_COPY.custom;
    const title = reminder.title?.trim() ? reminder.title : defaultCopy.title;
    const body = reminder.body?.trim() ? reminder.body : defaultCopy.body;

    try {
      if (reminder.days && reminder.days.length > 0 && reminder.days.length < 7) {
        for (const day of reminder.days) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              color: colors.primary,
              data: { url },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              weekday: day + 1,
              hour,
              minute,
              channelId,
            },
          });
        }
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            color: colors.primary,
            data: { url },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            channelId,
          },
        });
      }
    } catch {
      // Non-blocking in Expo Go environment
    }
  }
}
