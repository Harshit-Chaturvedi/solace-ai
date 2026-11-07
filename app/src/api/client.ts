import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const TOKEN_KEY = "solace_jwt_token";

export async function getStoredToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // secure store write error
  }
}

export async function clearStoredToken(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // secure store delete error
  }
}

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { timeoutMs = 30000, ...fetchOptions } = options;
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL.replace(/\/$/, "")}${normalizedPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: fetchOptions.signal || controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error)?.name === "AbortError") {
      throw new ApiError(
        "TIMEOUT",
        "Sol is taking longer than usual. Please try again.",
        408,
      );
    }
    throw new ApiError(
      "NETWORK_ERROR",
      (err as Error)?.message || "Network request failed",
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // non-json body
  }

  if (!res.ok) {
    const errorObj = data?.error as { code?: string; message?: string } | undefined;
    const code = errorObj?.code || `HTTP_${res.status}`;
    const message = errorObj?.message || res.statusText || "Something went wrong";
    throw new ApiError(code, message, res.status);
  }

  return (data as T) ?? ({} as T);
}
