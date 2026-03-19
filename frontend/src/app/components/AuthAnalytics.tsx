"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAuthToken } from "@/utils/authStorage";
import { isAnalyticsEnabled, trackEvent } from "@/lib/analytics";

const AUTH_SESSION_KEY = "classivo_analytics_auth_session";

export function AuthAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isAnalyticsEnabled()) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      return;
    }

    try {
      const existing = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (existing) {
        return;
      }

      trackEvent("authenticated_session", {
        path: pathname,
      });
      sessionStorage.setItem(AUTH_SESSION_KEY, "1");
    } catch {
      trackEvent("authenticated_session", {
        path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
