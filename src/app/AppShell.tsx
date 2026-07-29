import { Suspense } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { BottomNavigation } from "../components/BottomNavigation";
import { RouteLoading } from "../components/RouteLoading";
import { IdentityControl } from "../features/identity/IdentityControl";
import { NotificationHeaderAction } from "../features/notifications/NotificationHeaderAction";

const PLAY_GAME_TITLES: Record<string, string> = {
  "/play/find-leader": "Find the Leader",
  "/play/wavelength": "Wavelength",
  "/play/blind-resume": "Blind Resume",
  "/play/blind-rank": "Blind Rank 5",
  "/play/keep-cut": "Keep 4, Cut 4",
  "/play/better-than": "Better Than…",
};

export function AppShell() {
  const location = useLocation();
  const gameTitle = PLAY_GAME_TITLES[location.pathname];
  const isPlayGame = Boolean(gameTitle);

  return (
    <div className={`app-shell${isPlayGame ? " app-shell--game" : ""}`}>
      {isPlayGame ? (
        <header className="app-header app-header--game">
          <Link className="game-header__back" to="/play" aria-label="Return to Play Hub">
            <span aria-hidden="true">←</span>
            <span><small>PLAY HUB</small><strong>{gameTitle}</strong></span>
          </Link>
        </header>
      ) : (
        <header className="app-header">
          <Link to="/" aria-label="Return to Home" style={{ textDecoration: "none" }}>
            <BrandMark size="compact" />
          </Link>
          <div className="app-header__actions">
            <NotificationHeaderAction />
            <NavLink
              className={({ isActive }) => (isActive ? "app-ask-action is-active" : "app-ask-action")}
              to="/intelligence"
              aria-label="Ask Octagon Verdict"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5a7.5 7.5 0 1 0 4.9 13.2L21 20l-1.4-4.7A7.5 7.5 0 0 0 12 3.5Z" />
                <path d="M9.6 9.2a2.7 2.7 0 0 1 5.1 1.2c0 1.9-2.7 2-2.7 3.7M12 17.2h.01" />
              </svg>
              <span className="sr-only">Ask Octagon Verdict</span>
            </NavLink>
            <IdentityControl />
          </div>
        </header>
      )}

      <main className={`app-content${isPlayGame ? " app-content--game" : ""}`}>
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>

      <BottomNavigation />
    </div>
  );
}
