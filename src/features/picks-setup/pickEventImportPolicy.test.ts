import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  parseOfficialUfcSegmentTimes,
  resolveImportedCardScope,
  selectAndSequenceImportedBouts,
} from "../../../supabase/functions/sync-next-ufc-event/importPolicy";

const syncSource = readFileSync(
  "supabase/functions/sync-next-ufc-event/index.ts",
  "utf8",
);
const cardChangesSource = readFileSync(
  "supabase/functions/sync-next-ufc-event/cardChanges.ts",
  "utf8",
);
const migration = readFileSync(
  "supabase/migrations/202608290001_pick_event_import_segments.sql",
  "utf8",
);
const projectionMigration = readFileSync(
  "supabase/migrations/202608290002_expose_pick_event_import_segments.sql",
  "utf8",
);

describe("Picks event import policy", () => {
  it("uses the official labeled Gamrot time instead of a conflicting structured timestamp", () => {
    const result = parseOfficialUfcSegmentTimes(
      "UFC Fight Night Gamrot vs Salkilld Sat, Aug 8 / 5:00 PM EDT / Main Card Start Times Prelims 2:00 PM EDT Main Card 5:00 PM EDT",
      "2026-08-09T00:00:00Z",
      false,
      new Date("2026-08-03T12:00:00Z"),
    );

    expect(result).toEqual({
      mainCardStartsAt: "2026-08-08T21:00:00.000Z",
      prelimsStartsAt: "",
      localEventDate: "2026-08-08",
    });
  });

  it("stores both numbered-event anchors and rejects contradictory official times", () => {
    expect(parseOfficialUfcSegmentTimes(
      "UFC 330 Sat, Aug 15 / 9:00 PM EDT / Main Card Start Times Early Prelims 5:00 PM EDT Prelims 7:00 PM EDT Main Card 9:00 PM EDT",
      "2026-08-16T01:00:00Z",
      true,
      new Date("2026-08-03T12:00:00Z"),
    )).toEqual({
      mainCardStartsAt: "2026-08-16T01:00:00.000Z",
      prelimsStartsAt: "2026-08-15T23:00:00.000Z",
      localEventDate: "2026-08-15",
    });

    expect(() => parseOfficialUfcSegmentTimes(
      "UFC 330 Sat, Aug 15 / 9:00 PM EDT Start Times Prelims 7:00 PM EDT Main Card 8:00 PM EDT",
      "2026-08-16T01:00:00Z",
      true,
    )).toThrow("Main Card times are contradictory");
  });

  it("keeps Fight Nights main-card-only even when full is requested", () => {
    expect(resolveImportedCardScope("UFC Fight Night", "Gamrot vs. Salkilld", "auto")).toBe("main");
    expect(resolveImportedCardScope("UFC Fight Night", "Gamrot vs. Salkilld", "full")).toBe("main");
    expect(resolveImportedCardScope("UFC 330", "Makhachev vs. Machado Garry", "auto")).toBe("full");
    expect(resolveImportedCardScope("UFC 330", "Makhachev vs. Machado Garry", "main")).toBe("main");
  });

  it("excludes Early Prelims and assigns chronological sequence inside each segment", () => {
    const imported = selectAndSequenceImportedBouts([
      { section: "main-event" as const, id: "main-event" },
      { section: "main" as const, id: "main-co-main" },
      { section: "main" as const, id: "main-opener" },
      { section: "prelim" as const, id: "prelim-feature" },
      { section: "prelim" as const, id: "prelim-opener" },
      { section: "early-prelim" as const, id: "early-opener" },
    ], "full");

    expect(imported.map((bout) => bout.id)).toEqual([
      "main-event", "main-co-main", "main-opener", "prelim-feature", "prelim-opener",
    ]);
    expect(imported.map(({ id, card_segment, segment_sequence }) => ({
      id,
      card_segment,
      segment_sequence,
    }))).toEqual([
      { id: "main-event", card_segment: "main", segment_sequence: 3 },
      { id: "main-co-main", card_segment: "main", segment_sequence: 2 },
      { id: "main-opener", card_segment: "main", segment_sequence: 1 },
      { id: "prelim-feature", card_segment: "prelim", segment_sequence: 2 },
      { id: "prelim-opener", card_segment: "prelim", segment_sequence: 1 },
    ]);
  });

  it("wires the policy into the sole import owner", () => {
    expect(syncSource).toContain("parseOfficialUfcSegmentTimes(");
    expect(syncSource).toContain('sourceNormalized.eventType === "numbered"');
    expect(syncSource).toContain('"UFC_EVENT_TIME_REJECTED"');
    expect(syncSource).toContain('error.code === "UFC_EVENT_TIME_REJECTED"');
    expect(syncSource).toContain("resolveImportedCardScope(name, subtitle, requested)");
    expect(syncSource).toContain("selectAndSequenceImportedBouts(card.bouts, scope)");
    expect(syncSource).toContain("prelims_starts_at: metadata.prelims_starts_at");
    expect(syncSource).toContain("card_segment: bout.card_segment");
    expect(syncSource).not.toContain('scope === "full" || bout.section === "main-event"');
    expect(cardChangesSource).toContain('["Prelims time", current.prelims_starts_at, event.prelims_starts_at]');
  });

  it("keeps stage, setup, monitoring, and publish on their established owners", () => {
    expect(migration).toContain("alter function public.stage_pick_event_draft(jsonb)");
    expect(migration).toContain("private.stage_pick_event_draft_import_core(p_payload)");
    expect(migration).toContain("create function public.stage_pick_event_draft(p_payload jsonb)");
    expect(migration).toContain("alter function public.publish_pick_event_draft(uuid)");
    expect(migration).toContain("private.publish_pick_event_draft_import_core(p_draft_id)");
    expect(migration).toContain("create function public.publish_pick_event_draft(p_draft_id uuid)");
    expect(migration.match(/early-prelim-%/g)?.length).toBeGreaterThanOrEqual(3);
    expect(migration).toContain("Existing owner workflows may stage legacy main-card payloads");
    expect(migration).toContain("Draft editing predates segment metadata");
    expect(migration).toContain("prelims_starts_at timestamptz");
    expect(migration).toContain("card_segment text");
    expect(migration).toContain("segment_sequence smallint");
    expect(migration.match(/set card_segment = null,/g)?.length).toBe(2);
    expect(projectionMigration).toContain("private.get_pick_event_setup_import_segments_core()");
    expect(projectionMigration).toContain("create function public.get_pick_event_setup()");
    expect(projectionMigration).toContain("private.get_pick_monitoring_event_state_import_segments_core()");
    expect(projectionMigration).toContain("create function public.get_pick_monitoring_event_state()");
    expect(projectionMigration).toContain("'card_segment', bout.card_segment");
    expect(projectionMigration).toContain("'segment_sequence', bout.segment_sequence");
    expect(projectionMigration).toContain("{prelims_starts_at}");
  });
});
