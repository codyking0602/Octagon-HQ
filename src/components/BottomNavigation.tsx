import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { scrollPageToTop } from "../app/RouteScrollManager";
import { useWarRoom } from "../features/war-room/WarRoomProvider";

type NavigationIconName = "home" | "rankings" | "picks" | "play" | "war-room";

const baseDestinations = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/rankings", label: "Rankings", icon: "rankings", end: false },
  { to: "/picks", label: "Picks", icon: "picks", end: false },
  { to: "/play", label: "Play", icon: "play", end: false },
] as const;

const warRoomDestination = { to: "/war-room", label: "War Room", icon: "war-room", end: false } as const;

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const iconPaths = {
    home: (
      <>
        <path d="M3.5 10.5 12 3.5l8.5 7v9.75H14.8v-6.1H9.2v6.1H3.5Z" />
      </>
    ),
    rankings: (
      <>
        <path d="M8 4.25h8v4.5a4 4 0 0 1-8 0Z" />
        <path d="M8 6H4.5v1.5A3.5 3.5 0 0 0 8 11M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11M12 12.75v4M8.5 20.25h7M10 16.75h4" />
      </>
    ),
    picks: (
      <>
        <rect x="4" y="3.5" width="16" height="17" rx="2" />
        <path d="m7.5 9 1.75 1.75L12.5 7.5M7.5 15h9" />
      </>
    ),
    play: (
      <path d="m8 5 10 7-10 7Z" />
    ),
    "war-room": (
      <>
        <path d="M4 5h16v11H9l-5 4Z" />
        <path d="M8 9h8M8 12.5h5" />
      </>
    ),
  } satisfies Record<NavigationIconName, React.ReactNode>;

  return (
    <svg
      className="bottom-nav__icon"
      viewBox="0 0 24 24"
      width="23"
      height="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

export function BottomNavigation() {
  const location = useLocation();
  const warRoom = useWarRoom();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const destinations = warRoom.status === "eligible"
    ? [...baseDestinations, warRoomDestination]
    : baseDestinations;
  const unreadLabel = warRoom.unreadCount > 99 ? "99+" : String(warRoom.unreadCount);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const syncKeyboardState = () => {
      const activeElement = document.activeElement;
      const editing = activeElement instanceof HTMLElement
        && activeElement.matches("input, textarea, select, [contenteditable='true']");
      const occludedHeight = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      setKeyboardOpen(editing && occludedHeight > 120);
    };
    const syncAfterFocus = () => window.setTimeout(syncKeyboardState, 0);

    syncKeyboardState();
    viewport.addEventListener("resize", syncKeyboardState);
    viewport.addEventListener("scroll", syncKeyboardState);
    document.addEventListener("focusin", syncAfterFocus);
    document.addEventListener("focusout", syncAfterFocus);
    window.addEventListener("orientationchange", syncAfterFocus);
    return () => {
      viewport.removeEventListener("resize", syncKeyboardState);
      viewport.removeEventListener("scroll", syncKeyboardState);
      document.removeEventListener("focusin", syncAfterFocus);
      document.removeEventListener("focusout", syncAfterFocus);
      window.removeEventListener("orientationchange", syncAfterFocus);
    };
  }, []);

  const navigation = (
    <nav
      className={`bottom-nav${keyboardOpen ? " is-keyboard-open" : ""}`}
      aria-label="Primary navigation"
      style={{ gridTemplateColumns: `repeat(${destinations.length}, minmax(0, 1fr))` }}
    >
      {destinations.map((destination) => (
        <NavLink
key={destination.to}
to={destination.to}
end={destination.end}
onClick={(event) => {
  if (location.pathname !== destination.to) return;
  event.preventDefault();
  scrollPageToTop("smooth");
}}
className={({ isActive }) => (isActive ? "bottom-nav__item is-active" : "bottom-nav__item")}
        >
<span className="bottom-nav__indicator" aria-hidden="true" />
<NavigationIcon name={destination.icon} />
<span className="bottom-nav__label">{destination.label}</span>
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

  return createPortal(navigation, document.body);
}
