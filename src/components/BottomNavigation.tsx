import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { HqThemeScope } from "../app/AppShell";
import { scrollPageToTop } from "../app/RouteScrollManager";
import { nextSport, useSport } from "../app/SportProvider";
import { useOptionalIdentity } from "../features/identity/IdentityProvider";
import { canViewMlbPlayoffs } from "../features/mlb/mlbPlayoffsConfig";

type NavigationIconName = "home" | "rankings" | "picks" | "play";
type SecretSportSection = "picks" | "play";

const baseDestinations = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/picks", label: "Picks", icon: "picks", end: false },
  { to: "/play", label: "Play", icon: "play", end: false },
  { to: "/rankings", label: "Rankings", icon: "rankings", end: false },
] as const;

const SECRET_SPORT_TAP_WINDOW_MS = 350;

function routeOwnsNavigationItem(icon: NavigationIconName, pathname: string) {
  if (icon === "home") return pathname === "/";
  if (icon === "picks") {
    return pathname === "/picks"
      || pathname.startsWith("/picks/")
      || pathname === "/football/picks"
      || pathname.startsWith("/football/picks/")
      || pathname === "/mlb/picks"
      || pathname.startsWith("/mlb/picks/")
      || pathname.startsWith("/mlb/series/");
  }
  if (icon === "play") {
    return pathname === "/play"
      || pathname.startsWith("/play/")
      || pathname === "/football"
      || (pathname.startsWith("/football/") && !pathname.startsWith("/football/picks"))
      || pathname === "/mlb"
      || (pathname.startsWith("/mlb/")
        && !pathname.startsWith("/mlb/picks")
        && !pathname.startsWith("/mlb/series/"));
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
  const identity = useOptionalIdentity();
  const { selectedSport, setSelectedSport } = useSport();
  const lastActiveSportTapRef = useRef<Record<SecretSportSection, number>>({ picks: 0, play: 0 });
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const footballMode = location.pathname === "/football" || location.pathname.startsWith("/football/");
  const mlbMode = location.pathname === "/mlb" || location.pathname.startsWith("/mlb/");
  const effectiveSport = selectedSport === "mlb" && !canViewMlbPlayoffs(identity?.profile) ? "ufc" : selectedSport;
  const selectedPlayRoot = effectiveSport === "football" ? "/football" : effectiveSport === "mlb" ? "/mlb" : "/play";
  const selectedPicksRoot = effectiveSport === "football" ? "/football/picks" : effectiveSport === "mlb" ? "/mlb/picks" : "/picks";
  const standardDestinations = baseDestinations.map((destination) => (
    destination.icon === "play" ? { ...destination, to: selectedPlayRoot }
      : destination.icon === "picks" ? { ...destination, to: selectedPicksRoot }
      : destination
  ));

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const syncKeyboardState = () => {
      // iOS may keep stale visualViewport geometry when the PWA resumes.
      // Never use that geometry to translate the navigation: CSS bottom: 0
      // is always the sole owner of the dock's physical position.
      const activeElement = document.activeElement;
      const editing = activeElement instanceof HTMLElement
        && activeElement.matches("input, textarea, select, [contenteditable='true']");
      const visualBottom = viewport.height + viewport.offsetTop;
      const materiallyOccluded = window.innerHeight - visualBottom > 120;
      setKeyboardOpen(document.visibilityState === "visible" && editing && materiallyOccluded);
    };
    const afterFocus = () => window.setTimeout(syncKeyboardState, 0);
    syncKeyboardState();
    viewport.addEventListener("resize", syncKeyboardState);
    viewport.addEventListener("scroll", syncKeyboardState);
    document.addEventListener("focusin", afterFocus);
    document.addEventListener("focusout", afterFocus);
    document.addEventListener("visibilitychange", syncKeyboardState);
    window.addEventListener("pageshow", syncKeyboardState);
    window.addEventListener("resize", syncKeyboardState);
    return () => {
      viewport.removeEventListener("resize", syncKeyboardState);
      viewport.removeEventListener("scroll", syncKeyboardState);
      document.removeEventListener("focusin", afterFocus);
      document.removeEventListener("focusout", afterFocus);
      document.removeEventListener("visibilitychange", syncKeyboardState);
      window.removeEventListener("pageshow", syncKeyboardState);
      window.removeEventListener("resize", syncKeyboardState);
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
      }}
    >
      {standardDestinations.map((destination) => (
        <NavLink
          key={`${destination.label}:${destination.to}`}
          to={destination.to}
          end={destination.end}
          onClick={(event) => {
            if (destination.icon === "play" || destination.icon === "picks") {
              const section = destination.icon;
              const activeSection = routeOwnsNavigationItem(section, location.pathname);
              if (activeSection) {
                const now = Date.now();
                const activeRoot = section === "play"
                  ? (footballMode ? "/football" : mlbMode ? "/mlb" : "/play")
                  : (footballMode ? "/football/picks" : mlbMode ? "/mlb/picks" : "/picks");
                if (now - lastActiveSportTapRef.current[section] <= SECRET_SPORT_TAP_WINDOW_MS) {
                  event.preventDefault();
                  lastActiveSportTapRef.current[section] = 0;
                  const currentSport = footballMode ? "football" : mlbMode ? "mlb" : "ufc";
                  const next = nextSport(currentSport, canViewMlbPlayoffs(identity?.profile));
                  setSelectedSport(next);
                  const targetPath = section === "play"
                    ? next === "football" ? "/football" : next === "mlb" ? "/mlb" : "/play"
                    : next === "football" ? "/football/picks" : next === "mlb" ? "/mlb/picks" : "/picks";
                  navigate(targetPath);
                  return;
                }
                lastActiveSportTapRef.current[section] = now;
                if (location.pathname === activeRoot) {
                    event.preventDefault();
                    scrollPageToTop("smooth");
                  }
                  return;
                }
                if (now - lastActiveSportTapRef.current[section] <= SECRET_SPORT_TAP_WINDOW_MS) {
                  event.preventDefault();
                  lastActiveSportTapRef.current[section] = 0;
                  const targetPath = section === "play"
                    ? (footballMode ? "/play" : "/football")
                    : (footballMode ? "/picks" : "/football/picks");

                  if (footballMode) {
                    setSelectedSport("ufc");
                    navigate(targetPath);
                  } else {
                    setSelectedSport("football");
                    const entryState = nextFootballEntryState(section);
                    if (entryState) navigate(targetPath, { state: entryState });
                    else navigate(targetPath);
                  }
                  return;
                }
                lastActiveSportTapRef.current[section] = now;
                if (location.pathname === activeRoot) {
                  event.preventDefault();
                  scrollPageToTop("smooth");
                  return;
                }
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
