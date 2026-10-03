import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310244_wheel_football_final_grade_calibration.sql",
  "utf8",
);
const repository = readFileSync("src/features/play/wheelFootballRepository.ts", "utf8");
const page = readFileSync("src/features/back-room/FootballWheelPage.tsx", "utf8");

describe("Wheel of Football final-grade calibration v2", () => {
  it("uses 2.5x separation below the 95 anchor and preserves a monotonic elite tail", () => {
    expect(migration).toContain("95 + (2.5 * (p_raw_grade - 95))");
    expect(migration).toContain("when p_raw_grade <= 95");
    expect(migration).toContain("else round(least(100::numeric, p_raw_grade), 1)");
    expect(migration).toContain("'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v2'");
  });

  it("defines genuine ties from the exact seven-pick hidden-grade total", () => {
    expect(migration).toContain("create or replace function private.wheel_football_grade_total");
    expect(migration).toContain("then sum(pick.hidden_grade)::numeric");
    expect(migration).toContain("private.wheel_football_grade_total(challenge.id, challenge.creator_id)");
    expect(migration).toContain("private.wheel_football_grade_total(challenge.id, challenge.recipient_id)");
    expect(migration).toContain("'is_tie',");
    expect(migration).not.toContain("(challenge.creator_result ->> 'finalGrade')::integer >");
    expect(migration).not.toContain("(challenge.responder_result ->> 'finalGrade')::integer >");
  });

  it("keeps exact totals private while returning one-decimal final grades", () => {
    expect(migration).toContain("revoke all on function private.wheel_football_grade_total(uuid,uuid) from public, anon, authenticated");
    expect(migration).toContain("'creator_final_grade', (challenge.creator_result ->> 'finalGrade')::numeric");
    expect(migration).toContain("'recipient_final_grade', (challenge.responder_result ->> 'finalGrade')::numeric");
    expect(repository).not.toContain("wheel_football_grade_total");
    expect(repository).not.toContain("hidden_grade");
    expect(page).not.toContain("wheel_football_grade_total");
    expect(page).not.toContain("hidden_grade");
    expect(page).toContain("creator_final_grade.toFixed(1)");
    expect(page).toContain("recipient_final_grade.toFixed(1)");
  });

  it("allows decimal final grades through the client schema", () => {
    expect(repository).toContain("creator_final_grade: z.coerce.number().min(0).max(100)");
    expect(repository).toContain("recipient_final_grade: z.coerce.number().min(0).max(100)");
    expect(repository).not.toContain("creator_final_grade: z.coerce.number().int()");
    expect(repository).not.toContain("recipient_final_grade: z.coerce.number().int()");
  });
});
