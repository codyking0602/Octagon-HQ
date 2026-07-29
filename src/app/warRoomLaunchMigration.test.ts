import { readFileSync } from "node:fs";
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
const repository = readFileSync("src/features/war-room/warRoomRepository.ts", "utf8");
const provider = readFileSync("src/features/war-room/WarRoomProvider.tsx", "utf8");
const page = readFileSync("src/features/war-room/WarRoomPage.tsx", "utf8");
const joinPage = readFileSync("src/features/war-room/WarRoomJoinPage.tsx", "utf8");
const contract = readFileSync("docs/war-room-launch.md", "utf8");

describe("War Room launch", () => {
  it("owns unread state on membership and only moves read position forward", () => {
    expect(sql).toContain("add column if not exists last_read_message_id uuid");
    expect(sql).toContain("create or replace function private.war_room_unread_count");
    expect(sql).toContain("create or replace function public.mark_war_room_read");
    expect(sql).toContain("(v_target.created_at, v_target.id) > (v_current.created_at, v_current.id)");
    expect(sql).toContain("message.author_profile_id <> p_profile_id");
    expect(sql).toContain("'unread_count'");
    expect(sql).toContain("'latest_message_id'");
  });

  it("uses private database Broadcast only as a guarded refresh signal", () => {
    expect(sql).toContain("create policy war_room_members_receive_broadcast");
    expect(sql).toContain("realtime.topic() = 'war-room:conversation'");
    expect(sql).toContain("public.can_receive_war_room_realtime()");
    expect(sql).toContain("perform realtime.send(");
    expect(sql).toContain("'war_room_changed'");
    expect(repository).toContain("client.realtime.setAuth()");
    expect(repository).toContain('.channel("war-room:conversation", { config: { private: true } })');
    expect(repository).toContain('event: "war_room_changed"');
    expect(repository).toContain("client.removeChannel(channel)");
    expect(repository).not.toContain("postgres_changes");
  });

  it("keeps one owner for access, feed, unread, invite, realtime, and foreground refresh", () => {
    expect(provider).toContain("const [unreadCount");
    expect(provider).toContain("const [realtimeStatus");
    expect(provider).toContain("const checkInvite");
    expect(provider).toContain("const joinWithInvite");
    expect(provider).toContain("const markReadThroughLatest");
    expect(provider).toContain('window.addEventListener("focus"');
    expect(provider).toContain('window.addEventListener("online"');
    expect(provider).toContain('document.addEventListener("visibilitychange"');
    expect(provider).not.toContain("localStorage");
    expect(provider).not.toContain("setInterval");
  });

  it("shows the fifth destination only to eligible profiles in the locked order", () => {
    const home = navigation.indexOf('label: "Home"');
    const rankings = navigation.indexOf('label: "Rankings"');
    const picks = navigation.indexOf('label: "Picks"');
    const play = navigation.indexOf('label: "Play"');
    const warRoom = navigation.indexOf('label: "War Room"');
    expect(home).toBeGreaterThan(-1);
    expect(home).toBeLessThan(rankings);
    expect(rankings).toBeLessThan(picks);
    expect(picks).toBeLessThan(play);
    expect(play).toBeLessThan(warRoom);
    expect(navigation).toContain('warRoom.status === "eligible"');
    expect(navigation).toContain('warRoom.unreadCount > 99 ? "99+"');
    expect(navigation).toContain("bottom-nav__badge");
  });

  it("provides a dedicated Join with Invite route without exposing conversation data", () => {
    expect(router).toContain('path: "war-room/join"');
    expect(joinPage).toContain("Join with invite");
    expect(joinPage).toContain("SIGN IN TO CONTINUE");
    expect(joinPage).toContain("JOIN WAR ROOM");
    expect(joinPage).toContain("No War Room conversation is visible before you join");
    expect(page).toContain("markReadThroughLatest");
    expect(page).toContain("document.visibilityState");
    expect(page).toContain("atLatest");
  });

  it("keeps rollback proof for unread, invite, realtime authorization, and privacy", () => {
    expect(integrationSql).toContain("new War Room message did not increment unread count");
    expect(integrationSql).toContain("War Room read position moved backward");
    expect(integrationSql).toContain("member own message counted as unread");
    expect(integrationSql).toContain("valid launch invite did not produce Join with Invite state");
    expect(integrationSql).toContain("War Room private Realtime authorization policy is missing");
    expect(integrationSql).toContain("War Room launch exposed private tables directly");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
    expect(contract).toContain("Home → Rankings → Picks → Play → War Room");
  });
});
