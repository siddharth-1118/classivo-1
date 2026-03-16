"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";
import { listenAuthEvents, type AuthEventPayload } from "@/utils/authSync";

const PROTECTED_PREFIX = "/app";
const AUTH_PREFIX = "/auth";
const AUTH_ALLOW_LIST = ["/auth/logout", "/auth/login", "/auth/logout/"];

const redirectTo = (path: string) => {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  
  // Normalize paths by removing trailing slashes for comparison
  const normalize = (p: string) => p.replace(/\/$/, "") || "/";
  
  if (normalize(currentPath) === normalize(path)) {
    return;
  }
  window.location.href = path;
};

const normalizePath = (p: string) => p === "/" ? p : p.replace(/\/+$/, "");

const enforceRouteForState = (hasToken: boolean, forceReload = false) => {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  const pathname = normalizePath(currentPath || "/");
  const onProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const onAuthRoute = pathname.startsWith(AUTH_PREFIX);
  const isRoot = pathname === "/";
  
  const isLogoutPage = pathname === "/auth/logout" || pathname === "/auth/logout/";
  const authRouteAllowed = AUTH_ALLOW_LIST.some((route) => pathname.startsWith(normalizePath(route)));

  console.log("[AuthStateWatcher]", { 
    pathname, 
    hasToken, 
    onProtectedRoute, 
    onAuthRoute, 
    isRoot,
    authRouteAllowed 
  });

  if (hasToken) {
    if (onAuthRoute && !authRouteAllowed) {
      console.log("[AuthStateWatcher] Redirecting to /app/dashboard (Logged in on auth route)");
      redirectTo("/app/dashboard");
    }
  } else {
    // NOT logged in
    if (onProtectedRoute && !isLogoutPage) {
      console.log("[AuthStateWatcher] Redirecting to /auth/logout (Not logged in on protected route)");
      redirectTo("/auth/logout");
    }
  }
};

const isValidToken = (t: string | undefined | null) => {
  return !!t && t !== "undefined" && t !== "null";
};

const handleAuthPayload = (payload: AuthEventPayload) => {
  enforceRouteForState(payload.type === "login", true);
};

export function AuthStateWatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastToken = Cookies.get("token") ?? null;

    enforceRouteForState(isValidToken(lastToken));

    const unsubscribe = listenAuthEvents(handleAuthPayload);

    const checkToken = () => {
      const currentToken = Cookies.get("token") ?? null;
      if (currentToken === lastToken) return;
      lastToken = currentToken;
      enforceRouteForState(isValidToken(currentToken), true);
    };

    const focusHandler = () => checkToken();

    const visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        checkToken();
      }
    };

    const intervalId = window.setInterval(checkToken, 10000);

    window.addEventListener("focus", focusHandler);
    document.addEventListener("visibilitychange", visibilityHandler);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", focusHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, []);

  return null;
}
