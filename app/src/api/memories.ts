import { apiClient } from './client.js';

export interface MemoryItem {
  _id: string;
  userId: string;
  key: string;
  value: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMemories(): Promise<MemoryItem[]> {
  return apiClient<MemoryItem[]>('/memories');
}

export async function deleteMemory(id: string): Promise<void> {
  return apiClient<void>(`/memories/${id}`, {
    method: 'DELETE',
  });
}

export async function clearAllMemories(): Promise<void> {
  return apiClient<void>('/memories', {
    method: 'DELETE',
  });
}
