import { apiClient } from "./client.js";

export interface MoodEntry {
  _id: string;
  mood: "great" | "good" | "okay" | "low" | "awful";
  score: number;
  emotions: string[];
  note?: string;
  solReply?: string;
  createdAt: string;
}

export interface PostMoodResponse {
  mood: MoodEntry;
  streak: {
    current: number;
    longest: number;
  };
  solReply: string;
  achievementsUnlocked: string[];
}

export async function submitCheckin(payload: {
  mood: "great" | "good" | "okay" | "low" | "awful";
  emotions?: string[];
  note?: string;
}): Promise<PostMoodResponse> {
  return apiClient<PostMoodResponse>("/moods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMoods(range: 7 | 30 = 7): Promise<
  Array<{
    date: string;
    score: number;
    mood: string;
    emotions: string[];
  }>
> {
  return apiClient(`/moods?range=${range}`, {
    method: "GET",
  });
}
