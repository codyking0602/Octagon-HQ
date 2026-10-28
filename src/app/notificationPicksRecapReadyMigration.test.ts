import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200020_notification_picks_recap_ready.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_picks_recap_ready.sql",
  "utf8",
);
const foundation = readFileSync(
  "supabase/migrations/202608200013_notification_foundation.sql",
  "utf8",
);
const whatsNewOwner = readFileSync(
  "supabase/migrations/202608200010_whats_new_picks_recap.sql",
  "utf8",
);
const contract = readFileSync(
  "docs/notification-picks-recap-ready.md",
  "utf8",
);

describe("Picks recap-ready notifications", () => {
  it("keeps the existing lifecycle transition and What's New recap publication", () => {
    expect(migration).toContain(
      "create or replace function public.transition_pick_event",
    );
    expect(migration).toContain("private.upsert_whats_new_item");
    expect(migration).toContain("'picks:recap:' || v_event.event_id");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("cron.schedule");
    expect(whatsNewOwner).toContain(
      "transition_pick_event as the sole lifecycle owner",
    );
    expect(contract).toContain(
      "`transition_pick_event(...)` remains the only Picks lifecycle owner",
    );
  });

  it("publishes only to profiles that entered the completed event", () => {
    expect(migration).toContain("select distinct pick.profile_id");
    expect(migration).toContain("where pick.event_id = v_event.event_id");
    expect(migration).toContain("private.publish_notification_to_profile");
    expect(integrationSql).toContain(
      "A profile that did not enter the event received recap notification noise",
    );
    expect(contract).toContain(
      "Profiles that did not enter receive no personal notification",
    );
  });

  it("uses the actionable personal recap contract", () => {
    expect(migration).toContain("'picks_recap_ready'");
    expect(migration).toContain("'Final standings and your full Picks recap are ready.'");
    expect(migration).toContain("'/picks'");
    expect(migration).toContain("'VIEW RECAP'");
    expect(foundation).toContain("'picks_recap_ready'");
    expect(foundation).toContain(
      "'picks_incomplete_near_lock',\n      'picks_recap_ready'",
    );
  });

  it("aggregates unread event recaps and keeps replay idempotent", () => {
    expect(migration).toContain(
      "'picks-recap-ready:' || v_event.event_id",
    );
    expect(migration).toContain("'picks-recap-ready'");
    expect(integrationSql).toContain(
      "Two completed event recaps did not collapse into one unread group",
    );
    expect(integrationSql).toContain(
      "Replaying an already-complete transition duplicated recap delivery",
    );
    expect(contract).toContain("Recap is ready ×2");
  });

  it("does not create recap noise when an event only locks", () => {
    expect(migration.indexOf("if v_target_status = 'locked' then")).toBeLessThan(
      migration.indexOf("private.publish_notification_to_profile"),
    );
    expect(integrationSql).toContain(
      "Locking an event created recap notification noise",
    );
    expect(contract).toContain("Locking an event does not publish a recap notification");
  });

  it("keeps completion, global feed, and personal delivery transactional", () => {
    expect(migration.indexOf("update public.pick_events")).toBeLessThan(
      migration.indexOf("private.upsert_whats_new_item"),
    );
    expect(migration.indexOf("private.upsert_whats_new_item")).toBeLessThan(
      migration.indexOf("private.publish_notification_to_profile"),
    );
    expect(contract).toContain(
      "Event completion, the global What's New recap item, and all personal entrant notifications commit or roll back together",
    );
  });

  it("keeps private publishing and rollback proof", () => {
    expect(migration).not.toContain("public.publish_notification(");
    expect(integrationSql).toContain(
      "Authenticated Picks clients can bypass the canonical recap notification producer",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
    expect(contract).toContain(
      "No second inbox, provider, repository, scheduler, polling loop, lifecycle transition, or browser-storage fallback is added",
    );
  });
});
