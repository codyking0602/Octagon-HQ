import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608250002_pick_owner_entry_capability.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/pick_owner_entry_capability.sql",
  "utf8",
);
const identityGateway = readFileSync(
  "src/features/identity/identityGateway.ts",
  "utf8",
);
const identityControl = readFileSync(
  "src/features/identity/IdentityControl.tsx",
  "utf8",
);
const picksPage = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const picksRepository = readFileSync(
  "src/features/picks/picksRepository.ts",
  "utf8",
);
const ownerStyles = readFileSync(
  "src/styles/picks-owner-entry.css",
  "utf8",
);
const main = readFileSync("src/main.tsx", "utf8");

function occurrences(value: string, needle: string) {
  return value.split(needle).length - 1;
}

describe("Picks owner entry capability", () => {
  it("projects the existing owner allowlist without creating a second authorization rule", () => {
    expect(migration).toContain(
      "select public.is_pick_control_owner(auth.uid())",
    );
    expect(migration).toContain(
      "grant execute on function public.get_my_pick_control_capability()",
    );
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("display_name");
    expect(integrationSql).toContain(
      "browser roles can invoke the canonical owner predicate directly",
    );
    expect(integrationSql).toContain(
      "browser role can read the private Picks owner allowlist",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });

  it("loads the owner capability once through the existing identity profile owner", () => {
    expect(occurrences(identityGateway, 'rpc("get_my_pick_control_capability")')).toBe(1);
    expect(identityGateway).toContain("canManagePicks:");
    expect(identityGateway).toContain("capabilityResult.error");
    expect(identityGateway).toContain("? false");
    expect(identityGateway).not.toContain("pick_control_owners");
    expect(identityGateway).not.toContain("displayName === \"CODY\"");
  });

  it("uses the one canonical Control Center setup destination", () => {
    expect(picksPage).toContain('to="/picks/control#setup"');
    expect(identityControl).toContain('to="/picks/control#setup"');
    expect(picksPage).toContain("identity.profile?.canManagePicks");
    expect(identityControl).toContain("identity.profile.canManagePicks");
    expect(picksPage).not.toContain("displayName === \"CODY\"");
    expect(identityControl).not.toContain("displayName === \"CODY\"");
  });

  it("does not duplicate the current-event owner, initialization, or polling", () => {
    expect(occurrences(picksRepository, 'rpc("get_current_pick_event")')).toBe(1);
    expect(picksPage).not.toContain("setInterval(");
    expect(identityControl).not.toContain("get_current_pick_event");
    expect(identityGateway).not.toContain("get_current_pick_event");
  });

  it("keeps the owner actions compact at the phone breakpoint", () => {
    expect(ownerStyles).toContain("width: min(100%, 320px)");
    expect(ownerStyles).toContain("min-height: 48px");
    expect(ownerStyles).toContain("@media (max-width: 420px)");
    expect(main).toContain('import "./styles/picks-owner-entry.css"');
  });
});
