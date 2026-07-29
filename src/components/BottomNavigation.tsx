import { NavLink } from "react-router-dom";
import { useWarRoom } from "../features/war-room/WarRoomProvider";

const baseDestinations = [
  { to: "/", label: "Home", end: true },
  { to: "/rankings", label: "Rankings", end: false },
  { to: "/picks", label: "Picks", end: false },
  { to: "/play", label: "Play", end: false },
] as const;

const warRoomDestination = { to: "/war-room", label: "War Room", end: false } as const;

export function BottomNavigation() {
  const warRoom = useWarRoom();
  const destinations = warRoom.status === "eligible"
    ? [...baseDestinations, warRoomDestination]
    : baseDestinations;
  const unreadLabel = warRoom.unreadCount > 99 ? "99+" : String(warRoom.unreadCount);

  return (
    <nav
      className="bottom-nav"
      aria-label="Primary navigation"
      style={{ gridTemplateColumns: `repeat(${destinations.length}, minmax(0, 1fr))` }}
    >
      {destinations.map((destination) => (
        <NavLink
          key={destination.to}
          to={destination.to}
          end={destination.end}
          className={({ isActive }) => (isActive ? "bottom-nav__item is-active" : "bottom-nav__item")}
        >
          <span className="bottom-nav__indicator" aria-hidden="true" />
          <span>{destination.label}</span>
          {destination.to === "/war-room" && warRoom.unreadCount > 0 ? (
            <b
              className="bottom-nav__badge"
              aria-label={`${unreadLabel} unread War Room message${warRoom.unreadCount === 1 ? "" : "s"}`}
            >
              {unreadLabel}
            </b>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
