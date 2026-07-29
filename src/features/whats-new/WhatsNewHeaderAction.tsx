import { NavLink } from "react-router-dom";
import { useWhatsNew } from "./WhatsNewProvider";

export function WhatsNewHeaderAction() {
  const whatsNew = useWhatsNew();
  const unreadLabel = whatsNew.unreadCount > 9 ? "9+" : String(whatsNew.unreadCount);

  return (
    <NavLink
      className={({ isActive }) => (
        isActive ? "app-whats-new-action is-active" : "app-whats-new-action"
      )}
      to="/whats-new"
      aria-label={whatsNew.unreadCount
        ? `What's New, ${unreadLabel} unread update${whatsNew.unreadCount === 1 ? "" : "s"}`
        : "What's New"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5 13.8 8l4.7.3-3.6 3 1.2 4.6-4.1-2.5-4.1 2.5 1.2-4.6-3.6-3L10.2 8Z" />
        <path d="M18.5 4.5v3M20 6h-3M5.5 17v2.5M6.75 18.25h-2.5" />
      </svg>
      <span>What&apos;s New</span>
      {whatsNew.unreadCount > 0 ? (
        <b className="app-whats-new-action__badge">{unreadLabel}</b>
      ) : null}
    </NavLink>
  );
}
