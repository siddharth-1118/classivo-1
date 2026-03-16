"use client";

import { useEffect } from "react";

const UPDATE_MESSAGE = "Classivo_SW_UPDATED";
const SW_SKIP_WAITING = "SKIP_WAITING";
const SW_CLEAR_CACHES = "CLEAR_CACHES";

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let mounted = true;
    let registrationRef: ServiceWorkerRegistration | null = null;

    // Try to unregister extremely old workers that might be using different logic.
    async function cleanupOldWorkers() {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          // If the SW scriptURL doesn't match our expected /sw.js, unregister it.
          if (!r.active || !r.active.scriptURL.endsWith("/sw.js")) {
            try {
              await r.unregister();
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }
    }

    // Listen for controllerchange to know when a new worker has taken control
    function onControllerChange() {
      // Automatic reload removed as per user request
      console.log("Service Worker controller changed.");
    }

    // Register SW and handle lifecycle
    async function registerSW() {
      try {
        registrationRef = await navigator.serviceWorker.register("/sw.js");
        // If a worker is waiting (installed but not active), ask it to skipWaiting
        if (registrationRef.waiting) {
          registrationRef.waiting.postMessage({ type: SW_SKIP_WAITING });
        }

        // If an update is found (new worker installing)
        registrationRef.addEventListener?.("updatefound", () => {
          const newWorker = registrationRef?.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            // when installed and there's a controller, we can activate immediately
            if (newWorker.state === "installed") {
              // If there's an active controller (page controlled by old SW),
              // tell the new worker to skip waiting (become active) immediately.
              if (navigator.serviceWorker.controller) {
                try {
                  newWorker.postMessage({ type: SW_SKIP_WAITING });
                } catch {
                  // ignore
                }
              }
            }
          });
        });

        // Listen for messages from the SW (e.g. Classivo_SW_UPDATED)
        navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
          const data = event.data;
          if (!data || typeof data !== "object") return;

          if (data.type === UPDATE_MESSAGE) {
            // SW just finished activating and broadcasted the update.
            // Immediately reload to pick up new assets and behavior.
            try {
              // If there's a waiting worker, advance it
              if (registrationRef?.waiting) {
                registrationRef.waiting.postMessage({ type: SW_SKIP_WAITING });
                // controllerchange handler will reload for us
                return;
              }
            } catch {
              // fallback to reload
            }
            // fallback reload
            window.location.reload();
            return;
          }

          // Allow SW to ask client to clear caches (rare)
          if (data.type === SW_CLEAR_CACHES) {
            try {
              caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
            } catch {
              // ignore
            }
            return;
          }
        });

        // If the page is being controlled already, listen for controllerchange to reload
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
        }
      } catch (_err) {
        // Registration failed; ignore silently — site still works without SW
        // console.warn("SW registration failed", _err);
      }
    }

    (async () => {
      await cleanupOldWorkers();
      await registerSW();
    })();

    // cleanup
    return () => {
      mounted = false;
      try {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}

