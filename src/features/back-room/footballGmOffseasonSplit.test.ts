import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const css = readFileSync("src/styles/football-gm-mode.css", "utf8");
const offseasonScreen = page.slice(
  page.indexOf('{run.phase === "offseason" ? ('),
  page.indexOf('{run.phase === "years23" ? ('),
);
const releasePanel = page.slice(
  page.indexOf("export function FreeAgencyReleasePanel("),
  page.indexOf("export function TradeChipPanel("),
);

describe("Football GM single-screen offseason", () => {
  it("shows the detailed Year 2 cap before the editable roster, without cap pills", () => {
    expect(offseasonScreen).toContain("<CapMeter");
    expect(offseasonScreen).toContain("year={2}");
    expect(offseasonScreen).toContain("yearOneRoster={run.roster} forecastYears");
    expect(offseasonScreen.indexOf("<CapMeter")).toBeLessThan(offseasonScreen.indexOf("<RosterGrid"));
    expect(offseasonScreen).toContain("showFutureSalary");
    expect(offseasonScreen).toContain("compact");
    expect(offseasonScreen).toContain("onShop={!run.pendingFreeAgentTeam ? beginTrade : undefined}");
    expect(offseasonScreen).not.toContain("football-gm__moves-cap");
  });
  it("removes Team Report, development, fit, continuity and two-tab navigation", () => {
    expect(offseasonScreen).not.toContain("TEAM REPORT");
    expect(offseasonScreen).not.toContain("Offseason screens");
    expect(offseasonScreen).not.toContain("<FootballGmDevelopmentReport");
    expect(offseasonScreen).not.toContain("<FootballGmFitReport");
    expect(offseasonScreen).not.toContain("<ContinuityMeter");
    expect(offseasonScreen).not.toContain("CONTINUE TO OFFSEASON MOVES");
    expect(page).not.toContain("setOffseasonView");
    expect(page).not.toContain('useState<"report" | "moves">');
  });
  it("preserves trade talks, free agency and cap compliance mechanics", () => {
    expect(offseasonScreen).toContain("OFFSEASON · TRADE TALKS");
    expect(offseasonScreen).toContain("<TradeCutResolution");
    expect(offseasonScreen).toContain("<TradeRoom");
    expect(offseasonScreen).toContain("<TradeChipPanel");
    expect(offseasonScreen).toContain("<FreeAgencyBoard");
    expect(offseasonScreen).toContain("<EmergencyFreeAgencyBoard");
    expect(page).toContain("footballGmIsOffseasonCompliantV2(");
    expect(page).toContain("footballGmCanUseFreeAgency(");
    expect(page).toContain("footballGmResolveTradeAssets(");
    expect(page).toContain("footballGmAdjustedHoldingsCap(");
  });
  it("shows collapsed voluntary release before advance, with concise descriptions", () => {
    expect(releasePanel).toContain('<details className="football-gm__release-disclosure surface-card">');
    expect(releasePanel).toContain("<summary>");
    expect(releasePanel).toContain("Release one starter for an extra free-agent opening.");
    expect(releasePanel).not.toContain("You may deliberately cut one settled starter");
    expect(releasePanel).toContain("that player cannot be re-signed this offseason");
    expect(offseasonScreen.indexOf("<FreeAgencyReleasePanel")).toBeLessThan(
      offseasonScreen.indexOf("YOU CAN MOVE FORWARD"));
    expect(offseasonScreen.indexOf("YOU CAN MOVE FORWARD")).toBeLessThan(
      offseasonScreen.indexOf("SIMULATE YEARS 2 & 3"));
    expect(offseasonScreen).toContain("Your roster fits the cap for Years 2 and 3. Advance when ready.");
    expect(offseasonScreen).toContain('disabled={!offseasonReady}');
    expect(css).toContain(".football-gm__release-disclosure[open]");
    expect(css).toContain(".football-gm__release-details");
  });
});
