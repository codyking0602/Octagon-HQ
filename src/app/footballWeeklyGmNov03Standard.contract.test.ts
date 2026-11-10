import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202612310923_weekly_gm_nov03_standard.sql", "utf8");
const weeklyPage = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const gmPage = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const play = readFileSync("src/features/play/PlayV2Page.tsx", "utf8");
const archive = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");

describe("November 3 standard Weekly NFL GM", () => {
  it("publishes only the Nov 3–9 official GM event, not an auction", () => {
    expect(migration).toContain("date '2026-11-03'");
    expect(migration).toContain("date '2026-11-10'");
    expect(migration).toContain("'nfl-gm-championship'");
    expect(migration).toContain("'featured_challenge', 'nfl-gm'");
    expect(migration).toContain("'required', false, 'available', false");
    expect(play).toContain('to="/football/weekly-gm"');
    expect(play).not.toContain('Date.parse("2026-11-10T06:00:00Z")');
    expect(archive).not.toContain('Date.parse("2026-11-10T06:00:00Z")');
  });

  it("starts both official runs with standard seven-spin wheel and an empty roster", () => {
    expect(weeklyPage).toContain('weekStart >= "2026-11-03"');
    expect(weeklyPage).toContain('title: "FRANCHISE 1"');
    expect(weeklyPage).toContain('title: "FRANCHISE 2"');
    expect(weeklyPage).toContain('isStandardWeek ? "Seven" : "Six"');
    expect(gmPage).toContain("isStandardWeeklyGmSeed(weeklyRun.seed)");
    expect(gmPage).toContain('return { ...initialRun(weeklyRun.seed, "three-plus-one"), phase: "draft" };');
    expect(migration).toContain("Standard Weekly GM must begin with an empty roster");
    expect(migration).toContain("Standard GM must draft all seven wheel picks");
    expect(migration).toContain("v_spin <> 0");
    expect(migration).toContain("v_spin > 7");
  });

  it("preserves older special formats and official /200 standings", () => {
    expect(weeklyPage).toContain('weekStart === OCT27_WEEKLY_GM_START');
    expect(weeklyPage).toContain('weekStart === "2026-10-20"');
    expect(weeklyPage).toContain('myTotal.toFixed(1)} / 200');
    expect(migration).toContain("v_attempt.week_start = date '2026-10-27'");
    expect(migration).toContain("v_attempt.week_start < date '2026-10-27'");
  });
});
