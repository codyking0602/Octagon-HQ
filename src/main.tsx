import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { installUpdateRecovery } from "./app/installUpdateRecovery";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/sport-context.css";
import "./styles/pull-to-refresh.css";
import "./styles/app-error.css";
import "./styles/home.css";
import "./styles/home-challenges.css";
import "./styles/watchlist.css";
import "./styles/watchlist-scouting.css";
import "./styles/picks.css";
import "./styles/picks-lifecycle.css";
import "./styles/picks-underdog-lock.css";
import "./styles/picks-main-event-spotlight.css";
import "./styles/picks-spotlight-polish.css";
import "./styles/picks-season-hub.css";
import "./styles/picks-event-recap.css";
import "./styles/picks-group-progress.css";
import "./styles/picks-event-motion.css";
import "./styles/picks-polish.css";
import "./styles/picks-owner-entry.css";
import "./styles/picks-control.css";
import "./styles/picks-control-history.css";
import "./styles/picks-lock-time-control.css";
import "./styles/picks-setup.css";
import "./styles/picks-multi-spotlight.css";
import "./styles/picks-setup-source.css";
import "./styles/picks-monitoring.css";
import "./styles/picks-control-center.css";
import "./styles/open-picks-dashboard.css";
import "./styles/picks-owner-compact.css";
import "./styles/intelligence.css";
import "./styles/identity.css";
import "./styles/member-profiles.css";
import "./styles/member-profile-polish.css";
import "./styles/member-profile-compact.css";
import "./styles/member-profile-push.css";
import "./styles/play.css";
import "./styles/today-challenge.css";
import "./styles/today-challenge-hub.css";
import "./styles/daily-leaderboard-result-page.css";
import "./styles/daily-challenge-standings.css";
import "./styles/auction.css";
import "./styles/find-leader-leaderboard.css";
import "./styles/wavelength.css";
import "./styles/game-results.css";
import "./styles/blind-games.css";
import "./styles/final-play-games.css";
import "./styles/hit-the-number.css";
import "./styles/challenge-center.css";
import "./styles/challenge-profiles.css";
import "./styles/challenge-matchups.css";
import "./styles/challenge-member-picker.css";
import "./styles/play-hub-polish.css";
import "./styles/back-room.css";
import "./styles/football-rank-five.css";
import "./styles/football-debate-games.css";
import "./styles/football-blind-resume.css";
import "./styles/football-foundation.css";
import "./styles/football-shell.css";
import "./styles/football-picks.css";
import "./styles/football-matchup-breakdowns.css";
import "./styles/football-visual-assets.css";
import "./styles/football-replayable-polish.css";
import "./styles/whats-new.css";
import "./styles/notifications.css";
import "./styles/notification-settings.css";
import "./styles/notification-push-prompt.css";

installUpdateRecovery();

const root = document.getElementById("root");

if (!root) {
  throw new Error("The HQ root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
