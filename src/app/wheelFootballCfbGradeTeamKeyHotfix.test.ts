import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CFB Wheel grade team-key hotfix", () => {
  const migration = readFileSync(
    "supabase/migrations/202612310250_wheel_football_cfb_grade_team_key_hotfix.sql",
    "utf8",
  );

  it("preserves canonical CFB lowercase school ids while keeping exact NFL codes", () => {
    expect(migration).toContain("v_team text := trim(coalesce(p_team_code, ''))");
    expect(migration).toContain("authority.team_code = v_team");
    expect(migration).not.toContain("upper(trim(coalesce(p_team_code");
  });

  it("keeps the resolver private and fail-closed for genuinely missing grades", () => {
    expect(migration).toContain("Missing locked Wheel grade");
    expect(migration).toContain(
      "revoke all on function private.resolve_wheel_football_grade_snapshot(text,text,text,text)",
    );
  });
});
