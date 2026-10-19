import { describe, expect, it } from "vitest";
import routerSource from "../../app/router.tsx?raw";
import nbaHqSource from "./NbaPlayPage.tsx?raw";
import pageSource from "./NbaHigherLowerPage.tsx?raw";
import modelSource from "./nbaHigherLowerModel.ts?raw";
import styles from "../../styles/nba-higher-lower.css?raw";
import challengeRuntime from "../challenges/challengeRuntime.ts?raw";

describe("NBA Higher or Lower owner-preview integration", () => {
  it("keeps play and daily preview owner-only, off public Daily scoring", () => {
    expect(routerSource).toContain('path: "nba/higher-lower", element: <NbaWhoAmIOwnerGate>');
    expect(nbaHqSource).toContain('to="/nba/higher-lower?mode=daily"');
    expect(nbaHqSource).toContain("canPreviewNbaWhoAmI(identity.profile)");
    expect(pageSource).toContain("No Daily leaderboard score is submitted.");
    expect(pageSource).not.toContain("daily_challenge_run");
  });
  it("reuses football presentation, correct portraits, season labels and active timer", () => {
    expect(pageSource).toContain('import "../../styles/football-higher-lower.css"');
    expect(pageSource).toContain("nbaFindLeaderHeadshot");
    expect(pageSource).toContain("question.known.context");
    expect(pageSource).toContain("question.hidden.context");
    expect(pageSource).toContain('document.addEventListener("visibilitychange"');
    expect(styles).toContain("object-fit: contain");
    expect(styles).toContain("overflow-wrap: anywhere");
  });
  it("keeps frozen challenge snapshots and NBA-specific result navigation", () => {
    expect(modelSource).toContain("parseNbaHigherLowerBoard");
    expect(pageSource).toContain('gameId: "higher-lower"');
    expect(pageSource).toContain("setup: asChallengeJson({ board })");
    expect(challengeRuntime).toContain('challenge.gameVersion.startsWith("nba-higher-lower-")');
  });
});
