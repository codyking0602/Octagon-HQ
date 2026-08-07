import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202609140005_remove_stale_hqcheck_profiles.sql",
  "utf8",
);
const verifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("disposable HQCHECK profile cleanup", () => {
  it("removes only the reserved live-verification identities", () => {
    expect(migration).toContain("profile.normalized_name ~ '^HQCHECK[0-9]+$'");
    expect(migration).toContain("lower(user_row.email) ~ '^hqcheck-[0-9]+@login\\.octagon-hq\\.app$'");
    for (const member of ["CODY", "BROCK", "RHONDA", "SHANE", "TONY", "TYLER", "TEST"]) {
      expect(migration).not.toContain(`'${member}'`);
    }
  });

  it("keeps the production verifier name inside the same reserved namespace", () => {
    expect(verifier).toContain('const displayName = `HQCHECK${suffix}`.slice(0, 24);');
    expect(verifier).toContain('const authEmail = `hqcheck-${suffix}@login.octagon-hq.app`;');
  });
});
