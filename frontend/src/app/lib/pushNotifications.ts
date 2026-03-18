export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported by the browser.');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification');
  }

  // Register or get existing service worker
  const registration = await navigator.serviceWorker.register('/sw.js');
  
  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;

  // Get public key
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicVapidKey) {
    throw new Error('VAPID public key not found in environment');
  }

  // Convert VAPID key for PushManager
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const applicationServerKey = urlBase64ToUint8Array(publicVapidKey);

  // Subscribe
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  // Send subscription to backend
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
  const token = localStorage.getItem('classivo_token');
  
  const response = await fetch(`${apiBase}/api/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to save subscription on server');
  }

  return true;
}
