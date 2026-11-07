import { apiClient } from "./client.js";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatarColor?: string;
  goals?: string[];
  companionTone?: "gentle" | "cheerful" | "direct";
  checkinTime?: string;
  timezone?: string;
  memoryEnabled?: boolean;
  onboardingDone?: boolean;
  expoPushToken?: string;
  streak?: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
  };
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 60000,
  });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 60000,
  });
}

export async function getMe(): Promise<UserProfile> {
  return apiClient<UserProfile>("/me", {
    method: "GET",
    timeoutMs: 60000,
  });
}

export async function updateMe(
  updates: Partial<UserProfile>,
): Promise<UserProfile> {
  return apiClient<UserProfile>("/me", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteMe(): Promise<void> {
  return apiClient<void>("/me", {
    method: "DELETE",
  });
}
