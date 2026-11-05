export interface StreakState {
  current: number;
  longest: number;
  lastActiveDate: Date | null;
}

export function formatLocalDate(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

export function calculateNewStreak(
  prevStreak: StreakState | undefined,
  timezone: string,
  now: Date = new Date(),
): StreakState {
  const current = prevStreak?.current || 0;
  const longest = prevStreak?.longest || 0;
  const lastActiveDate = prevStreak?.lastActiveDate
    ? new Date(prevStreak.lastActiveDate)
    : null;

  const userTimezone = timezone || "Asia/Kolkata";
  const todayStr = formatLocalDate(now, userTimezone);

  if (lastActiveDate) {
    const lastStr = formatLocalDate(lastActiveDate, userTimezone);

    // Already checked in today -> keep streak without double counting
    if (lastStr === todayStr) {
      return {
        current: Math.max(1, current),
        longest: Math.max(1, longest, current),
        lastActiveDate: now,
      };
    }

    // Check if yesterday
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = formatLocalDate(yesterday, userTimezone);

    if (lastStr === yesterdayStr) {
      const newCurrent = current + 1;
      return {
        current: newCurrent,
        longest: Math.max(longest, newCurrent),
        lastActiveDate: now,
      };
    }
  }

  // First time or missed day
  const newCurrent = 1;
  return {
    current: newCurrent,
    longest: Math.max(longest, newCurrent),
    lastActiveDate: now,
  };
}
