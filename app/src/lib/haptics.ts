import * as Haptics from "expo-haptics";

export const haptics = {
  tap: async (): Promise<void> => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics not available on current device/environment
    }
  },
  select: async (): Promise<void> => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics not available
    }
  },
  success: async (): Promise<void> => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics not available
    }
  },
  warn: async (): Promise<void> => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Haptics not available
    }
  },
};
