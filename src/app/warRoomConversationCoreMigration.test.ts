import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608200002_war_room_conversation_core.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/war_room_conversation_core.sql",
  "utf8",
);
const router = readFileSync("src/app/router.tsx", "utf8");
const providers = readFileSync("src/app/providers.tsx", "utf8");
const bottomNavigation = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const contract = readFileSync("docs/war-room-conversation-core.md", "utf8");
const removedRuntimePaths = [
  "src/features/war-room/warRoomRepository.ts",
  "src/features/war-room/WarRoomProvider.tsx",
  "src/features/war-room/WarRoomPage.tsx",
  "src/features/war-room/WarRoomJoinPage.tsx",
];

describe("War Room conversation core", () => {
  it("retains the historical private database contract", () => {
    expect(sql).toContain("create table if not exists private.war_room_messages");
    expect(sql).toContain("create table if not exists private.war_room_mentions");
    expect(sql).toContain("alter table private.war_room_messages enable row level security");
    expect(sql).toContain("revoke all on private.war_room_messages from public, anon, authenticated");
    expect(sql).toContain("create or replace function public.get_war_room_snapshot");
    expect(sql).toContain("create or replace function public.post_war_room_message");
    expect(sql).toContain("create or replace function public.delete_war_room_message");
    expect(sql).not.toContain("grant select on private.war_room_messages to authenticated");
  });

  it("retains the historical paging, reply, mention, and deletion constraints", () => {
    expect(sql).toContain("limit v_limit + 1");
    expect(sql).toContain("p_before_created_at");
    expect(sql).toContain("War Room replies support one level only");
    expect(sql).toContain("War Room mention does not match the message text");
    expect(sql).toContain("Messages must contain between 1 and 500 characters");
    expect(sql).toContain("set deleted_at = now()");
    expect(sql).not.toContain("week_start");
  });

  it("removes frontend War Room ownership without a fallback route or provider", () => {
    expect(providers).not.toContain("WarRoomProvider");
    expect(router).not.toContain('path: "war-room"');
    expect(router).not.toContain('path: "war-room/join"');
    expect(bottomNavigation).not.toContain('label: "War Room"');
    expect(removedRuntimePaths.every((path) => !existsSync(path))).toBe(true);
    expect(contract).toContain("PR 2 created the guarded conversation core");
  });

  it("keeps rollback proof for access, pagination, replies, mentions, deletion, and privacy", () => {
    expect(integrationSql).toContain("unauthorized profile loaded the War Room conversation");
    expect(integrationSql).toContain("War Room accepted a nested reply");
    expect(integrationSql).toContain("latest War Room page did not enforce the 40-message contract");
    expect(integrationSql).toContain("admin soft delete exposed the deleted body");
    expect(integrationSql).toContain("authenticated role can access private War Room conversation tables directly");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
