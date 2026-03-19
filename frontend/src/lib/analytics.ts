"use client";

import { track } from "@vercel/analytics";

const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true";

type AnalyticsValue = string | number | boolean | null;
type AnalyticsPayload = Record<string, AnalyticsValue | undefined>;

export function isAnalyticsEnabled() {
  return ENABLE_ANALYTICS;
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  if (!ENABLE_ANALYTICS || typeof window === "undefined") {
    return;
  }

  try {
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => typeof value !== "undefined")
    ) as Record<string, AnalyticsValue>;
    track(name, sanitizedPayload);
  } catch (error) {
    console.error("[analytics] Failed to track event", name, error);
  }
}
