import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-foundation.css"), "utf8");
const page = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"), "utf8");

describe("Draft Room Trio presentation contract", () => {
  it("keeps all three package identities wrap-safe instead of truncating names", () => {
    expect(css).toContain(".draft-room-trio-package__player");
    expect(css).toContain("grid-template-columns: 34px minmax(0, 1fr)");
    expect(css).toContain("min-width: 0");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(page).toContain('TRIO_POSITIONS.map((position, index)');
    expect(page).not.toContain("text-overflow: ellipsis");
  });

  it("has a dedicated phone treatment for two side-by-side three-trio rosters", () => {
    expect(css).toContain("@media (max-width: 430px)");
    expect(css).toContain(".draft-room-trio-rosters__grid");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(css).toContain(".draft-room-trio-package--compact .draft-room-trio-package__player");
  });

  it("keeps the completed Trio result focused on winner, overall score, and rosters", () => {
    expect(page).toContain('const trioResult = trioMode && state.lifecycle_state === "completed"');
    expect(page).toContain("{!trioResult ? <section className=\"auction-scoreboard surface-card\">");
    expect(page).toContain("{latestRound && !trioResult ? (");
    expect(page).toContain('{trioMode ? "FINAL ROSTER SCORE" : "FINAL BUILD SCORE"}');
    expect(page).toContain("{trioMode ? <TrioComparison state={state} /> : <BuildComparison state={state} />}");
  });
});
