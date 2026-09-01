import { useState } from "react";
import { requestNotificationDevicePermission } from "./notificationDevicePush";
import { useNotifications } from "./NotificationProvider";

export function NotificationPushSetting() {
  const notifications = useNotifications();
  const readiness = notifications.deviceReadiness;
  const push = notifications.devicePush;
  const [attemptedConnection, setAttemptedConnection] = useState(false);

  const effectiveStatus = push.status === "error"
    && !attemptedConnection
    && readiness.permission === "default"
    ? "off"
    : push.status;
  const isOn = effectiveStatus === "on";
  const busy = effectiveStatus === "checking"
    || effectiveStatus === "enabling"
    || effectiveStatus === "disabling";
  const unavailable = effectiveStatus === "unsupported"
    || effectiveStatus === "blocked"
    || (readiness.isIos && !readiness.installed);
  const statusLabel = {
    checking: "Checking",
    off: "Off",
    on: "On",
    enabling: "Turning on",
    disabling: "Turning off",
    blocked: "Blocked",
    unsupported: "Unavailable",
    error: "Needs retry",
  }[effectiveStatus];

  async function togglePush() {
    if (busy || unavailable) return;
    setAttemptedConnection(true);
    if (isOn) {
      await notifications.disableDevicePush();
      return;
    }

    try {
      // iPhone requires this prompt to begin directly from the member's tap.
      await requestNotificationDevicePermission();
    } catch {
      // Let the canonical provider translate denied or failed permission into shared state.
    }
    await notifications.enableDevicePush();
  }

  const detail = readiness.isIos && !readiness.installed
    ? "Add The HQ to your Home Screen, then open the installed app to turn this on."
    : effectiveStatus === "blocked"
      ? "Push notifications are blocked in this device's settings. Bell notifications still work."
      : effectiveStatus === "unsupported"
        ? "This browser cannot receive push notifications. Bell notifications still work."
        : effectiveStatus === "error" && readiness.permission === "default"
          ? "Tap the switch again. Your iPhone should ask for permission before The HQ connects."
          : effectiveStatus === "error" && readiness.permission === "granted"
            ? "Your iPhone allowed notifications, but The HQ could not finish registering this device. Tap the switch to retry."
            : effectiveStatus === "error"
              ? "The last connection attempt did not finish. Bell notifications still work."
              : isOn
                ? "Phone alerts are enabled for this device. Bell notifications remain available inside The HQ."
                : "Phone alerts are off. Bell notifications still appear inside The HQ.";

  return (
    <section className="surface-card member-profile-push-setting" aria-labelledby="profile-push-title">
      <div className="member-profile-push-setting__copy">
        <p className="eyebrow">NOTIFICATIONS</p>
        <h2 id="profile-push-title">Push notifications</h2>
        <p>{detail}</p>
      </div>
      <div className="member-profile-push-setting__control">
        <strong>{statusLabel}</strong>
        <button
          className={`member-profile-push-switch${isOn ? " is-on" : ""}`}
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label={`Push notifications: ${isOn ? "on" : "off"}`}
          disabled={busy || unavailable}
          onClick={() => void togglePush()}
        >
          <span aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
