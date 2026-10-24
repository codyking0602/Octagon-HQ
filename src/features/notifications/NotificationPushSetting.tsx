import { useState } from "react";
import { requestNotificationDevicePermission } from "./notificationDevicePush";
import { notificationSportLabel, pushNotificationSports } from "./notificationModel";
import { useNotifications } from "./NotificationProvider";

/** Shared control: the bell owns the primary settings, Profile remains a shortcut. */
export function NotificationPushSetting({ compact = false }: { compact?: boolean }) {
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
  const sportBusy = notifications.pushSportStatus !== "ready";
  const allSelected = pushNotificationSports.every((sport) => notifications.pushSports[sport]);
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
      // On iOS the permission request must begin during the original tap.
      await requestNotificationDevicePermission();
    } catch {
      // The canonical provider reports permission denied/registration failures.
    }
    await notifications.enableDevicePush();
  }

  const detail = readiness.isIos && !readiness.installed
    ? "Add The HQ to your Home Screen, then open it to enable phone alerts."
    : effectiveStatus === "blocked"
      ? "Allow The HQ notifications in your device settings. Your in-app inbox still works."
      : effectiveStatus === "unsupported"
        ? "This browser cannot receive push alerts. Your in-app inbox still works."
        : effectiveStatus === "error" && readiness.permission === "default"
          ? "Tap the switch again to allow notifications on this device."
          : effectiveStatus === "error" && readiness.permission === "granted"
            ? "Permission was granted, but registration failed. Tap the switch to retry."
            : effectiveStatus === "error"
              ? "Connection failed. In-app notifications are still available."
              : isOn
                ? "Phone alerts are on for this device. Select which sports can send push."
                : "Phone alerts are off on this device. Your in-app inbox is always available.";

  return (
    <section
      className={`surface-card member-profile-push-setting notification-push-control${compact ? " notification-push-control--compact" : ""}`}
      aria-labelledby="profile-push-title"
    >
      <div className="notification-push-control__top">
        <div className="member-profile-push-setting__copy">
          <p className="eyebrow">PUSH SETTINGS</p>
          <h2 id="profile-push-title">Phone notifications</h2>
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
      </div>
      <div className="notification-push-control__sports">
        <div className="notification-push-control__sports-heading">
          <strong>Sports that can send push</strong>
          <small>Applies to your connected devices. In-app notifications are unaffected.</small>
        </div>
        <div className="notification-push-control__choices" role="group" aria-label="Sports for push notifications">
          <button
            type="button"
            className={`notification-push-sport${allSelected ? " is-selected" : ""}`}
            aria-pressed={allSelected}
            disabled={sportBusy}
            onClick={() => void notifications.updatePushSports("all", !allSelected)}
          >
            All sports
          </button>
          {pushNotificationSports.map((sport) => (
            <button
              key={sport}
              type="button"
              className={`notification-push-sport${notifications.pushSports[sport] ? " is-selected" : ""}`}
              data-hq-theme={sport}
              aria-pressed={notifications.pushSports[sport]}
              disabled={sportBusy}
              onClick={() => void notifications.updatePushSports(sport, !notifications.pushSports[sport])}
            >
              {notificationSportLabel(sport)}
            </button>
          ))}
        </div>
        {notifications.pushSportStatus === "error" ? (
          <button type="button" className="notification-push-control__retry"
            onClick={() => void notifications.refreshPushSports()}>
            Sport settings could not load or save. Retry
          </button>
        ) : null}
        {notifications.pushSportStatus === "loading" ? (
          <small role="status">Loading sport preferences…</small>
        ) : null}
      </div>
    </section>
  );
}
