import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310241_mlb_division_series_transition.sql",
  "utf8",
);
const repository = readFileSync("src/features/mlb/mlbPlayoffsRepository.ts", "utf8");
const picks = readFileSync("src/features/mlb/MlbPicksPage.tsx", "utf8");
const css = readFileSync("src/styles/mlb-playoffs.css", "utf8");

describe("2026 MLB Division Series transition", () => {
  it("records every Wild Card winner and advances the live season", () => {
    expect(migration).toContain("('nl-wc-1'::text, 'atl'::text");
    expect(migration).toContain("('al-wc-1'::text, 'cws'::text");
    expect(migration).toContain("('al-wc-2'::text, 'nyy'::text");
    expect(migration).toContain("('nl-wc-2'::text, 'sd'::text");
    expect(migration).toContain("current_round = 'division_series'");
  });

  it("publishes all four Division Series with frozen series-winner odds", () => {
    for (const id of ["al-ds-1", "al-ds-2", "nl-ds-1", "nl-ds-2"]) {
      expect(migration).toContain(`'${id}'`);
    }
    expect(migration).toContain("'DraftKings series winner · frozen Oct 2'");
    expect(migration).toContain("'DraftKings series winner · frozen Oct 1'");
    expect(migration).toContain("120,\n      -140");
    expect(migration).toContain("-120,\n      100");
    expect(migration).toContain("175,\n      -210");
    expect(migration).toContain("150,\n      -180");
  });

  it("uses a truthful one-time grace lock instead of changing Game 1 times", () => {
    expect(migration).toContain("add column if not exists picks_lock_at timestamptz");
    expect(migration.match(/2026-10-04 19:45:00\+00/g)?.length).toBe(4);
    expect(migration).toContain("2026-10-03 17:00:00+00");
    expect(migration).toContain("2026-10-03 20:00:00+00");
    expect(migration).toContain("2026-10-03 22:30:00+00");
    expect(migration).toContain("2026-10-04 00:30:00+00");
    expect(migration).toContain("G2 · Sun Oct 4 · 3:00 PM CT · FS1");
    expect(migration).toContain("G2 · Sun Oct 4 · 7:00 PM CT · FS1");
    expect(migration).toContain("coalesce(v_series.picks_lock_at, v_series.starts_at)");
    expect(migration).toContain("coalesce(series_row.picks_lock_at, series_row.starts_at)");
    expect(repository).toContain("picks_lock_at:");
    expect(picks).toContain("series.picks_lock_at ?? series.starts_at");
    expect(picks).toContain("PICKS LOCK");
  });

  it("marks eliminated teams throughout the submitted bracket", () => {
    expect(picks).toContain("eliminatedTeamIds");
    expect(picks).toContain('is-eliminated');
    expect(css).toContain(".mlb-bracket-mini-team.is-eliminated > strong");
    expect(css).toContain("text-decoration-line: line-through");
  });

  it("leaves notification delivery to the secured canonical scheduler", () => {
    expect(migration).not.toContain("select public.dispatch_due_mlb_notifications(now())");
    expect(migration).toContain("canonical notification scheduler");
  });
});
