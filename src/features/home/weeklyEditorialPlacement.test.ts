import { describe, expect, it } from "vitest";
import home from "./HomePage.tsx?raw";
import footballHq from "./FootballHq.tsx?raw";
import spotlight from "./footballPlayerSpotlightSchedule.ts?raw";
import publication from "./footballWeeklyPublication.ts?raw";
import footballPicks from "../picks/FootballPicksPage.tsx?raw";
import ufcPicks from "../picks/PicksPage.tsx?raw";
import breakdownView from "../picks/FootballMatchupBreakdowns.tsx?raw";
import featured from "../picks/footballWeekOct13Featured.ts?raw";

describe("approved weekly editorial presentation cannot regress at next automated rollover", () => {
  it("keeps MMA Mania poster in UFC Picks rather than growing the UFC HQ home panel", () => {
    expect(home).not.toContain("home-ufc-poster");
    expect(ufcPicks).toContain("reviewedMmaManiaPoster(activeEvent)");
  });
  it("rotates football matchup graphics only in Picks at eight-second intervals", () => {
    expect(footballPicks).toContain("matchupBreakdowns.filter((matchup) => matchup.headerAssetPath)");
    expect(footballPicks).toContain("}, 8000);");
    expect(footballHq).not.toContain('className="football-hq-game-row__art"');
    expect(breakdownView).not.toContain("football-matchup-breakdown-weekly-art");
  });
  it("uses direct team identity matching for automated weekly Home rows", () => {
    expect(footballHq).toContain("featuredGameForBreakdown(event, breakdown)");
    expect(footballHq).toContain("team.aliases.some((alias)");
    expect(publication).toContain("publishedFootballMatchupsForEvent");
  });
  it("shows Spotlight measurements and result without a redundant TD footer", () => {
    expect(footballHq).toContain("<span>{spotlight.measurements}</span>");
    expect(footballHq).toContain("<span>{spotlight.result}</span>");
    expect(publication).toContain("TOTAL");
    expect(spotlight).toContain('{ value: "1", label: "RUSH TD" }');
    expect(spotlight).not.toContain('W 38–19 · 5 TOTAL TD');
  });
  it("keeps breakdown setup and bottom line free of schedule and image citations", () => {
    const copy = featured.match(/setup: \[([\s\S]*?)\],/g) ?? [];
    expect(copy).toHaveLength(2);
    expect(copy.join(" ")).not.toMatch(/kickoff airs|p\.m\. Central|Game graphic/);
    expect(featured).not.toContain("Game graphic:");
    expect(featured).not.toContain("Matchup information:");
    expect(featured).not.toContain("who will win");
  });
});
