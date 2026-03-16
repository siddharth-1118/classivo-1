"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase-custom";

let browserClient: SupabaseClient<Database> | null = null;

const logSupabase = (...args: unknown[]) => {
  if (typeof console !== "undefined") {
    console.log("[supabase]", ...args);
  }
};

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") {
    logSupabase("getSupabaseBrowserClient called on server; returning null");
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const serviceKey = (process.env.NEXT_PUBLIC_SERVICE_KEY ?? "").trim();

  if (!url || !serviceKey) {
    logSupabase("Missing Supabase credentials", {
      hasUrl: Boolean(url),
      hasServiceKey: Boolean(serviceKey),
    });
    return null;
  }

  browserClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-Classivo-calendar-client": "supabase-browser",
      },
    },
  });

  logSupabase("Supabase browser client initialised", { url });

  return browserClient;
}

