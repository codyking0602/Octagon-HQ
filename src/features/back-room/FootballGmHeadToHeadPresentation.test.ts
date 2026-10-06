import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(
  resolve(process.cwd(), "src/features/back-room/FootballGmHeadToHeadPage.tsx"),
  "utf8",
);
const css = readFileSync(
  resolve(process.cwd(), "src/styles/football-gm-mode.css"),
  "utf8",
);
const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202612310271_football_gm_head_to_head.sql"),
  "utf8",
);
const bottomNav = readFileSync(
  resolve(process.cwd(), "src/components/BottomNavigation.tsx"),
  "utf8",
);

describe("Football GM head-to-head presentation", () => {
  it("keeps the draft as a two-sided shared-player battle", () => {
    expect(page).toContain("football-gm-versus");
    expect(page).toContain("OPPONENT");
    expect(page).toContain("WATCH THE BOARD UPDATE LIVE");
    expect(page).toContain("Their pick locks that player out of your shared draft pool.");
    expect(page).toContain("excludedPlayerIds={opponentHeldIds}");
    expect(css).toContain(".football-gm-versus__row");
  });

  it("supports both CPU and one human opponent without changing the locked game", () => {
    expect(page).toContain("VS CPU");
    expect(page).toContain("CHALLENGE {opponentName}");
    expect(page).toContain("footballGmCpuDraftChoice");
    expect(page).toContain("footballGmCpuOffseason");
    expect(page).toContain("FOOTBALL_GM_CAP");
    expect(page).toContain("FOOTBALL_GM_ROSTER_SLOTS");
  });

  it("awards the entire first offseason to the lower Year 1 finisher", () => {
    expect(page).toContain("Lower Year 1 finisher gets first access to the shared player market.");
    expect(page).toContain("HAS THE FRONT OFFICE");
    expect(page).toContain("finished the offseason. The remaining market is yours.");
    expect(migration).toContain("private.football_gm_finish_rank");
    expect(migration).toContain("offseason_first_profile_id");
    expect(migration).toContain("The lower Year 1 finisher gets first access to the shared market.");
  });

  it("enforces match-wide player uniqueness in the server-owned runtime", () => {
    expect(migration).toContain("That player was already drafted in this match");
    expect(migration).toContain("That player is already held by the other GM");
    expect(migration).toContain("current_turn_profile_id");
    expect(migration).toContain("private.football_gm_held_player_ids");
  });

  it("uses the NFL wheel treatment in draft, trade and free agency", () => {
    expect(page.match(/<GmFootballWheel/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(page).toContain("SPIN THE 1YR MARKET");
    expect(page).toContain("Same NFL wheel.");
    expect(css).toContain(".football-gm__market-wheel");
    expect(css).toContain(".football-gm__trade-wheel-stage");
  });

  it("keeps quality and outlook scouting in the shared market and allows pills to wrap", () => {
    expect(page).toContain("PlayerQualityPill");
    expect(page).toContain("PlayerOutlookPill");
    expect(css).toContain(".football-gm__candidate-tags");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain(".football-gm__market-player");
  });

  it("anchors the bottom navigation to the live visual viewport after iOS resume", () => {
    expect(bottomNav).toContain("visualViewportShift");
    expect(bottomNav).toContain("translate3d(0, ${visualViewportShift}px, 0)");
    expect(bottomNav).toContain("window.setTimeout(syncViewportState, 1500)");
  });
});
