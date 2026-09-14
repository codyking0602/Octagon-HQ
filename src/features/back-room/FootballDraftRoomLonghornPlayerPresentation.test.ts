import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"),
  "utf8",
);
const css = readFileSync(resolve(process.cwd(), "src/styles/auction.css"), "utf8");

describe("Longhorns player summary presentation", () => {
  it("shows the brief Texas resume under current, awarded, and roster player names", () => {
    expect(page).toContain('import { longhornsPlayerSummary } from "./longhornsPlayerSummaries";');
    expect(page).toContain('className="draft-room-player-summary draft-room-player-summary--current"');
    expect(page).toContain("{longhornsPlayerSummary(state.current_item.display_label)}");
    expect(page).toContain('<span className="draft-room-player-summary">{longhornsPlayerSummary(latestAward.display_label)}</span>');
    expect(page).toContain("<LonghornsComparison state={state} itemSummary={longhornsPlayerSummary} />");
  });

  it("keeps the compact summary wrap-safe on mobile without changing Cowboys presentation", () => {
    expect(css).toContain(".draft-room-player-summary {");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain(".draft-room-player-summary--current");
    expect(page).toContain('? <LonghornsComparison state={state} itemSummary={longhornsPlayerSummary} />');
    expect(page).toContain('? <LonghornsComparison state={state} ariaLabel="Cowboys roster comparison" />');
  });
});
