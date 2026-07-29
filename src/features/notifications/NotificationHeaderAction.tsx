import { NavLink } from "react-router-dom";
import { useNotifications } from "./NotificationProvider";

export function NotificationHeaderAction() {
  const notifications = useNotifications();
  const unreadLabel = notifications.unreadCount > 9
    ? "9+"
    : String(notifications.unreadCount);

  return (
    <NavLink
      className={({ isActive }) => (
        isActive ? "app-notification-action is-active" : "app-notification-action"
      )}
      to="/notifications"
      aria-label={notifications.unreadCount
        ? `Notifications, ${unreadLabel} unread`
        : "Notifications"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9.5a6 6 0 0 0-12 0c0 6.5-2.5 7-2.5 7h17S18 16 18 9.5Z" />
        <path d="M9.8 20h4.4" />
      </svg>
      <span className="sr-only">Notifications</span>
      {notifications.unreadCount > 0 ? (
        <b className="app-notification-action__badge">{unreadLabel}</b>
      ) : null}
    </NavLink>
  );
}
