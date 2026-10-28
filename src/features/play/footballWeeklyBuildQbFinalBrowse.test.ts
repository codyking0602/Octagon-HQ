import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gate = readFileSync("src/features/back-room/FootballWeeklyBuildQbGate.tsx", "utf8");
const styles = readFileSync("src/styles/football-weekly-build-qb.css", "utf8");

describe("NFL Build a QB final-results browsing", () => {
  it("lets the final QB tab switch between every player in the standings", () => {
    expect(gate).toContain("function buildForProfile");
    expect(gate).toContain("entry.winner_profile_id === profileId");
    expect(gate).toContain('aria-label="Select player QB"');
    expect(gate).toContain("setSelectedProfileId(entry.profile_id)");
    expect(gate).toContain("selectedBuild.find((item) => item.trait === trait)");
    expect(gate).toContain("selectedStanding?.final_score?.toFixed(1)");
  });

  it("keeps the player switcher compact, internally scrollable, and unable to widen the page", () => {
    expect(styles).toContain(".football-weekly-build-qb__final {\n  min-width: 0;");
    expect(styles).toContain("max-width: 100%;\n  overflow: hidden;");
    expect(styles).toContain(".football-weekly-build-qb__final > * {\n  min-width: 0;");
    expect(styles).toContain(".football-weekly-build-qb__builds,\n.football-weekly-build-qb__grade-grid {\n  min-width: 0;");
    expect(styles).toContain(".football-weekly-build-qb__player-picker");
    expect(styles).toContain("width: 100%;");
    expect(styles).toContain("overflow-x: auto;");
    expect(styles).toContain("overflow-y: hidden;");
    expect(styles).toContain("flex: 0 0 auto;");
  });
});
