import { useEffect, useState } from "react";
import "../../styles/football-games-early-access.css";

const FOOTBALL_GAMES_EARLY_ACCESS_SESSION_KEY = "the-hq:football-games-early-access-seen";
const FOOTBALL_GAMES_EARLY_ACCESS_DURATION_MS = 4_500;

function hasSeenFootballGamesEarlyAccess() {
  if (typeof window === "undefined") return true;

  try {
    return window.sessionStorage.getItem(FOOTBALL_GAMES_EARLY_ACCESS_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markFootballGamesEarlyAccessSeen() {
  try {
    window.sessionStorage.setItem(FOOTBALL_GAMES_EARLY_ACCESS_SESSION_KEY, "1");
  } catch {
    // The banner can still auto-dismiss when session storage is unavailable.
  }
}

export function FootballGamesEarlyAccessBanner() {
  const [visible, setVisible] = useState(() => !hasSeenFootballGamesEarlyAccess());

  useEffect(() => {
    if (!visible) return undefined;

    const seenTimer = window.setTimeout(markFootballGamesEarlyAccessSeen, 0);
    const dismissTimer = window.setTimeout(
      () => setVisible(false),
      FOOTBALL_GAMES_EARLY_ACCESS_DURATION_MS,
    );

    return () => {
      window.clearTimeout(seenTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <aside className="football-games-early-access" role="status" aria-live="polite">
      <span className="football-games-early-access__badge">EARLY ACCESS</span>
      <div>
        <strong>FOOTBALL GAMES</strong>
        <p>Games and features are still being built and refined.</p>
      </div>
    </aside>
  );
}
