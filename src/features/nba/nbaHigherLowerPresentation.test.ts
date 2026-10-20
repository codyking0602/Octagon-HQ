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
    expect(pageSource).toContain("nbaHigherLowerPortraitSource");
    expect(pageSource).toContain("nbaHigherLowerIsGenericSilhouette");
    expect(pageSource).toContain('ref={boardHeaderRef}');
    expect(pageSource).toContain("useLayoutEffect");
    expect(pageSource).toContain("scrollIntoView");
    expect(pageSource).toContain("question.known.context");
    expect(pageSource).toContain("question.hidden.context");
    expect(pageSource).toContain('document.addEventListener("visibilitychange"');
    expect(styles).toContain("object-fit: contain");
    expect(styles).toContain("transform: translateY(12px) scale(1.18)");
    expect(styles).toContain("mask-image: linear-gradient");
    expect(styles).toContain("scroll-margin-top");
    expect(styles).toContain(".nba-higher-lower-portrait.is-editorial img");
    expect(pageSource).toContain("reviewContext(question)");
    expect(pageSource).toContain("nba-higher-lower-intro__highlights");
    expect(pageSource).not.toContain("3/5/2");
    expect(pageSource).not.toContain('className="higher-lower-rules"');
    expect(styles).toContain("background: linear-gradient(90deg, #b8752c, #efb35b)");
    expect(styles).toContain("background: #644322");
    expect(styles).toContain("overflow-wrap: anywhere");
  });
  it("keeps frozen challenge snapshots and NBA-specific result navigation", () => {
    expect(modelSource).toContain("parseNbaHigherLowerBoard");
    expect(pageSource).toContain('gameId: "higher-lower"');
    expect(pageSource).toContain("setup: asChallengeJson({ board })");
    expect(challengeRuntime).toContain('challenge.gameVersion.startsWith("nba-higher-lower-")');
  });
});
