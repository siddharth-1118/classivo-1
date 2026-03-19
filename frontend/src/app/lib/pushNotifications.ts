import { getApiBase } from "@/lib/api";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  await navigator.serviceWorker.register("/sw.js");
  const registration = await navigator.serviceWorker.ready;

  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicVapidKey) {
    throw new Error("VAPID public key is missing in the frontend environment.");
  }

  const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const apiBase = getApiBase();
  const token = localStorage.getItem("classivo_token");
  const response = await fetch(`${apiBase}/api/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    let errorMessage = "Failed to save subscription on the server.";
    try {
      const payload = await response.json();
      if (payload?.error && typeof payload.error === "string") {
        errorMessage = payload.error;
      }
    } catch {
      // Ignore non-JSON errors and use the fallback message.
    }
    throw new Error(errorMessage);
  }

  return true;
}
