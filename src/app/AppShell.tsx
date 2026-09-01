import { Suspense } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation } from "../components/BottomNavigation";
import { RouteLoading } from "../components/RouteLoading";
import { BackRoomLogoLink } from "../features/back-room/BackRoomLogoLink";
import { useIdentity } from "../features/identity/IdentityProvider";
import { memberProfilePath } from "../features/members/memberProfilesModel";
import { NotificationHeaderAction } from "../features/notifications/NotificationHeaderAction";
import { NotificationPushSetting } from "../features/notifications/NotificationPushSetting";
import { IdentityControl } from "../features/identity/IdentityControl";
import { BrandedPullToRefresh } from "./BrandedPullToRefresh";
import { RouteScrollManager } from "./RouteScrollManager";
import { useSport, type SelectedSport } from "./SportProvider";

const PLAY_GAME_TITLES: Record<string, string> = {
  "/play/find-leader": "Find the Leader",
  "/play/wavelength": "Wavelength",
  "/play/blind-resume": "Blind Resume",
  "/play/blind-rank": "Blind Rank 5",
  "/play/keep-cut": "Keep 4, Cut 4",
  "/play/better-than": "Better Than…",
};

const FOOTBALL_GAME_TITLES: Record<string, string> = {
  "/football/find-leader": "Find the Leader",
};

type SportContextSection = "PICKS" | "PLAY" | "RANKINGS" | "INTELLIGENCE";

type SportContext = {
  sport: SelectedSport;
  section: SportContextSection;
  switchable: boolean;
};

export type HqThemeScope = "neutral" | SelectedSport;

function sportContextForPath(pathname: string): SportContext | null {
  if (pathname === "/picks") return { sport: "ufc", section: "PICKS", switchable: true };
  if (pathname === "/football/picks") return { sport: "football", section: "PICKS", switchable: true };
  if (pathname === "/play") return { sport: "ufc", section: "PLAY", switchable: true };
  if (pathname === "/football") return { sport: "football", section: "PLAY", switchable: true };
  if (pathname === "/rankings") return { sport: "ufc", section: "RANKINGS", switchable: false };
  if (pathname === "/intelligence") return { sport: "ufc", section: "INTELLIGENCE", switchable: false };
  return null;
}

function themeScopeForPath(pathname: string, selectedSport: SelectedSport): HqThemeScope {
  const context = sportContextForPath(pathname);

  if (context?.switchable) return selectedSport;
  if (context) return context.sport;

  if (
    pathname === "/"
    || pathname === "/members"
    || pathname.startsWith("/members/")
    || pathname === "/notifications"
    || pathname === "/whats-new"
  ) {
    return "neutral";
  }

  if (pathname === "/football" || pathname.startsWith("/football/")) return "football";

  return "ufc";
}

function sportSectionDestination(section: SportContextSection, sport: SelectedSport) {
  if (section === "PICKS") return sport === "football" ? "/football/picks" : "/picks";
  if (section === "PLAY") return sport === "football" ? "/football" : "/play";
  return null;
}

