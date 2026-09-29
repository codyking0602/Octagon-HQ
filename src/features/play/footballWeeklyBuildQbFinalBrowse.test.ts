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

  it("keeps the player switcher compact and horizontally scrollable on mobile", () => {
    expect(styles).toContain(".football-weekly-build-qb__player-picker");
    expect(styles).toContain("overflow-x: auto;");
    expect(styles).toContain("flex: 0 0 auto;");
  });
});
