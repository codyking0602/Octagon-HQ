import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/styles/football-foundation.css"), "utf8");
const page = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballDraftRoomPage.tsx"), "utf8");

describe("Draft Room Trio presentation contract", () => {
  it("keeps all three package identities wrap-safe instead of truncating names", () => {
    expect(css).toContain(".draft-room-trio-package__player");
    expect(css).toContain("grid-template-columns: 34px 23px minmax(0, 1fr)");
    expect(css).toContain("min-width: 0");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(page).toContain('TRIO_POSITIONS.map((position, index)');
    expect(page).not.toContain("text-overflow: ellipsis");
  });

  it("carries the selected mode artwork into every live and completed Draft Room header", () => {
    expect(page).toContain('<DraftRoomModeArtworkImage');
    expect(page).toContain('modeId={state.mode_id}');
    expect(page).not.toContain('{!trioMode ? (\n          <img');
  });

  it("adds restrained team identity instead of full-color Trio rows", () => {
    expect(page).toContain('trioPlayerVisualIdentity(modeId, player.label)');
    expect(page).toContain('<BuildQbTeamMark identity={identity} compact />');
    expect(css).toContain(".draft-room-trio-package__player.has-team-identity");
    expect(css).toContain("rgba(var(--build-qb-team-rgb), .14)");
    expect(css).toContain("inset 3px 0 0 var(--build-qb-team-secondary)");
  });

  it("has a dedicated phone treatment for two side-by-side three-trio rosters", () => {
    expect(css).toContain("@media (max-width: 430px)");
    expect(css).toContain(".draft-room-trio-rosters__grid");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(css).toContain(".draft-room-trio-package--compact .draft-room-trio-package__player");
  });


  it("keeps the sport-filtered visual browse compact and phone-safe", () => {
    expect(page).toContain('className="auction-catalog draft-room-catalog"');
    expect(page).toContain('className="auction-catalog__tabs draft-room-sport-toggle"');
    expect(page).toContain('SEALED BID CHALLENGE');
    expect(css).toContain(".draft-room-sport-toggle");
    expect(css).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(css).toContain(".draft-room-catalog .auction-catalog__name");
    expect(css).toContain("white-space: normal");
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("env(safe-area-inset-bottom, 0px)");
  });

  it("keeps the completed Trio result focused on winner, overall score, and rosters", () => {
    expect(page).toContain('const trioResult = trioMode && state.lifecycle_state === "completed"');
    expect(page).toContain("{!trioResult ? <section className=\"auction-scoreboard surface-card\">");
    expect(page).toContain("{latestRound && !trioResult ? (");
    expect(page).toContain('{openRosterMode ? "FINAL ROSTER SCORE" : "FINAL BUILD SCORE"}');
    expect(page).toContain("? <TrioComparison state={state} />");
    expect(page).toContain("? <LonghornsComparison state={state} />");
    expect(page).toContain(": <BuildComparison state={state} />");
  });
});
