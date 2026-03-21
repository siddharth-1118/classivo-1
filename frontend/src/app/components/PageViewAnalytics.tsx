"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "@/lib/api";

const VISITOR_ID_KEY = "classivo_visitor_id";

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const id = `visitor_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  window.localStorage.setItem(VISITOR_ID_KEY, id);
  return id;
}

export function PageViewAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) {
      return;
    }

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return;
    }

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) {
      return;
    }

    void fetch(`${getApiBase()}/api/analytics/pageview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitorId,
        path: pathname,
        referrer: document.referrer || "",
        userAgent: navigator.userAgent || "",
      }),
    }).catch(() => {
      // Ignore analytics failures in the UI; this should never block navigation.
    });
  }, [pathname]);

  return null;
}
