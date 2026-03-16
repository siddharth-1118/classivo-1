"use client";

export type AuthEventType = "login" | "logout";

export type AuthEventPayload = {
  type: AuthEventType;
  timestamp: number;
};

const AUTH_EVENT_KEY = "Classivo:auth-event";

const safeParsePayload = (value: string | null): AuthEventPayload | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as AuthEventPayload;
    if (parsed && (parsed.type === "login" || parsed.type === "logout")) {
      return parsed;
    }
  } catch {
    /* ignore malformed payload */
  }
  return null;
};

export function emitAuthEvent(type: AuthEventType) {
  if (typeof window === "undefined") return;
  const payload: AuthEventPayload = { type, timestamp: Date.now() };
  const serialized = JSON.stringify(payload);
  try {
    window.localStorage.setItem(AUTH_EVENT_KEY, serialized);
  } catch {
    // localStorage might be unavailable (Safari private mode etc.)
  }
  window.dispatchEvent(new CustomEvent<AuthEventPayload>(AUTH_EVENT_KEY, { detail: payload }));
}

export function listenAuthEvents(handler: (payload: AuthEventPayload) => void) {
  if (typeof window === "undefined") return () => {};

  const customHandler = (event: Event) => {
    const detail = (event as CustomEvent<AuthEventPayload>).detail;
    if (!detail) return;
    handler(detail);
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key !== AUTH_EVENT_KEY) return;
    const payload = safeParsePayload(event.newValue ?? null);
    if (!payload) return;
    handler(payload);
  };

  window.addEventListener(AUTH_EVENT_KEY, customHandler as EventListener);
  window.addEventListener("storage", storageHandler);

  return () => {
    window.removeEventListener(AUTH_EVENT_KEY, customHandler as EventListener);
    window.removeEventListener("storage", storageHandler);
  };
}

