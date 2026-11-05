import { apiClient } from "./client.js";

export interface HomeData {
  greeting: string;
  todayMood: {
    mood: "great" | "good" | "okay" | "low" | "awful";
    score: number;
    emotions: string[];
    note?: string;
    solReply?: string;
  } | null;
  affirmation: string;
  suggestion: {
    title: string;
    reason: string;
    action: {
      type: string;
      params?: Record<string, unknown>;
    };
  };
  streak: {
    current: number;
    longest: number;
  };
  quickActions: Array<{
    id: string;
    title: string;
    route: string;
  }>;
}

export async function getHomeData(): Promise<HomeData> {
  return apiClient<HomeData>("/home", {
    method: "GET",
  });
}
