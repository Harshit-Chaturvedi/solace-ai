import { apiClient } from './client.js';

export interface MoodSeriesPoint {
  date: string;
  mood: string;
  score: number;
}

export interface EmotionCount {
  emotion: string;
  count: number;
}

export interface InsightsData {
  range: number;
  moodSeries: MoodSeriesPoint[];
  streak: {
    current: number;
    longest: number;
    lastActiveDate?: string;
  };
  activitySummary?: {
    totalSessions: number;
    totalMinutes: number;
  };
  emotionCounts?: EmotionCount[];
  checkinCount?: number;
  averageScore?: number | null;
}

export async function getInsights(range = 7): Promise<InsightsData> {
  return apiClient<InsightsData>(`/insights?range=${range}`);
}
