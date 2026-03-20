"use client";

import { clearAuthToken, getAuthToken } from "./authStorage";
import { emitAuthEvent } from "./authSync";

const DEFAULT_SESSION_ERROR = "Session expired or invalid. Please login again.";

export function getSessionToken(): string | undefined {
  return getAuthToken();
}

export function expireSession(message = DEFAULT_SESSION_ERROR): string {
  clearAuthToken();
  emitAuthEvent("logout");
  return message;
}

