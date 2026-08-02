import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608240001_picks_recap_destination_repair.sql",
  "utf8",
);

describe("Picks recap destination repair", () => {
  it("keeps the canonical lifecycle owner and publishes exact archived recap routes", () => {
    expect(migration).toContain("create or replace function public.transition_pick_event");
    expect(migration).toContain("v_recap_route := '/picks?event=' || v_event.event_id || '&view=recap'");
    expect(migration).toContain("private.upsert_whats_new_item");
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("cron.schedule");
  });

  it("repairs already-published personal and global recap destinations", () => {
    expect(migration).toContain("with latest_recap_source as");
    expect(migration).toContain("event.source_key like 'picks-recap-ready:%'");
    expect(migration).toContain("update private.notification_groups notification");
    expect(migration).toContain("update private.whats_new_items item");
    expect(migration).toContain("item.source_key like 'picks:recap:%'");
  });

  it("uses the newest immutable source event for an aggregated notification row", () => {
    expect(migration).toContain("select distinct on (event.group_id)");
    expect(migration).toContain("event.occurred_at desc");
    expect(migration).toContain("event.created_at desc");
    expect(migration).toContain("event.id desc");
  });
});
