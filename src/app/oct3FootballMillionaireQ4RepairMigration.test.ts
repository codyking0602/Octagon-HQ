import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310240_oct3_football_millionaire_q4_repair.sql",
  "utf8",
);

describe("October 3 Football Millionaire Q4 repair", () => {
  it("repairs the persisted self-answering question without changing its answer slot", () => {
    expect(migration).toContain("Which of these programs won a national championship most recently?");
    expect(migration).toContain("Which program did Urban Meyer coach immediately before he became Florida''s head coach?");
    expect(migration).toContain("millionaire-cfb-run-2-q4:A");
    expect(migration).toContain("'correct_choice_id', 'A'");
    expect(migration).toContain("'correctChoiceId', 'A'");
  });

  it("scopes the repair to Oct 3 Football Millionaire", () => {
    expect(migration).toContain("daily.central_day = date '2026-10-03'");
    expect(migration).toContain("schedule.sport = 'football'");
    expect(migration).toContain("daily.game_type = 'millionaire'");
  });
});