function SportContextRow({
  context,
  onSelectSport,
}: {
  context: SportContext;
  onSelectSport: (sport: SelectedSport) => void;
}) {
  const sectionLabel = context.section[0] + context.section.slice(1).toLowerCase();

  return (
    <div className="sport-context-row" data-testid="sport-context-row" aria-label="Sport context">
      <strong className="sport-context-row__label">
        {context.sport.toUpperCase()} {context.section}
      </strong>
      {context.switchable ? (
        <div className="sport-context-row__switch" role="group" aria-label={`${sectionLabel} sport`}>
          {(["ufc", "football"] as const).map((sport) => (
            <button
              key={sport}
              type="button"
              className={context.sport === sport ? "is-active" : ""}
              aria-pressed={context.sport === sport}
              onClick={() => onSelectSport(sport)}
            >
              {sport === "ufc" ? "UFC" : "Football"}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProfilePushSettingRoute() {
  const identity = useIdentity();
  const location = useLocation();
  const ownProfilePath = identity.profile ? memberProfilePath(identity.profile.displayName) : null;

  if (!ownProfilePath || location.pathname !== ownProfilePath) return null;

  return (
    <div className="page member-profile-push-route">
      <NotificationPushSetting />
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSport, setSelectedSport } = useSport();
  const gameTitle = PLAY_GAME_TITLES[location.pathname];
  const footballGameTitle = FOOTBALL_GAME_TITLES[location.pathname];
  const isPlayGame = Boolean(gameTitle);
  const isFootballGame = Boolean(footballGameTitle);
  const isGame = isPlayGame || isFootballGame;
  const isBackRoom = location.pathname === "/back-room" || location.pathname.startsWith("/back-room/");
  const isFootball = location.pathname === "/football" || location.pathname.startsWith("/football/");
  const sportContext = sportContextForPath(location.pathname);
  const themeScope = themeScopeForPath(location.pathname, selectedSport);

  function selectSport(sport: SelectedSport) {
    if (!sportContext?.switchable) return;

    setSelectedSport(sport);
    const destination = sportSectionDestination(sportContext.section, sport);
    if (destination && destination !== location.pathname) navigate(destination);
  }

  return (
    <div
      className={`app-shell${isGame ? " app-shell--game" : ""}${isBackRoom ? " app-shell--back-room" : ""}${isFootball ? " app-shell--football-room" : ""}`}
      data-hq-theme={themeScope}
    >
      <RouteScrollManager />

      {isFootballGame ? (
        <header className="app-header app-header--game app-header--football-game">
          <Link className="game-header__back" to="/football" aria-label="Return to Football HQ">
            <span aria-hidden="true">←</span>
            <span><small>FOOTBALL HQ</small><strong>{footballGameTitle}</strong></span>
          </Link>
        </header>
      ) : isBackRoom ? (
        <header className="app-header app-header--back-room">
          <Link
            className="back-room-header__exit"
            to="/play"
            aria-label="Return to UFC games"
          >
            <span aria-hidden="true">←</span>
            <span>
              <small>OCTAGON HQ</small>
              <strong>THE BACK ROOM</strong>
            </span>
          </Link>
        </header>
      ) : isPlayGame ? (
        <header className="app-header app-header--game">
          <Link className="game-header__back" to="/play" aria-label="Return to Play Hub">
            <span aria-hidden="true">←</span>
            <span><small>PLAY HUB</small><strong>{gameTitle}</strong></span>
          </Link>
        </header>
      ) : (
        <header className={`app-header app-header--universal${sportContext ? " app-header--with-sport-context" : ""}`}>
          <BackRoomLogoLink enabled={location.pathname === "/play"} />
          <div className="app-header__actions">
            <NotificationHeaderAction />
            <NavLink
              className={({ isActive }) => (isActive ? "app-ask-action is-active" : "app-ask-action")}
              to="/intelligence"
              aria-label="Open UFC Intelligence"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5a7.5 7.5 0 1 0 4.9 13.2L21 20l-1.4-4.7A7.5 7.5 0 0 0 12 3.5Z" />
                <path d="M9.6 9.2a2.7 2.7 0 0 1 5.1 1.2c0 1.9-2.7 2-2.7 3.7M12 17.2h.01" />
              </svg>
              <span className="sr-only">UFC Intelligence</span>
            </NavLink>
            <IdentityControl />
          </div>
          {sportContext ? (
            <SportContextRow context={sportContext} onSelectSport={selectSport} />
          ) : null}
        </header>
      )}

      <BrandedPullToRefresh>
        <main className={`app-content${isGame ? " app-content--game" : ""}`}>
          <Suspense fallback={<RouteLoading />}>
            <Outlet />
          </Suspense>
          <ProfilePushSettingRoute />
        </main>
      </BrandedPullToRefresh>

      {isBackRoom ? null : <BottomNavigation themeScope={themeScope} />}
    </div>
  );
}
