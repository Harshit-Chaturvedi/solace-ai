import { apiClient } from './client';

export interface ActivitySuggestion {
  type: 'breathing' | 'breathe' | 'affirmation' | 'checkin' | 'crisis';
  title?: string;
  description?: string;
  params?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

export interface MessageItem {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  sender?: 'user' | 'assistant';
  content: string;
  suggestion?: ActivitySuggestion | null;
  flagged?: 'crisis' | null;
  createdAt: string;
}

export interface ConversationItem {
  _id: string;
  title: string;
  lastMessagePreview?: string;
  lastMessageAt: string;
  messageCount: number;
  mood?: string;
}

export interface CreateConversationInput {
  firstMessage?: string;
  seed?: string | {
    mood: string;
    note?: string;
  };
}

export async function getConversations(): Promise<ConversationItem[]> {
  return apiClient<ConversationItem[]>('/conversations');
}

export async function getMessages(id: string): Promise<MessageItem[]> {
  return apiClient<MessageItem[]>(`/conversations/${id}/messages`);
}

export async function createConversation(input?: CreateConversationInput): Promise<ConversationItem> {
  return apiClient<ConversationItem>('/conversations', {
    method: 'POST',
    body: JSON.stringify(input || {}),
  });
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ userMessage: MessageItem; assistantMessage: MessageItem }> {
  return apiClient<{ userMessage: MessageItem; assistantMessage: MessageItem }>(
    `/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    }
  );
}

export async function renameConversation(id: string, title: string): Promise<ConversationItem> {
  return apiClient<ConversationItem>(`/conversations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  return apiClient<void>(`/conversations/${id}`, {
    method: 'DELETE',
  });
}
