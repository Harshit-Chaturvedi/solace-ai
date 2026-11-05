import { apiClient } from './client.js';

export interface ActivityLogInput {
  type: 'breathing' | 'affirmation' | 'journal' | 'meditation';
  durationSeconds?: number;
  meta?: Record<string, unknown>;
}

export interface ActivityItem {
  _id: string;
  userId: string;
  type: string;
  durationSeconds: number;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface AffirmationToday {
  text: string;
  affirmation?: string;
  author?: string;
  date: string;
}

export async function logActivity(input: ActivityLogInput): Promise<ActivityItem> {
  return apiClient<ActivityItem>('/activities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getTodayAffirmation(): Promise<AffirmationToday> {
  return apiClient<AffirmationToday>('/affirmations/today');
}

export async function getRecentAffirmations(): Promise<AffirmationToday[]> {
  return apiClient<AffirmationToday[]>('/affirmations/recent');
}
