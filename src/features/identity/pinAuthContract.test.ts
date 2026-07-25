import { describe, expect, it } from "vitest";
import pinAuthFunction from "../../../supabase/functions/pin-auth/index.ts?raw";
import authoritativeIdentityMigration from "../../../supabase/migrations/202607280003_authoritative_auth_identity.sql?raw";

describe("PIN authentication identity contract", () => {
  it("uses the verified profile UUID to resolve the authoritative Auth user", () => {
    expect(pinAuthFunction).toContain("admin.auth.admin.getUserById(match.profile_id)");
    expect(pinAuthFunction).toContain("issueSessionToken(authEmail)");
    expect(pinAuthFunction).not.toContain("issueSessionToken(match.internal_email)");
  });

  it("keeps PIN verification independent from the credential table's stored email", () => {
    expect(authoritativeIdentityMigration).toContain("returns table (\n  profile_id uuid,\n  auth_result text,");
    expect(authoritativeIdentityMigration).not.toContain("internal_email text");
    expect(authoritativeIdentityMigration).not.toContain("c.internal_email");
  });
});
