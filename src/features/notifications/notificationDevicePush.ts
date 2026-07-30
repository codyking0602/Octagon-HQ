export interface NotificationPushSubscriptionInput {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}

const workerPath = "/push-readiness-sw.js";

function base64UrlToBytes(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const normalized = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64Url(value: ArrayBuffer) {
  const bytes = new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function getNotificationServiceWorkerRegistration() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.register(workerPath, {
    scope: "/",
    updateViaCache: "none",
  });
  await navigator.serviceWorker.ready;
  return registration;
}

export async function getCurrentNotificationPushSubscription() {
  const registration = await getNotificationServiceWorkerRegistration();
  if (!registration || !("pushManager" in registration)) return null;
  return registration.pushManager.getSubscription();
}

export function serializeNotificationPushSubscription(
  subscription: PushSubscription,
): NotificationPushSubscriptionInput {
  const p256dh = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  if (!p256dh || !auth) throw new Error("This device did not provide valid push encryption keys.");

  return {
    endpoint: subscription.endpoint,
    p256dh: bytesToBase64Url(p256dh),
    auth: bytesToBase64Url(auth),
    userAgent: navigator.userAgent.slice(0, 500),
  };
}

export async function enableNotificationDevicePush(publicKey: string) {
  if (
    typeof window === "undefined"
    || !("Notification" in window)
    || !("PushManager" in window)
    || !window.isSecureContext
  ) throw new Error("This browser does not support device notifications.");

  const permission = window.Notification.permission === "granted"
    ? "granted"
    : await window.Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(permission === "denied"
      ? "Device notifications are blocked in this browser's settings."
      : "Device notification permission was not granted.");
  }

  const registration = await getNotificationServiceWorkerRegistration();
  if (!registration) throw new Error("The notification service worker is unavailable.");

  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(publicKey),
  });

  return {
    subscription,
    input: serializeNotificationPushSubscription(subscription),
  };
}

export async function disableNotificationDevicePush() {
  const subscription = await getCurrentNotificationPushSubscription();
  if (!subscription) return { endpoint: null, unsubscribed: true };
  const endpoint = subscription.endpoint;
  const unsubscribed = await subscription.unsubscribe();
  return { endpoint, unsubscribed };
}
