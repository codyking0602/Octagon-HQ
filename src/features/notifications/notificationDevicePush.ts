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

function sameBytes(left: ArrayBuffer | ArrayBufferView, right: Uint8Array) {
  const leftBytes = left instanceof ArrayBuffer
    ? new Uint8Array(left)
    : new Uint8Array(left.buffer, left.byteOffset, left.byteLength);
  if (leftBytes.byteLength !== right.byteLength) return false;
  return leftBytes.every((byte, index) => byte === right[index]);
}

function subscriptionUsesPublicKey(subscription: PushSubscription, publicKey: string) {
  const existingKey = subscription.options.applicationServerKey;
  if (!existingKey) return true;
  return sameBytes(existingKey, base64UrlToBytes(publicKey));
}

function requireNotificationSupport() {
  if (
    typeof window === "undefined"
    || !("Notification" in window)
    || !("PushManager" in window)
    || !window.isSecureContext
  ) throw new Error("This browser does not support device notifications.");
}

export async function requestNotificationDevicePermission() {
  requireNotificationSupport();
  const permission = window.Notification.permission === "granted"
    ? "granted"
    : await window.Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(permission === "denied"
      ? "Device notifications are blocked in this browser's settings."
      : "Device notification permission was not granted.");
  }
  return permission;
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

async function createNotificationPushSubscription(
  registration: ServiceWorkerRegistration,
  publicKey: string,
) {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(publicKey),
  });
}

async function usableExistingSubscription(
  registration: ServiceWorkerRegistration,
  publicKey: string,
) {
  const existing = await registration.pushManager.getSubscription();
  if (!existing) return null;
  try {
    serializeNotificationPushSubscription(existing);
    if (!subscriptionUsesPublicKey(existing, publicKey)) {
      await existing.unsubscribe().catch(() => false);
      return null;
    }
    return existing;
  } catch {
    await existing.unsubscribe().catch(() => false);
    return null;
  }
}

export async function enableNotificationDevicePush(publicKey: string) {
  await requestNotificationDevicePermission();

  const registration = await getNotificationServiceWorkerRegistration();
  if (!registration) throw new Error("The notification service worker is unavailable.");

  const existing = await usableExistingSubscription(registration, publicKey);
  if (existing) {
    return {
      subscription: existing,
      input: serializeNotificationPushSubscription(existing),
    };
  }

  let subscription: PushSubscription;
  try {
    subscription = await createNotificationPushSubscription(registration, publicKey);
  } catch {
    // Installed iPhone web apps can retain a half-created subscription after an interrupted
    // first attempt. Refresh the one service-worker owner and replace that stale subscription once.
    await registration.update().catch(() => undefined);
    const stale = await registration.pushManager.getSubscription().catch(() => null);
    if (stale) await stale.unsubscribe().catch(() => false);
    subscription = await createNotificationPushSubscription(registration, publicKey);
  }

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
