import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const gradingMigration = readFileSync(
  "supabase/migrations/202612310239_wheel_football_grading.sql",
  "utf8",
);
const authorityMigration = readFileSync(
  "supabase/migrations/202612310240_wheel_football_grade_authority.sql",
  "utf8",
);
const repositorySource = readFileSync(
  "src/features/play/wheelFootballRepository.ts",
  "utf8",
);
const pageSource = readFileSync(
  "src/features/back-room/FootballWheelPage.tsx",
  "utf8",
);

describe("Wheel of Football hidden grading contract", () => {
  it("keeps the authority private and freezes a server-owned grade onto every pick", () => {
    expect(gradingMigration).toContain("create table if not exists private.wheel_football_grade_authority");
    expect(gradingMigration).toContain("revoke all on private.wheel_football_grade_authority from public, anon, authenticated");
    expect(gradingMigration).toContain("add column if not exists hidden_grade numeric(4,1)");
    expect(gradingMigration).toContain("before insert on private.wheel_football_picks");
    expect(gradingMigration).toContain("private.resolve_wheel_football_hidden_grade");
    expect(gradingMigration).not.toContain("grant select on private.wheel_football_grade_authority");
  });

  it("uses an equal-weight seven-pick raw average and a wider NFL presentation curve", () => {
    expect(gradingMigration).toContain("when count(*) = 7 then round(avg(pick.hidden_grade)::numeric, 1)");
    expect(gradingMigration).toContain("round((p_raw_score * 2) - 100)");
    expect(gradingMigration).toContain("raw 75/80/85/90/95/100 maps to 50/60/70/80/90/100");
  });

  it("reveals grades and scores only after the matchup is complete", () => {
    expect(gradingMigration).toContain("'grade', case when match.phase = 'complete' then pick.hidden_grade else null end");
    expect(gradingMigration).toContain("'creator_score', case when match.phase = 'complete'");
    expect(gradingMigration).toContain("'recipient_score', case when match.phase = 'complete'");
    expect(gradingMigration).toContain("'winner_profile_id'");
    expect(repositorySource).toContain("grade: z.coerce.number().min(0).max(100).nullable().optional()");
    expect(pageSource).toContain("Player grades stay hidden until both Superteams are complete");
    expect(pageSource).toContain("football-wheel-final-score");
    expect(pageSource).not.toContain("No grades or hidden score in v1");
  });

  it("seeds a meaningful current-ability elite tier and safely upgrades recognized existing picks once", () => {
    const seededRows = (authorityMigration.match(/^  \('/gm) ?? []).length;
    expect(seededRows).toBeGreaterThanOrEqual(100);
    expect(authorityMigration).toContain("'mylesgarrett','Myles Garrett','Front Seven',100.0");
    expect(authorityMigration).toContain("'bijanrobinson','Bijan Robinson','RB',99.0");
    expect(authorityMigration).toContain("'treymcbride','Trey McBride','TE',99.0");
    expect(authorityMigration).toContain("'derekstingleyjr','Derek Stingley Jr.','Secondary',99.0");
    expect(authorityMigration).toContain("update private.wheel_football_picks pick");
    expect(authorityMigration).toContain("authority.name_key = private.wheel_football_name_key(pick.display_name)");
  });

  it("enriches completed generic challenge results without changing the core turn RPC", () => {
    expect(gradingMigration).toContain("create or replace function private.enrich_completed_wheel_football_result()");
    expect(gradingMigration).toContain("'wheelScoreVersion', 'current-ability-v1'");
    expect(gradingMigration).toContain("'roster', private.wheel_football_result_roster");
    expect(gradingMigration).not.toContain("create or replace function private.pick_wheel_football");
  });
});
