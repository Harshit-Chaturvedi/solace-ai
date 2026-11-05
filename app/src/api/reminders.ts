import { apiClient } from './client.js';

export interface ReminderItem {
  _id: string;
  userId: string;
  type: 'checkin' | 'breathe' | 'affirmation' | 'reflection';
  title: string;
  body: string;
  time: string; // HH:MM
  days: number[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  type?: 'checkin' | 'breathe' | 'affirmation' | 'reflection';
  title: string;
  body: string;
  time: string;
  days?: number[];
  enabled?: boolean;
}

export async function getReminders(): Promise<ReminderItem[]> {
  return apiClient<ReminderItem[]>('/reminders');
}

export async function createReminder(input: CreateReminderInput): Promise<ReminderItem> {
  return apiClient<ReminderItem>('/reminders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateReminder(
  id: string,
  input: Partial<CreateReminderInput>
): Promise<ReminderItem> {
  return apiClient<ReminderItem>(`/reminders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteReminder(id: string): Promise<void> {
  return apiClient<void>(`/reminders/${id}`, {
    method: 'DELETE',
  });
}
