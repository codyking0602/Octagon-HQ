import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200009_war_room_reactions.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/war_room_reactions.sql",
  "utf8",
);
const model = readFileSync(
  "src/features/war-room/warRoomModel.ts",
  "utf8",
);
const repository = readFileSync(
  "src/features/war-room/warRoomRepository.ts",
  "utf8",
);
const provider = readFileSync(
  "src/features/war-room/WarRoomProvider.tsx",
  "utf8",
);
const page = readFileSync(
  "src/features/war-room/WarRoomPage.tsx",
  "utf8",
);
const styles = readFileSync(
  "src/styles/war-room-reactions.css",
  "utf8",
);
const contract = readFileSync(
  "docs/war-room-reactions.md",
  "utf8",
);

describe("War Room reactions and disappearing deletes", () => {
  it("stores reactions privately behind guarded RPCs", () => {
    expect(migration).toContain("create table if not exists private.war_room_reactions");
    expect(migration).toContain("alter table private.war_room_reactions enable row level security");
    expect(migration).toContain("revoke all on private.war_room_reactions from public, anon, authenticated");
    expect(migration).toContain("create or replace function public.toggle_war_room_reaction");
    expect(migration).toContain("create or replace function public.get_war_room_message");
    expect(migration).not.toContain("grant select on private.war_room_reactions to authenticated");
    expect(repository).toContain('client.rpc("toggle_war_room_reaction"');
    expect(repository).toContain('client.rpc("get_war_room_message"');
  });

  it("locks the four independent reaction types behind an iMessage-style tapback picker", () => {
    expect(migration).toContain("reaction_type in ('like', 'dislike', 'exclaim', 'laugh')");
    expect(model).toContain('"like" | "dislike" | "exclaim" | "laugh"');
    expect(page).toContain('{ type: "like", icon: "👍", label: "Like" }');
    expect(page).toContain('{ type: "dislike", icon: "👎", label: "Dislike" }');
    expect(page).toContain('{ type: "exclaim", icon: "❗", label: "Exclaim" }');
    expect(page).toContain('{ type: "laugh", icon: "😂", label: "Laugh" }');
    expect(page).toContain("war-room-tapback-summary");
    expect(page).toContain("war-room-tapback-picker");
    expect(page).toContain("setTimeout(() =>");
    expect(page).toContain("openReactionPicker(message.id)");
    expect(page).toContain("aria-pressed={selected}");
    expect(styles).toContain(".war-room-tapback-picker button.is-selected");
    expect(styles).toContain(".war-room-tapback-summary");
    expect(styles).not.toContain(".war-room-reactions {");
    expect(contract).toContain("compact tapback badges");
    expect(contract).toContain("toggle each reaction independently");
  });

  it("removes deleted messages and deleted parent previews from visible snapshots", () => {
    expect(migration).toContain("where message.deleted_at is null");
    expect(migration).toContain("when parent.id is null or parent.deleted_at is not null then null");
    expect(model).toContain("if (message.deleted) byId.delete(message.id)");
    expect(provider).toContain("current.filter((message) => message.id !== messageId)");
    expect(page).not.toContain("Message deleted");
    expect(page).not.toContain("message.deleted");
    expect(contract).toContain("disappears completely from the conversation");
  });

  it("keeps one provider and the existing Broadcast as the live owner", () => {
    expect(provider).toContain("const toggleReaction");
    expect(provider).toContain("const syncChange");
    expect(provider).toContain("repository.loadMessage(messageId)");
    expect(repository).toContain('.channel("war-room:conversation", { config: { private: true } })');
    expect(repository).toContain('event: "war_room_changed"');
    expect(migration).toContain("create trigger war_room_reactions_broadcast");
    expect(migration).toContain("'message_id', v_message_id");
    expect(repository).not.toContain("postgres_changes");
    expect(provider).not.toContain("localStorage");
    expect(provider).not.toContain("setInterval");
  });

  it("preserves deletion permissions and rejects reactions to deleted messages", () => {
    expect(migration).toContain("v_message.author_profile_id <> v_member.profile_id");
    expect(migration).toContain("v_member.role <> 'admin'");
    expect(migration).toContain("That War Room message is not available");
    expect(migration).toContain("delete from private.war_room_reactions reaction");
    expect(page).toContain("message.canDelete");
    expect(integrationSql).toContain("unauthorized profile reacted to a War Room message");
    expect(integrationSql).toContain("deleted War Room message accepted a reaction");
    expect(integrationSql).toContain("deleted War Room message retained reactions");
  });

  it("keeps rollback proof for toggles, counts, deletion, replies, and privacy", () => {
    expect(integrationSql).toContain("Like reaction did not toggle on");
    expect(integrationSql).toContain("independent War Room reactions did not coexist");
    expect(integrationSql).toContain("Laugh reaction count did not aggregate across members");
    expect(integrationSql).toContain("deleted War Room message remained visible in the snapshot");
    expect(integrationSql).toContain("reply disappeared with its deleted parent");
    expect(integrationSql).toContain("authenticated role can access private War Room reactions directly");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
