import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200014_notification_war_room_social.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_war_room_social.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-war-room-social.md",
  "utf8",
);
const notificationFoundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);

describe("War Room social notifications", () => {
  it("keeps the existing War Room post transition as the single producer", () => {
    expect(migration).toContain(
      "create or replace function public.post_war_room_message",
    );
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("public.publish_notification(");
    expect(contract).toContain(
      "public.post_war_room_message(...)` remains the only canonical message-post transition",
    );
  });

  it("publishes aggregated mention and direct reply events", () => {
    expect(migration).toContain("'war-room:mentions'");
    expect(migration).toContain("'war_room_mention'");
    expect(migration).toContain("'You were mentioned'");
    expect(migration).toContain("'war-room:replies'");
    expect(migration).toContain("'war_room_reply'");
    expect(migration).toContain("'Someone replied to your message'");
    expect(migration).toContain("'/war-room'");
    expect(notificationFoundation).toContain("aggregate_count = case");
    expect(contract).toContain("You were mentioned ×2");
  });

  it("suppresses self and overlapping reply-plus-mention noise", () => {
    expect(migration).toContain("v_parent.author_profile_id <> v_member.profile_id");
    expect(migration).toContain("v_mention_id <> v_member.profile_id");
    expect(migration).toContain("v_mention_id <> v_parent.author_profile_id");
    expect(integrationSql).toContain(
      "A reply that also mentioned its parent author created duplicate unread notifications",
    );
    expect(integrationSql).toContain("A self mention created a notification");
    expect(contract).toContain(
      "receives only the reply notification, not a second mention notification",
    );
  });

  it("keeps notification publication private and transactional", () => {
    expect(notificationFoundation).toContain(
      "revoke all on function private.publish_notification_to_profile",
    );
    expect(integrationSql).toContain(
      "authenticated role can bypass the canonical War Room notification transition",
    );
    expect(contract).toContain(
      "Browser roles cannot call the private notification publisher",
    );
    expect(contract).toContain(
      "A posting failure rolls back both the message and any related notification work",
    );
  });

  it("proves aggregation, reply delivery, and duplicate suppression", () => {
    expect(integrationSql).toContain(
      "War Room mentions did not aggregate into one notification row",
    );
    expect(integrationSql).toContain(
      "War Room reply did not create a notification",
    );
    expect(integrationSql).toContain(
      "War Room mention did not publish through the canonical notification owner",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});
