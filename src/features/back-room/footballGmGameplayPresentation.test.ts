import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballGmModePage.tsx"),
  "utf8",
);
const css = readFileSync(
  resolve(process.cwd(), "src/styles/football-gm-mode.css"),
  "utf8",
);

describe("Football GM gameplay presentation", () => {
  it("shows the same hidden-grade outlook pill throughout trade decisions", () => {
    expect(page).toContain("function OutlookPill");
    expect(page.match(/<OutlookPill outlook=\{player\.outlook\} \/>/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(css).toContain(".football-gm__outlook-pill");
    expect(css).toContain(".football-gm__trade-targets button .football-gm__outlook-pill");
    expect(css).toContain(".football-gm__trade-package-player .football-gm__outlook-pill");
  });

  it("limits the voluntary cut without blocking free agency for later real vacancies", () => {
    expect(page).toContain("if (run.voluntaryFreeAgencyUsed || run.tradeChipPlayerIds.length || run.finalRoster.length !== FOOTBALL_GM_ROSTER_SLOTS.length) return;");
    expect(page).toContain("offseasonHoldingsCount < FOOTBALL_GM_ROSTER_SLOTS.length");
    expect(page).toContain("Any real vacancy created by a trade can always use free agency.");
    expect(page).toContain("that player cannot be re-signed this offseason");
  });
});
