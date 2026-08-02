import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608260001_picks_owner_identity_projection.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/picks_owner_identity_projection.sql",
  "utf8",
);
const identityGateway = readFileSync("src/features/identity/identityGateway.ts", "utf8");
const identityControl = readFileSync("src/features/identity/IdentityControl.tsx", "utf8");
const picksPage = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const picksProvider = readFileSync("src/features/picks/PicksProvider.tsx", "utf8");
const styles = readFileSync("src/styles/picks-owner-entry.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("Picks owner entry point architecture", () => {
  it("extends the existing private owner allowlist through one authenticated identity projection", () => {
    expect(migration).toContain("create or replace function public.get_my_identity_profile()");
    expect(migration).toContain("public.is_pick_control_owner(profile.id)");
    expect(migration).toContain("where profile.id = auth.uid()");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("grant execute on function public.get_my_identity_profile() to authenticated");
    expect(migration).not.toContain("grant select on public.pick_control_owners");
  });

  it("loads profile and Picks ownership once without a second repository or owner query", () => {
    expect(occurrences(identityGateway, /\.rpc\("get_my_identity_profile"\)/g)).toBe(1);
    expect(identityGateway).not.toContain('.from("profiles")');
    expect(identityGateway).not.toContain('.from("pick_control_owners")');
    expect(occurrences(picksProvider, /repository\.loadCurrentEvent\(\)/g)).toBe(1);
    expect(`${identityGateway}\n${identityControl}\n${picksPage}`).not.toMatch(/setInterval|setTimeout/);
  });

  it("uses the canonical owner route for both discoverability surfaces", () => {
    expect(picksPage).toContain('to="/picks/control#setup"');
    expect(picksPage).toContain("STAGE NEXT UFC EVENT");
    expect(picksPage).toContain("Stage → sync → review → publish → monitor → lock/results.");
    expect(picksPage).toContain('"Check back when the next UFC main card is ready."');
    expect(identityControl).toContain('to="/picks/control"');
    expect(identityControl).toContain("MANAGE PICKS");
    expect(occurrences(identityControl, /canControlPicks === true/g)).toBe(1);
    expect(occurrences(picksPage, /canControlPicks === true/g)).toBe(1);
  });

  it("keeps the entry styling mobile-first and loaded once", () => {
    expect(main.match(/styles\/picks-owner-entry\.css/g)).toHaveLength(1);
    expect(styles).toContain("@media (max-width: 390px)");
    expect(styles).toContain("overflow-wrap: anywhere");
    expect(styles).toContain("width: 100%");
  });

  it("keeps backend security coverage rollback-only and chained into the Picks suite", () => {
    expect(integrationSql).toContain("owner identity projection is incorrect");
    expect(integrationSql).toContain("member identity projection is incorrect");
    expect(integrationSql).toContain("browser role can read the private Picks owner table");
    expect(integrationSql).toContain("anonymous role can execute the private identity projection");
    const staleSuiteInclude = `${String.fromCharCode(92)}ir picks_stale_draft_rollover.sql`;
    expect(integrationSql).toContain("rollback;");
    expect(integrationSql.trimEnd().endsWith(staleSuiteInclude)).toBe(true);
  });
});
