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
    expect(page).toContain('<PlayerOutlookPill player={player} />');
    expect(page).toContain('<PlayerOutlookPill player={player} year={2} seed={seed} />');
    expect(page).toContain('<PlayerDevelopmentNote player={player} seed={seed} />');
    expect(page).toContain('footballGmRepriceLabel(player.extensionRisk)');
    expect(page.match(/PlayerOutlookPill player=/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
    expect(css).toContain(".football-gm__outlook-pill");
    expect(css).toContain(".football-gm__trade-targets button .football-gm__outlook-pill");
    expect(css).toContain(".football-gm__trade-package-player .football-gm__outlook-pill");
  });

  it("reuses the live Wheel of Football interaction and adds GM scouting context", () => {
    expect(page).toContain('import "../../styles/football-wheel.css";');
    expect(page).toContain('className="football-wheel surface-card"');
    expect(page).toContain('className="football-wheel__pointer"');
    expect(page).toContain("current + 1080 + correction");
    expect(page).toContain("}, 1550);");
    expect(page).toContain('className="football-wheel-picker football-gm__picker surface-card"');
    expect(page).toContain('className="football-wheel-picker__slots football-gm__position-tabs"');
    expect(page).toContain("Choose a position, then a player. GM automatically fits the legal roster spots.");
    expect(page).toContain('aria-pressed={selectedPosition === position}');
    expect(page).toContain('visibleCandidates.map(({ player, salary }) => (');
    expect(page).toContain('onClick={() => onPick(player.id)}');
    expect(page).toContain('if (player.family === "Front Seven") return "FRONT 7";');
    expect(page).toContain('const positions = ["QB", "RB", "WR", "TE", "FRONT 7", "DB"] as const;');
    expect(page).not.toContain('player.eligibleSlots.includes("DL")');
    expect(page).not.toContain('onPick(player.id, selectedPosition)');
    expect(page).toContain('className="football-wheel-picker__headshot"');
    expect(page).toContain("ELITE / IMPACT / STARTER / DEPTH");
    expect(page).toContain("LOW / MED / HIGH REPRICE");
    expect(page).toContain("HIGH UPSIDE / RISING / STEADY / BOOM/BUST / DECLINE RISK");
    expect(page).toContain("SCOUT KEY");
    expect(page).toContain("Exact grades stay hidden.");
    expect(page).not.toContain("EXTENSION RISK");
    expect(css).toContain(".football-gm__scout-sheet");
    expect(css).toContain(".football-gm__quality-pill.quality-elite");
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
  it("restores an unfinished standalone GM run after an app restart", () => {
    expect(page).toContain("activeStorageKey");
    expect(page).toContain("loadActivePersistedRun");
    expect(page).toContain("runRepository?.loadLatestActive()");
    expect(page).toContain("RESTORING YOUR FRONT OFFICE");
    expect(page).toContain("window.localStorage.setItem(activeStorageKey(identity.profile.id), run.seed)");
    expect(page).toContain("window.localStorage.removeItem(activeStorageKey(identity.profile.id))");
  });

});
