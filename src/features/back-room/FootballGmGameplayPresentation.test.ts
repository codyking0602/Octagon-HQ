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
  it("shows the same outlook pill during draft, roster management, trade targeting, and asking prices", () => {
    expect(page).toContain('function PlayerOutlookPill');
    expect(page).toContain('<PlayerOutlookPill outlook={player.outlook} />');
    expect(page.match(/PlayerOutlookPill outlook=/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
    expect(css).toContain(".football-gm__outlook-pill");
    expect(css).toContain(".football-gm__trade-targets button .football-gm__outlook-pill");
    expect(css).toContain(".football-gm__trade-package-player .football-gm__outlook-pill");
  });

  it("keeps the intro to one compact three-stage game flow", () => {
    expect(page).toContain("BUILD IT. SURVIVE THE OFFSEASON. SEE IF IT WINS.");
    expect(page).toContain('className="football-gm__intro-stages"');
    expect(page).toContain("<strong>DRAFT</strong>");
    expect(page).toContain("<strong>OFFSEASON</strong>");
    expect(page).toContain("<strong>3-YEAR RESULT</strong>");
    expect(page).toContain('className="football-gm__intro-facts"');
    expect(page).toContain("HIDDEN GRADES");
    expect(page).not.toContain("BUILD IT. PAY FOR IT. LIVE WITH IT.");
    expect(page).not.toContain("football-gm__intro-note");
    expect(css).toContain(".football-gm__intro-stages > article");
    expect(css).toContain(".football-gm__intro-facts");
  });

  it("keeps the one-time restriction on voluntary release, not on legitimate vacancy free agency", () => {
    expect(page).toContain("if (run.voluntaryFreeAgencyUsed || run.tradeChipPlayerIds.length || run.finalRoster.length !== FOOTBALL_GM_ROSTER_SLOTS.length) return;");
    expect(page).toContain("footballGmCanUseFreeAgency(run.finalRoster, run.tradeChipPlayerIds)");
    expect(page).toContain("ONE VOLUNTARY RELEASE");
    expect(page).toContain("any genuine vacancy can use free agency");
    expect(page).toContain("that player cannot be re-signed this offseason");
  });
});
