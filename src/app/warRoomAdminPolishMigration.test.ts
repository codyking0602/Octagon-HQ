import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200007_war_room_access_admin.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/war_room_access_admin.sql",
  "utf8",
);
const conversationSql = readFileSync(
  "supabase/migrations/202608200002_war_room_conversation_core.sql",
  "utf8",
);
const page = readFileSync("src/features/war-room/WarRoomPage.tsx", "utf8");
const manager = readFileSync("src/features/war-room/WarRoomAccessManager.tsx", "utf8");
const provider = readFileSync("src/features/war-room/WarRoomProvider.tsx", "utf8");
const repository = readFileSync("src/features/war-room/warRoomRepository.ts", "utf8");
const styles = readFileSync("src/styles/war-room-admin-polish.css", "utf8");
const contract = readFileSync("docs/war-room-admin-polish.md", "utf8");

describe("War Room admin and mobile polish", () => {
  it("removes manual refresh and descriptive heading copy", () => {
    expect(page).toContain("<h1>War Room</h1>");
    expect(page).not.toContain("REFRESH");
    expect(page).not.toContain("PRIVATE OCTAGON HQ CONVERSATION");
    expect(page).not.toContain("One ongoing UFC conversation");
    expect(provider).not.toContain("refresh:");
    expect(contract).toContain("There is no Refresh button");
  });

  it("uses a compact naturally sized feed and composer", () => {
    expect(page).toContain("rows={1}");
    expect(page).toContain('"POST"');
    expect(page).toContain("resizeComposer");
    expect(styles).toContain(".war-room-shell");
    expect(styles).toContain("min-height: 0");
    expect(styles).toContain("max-height: min(56dvh, 560px)");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr) auto");
    expect(styles).toContain("max-height: 96px");
  });

  it("keeps access management admin-only behind guarded RPCs", () => {
    expect(migration).toContain("create or replace function public.get_war_room_access_roster");
    expect(migration).toContain("create or replace function public.set_war_room_profile_access");
    expect(migration).toContain("War Room admin access required");
    expect(migration).toContain("You cannot remove your own War Room access");
    expect(migration).toContain("grant execute on function public.get_war_room_access_roster() to authenticated");
    expect(migration).not.toContain("grant select on private.war_room_memberships to authenticated");
    expect(manager).toContain("Manage War Room Access");
    expect(manager).toContain('warRoom.role !== "admin"');
    expect(provider).toContain("const loadAccessRoster");
    expect(provider).toContain("const setProfileAccess");
    expect(repository).toContain('client.rpc("get_war_room_access_roster")');
    expect(repository).toContain('client.rpc("set_war_room_profile_access"');
  });

  it("notifies the affected profile to re-check canonical access", () => {
    expect(migration).toContain("war_room_profile_receives_access_broadcast");
    expect(migration).toContain("war_room_access_changed");
    expect(migration).toContain("war-room-access:");
    expect(repository).toContain("subscribeAccess(profileId");
    expect(repository).toContain('event: "war_room_access_changed"');
    expect(provider).toContain("repository.subscribeAccess(profileId");
    expect(provider).toContain("recheckAccess(false)");
  });

  it("locks deletion to own messages for members and all messages for admins", () => {
    expect(conversationSql).toContain("v_message.author_profile_id <> v_member.profile_id");
    expect(conversationSql).toContain("v_member.role <> 'admin'");
    expect(conversationSql).toContain("You cannot delete that War Room message");
    expect(page).toContain("message.canDelete");
    expect(integrationSql).toContain("member could not delete their own War Room message");
    expect(integrationSql).toContain("regular member deleted another person''s War Room message");
    expect(integrationSql).toContain("War Room admin could not delete another member''s message");
  });

  it("keeps rollback proof for access, permissions, and Realtime privacy", () => {
    expect(integrationSql).toContain("regular member loaded the War Room access roster");
    expect(integrationSql).toContain("admin toggle did not enable War Room access");
    expect(integrationSql).toContain("revoked profile retained War Room access");
    expect(integrationSql).toContain("War Room profile access Broadcast policy is missing");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
