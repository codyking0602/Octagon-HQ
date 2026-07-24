import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/intelligence.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Octagon HQ root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
