import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const invariant = readFileSync(
  "supabase/migrations/202608060001_pick_active_event_invariant.sql",
  "utf8",
);
const resultsControl = readFileSync(
  "supabase/migrations/202608040001_fight_night_results_control.sql",
  "utf8",
);
const eventSetup = readFileSync(
  "supabase/migrations/202608050001_event_setup_card_review.sql",
  "utf8",
);

describe("Picks active-event invariant", () => {
  it("allows completed history while preventing a second active event", () => {
    expect(invariant).toContain("create unique index if not exists pick_events_one_active_event_idx");
    expect(invariant).toContain("on public.pick_events ((1))");
    expect(invariant).toContain("where status in ('upcoming', 'locked')");
    expect(invariant).not.toContain("status = 'complete'");
  });

  it("fails explicitly when existing data already violates the invariant", () => {
    expect(invariant).toContain("multiple active Picks events must be reconciled");
    expect(invariant).toContain("select count(*)");
    expect(invariant).toContain(") > 1");
  });

  it("preserves the existing lifecycle and publication mutation owners", () => {
    expect(invariant).not.toContain("create or replace function");
    expect(resultsControl).toContain("create or replace function public.transition_pick_event");
    expect(eventSetup).toContain("create or replace function public.publish_pick_event_draft");
    expect(eventSetup).toContain("raise exception 'a locked event already exists'");
    expect(eventSetup).toContain("raise exception 'the current upcoming card already has picks'");
  });
});
