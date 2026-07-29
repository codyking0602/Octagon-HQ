import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  formatNotificationAge,
  notificationCategoryLabel,
  notificationCategoryMark,
  type NotificationItem,
} from "./notificationModel";
import { useNotifications } from "./NotificationProvider";

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

      {notifications.error ? (
        <div className="notification-error" role="status">{notifications.error}</div>
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
      ) : notifications.status === "loading" && !notifications.items.length ? (
        <section className="surface-card notification-empty">
          <strong>Loading notifications…</strong>
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
    </div>
  );
}
