import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = [
  "supabase/migrations/202608200003_war_room_read_foundation.sql",
  "supabase/migrations/202608200004_war_room_access_launch.sql",
  "supabase/migrations/202608200005_war_room_read_rpc.sql",
  "supabase/migrations/202608200006_war_room_realtime.sql",
].map((path) => readFileSync(path, "utf8")).join("\n");
const integrationSql = readFileSync(
  "supabase/tests/war_room_launch.sql",
  "utf8",
);
const router = readFileSync("src/app/router.tsx", "utf8");
const navigation = readFileSync("src/components/BottomNavigation.tsx", "utf8");
const contract = readFileSync("docs/war-room-launch.md", "utf8");
const removedRuntimePaths = [
  "src/features/war-room/warRoomRepository.ts",
  "src/features/war-room/WarRoomProvider.tsx",
  "src/features/war-room/WarRoomPage.tsx",
  "src/features/war-room/WarRoomJoinPage.tsx",
];

describe("War Room launch history", () => {
  it("retains the historical unread and read-position database contract", () => {
    expect(sql).toContain("add column if not exists last_read_message_id uuid");
    expect(sql).toContain("create or replace function private.war_room_unread_count");
    expect(sql).toContain("create or replace function public.mark_war_room_read");
    expect(sql).toContain("(v_target.created_at, v_target.id) > (v_current.created_at, v_current.id)");
    expect(sql).toContain("message.author_profile_id <> p_profile_id");
    expect(sql).toContain("'unread_count'");
    expect(sql).toContain("'latest_message_id'");
  });

  it("retains the historical guarded realtime database contract", () => {
    expect(sql).toContain("create policy war_room_members_receive_broadcast");
    expect(sql).toContain("realtime.topic() = 'war-room:conversation'");
    expect(sql).toContain("public.can_receive_war_room_realtime()");
    expect(sql).toContain("perform realtime.send(");
    expect(sql).toContain("'war_room_changed'");
  });

  it("removes the frontend runtime while preserving navigation order", () => {
    const home = navigation.indexOf('label: "Home"');
    const picks = navigation.indexOf('label: "Picks"');
    const play = navigation.indexOf('label: "Play"');
    const rankings = navigation.indexOf('label: "Rankings"');
    expect(home).toBeGreaterThan(-1);
    expect(home).toBeLessThan(picks);
    expect(picks).toBeLessThan(play);
    expect(play).toBeLessThan(rankings);
    expect(navigation).not.toContain('label: "War Room"');
    expect(router).not.toContain('path: "war-room"');
    expect(router).not.toContain('path: "war-room/join"');
    expect(removedRuntimePaths.every((path) => !existsSync(path))).toBe(true);
    expect(contract).toContain("Home → Rankings → Picks → Play → War Room");
  });

  it("keeps rollback proof for unread, invite, realtime authorization, and privacy", () => {
    expect(integrationSql).toContain("new War Room message did not increment unread count");
    expect(integrationSql).toContain("War Room read position moved backward");
    expect(integrationSql).toContain("member own message counted as unread");
    expect(integrationSql).toContain("valid launch invite did not produce Join with Invite state");
    expect(integrationSql).toContain("War Room private Realtime authorization policy is missing");
    expect(integrationSql).toContain("War Room launch exposed private tables directly");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
