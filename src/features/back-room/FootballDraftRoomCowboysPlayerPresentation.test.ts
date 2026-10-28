import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"),
  "utf8",
);
const css = readFileSync(resolve(process.cwd(), "src/styles/auction.css"), "utf8");

describe("Cowboys player presentation", () => {
  it("shows the brief Dallas resume under current, awarded, and roster player names", () => {
    expect(page).toContain('import { cowboysPlayerSummary } from "./cowboysPlayerSummaries";');
    expect(page).toContain("{cowboysPlayerSummary(state.current_item.display_label)}");
    expect(page).toContain('<span className="draft-room-player-summary">{cowboysPlayerSummary(latestAward.display_label)}</span>');
    expect(page).toContain('ariaLabel="Cowboys roster comparison"');
    expect(page).toContain("itemSummary={cowboysPlayerSummary}");
  });

  it("uses a subtle Cowboys navy and silver identity on the room and browse card", () => {
    expect(page).toContain("cowboysFamilyMode = cowboysMode || cowboysTeamsMode");
    expect(page).toContain('cowboysFamilyMode ? " auction-board--cowboys" : ""');
    expect(page).toContain('isCowboysDraftRoomMode(mode.id) || isCowboysTeamsDraftRoomMode(mode.id) ? "is-cowboys-mode" : ""');
    expect(css).toContain("--cowboys-navy: #003594");
    expect(css).toContain("--cowboys-silver: #869397");
    expect(css).toContain(".auction-board--cowboys .auction-current__status");
    expect(css).toContain(".auction-board--cowboys .auction-collections__rows article > div.is-filled");
    expect(css).toContain(".auction-catalog li.is-cowboys-mode.is-selected");
  });
});
