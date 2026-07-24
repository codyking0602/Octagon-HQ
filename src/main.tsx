import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/intelligence.css";
import "./styles/play.css";
import "./styles/wavelength.css";
import "./styles/game-results.css";
import "./styles/blind-games.css";
import "./styles/final-play-games.css";
import "./styles/challenge-center.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Octagon HQ root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
