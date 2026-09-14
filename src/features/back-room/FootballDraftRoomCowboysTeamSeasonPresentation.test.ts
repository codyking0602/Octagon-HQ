import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"),
  "utf8",
);
const css = readFileSync(resolve(process.cwd(), "src/styles/auction.css"), "utf8");

describe("Cowboys Teams presentation", () => {
  it("presents Cowboys team-seasons as a distinct navy/silver team mode", () => {
    expect(page).toContain('import { cowboysTeamSeasonSummary } from "./cowboysTeamSeasonSummaries";');
    expect(page).toContain("const cowboysTeamsMode = isCowboysTeamsDraftRoomMode(state.mode_id);");
    expect(page).toContain('cowboysTeamsMode ? "CURRENT COWBOYS TEAM"');
    expect(page).toContain('ariaLabel="Cowboys team-season comparison"');
    expect(page).toContain("itemSummary={cowboysTeamSeasonSummary}");
    expect(page).toContain('itemLabel="TEAM"');
    expect(page).toContain('cowboysFamilyMode ? " auction-board--cowboys"');
    expect(css).toContain("--cowboys-navy: #003594");
    expect(css).toContain("--cowboys-silver: #869397");
  });

  it("keeps the year visible and shows the brief season resume throughout the room", () => {
    expect(page).toContain('longhornsTeamsMode || cowboysTeamsMode ? "draft-room-season-label"');
    expect(page).toContain("{cowboysTeamSeasonSummary(state.current_item.display_label)}");
    expect(page).toContain('<span className="draft-room-season-summary">{cowboysTeamSeasonSummary(latestAward.display_label)}</span>');
    expect(css).toContain(".draft-room-season-label");
    expect(css).toContain("white-space: nowrap");
  });
});
