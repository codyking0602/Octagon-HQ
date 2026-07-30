import type { NotificationDeviceReadiness } from "./notificationModel";

interface InstallPromptChoice {
  outcome: "accepted" | "dismissed";
  platform: string;
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptChoice>;
}

type ReadinessListener = () => void;

let installPrompt: InstallPromptEvent | null = null;
const readinessListeners = new Set<ReadinessListener>();
let browserListenersInstalled = false;

function notifyReadinessListeners() {
  readinessListeners.forEach((listener) => listener());
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandaloneApp() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches === true
    || iosNavigator.standalone === true;
}

function installBrowserListeners() {
  if (browserListenersInstalled || typeof window === "undefined") return;
  browserListenersInstalled = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as InstallPromptEvent;
    notifyReadinessListeners();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    notifyReadinessListeners();
  });
}

function permissionState(): NotificationDeviceReadiness["permission"] {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return window.Notification.permission;
}

export function subscribeNotificationDeviceReadiness(listener: ReadinessListener) {
  installBrowserListeners();
  readinessListeners.add(listener);
  return () => {
    readinessListeners.delete(listener);
  };
}

export async function inspectNotificationDeviceReadiness(): Promise<NotificationDeviceReadiness> {
  installBrowserListeners();

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      status: "unsupported",
      secureContext: false,
      notificationsSupported: false,
      serviceWorkerSupported: false,
      pushSupported: false,
      serviceWorkerReady: false,
      installed: false,
      isIos: false,
      installPromptAvailable: false,
      permission: "unsupported",
    };
  }

  const secureContext = window.isSecureContext;
  const notificationsSupported = "Notification" in window;
  const serviceWorkerSupported = "serviceWorker" in navigator;
  const pushSupported = "PushManager" in window;
  let serviceWorkerReady = false;

  if (secureContext && serviceWorkerSupported) {
    try {
      const registration = await navigator.serviceWorker.register("/push-readiness-sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      serviceWorkerReady = Boolean(registration.active || registration.waiting || registration.installing);
    } catch {
      serviceWorkerReady = false;
    }
  }

  const supported = secureContext
    && notificationsSupported
    && serviceWorkerSupported
    && pushSupported;

  return {
    status: supported ? "ready" : "unsupported",
    secureContext,
    notificationsSupported,
    serviceWorkerSupported,
    pushSupported,
    serviceWorkerReady,
    installed: isStandaloneApp(),
    isIos: isIosDevice(),
    installPromptAvailable: Boolean(installPrompt),
    permission: permissionState(),
  };
}

export async function promptNotificationAppInstall() {
  if (!installPrompt) return false;
  const prompt = installPrompt;
  installPrompt = null;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  notifyReadinessListeners();
  return choice.outcome === "accepted";
}
