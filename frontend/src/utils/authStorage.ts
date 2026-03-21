"use client";

import Cookies from "js-cookie";

const TOKEN_KEY = "token";

function normalizeToken(value?: string): string | undefined {
  if (!value) return undefined;

  const normalized = value
    .replace(/[\r\n\t]/g, "")
    .trim()
    .replace(/^"+|"+$/g, "");

  if (!normalized || normalized === "undefined" || normalized === "null") {
    return undefined;
  }

  return normalized;
}

function readLocalToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = normalizeToken(window.localStorage.getItem(TOKEN_KEY) ?? undefined);
    if (!value) {
      return undefined;
    }
    return value;
  } catch {
    return undefined;
  }
}

export function getAuthToken(): string | undefined {
  const localToken = readLocalToken();
  if (localToken) {
    return localToken;
  }

  const cookieToken = normalizeToken(Cookies.get(TOKEN_KEY));
  if (cookieToken) {
    try {
      window.localStorage.setItem(TOKEN_KEY, cookieToken);
    } catch {
      // ignore storage sync failures
    }
    return cookieToken;
  }

  return undefined;
}

export function setAuthToken(token: string) {
  const normalizedToken = normalizeToken(token);
  if (!normalizedToken) {
    clearAuthToken();
    return;
  }

  try {
    window.localStorage.setItem(TOKEN_KEY, normalizedToken);
  } catch {
    // ignore storage failures and fall back to cookie
  }
  Cookies.set(TOKEN_KEY, normalizedToken, { expires: 30, path: "/" });
}

export function clearAuthToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage failures
  }
  Cookies.remove(TOKEN_KEY, { path: "/" });
  Cookies.remove(TOKEN_KEY);
}
