import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  formatNotificationAge,
  notificationCategoryLabel,
  notificationCategoryMark,
  type NotificationItem,
  type NotificationPreferenceKey,
} from "./notificationModel";
import { useNotifications } from "./NotificationProvider";

const preferenceOptions: Array<{
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}> = [
  {
    key: "picksReminders",
    title: "Picks reminders",
    description: "Finish-your-card and event-start timing.",
  },
  {
    key: "dailyChallengeReminders",
    title: "Daily Challenge",
    description: "The four-hours-left Find the Leader reminder.",
  },
  {
    key: "gameChallengeActivity",
    title: "Game challenges",
    description: "Challenges, accepts, results, and expiry alerts.",
  },
  {
    key: "warRoomActivity",
    title: "War Room activity",
    description: "Mentions, replies, and invite activity.",
  },
];

function NotificationCopy({ item }: { item: NotificationItem }) {
  return (
    <>
      <span
        className={`notification-item__mark notification-item__mark--${item.category}`}
        aria-hidden="true"
      >
        {notificationCategoryMark(item.category)}
      </span>
      <span className="notification-item__body">
        <span className="notification-item__meta">
          <small>{notificationCategoryLabel(item.category)}</small>
          <time dateTime={item.latestEventAt}>{formatNotificationAge(item.latestEventAt)}</time>
          {!item.isRead ? <b>NEW</b> : null}
        </span>
        <span className="notification-item__title">
          <strong>{item.title}</strong>
          {item.aggregateCount > 1 ? <b>×{item.aggregateCount}</b> : null}
        </span>
        <p>{item.summary}</p>
        {item.actionLabel ? <em>{item.actionLabel} →</em> : null}
      </span>
      {item.route ? <span className="notification-item__chevron" aria-hidden="true">›</span> : null}
    </>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const notifications = useNotifications();
  const copy = <NotificationCopy item={item} />;

  return (
    <article className={`notification-item${item.isRead ? " is-read" : " is-unread"}`}>
      {item.route ? (
        <Link
          className="notification-item__main"
          to={item.route}
          onClick={() => void notifications.markRead(item.id)}
        >
          {copy}
        </Link>
      ) : (
        <div className="notification-item__main">{copy}</div>
      )}
      {!item.isRead ? (
        <button
          className="notification-item__read"
          type="button"
          onClick={() => void notifications.markRead(item.id)}
        >
          Mark as read
        </button>
      ) : null}
    </article>
  );
}

function PreferenceSwitch({
  preferenceKey,
  title,
  description,
}: {
  preferenceKey: NotificationPreferenceKey;
  title: string;
  description: string;
}) {
  const notifications = useNotifications();
  const enabled = notifications.preferences[preferenceKey];
  const saving = notifications.preferenceStatus === "saving";

  return (
    <div className="notification-setting-row">
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <button
        className={`notification-switch${enabled ? " is-on" : ""}`}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${title}: ${enabled ? "on" : "off"}`}
        disabled={saving}
        onClick={() => void notifications.updatePreference(preferenceKey, !enabled)}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}

function DeviceReadinessCard() {
  const notifications = useNotifications();
  const readiness = notifications.deviceReadiness;
  const permissionLabel = {
    unsupported: "Unavailable",
    default: "Not requested",
    granted: "Allowed",
    denied: "Blocked",
  }[readiness.permission];

  const readyForFinalConnection = readiness.status === "ready"
    && readiness.serviceWorkerReady
    && readiness.installed;

  return (
    <section className="surface-card notification-settings-card notification-device-card">
      <div className="notification-settings-card__heading">
        <div>
          <p className="eyebrow">DEVICE READINESS</p>
          <h2>Device notifications</h2>
          <p>
            Device delivery is not active yet. This confirms whether Octagon HQ and this browser
            are ready for the final push connection.
          </p>
        </div>
        <b className="notification-roadmap-badge">PR 2 OF 3</b>
      </div>

      <div className="notification-readiness-grid">
        <span>
          <small>App mode</small>
          <strong>{readiness.installed ? "Installed" : "Browser mode"}</strong>
        </span>
        <span>
          <small>Push support</small>
          <strong>{readiness.status === "ready" ? "Supported" : "Unavailable"}</strong>
        </span>
        <span>
          <small>Permission</small>
          <strong>{permissionLabel}</strong>
        </span>
        <span>
          <small>Service worker</small>
          <strong>{readiness.serviceWorkerReady ? "Ready" : "Not ready"}</strong>
        </span>
      </div>

      {readiness.status === "checking" ? (
        <p className="notification-device-note">Checking this device…</p>
      ) : readiness.isIos && !readiness.installed ? (
        <p className="notification-device-note">
          On iPhone or iPad, use <strong>Share → Add to Home Screen</strong> first.
        </p>
      ) : readyForFinalConnection ? (
        <p className="notification-device-note is-ready">
          This device is ready for the final push connection. Permission has not been requested yet.
        </p>
      ) : readiness.status === "unsupported" ? (
        <p className="notification-device-note">
          This browser cannot complete the future device-push connection.
        </p>
      ) : (
        <p className="notification-device-note">
          Install Octagon HQ to complete device readiness before push delivery is added.
        </p>
      )}

      {readiness.installPromptAvailable && !readiness.installed ? (
        <button
          className="primary-action notification-install-action"
          type="button"
          onClick={() => void notifications.installApp()}
        >
          INSTALL APP
        </button>
      ) : null}
    </section>
  );
}

function NotificationSettings() {
  const notifications = useNotifications();

  return (
    <div className="notification-settings">
      <section className="surface-card notification-settings-card">
        <div className="notification-settings-card__heading">
          <div>
            <p className="eyebrow">PREFERENCES</p>
            <h2>What should reach you?</h2>
            <p>Optional reminders can be controlled without muting important account actions.</p>
          </div>
          {notifications.preferenceStatus === "saving" ? <b>Saving…</b> : null}
        </div>

        <div className="notification-setting-row is-locked">
          <span>
            <strong>Critical actions</strong>
            <small>
              Repicks, cancellations, recap corrections, account safety, and Cody-only control alerts.
            </small>
          </span>
          <b className="notification-always-on">ALWAYS ON</b>
        </div>

        {preferenceOptions.map((option) => (
          <PreferenceSwitch
            key={option.key}
            preferenceKey={option.key}
            title={option.title}
            description={option.description}
          />
        ))}
      </section>

      <DeviceReadinessCard />
    </div>
  );
}

export default function NotificationCenterPage() {
  const identity = useIdentity();
  const notifications = useNotifications();

  return (
    <div className="page notification-page">
      <section className="page-heading notification-page__heading">
        <div>
          <p className="eyebrow">YOUR OCTAGON HQ</p>
          <h1>Notifications</h1>
          <p>Personal updates, reminders, and actions from across the app.</p>
        </div>
        {notifications.unreadCount > 0 ? (
          <button
            className="notification-page__mark-all"
            type="button"
            onClick={() => void notifications.markAllRead()}
          >
            Mark all as read
          </button>
        ) : null}
      </section>

      {notifications.error && notifications.items.length ? (
        <div className="notification-error" role="status">
          Notifications could not refresh. The last available updates are shown below.
        </div>
      ) : null}

      {!identity.profile ? (
        <section className="surface-card notification-empty">
          <span className="notification-empty__bell" aria-hidden="true">♢</span>
          <strong>Sign in for notifications.</strong>
          <p>Mentions, Picks reminders, challenges, and account actions stay tied to your profile.</p>
          <button className="primary-action" type="button" onClick={identity.openDialog}>
            SIGN IN
          </button>
        </section>
      ) : (
        <>
          {notifications.status === "loading" && !notifications.items.length ? (
            <section className="surface-card notification-empty">
              <strong>Loading notifications…</strong>
            </section>
          ) : notifications.error && !notifications.items.length ? (
            <section className="surface-card notification-empty" role="status">
              <span className="notification-empty__bell" aria-hidden="true">!</span>
              <strong>Notifications are temporarily unavailable.</strong>
              <p>Octagon HQ could not reach the notification service. Try again shortly.</p>
              <button
                className="primary-action"
                type="button"
                onClick={() => void notifications.refresh()}
              >
                TRY AGAIN
              </button>
            </section>
          ) : !notifications.items.length ? (
            <section className="surface-card notification-empty">
              <span className="notification-empty__bell" aria-hidden="true">♢</span>
              <strong>You&apos;re caught up.</strong>
              <p>Actionable Octagon HQ updates will appear here.</p>
            </section>
          ) : (
            <section className="notification-list" aria-label="Notifications">
              {notifications.items.map((item) => <NotificationRow item={item} key={item.id} />)}
            </section>
          )}
          <NotificationSettings />
        </>
      )}
    </div>
  );
}
