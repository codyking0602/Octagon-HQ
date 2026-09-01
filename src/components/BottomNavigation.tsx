import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { HqThemeScope } from "../app/AppShell";
import { scrollPageToTop } from "../app/RouteScrollManager";
import { useSport } from "../app/SportProvider";

type NavigationIconName = "home" | "rankings" | "picks" | "play";

const baseDestinations = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/picks", label: "Picks", icon: "picks", end: false },
  { to: "/play", label: "Play", icon: "play", end: false },
  { to: "/rankings", label: "Rankings", icon: "rankings", end: false },
] as const;

const SECRET_PLAY_TAP_WINDOW_MS = 350;

function routeOwnsNavigationItem(icon: NavigationIconName, pathname: string) {
  if (icon === "home") return pathname === "/";
  if (icon === "picks") {
    return pathname === "/picks"
      || pathname.startsWith("/picks/")
      || pathname === "/football/picks"
      || pathname.startsWith("/football/picks/");
  }
  if (icon === "play") {
    return pathname === "/play"
      || pathname.startsWith("/play/")
      || pathname === "/football"
      || (pathname.startsWith("/football/") && !pathname.startsWith("/football/picks"));
  }
  return pathname === "/rankings" || pathname.startsWith("/rankings/");
}

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const iconPaths = {
    home: <path d="M3.5 10.5 12 3.5l8.5 7v9.75H14.8v-6.1H9.2v6.1H3.5Z" />,
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
    play: <path d="m8 5 10 7-10 7Z" />,
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

export function BottomNavigation({ themeScope = "neutral" }: { themeScope?: HqThemeScope }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSport, setSelectedSport } = useSport();
  const keyboardSessionRef = useRef(false);
  const lastActivePlayTapRef = useRef(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [viewportBottomCorrection, setViewportBottomCorrection] = useState(0);
  const footballMode = location.pathname === "/football" || location.pathname.startsWith("/football/");
  const selectedPlayRoot = selectedSport === "football" ? "/football" : "/play";
  const selectedPicksRoot = selectedSport === "football" ? "/football/picks" : "/picks";
  const activePlayRoot = footballMode ? "/football" : "/play";
  const standardDestinations = baseDestinations.map((destination) => (
    destination.icon === "play" ? { ...destination, to: selectedPlayRoot }
      : destination.icon === "picks" ? { ...destination, to: selectedPicksRoot }
      : destination
  ));

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    let resumeTimer: number | undefined;
    const syncViewportState = () => {
      const activeElement = document.activeElement;
      const editing = activeElement instanceof HTMLElement
        && activeElement.matches("input, textarea, select, [contenteditable='true']");
      const visualBottom = viewport.height + viewport.offsetTop;
      const occludedHeight = Math.max(0, window.innerHeight - visualBottom);
      const materiallyOccluded = occludedHeight > 120;

      if (editing && materiallyOccluded) keyboardSessionRef.current = true;
      const nextKeyboardOpen = keyboardSessionRef.current && materiallyOccluded;
      if (keyboardSessionRef.current && !materiallyOccluded) keyboardSessionRef.current = false;

      setKeyboardOpen(nextKeyboardOpen);
      setViewportBottomCorrection(
        nextKeyboardOpen ? 0 : Math.round(Math.abs(visualBottom - window.innerHeight)),
      );
    };
    const syncAfterFocus = () => window.setTimeout(syncViewportState, 0);
    const syncAfterResume = () => {
      if (document.visibilityState !== "visible") return;
      syncViewportState();
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(syncViewportState, 250);
    };

    syncViewportState();
    viewport.addEventListener("resize", syncViewportState);
    viewport.addEventListener("scroll", syncViewportState);
    document.addEventListener("focusin", syncAfterFocus);
    document.addEventListener("focusout", syncAfterFocus);
    document.addEventListener("visibilitychange", syncAfterResume);
    window.addEventListener("orientationchange", syncAfterFocus);
    window.addEventListener("pageshow", syncAfterResume);
    return () => {
      window.clearTimeout(resumeTimer);
      viewport.removeEventListener("resize", syncViewportState);
      viewport.removeEventListener("scroll", syncViewportState);
      document.removeEventListener("focusin", syncAfterFocus);
      document.removeEventListener("focusout", syncAfterFocus);
      document.removeEventListener("visibilitychange", syncAfterResume);
      window.removeEventListener("orientationchange", syncAfterFocus);
      window.removeEventListener("pageshow", syncAfterResume);
    };
  }, []);

  const navigation = (
    <nav
      className={`bottom-nav${keyboardOpen ? " is-keyboard-open" : ""}`}
      data-hq-theme={themeScope}
      aria-label="Primary navigation"
      style={{
        gridTemplateColumns: `repeat(${standardDestinations.length}, minmax(0, 1fr))`,
        display: keyboardOpen ? "none" : "grid",
        transform: viewportBottomCorrection > 0
          ? `translateY(${viewportBottomCorrection}px)`
          : undefined,
      }}
    >
      {standardDestinations.map((destination) => (
        <NavLink
          key={`${destination.label}:${destination.to}`}
          to={destination.to}
          end={destination.end}
          onClick={(event) => {
            if (destination.icon === "play") {
              const activePlay = location.pathname === activePlayRoot || location.pathname.startsWith(`${activePlayRoot}/`);
              if (activePlay) {
                const now = Date.now();
                if (now - lastActivePlayTapRef.current <= SECRET_PLAY_TAP_WINDOW_MS) {
                  event.preventDefault();
                  lastActivePlayTapRef.current = 0;
                  if (footballMode) {
                    setSelectedSport("ufc");
                    navigate("/play");
                  } else {
                    setSelectedSport("football");
                    navigate("/football", { state: { footballEntry: true } });
                  }
                  return;
                }
                lastActivePlayTapRef.current = now;
              }
            }

            if (location.pathname !== destination.to) return;
            event.preventDefault();
            scrollPageToTop("smooth");
          }}
          className={() => (
            routeOwnsNavigationItem(destination.icon, location.pathname)
              ? "bottom-nav__item is-active"
              : "bottom-nav__item"
          )}
        >
          <span className="bottom-nav__indicator" aria-hidden="true" />
          <NavigationIcon name={destination.icon} />
          <span className="bottom-nav__label">{destination.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return createPortal(navigation, document.body);
}
