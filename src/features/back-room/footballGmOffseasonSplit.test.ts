import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const css = readFileSync("src/styles/football-gm-mode.css", "utf8");
const offseasonScreen = page.slice(
  page.indexOf('{run.phase === "offseason" ? ('),
  page.indexOf('{run.phase === "years23" ? ('),
);
const voluntaryRelease = page.slice(
  page.indexOf("export function FreeAgencyReleasePanel("),
  page.indexOf("export function TradeChipPanel("),
);

describe("Football GM single-screen offseason", () => {
  it("shows the full Year 2 cap first and preserves compact player shopping without a report tab", () => {
    expect(offseasonScreen).toContain("<CapMeter");
    expect(offseasonScreen).toContain("yearOneRoster={run.roster} forecastYears");
    expect(offseasonScreen).toContain("<RosterGrid");
    expect(offseasonScreen.indexOf("<CapMeter")).toBeLessThan(offseasonScreen.indexOf("<RosterGrid"));
    expect(offseasonScreen).toContain("onShop={!run.pendingFreeAgentTeam ? beginTrade : undefined}");
    expect(offseasonScreen).not.toContain("TEAM REPORT");
    expect(offseasonScreen).not.toContain("football-gm__moves-cap");
    expect(offseasonScreen).not.toContain("<ContinuityMeter");
    expect(offseasonScreen).not.toContain("<FootballGmDevelopmentReport");
    expect(offseasonScreen).not.toContain("<FootballGmFitReport");
    expect(page).not.toContain("offseasonView");
  });

  it("keeps trades and free agency, but collapses the one-time release above the final action", () => {
    expect(offseasonScreen).toContain("<TradeCutResolution");
    expect(offseasonScreen).toContain("<TradeRoom");
    expect(offseasonScreen).toContain("<TradeChipPanel");
    expect(offseasonScreen).toContain("<FreeAgencyBoard");
    expect(offseasonScreen).toContain("<EmergencyFreeAgencyBoard");
    expect(offseasonScreen).toContain("<FreeAgencyReleasePanel");
    expect(voluntaryRelease).toContain('<details className="football-gm__trade-cuts football-gm__release-details surface-card">');
    expect(voluntaryRelease).toContain('<summary className="football-gm__release-summary">');
    expect(voluntaryRelease).not.toContain("<details open");
    expect(voluntaryRelease).not.toContain("Release one starter to create an extra free-agent opportunity and increase your available budget.");
    expect(voluntaryRelease).toContain("The release is final.");
    expect(offseasonScreen.indexOf("<FreeAgencyReleasePanel")).toBeLessThan(offseasonScreen.indexOf("SIMULATE YEARS 2 & 3"));
    expect(offseasonScreen).toContain("Roster fits both future salary caps.");
    expect(offseasonScreen).not.toContain("WINDOW SET");
    expect(css).toContain(".football-gm__offseason-status.is-ready");
    expect(css).toContain(".football-gm__release-details .football-gm__trade-warning");
    expect(offseasonScreen).toContain("Get under the cap for both Years 2 and 3 before advancing.");
    expect(offseasonScreen).toContain('disabled={!offseasonReady}');
    expect(css).toContain(".football-gm__release-details[open]");
  });

  it("preserves the existing offseason game rules and trade subflow", () => {
    expect(offseasonScreen).toContain("OFFSEASON · TRADE TALKS");
    expect(page).toContain("footballGmIsOffseasonCompliantV2(");
    expect(page).toContain("footballGmCanUseFreeAgency(");
    expect(page).toContain("footballGmResolveTradeAssets(");
    expect(page).toContain("footballGmAdjustedHoldingsCap(");
    expect(page).toContain("footballGmReleaseVisitCeiling(run)");
    expect(page).toContain('onClick={() => patch({ phase: "years23" })}');
  });
});
