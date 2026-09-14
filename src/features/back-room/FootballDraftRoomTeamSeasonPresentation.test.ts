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
});
