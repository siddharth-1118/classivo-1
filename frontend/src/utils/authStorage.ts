"use client";

import Cookies from "js-cookie";

const TOKEN_KEY = "token";

function readLocalToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(TOKEN_KEY) ?? undefined;
    if (!value || value === "undefined" || value === "null") {
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

  const cookieToken = Cookies.get(TOKEN_KEY);
  if (cookieToken && cookieToken !== "undefined" && cookieToken !== "null") {
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
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage failures and fall back to cookie
  }
  Cookies.set(TOKEN_KEY, token, { expires: 30, path: "/" });
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
