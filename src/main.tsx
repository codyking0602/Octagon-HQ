import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { installUpdateRecovery } from "./app/installUpdateRecovery";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/pull-to-refresh.css";
import "./styles/app-error.css";
import "./styles/home.css";
import "./styles/watchlist.css";
import "./styles/picks.css";
import "./styles/picks-lifecycle.css";
import "./styles/picks-underdog-lock.css";
import "./styles/picks-main-event-spotlight.css";
import "./styles/picks-season-hub.css";
import "./styles/picks-event-recap.css";
import "./styles/picks-group-progress.css";
import "./styles/picks-polish.css";
import "./styles/picks-owner-entry.css";
import "./styles/picks-control.css";
import "./styles/picks-lock-time-control.css";
import "./styles/picks-setup.css";
import "./styles/picks-setup-source.css";
import "./styles/picks-monitoring.css";
import "./styles/picks-control-center.css";
import "./styles/picks-owner-compact.css";
import "./styles/intelligence.css";
import "./styles/identity.css";
import "./styles/member-profiles.css";
import "./styles/member-profile-polish.css";
import "./styles/member-profile-compact.css";
import "./styles/member-profile-push.css";
import "./styles/play.css";
import "./styles/today-challenge.css";
import "./styles/auction.css";
import "./styles/find-leader-leaderboard.css";
import "./styles/wavelength.css";
import "./styles/game-results.css";
import "./styles/blind-games.css";
import "./styles/final-play-games.css";
import "./styles/challenge-center.css";
import "./styles/challenge-profiles.css";
import "./styles/challenge-matchups.css";
import "./styles/challenge-member-picker.css";
import "./styles/play-hub-polish.css";
import "./styles/war-room.css";
import "./styles/war-room-launch.css";
import "./styles/war-room-admin-polish.css";
import "./styles/war-room-reactions.css";
import "./styles/whats-new.css";
import "./styles/notifications.css";
import "./styles/notification-settings.css";
import "./styles/notification-push-prompt.css";

installUpdateRecovery();

const root = document.getElementById("root");

if (!root) {
  throw new Error("Octagon HQ root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
