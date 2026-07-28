import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { installUpdateRecovery } from "./app/installUpdateRecovery";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/app-error.css";
import "./styles/home.css";
import "./styles/picks.css";
import "./styles/picks-lifecycle.css";
import "./styles/picks-control.css";
import "./styles/picks-setup.css";
import "./styles/picks-setup-source.css";
import "./styles/picks-monitoring.css";
import "./styles/intelligence.css";
import "./styles/identity.css";
import "./styles/member-profiles.css";
import "./styles/member-profile-polish.css";
import "./styles/member-profile-compact.css";
import "./styles/play.css";
import "./styles/wavelength.css";
import "./styles/game-results.css";
import "./styles/blind-games.css";
import "./styles/final-play-games.css";
import "./styles/challenge-center.css";
import "./styles/challenge-profiles.css";
import "./styles/challenge-matchups.css";

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
