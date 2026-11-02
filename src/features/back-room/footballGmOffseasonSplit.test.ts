import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const css = readFileSync("src/styles/football-gm-mode.css", "utf8");

const offseasonScreen = page.slice(
  page.indexOf('{run.phase === "offseason" ? ('),
  page.indexOf('{run.phase === "years23" ? ('),
);

describe("Football GM offseason Team Report and Moves parity", () => {
  it("starts on a read-only Team Report with development, positional fit, all-year cap and continuity", () => {
    expect(page).toContain('useState<"report" | "moves">("report")');
    expect(page).toContain('setOffseasonView("report")');
    expect(offseasonScreen).toContain('aria-label="Offseason screens"');
    expect(offseasonScreen).toContain('aria-pressed={offseasonView === "report"}');
    expect(offseasonScreen).toContain('aria-pressed={offseasonView === "moves"}');
    const report = offseasonScreen.slice(
      offseasonScreen.indexOf('{showOffseasonReport ? ('),
      offseasonScreen.indexOf('{showOffseasonMoves ? ('),
    );
    expect(report).toContain("<FootballGmDevelopmentReport");
    expect(report).toContain("<FootballGmFitReport");
    expect(report).toContain("yearOneRoster={run.roster} forecastYears");
    expect(report).toContain("<ContinuityMeter");
    expect(report).toContain("CONTINUE TO OFFSEASON MOVES");
    expect(report).not.toContain("<TradeRoom");
    expect(report).not.toContain("onShop=");
    expect(page).toContain('aria-label="Year 2 roster fit"');
    expect(page).toContain("footballGmReflowRoster(roster, 2, seed)");
  });

  it("keeps the active roster, shopping, trade assets, free agency and advancing in Moves", () => {
    const moves = offseasonScreen.slice(offseasonScreen.indexOf('{showOffseasonMoves ? ('));
    expect(moves).toContain("football-gm__moves-cap");
    expect(moves).toContain("futureCap.map");
    expect(moves).toContain("<RosterGrid");
    expect(moves).toContain("onShop={!run.pendingFreeAgentTeam ? beginTrade : undefined}");
    expect(moves).toContain("<TradeChipPanel");
    expect(moves).toContain("<FreeAgencyBoard");
    expect(moves).toContain("<EmergencyFreeAgencyBoard");
    expect(moves).toContain("<FreeAgencyReleasePanel");
    expect(moves).toContain("SIMULATE YEARS 2 & 3");
    expect(offseasonScreen).toContain("(offseasonTradeStage || showOffseasonMoves)");
    expect(page).toContain('setOffseasonView("moves")');
    expect(page).toContain("run.tradeAnchorPlayerId || run.pendingTradeResolution");
  });

  it("gives trade talks their own screen and preserves NFL gameplay rules", () => {
    expect(offseasonScreen).toContain("!offseasonTradeStage ?");
    expect(offseasonScreen).toContain("OFFSEASON · TRADE TALKS");
    expect(offseasonScreen).toContain("<TradeCutResolution");
    expect(offseasonScreen).toContain("<TradeRoom");
    expect(page).toContain("footballGmIsOffseasonCompliantV2(");
    expect(page).toContain("footballGmCanUseFreeAgency(");
    expect(page).toContain("footballGmResolveTradeAssets(");
    expect(page).toContain("footballGmAdjustedHoldingsCap(");
    expect(css).toContain(".football-gm-page .football-gm__offseason-nav");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(css).toContain(".football-gm-page .football-gm__fit-grid");
    expect(css).toContain(".football-gm-page .football-gm__moves-cap");
    expect(css).toContain("@media (max-width: 380px)");
  });
});
