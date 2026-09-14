import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"), "utf8");
const css = readFileSync(resolve(process.cwd(), "src/styles/auction.css"), "utf8");

describe("Longhorns Teams presentation contract", () => {
  it("keeps the season year as part of every team-season identity", () => {
    expect(page).toContain('"CURRENT TEXAS TEAM"');
    expect(page).toContain('className={longhornsTeamsMode ? "draft-room-season-label" : undefined}');
    expect(page).toContain('itemLabel="TEAM"');
    expect(css).toContain(".draft-room-season-label");
    expect(css).toContain("white-space: nowrap");
    expect(css).toContain("overflow-wrap: normal");
  });

  it("shows concise season context on the current team and filled team slots", () => {
    expect(page).toContain("longhornsTeamSeasonSummary(state.current_item.display_label)");
    expect(page).toContain("longhornsTeamSeasonSummary(challengerAward.display_label)");
    expect(page).toContain("longhornsTeamSeasonSummary(recipientAward.display_label)");
    expect(css).toContain(".draft-room-season-summary");
    expect(css).toContain(".draft-room-season-summary--current");
  });

  it("uses the same subtle burnt-orange identity for Longhorns player and team modes", () => {
    expect(page).toContain("longhornsFamilyMode = longhornsMode || longhornsTeamsMode");
    expect(page).toContain('auction-board--longhorns');
    expect(page).toContain('"is-longhorns-mode"');
    expect(css).toContain("--longhorn-burnt-orange: #bf5700");
    expect(css).toContain(".auction-board--longhorns .auction-current__status");
    expect(css).toContain(".auction-catalog li.is-longhorns-mode.is-selected");
  });
});
