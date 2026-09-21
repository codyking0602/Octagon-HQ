import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310150_nfl_build_qb_weekly_runtime.sql",
  "utf8",
);
const grading = JSON.parse(
  readFileSync("data/generated/football/nfl-build-qb-v2-trait-grades.json", "utf8"),
) as {
  populationCount: number;
  rows: Array<{
    name: string;
    Arm: number;
    Accuracy: number;
    Processing: number;
    Mobility: number;
    overall: number;
  }>;
};
const authorityInsert = migration.slice(
  migration.indexOf("insert into private.nfl_build_qb_v2_authority"),
  migration.indexOf("on conflict(item_reference)", migration.indexOf("insert into private.nfl_build_qb_v2_authority")),
);
const migratedTraitRows = new Map(
  [...authorityInsert.matchAll(/\('build-qb-[^']+','([^']+)','[^']+',([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+),([0-9.]+)\)/g)]
    .map((match) => [match[1], {
      Arm: Number(match[2]),
      Accuracy: Number(match[3]),
      Processing: Number(match[4]),
      Mobility: Number(match[5]),
      overall: Number(match[6]),
    }] as const),
);

const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);
const gate = readFileSync(
  "src/features/back-room/FootballWeeklyBuildQbGate.tsx",
  "utf8",
);
const styles = readFileSync(
  "src/styles/football-weekly-build-qb.css",
  "utf8",
);

describe("NFL Build a QB Weekly runtime contract", () => {
  it("uses the locked 112-QB four-trait authority without changing the grades", () => {
    expect(grading.populationCount).toBe(112);
    expect(grading.rows).toHaveLength(112);
    expect(new Set(grading.rows.map((row) => row.name)).size).toBe(112);
    expect(migration).toContain("create table if not exists private.nfl_build_qb_v2_authority");
    expect(migration).toContain("NFL Build a QB v2 authority must contain 112 quarterbacks");
    expect(migration).toContain("'Arm',qb.arm");
    expect(migration).toContain("'Accuracy',qb.accuracy");
    expect(migration).toContain("'Processing',qb.processing");
    expect(migration).toContain("'Mobility',qb.mobility");
    expect(migration).toContain("football_weekly_auction_items_hidden_grade_subject_check");
    expect(migration).toContain("subject_key <> 'cfb-best-teams-since-2000'");
    expect(migration).toContain("or hidden_grade >= 74.0");
    expect(migratedTraitRows.size).toBe(112);
    for (const row of grading.rows) {
      expect(migratedTraitRows.get(row.name)).toEqual({
        Arm: row.Arm,
        Accuracy: row.Accuracy,
        Processing: row.Processing,
        Mobility: row.Mobility,
        overall: row.overall,
      });
    }
  });

  it("routes the next Tuesday to NFL Build a QB while preserving the active CFB week", () => {
    expect(migration).toContain("'nfl-build-qb'");
    expect(migration).toContain("date '2026-09-22'");
    expect(migration).toContain("date '2026-09-15')<>'cfb-best-teams-since-2000'");
    expect(migration).toContain("date '2026-09-22')<>'nfl-build-qb'");
    expect(migration).toContain("date '2026-09-29')<>'cfb-best-teams-since-2000'");
    expect(migration).toContain("materialize_football_weekly_auction_week_cfb");
  });

  it("keeps the board at exactly four trait-bound auctions per day and 28 for the week", () => {
    expect(migration).toContain("slot between 1 and 4");
    expect(migration).toContain("array['Arm','Accuracy','Processing','Mobility']");
    expect(migration).toContain("count(*) from private.football_weekly_auction_board where week_start=p_week_start)=28");
    expect(migration).toContain("having count(*)<>7");
    expect(migration).toContain("NFL Build a QB Weekly requires exactly six locked participants");
    expect(migration).toContain(") <> 6");
    expect(migration).not.toContain("makeup");
    expect(gate).toContain("TODAY’S FOUR TRAITS");
  });

  it("uses the hidden Premium / Standard / Grinder / Chaos caliber mix", () => {
    expect(migration).toContain("when v_roll<0.15 then 'Premium'");
    expect(migration).toContain("when v_roll<0.75 then 'Standard'");
    expect(migration).toContain("when v_roll<0.95 then 'Grinder'");
    expect(migration).toContain("else 'Chaos'");
    expect(migration).toContain("array['96+','90-95.5','90-95.5','84-89.5','84-89.5','78-83.5','78-83.5']");
    expect(migration).toContain("v_low_count>=1");
  });

  it("enforces one free pass per trait and a $1 minimum after that pass is consumed", () => {
    expect(migration).toContain("private.football_weekly_auction_trait_passes");
    expect(migration).toContain("coalesce(bid.amount,0)=0");
    expect(migration).toContain("on conflict(week_start,profile_id,trait) do nothing");
    expect(migration).toContain("Your free % pass is already used; bid at least $1");
    expect(gate).toContain("one free pass per trait");
    expect(gate).toContain("$0 uses your free pass for that trait.");
    expect(gate).toContain("requires at least a $1 bid until you fill it.");
  });

  it("keeps the $40 completion-preserving bankroll and four required wins", () => {
    expect(migration).toContain("private.football_weekly_auction_bids_preserve_required_completion");
    expect(migration).toContain("v_bankroll,4,v_owned,v_bids_array");
    expect(migration).toContain("array[37,1,1,1]");
    expect(migration).toContain("array[40,0,0,0]");
    expect(gate).toContain("4 traits. $40. 7 days.");
  });

  it("prevents repeat-trait wins and keeps Build a QB out of the Daily bonus-win calculation", () => {
    expect(migration).toContain("prior_board.trait=v_trait");
    expect(migration).toContain("auction_week.subject_key = ''cfb-best-teams-since-2000''");
    expect(gate).not.toContain("bonus Daily Challenge win");
  });

  it("keeps grades private until final results", () => {
    const getterStart = migration.indexOf("create or replace function private.get_my_football_weekly_build_qb");
    const submitStart = migration.indexOf("create or replace function private.submit_my_football_weekly_build_qb_bids");
    const getter = migration.slice(getterStart, submitStart);
    expect(getter).not.toContain("'grade'");
    expect(migration).toContain("private.football_weekly_build_qb_final_payload");
    expect(migration).toContain("'grade',private.nfl_build_qb_v2_trait_grade");
    expect(repository).toContain('z.literal("nfl-build-qb")');
  });

  it("ships a compact mobile-first trait presentation", () => {
    expect(styles).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(styles).toContain("@media (max-width: 560px)");
    expect(styles).toContain("text-overflow: ellipsis");
    expect(styles).toContain("overflow-y: auto");
    expect(styles).toContain("env(safe-area-inset-bottom)");
  });
});
