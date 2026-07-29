import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200012_war_room_legacy_message_cleanup.sql",
  "utf8",
);

describe("War Room legacy message cleanup", () => {
  it("targets only the two screenshot-confirmed Cody messages", () => {
    expect(migration).toContain("upper(trim(profile.display_name)) = 'CODY'");
    expect(migration).toContain("message.body = 'Yo'");
    expect(migration).toContain("timestamp '2026-07-29 13:46:00'");
    expect(migration).toContain("message.body = 'Sup'");
    expect(migration).toContain("timestamp '2026-07-29 14:37:00'");
    expect(migration).toContain("timezone('America/Chicago', message.created_at)");
  });

  it("fails closed if either exact selector becomes ambiguous", () => {
    expect(migration).toContain("if v_yo_count > 1 or v_sup_count > 1 then");
    expect(migration).toContain("Legacy War Room cleanup selector matched more than one message");
  });

  it("uses the canonical soft-delete path without broad message deletion", () => {
    expect(migration).toContain("delete from private.war_room_reactions reaction");
    expect(migration).toContain("update private.war_room_messages message");
    expect(migration).toContain("deleted_at = coalesce(message.deleted_at, now())");
    expect(migration).toContain("deleted_by_profile_id = coalesce(");
    expect(migration).not.toContain("delete from private.war_room_messages");
  });
});
