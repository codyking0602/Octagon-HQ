import { useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { notificationDestination } from "./notificationDestination";
import {
  formatNotificationAge,
  notificationCategoryLabel,
  notificationCategoryMark,
  notificationSport,
  notificationSportLabel,
  pushNotificationSports,
  type NotificationItem,
  type NotificationSport,
} from "./notificationModel";
import { useNotifications } from "./NotificationProvider";
import { NotificationPushSetting } from "./NotificationPushSetting";

function NotificationCopy({
  item,
  route,
  sport,
}: {
  item: NotificationItem;
  route: string | null;
  sport: NotificationSport | null;
}) {
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
          {sport ? <b className="notification-item__sport">{notificationSportLabel(sport)}</b> : null}
          <small>{notificationCategoryLabel(item.category)}</small>
          <time dateTime={item.latestEventAt}>{formatNotificationAge(item.latestEventAt)}</time>
          {!item.isRead ? <b className="notification-item__new">NEW</b> : null}
        </span>
        <span className="notification-item__title">
          <strong>{item.title}</strong>
          {item.aggregateCount > 1 ? <b>×{item.aggregateCount}</b> : null}
        </span>
        <p>{item.summary}</p>
        {item.actionLabel ? <em>{item.actionLabel} →</em> : null}
      </span>
      {route ? <span className="notification-item__chevron" aria-hidden="true">›</span> : null}
    </>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const notifications = useNotifications();
  const route = notificationDestination(item);
  const sport = notificationSport(item);
  const copy = <NotificationCopy item={item} route={route} sport={sport} />;

  return (
    <article
      className={`notification-item${item.isRead ? " is-read" : " is-unread"}`}
      data-hq-theme={sport ?? undefined}
      data-notification-sport={sport ?? "universal"}
    >
      {route ? (
        <Link
          className="notification-item__main"
          to={route}
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
  const [sportFilter, setSportFilter] = useState<NotificationSport | "all">("all");
  const visibleItems = sportFilter === "all"
    ? notifications.items
    : notifications.items.filter((item) => notificationSport(item) === sportFilter);
  const hasReadNotifications = notifications.items.some((item) => item.isRead);

  return (
    <div className="page notification-page">
      <section className="page-heading notification-page__heading">
        <div>
          <p className="eyebrow">THE HQ</p>
          <h1>Notifications</h1>
          <p>UFC, Football, Baseball, Basketball, and account updates in one inbox.</p>
        </div>
        {notifications.unreadCount > 0 || hasReadNotifications ? (
          <div className="notification-page__actions">
            {notifications.unreadCount > 0 ? (
              <button
                className="notification-page__mark-all"
                type="button"
                onClick={() => void notifications.markAllRead()}
              >
                Mark all as read
              </button>
            ) : null}
            {hasReadNotifications ? (
              <button
                className="notification-page__mark-all"
                type="button"
                onClick={() => void notifications.clearRead()}
              >
                Clear read
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {notifications.status === "error" && notifications.items.length ? (
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
          <NotificationPushSetting compact />
          <div className="notification-page__filters" role="group" aria-label="Filter in-app notifications by sport">
            <button
              type="button"
              className={`notification-feed-filter${sportFilter === "all" ? " is-selected" : ""}`}
              aria-pressed={sportFilter === "all"}
              onClick={() => setSportFilter("all")}
            >
              All
            </button>
            {pushNotificationSports.map((sport) => (
              <button
                type="button"
                key={sport}
                data-hq-theme={sport}
                className={`notification-feed-filter${sportFilter === sport ? " is-selected" : ""}`}
                aria-pressed={sportFilter === sport}
                onClick={() => setSportFilter(sport)}
              >
                {notificationSportLabel(sport)}
              </button>
            ))}
          </div>
          {notifications.status === "loading" && !notifications.items.length ? (
            <section className="surface-card notification-empty">
              <strong>Loading notifications…</strong>
            </section>
          ) : notifications.status === "error" && !notifications.items.length ? (
            <section className="surface-card notification-empty" role="status">
              <span className="notification-empty__bell" aria-hidden="true">!</span>
              <strong>Notifications are temporarily unavailable.</strong>
              <p>The HQ could not reach the notification service. Try again shortly.</p>
              <button
                className="primary-action"
                type="button"
                onClick={() => void notifications.refresh()}
              >
                TRY AGAIN
              </button>
            </section>
          ) : !visibleItems.length ? (
            <section className="surface-card notification-empty">
              <span className="notification-empty__bell" aria-hidden="true">♢</span>
              <strong>{sportFilter === "all" ? "You’re caught up." : `No ${notificationSportLabel(sportFilter)} notifications yet.`}</strong>
              <p>{sportFilter === "all" ? "Actionable The HQ updates will appear here." : "Choose All to see your full notification history."}</p>
            </section>
          ) : (
            <section className="notification-list" aria-label="Notifications">
              {visibleItems.map((item) => <NotificationRow item={item} key={item.id} />)}
            </section>
          )}
        </>
      )}
    </div>
  );
}
