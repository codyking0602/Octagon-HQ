import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sender = readFileSync(
  "supabase/migrations/202612310090_fix_football_picks_slate_admin.sql",
  "utf8",
);
const repair = readFileSync(
  "supabase/migrations/202612310091_fix_football_pick_push_notification.sql",
  "utf8",
);

describe("Football Picks manual push notification contract", () => {
  it("keeps the Football sender on the canonical notification publisher", () => {
    expect(sender).toContain("v_notification_type := 'football_picks_open'");
    expect(sender).toContain("perform private.publish_notification_to_profile(");
    expect(sender).toContain("v_route := '/football/picks'");
  });

  it("registers the Football announcement as a Picks push candidate using Picks reminder preferences", () => {
    expect(repair).toContain("'football_picks_open'");
    expect(repair).toMatch(/'ufc_event_starting',\s*'football_picks_open'\s*\) then\s*return 'picks';/s);
    expect(repair).toMatch(/'ufc_event_starting',\s*'football_picks_open',\s*'new_game_available'/s);
    expect(repair).toContain("return 'push_candidate';");
    expect(repair).toContain("'picks_incomplete_near_lock', 'ufc_event_starting', 'football_picks_open'");
    expect(repair).toContain("return 'picks_reminders';");
  });
});
