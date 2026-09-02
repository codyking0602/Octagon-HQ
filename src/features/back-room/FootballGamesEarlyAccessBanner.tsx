import { useEffect, useState } from "react";
import "../../styles/football-games-early-access.css";

const FOOTBALL_GAMES_EARLY_ACCESS_DURATION_MS = 4_500;

export function FootballGamesEarlyAccessBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return undefined;

    const dismissTimer = window.setTimeout(
      () => setVisible(false),
      FOOTBALL_GAMES_EARLY_ACCESS_DURATION_MS,
    );

    return () => window.clearTimeout(dismissTimer);
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
