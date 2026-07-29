import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608200001_war_room_access_foundation.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/war_room_access_foundation.sql",
  "utf8",
);
const router = readFileSync("src/app/router.tsx", "utf8");
const bottomNavigation = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const contract = readFileSync("docs/war-room-access-foundation.md", "utf8");

describe("War Room access foundation", () => {
  it("keeps membership and invite evidence private and stores only invite hashes", () => {
    expect(sql).toContain("create table if not exists private.war_room_memberships");
    expect(sql).toContain("create table if not exists private.war_room_invites");
    expect(sql).toContain("code_hash bytea not null unique");
    expect(sql).toContain("alter table private.war_room_invites enable row level security");
    expect(sql).toContain("revoke all on private.war_room_invites from public, anon, authenticated");
    expect(sql).not.toContain("create table if not exists public.war_room");
  });

  it("exposes only guarded access and invite joining to signed-in profiles", () => {
    expect(sql).toContain("create or replace function public.get_my_war_room_access");
    expect(sql).toContain("create or replace function public.join_war_room_with_invite");
    expect(sql).toContain("'mode', 'locked'");
    expect(sql).toContain("'mode', 'invite'");
    expect(sql).toContain("'mode', 'eligible'");
    expect(sql).toContain("grant execute on function public.get_my_war_room_access(text) to authenticated");
    expect(sql).toContain("grant execute on function public.join_war_room_with_invite(text) to authenticated");
    expect(sql).toContain("War Room access is not available for this profile");
  });

  it("keeps grant, revoke, and invite creation service-role-only", () => {
    expect(sql).toContain("create or replace function public.create_war_room_invite");
    expect(sql).toContain("create or replace function public.revoke_war_room_invite");
    expect(sql).toContain("create or replace function public.set_war_room_membership");
    expect(sql).toContain("if auth.role() <> 'service_role'");
    expect(sql).toContain("grant execute on function public.create_war_room_invite");
    expect(sql).toContain("grant execute on function public.set_war_room_membership");
    expect(sql).not.toContain("grant execute on function public.create_war_room_invite(timestamptz, integer, uuid) to authenticated");
  });

  it("does not expose a War Room route, tab, placeholder, or provider in PR 1", () => {
    expect(router.toLowerCase()).not.toContain("war-room");
    expect(bottomNavigation.toLowerCase()).not.toContain("war room");
    expect(contract).toContain("No route, tab, page, provider, badge, feed, or placeholder");
    expect(contract).toContain("Home → Rankings → Picks → Play → War Room");
  });

  it("keeps rollback coverage for privacy, invite use, revocation, and managed access", () => {
    expect(integrationSql).toContain("unauthorized signed-in member received War Room access");
    expect(integrationSql).toContain("valid invite did not produce the Join with Invite state");
    expect(integrationSql).toContain("consumed single-use invite admitted a second profile");
    expect(integrationSql).toContain("revoked membership bypassed revocation with a generic invite");
    expect(integrationSql).toContain("authenticated role can read private War Room access tables directly");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
