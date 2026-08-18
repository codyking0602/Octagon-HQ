import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/209912310001_published_pick_spotlight_controls.sql", "utf8");
const builder = readFileSync("supabase/functions/build-pick-spotlight/index.ts", "utf8");
const controlRepository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");

describe("published Fight Spotlight ownership", () => {
  it("keeps the published write owner on the canonical Picks event and upcoming lifecycle", () => {
    expect(migration).toContain("create or replace function public.set_pick_event_spotlights");
    expect(migration).toContain("event.status = 'upcoming'");
    expect(migration).toContain("private.pick_event_spotlight_is_valid(v_event_id, p_spotlights)");
    expect(migration).toContain("alter function public.get_pick_control_event(text)");
    expect(migration).not.toContain("insert into public.pick_events");
  });

  it("reuses the one Spotlight builder for staged drafts and published events", () => {
    expect(builder).toContain('owner.rpc("get_pick_event_setup")');
    expect(builder).toContain('owner.rpc("get_pick_control_event", { p_event_id: eventId })');
    expect(builder).toContain('source.status !== "upcoming"');
    expect(controlRepository).toContain('client.functions.invoke("build-pick-spotlight"');
    expect(controlRepository).toContain('client.rpc("set_pick_event_spotlights"');
    expect(controlRepository).not.toContain("from(\"pick_events\")");
  });
});
