import { describe, expect, it } from "vitest";
import {
  pickSetupBoutSection,
  pickSetupBoutSectionLabel,
  pickSetupDraftCardLabel,
} from "./pickSetupModel";
import {
  mapPickSetupDraft,
  mapPickSetupSourcePreview,
  pickSetupFunctionErrorMessage,
} from "./pickSetupRepository";

const payload = {
  draft_id: "11111111-1111-4111-8111-111111111111",
  source: "UFC.com metadata + MMA Mania card",
  source_event_key: "event/ufc-test",
  source_url: "https://www.mmamania.com/ufc-fight-cards/1/ufc-test",
  event_id: "ufc-test-2026-08-01",
  name: "UFC Fight Night",
  subtitle: "Red vs. Blue",
  venue: "Test Arena",
  location: "Dallas, Texas",
  starts_at: "2026-08-02T00:00:00.000Z",
  locks_at: "2026-08-02T00:00:00.000Z",
  season: 2026,
  state: "staged",
  synced_at: "2026-07-26T20:00:00.000Z",
  updated_at: "2026-07-26T20:00:00.000Z",
  warnings: [],
  can_publish: true,
  bouts: [{
    bout_id: "main-event-red-fighter-blue-fighter",
    position: 1,
    weight_class: "Lightweight",
    red_fighter_slug: "red-fighter",
    red_fighter_name: "Red Fighter",
    blue_fighter_slug: "blue-fighter",
    blue_fighter_name: "Blue Fighter",
    included: true,
  }],
};

const mappedBout = {
  boutId: "main-event-red-fighter-blue-fighter",
  position: 1,
  weightClass: "Lightweight",
  redFighterSlug: "red-fighter",
  redFighterName: "Red Fighter",
  blueFighterSlug: "blue-fighter",
  blueFighterName: "Blue Fighter",
  included: true,
};

describe("Event Setup draft mapping", () => {
  it("maps private staged metadata and section-aware fight review fields", () => {
    const draft = mapPickSetupDraft(payload);
    expect(draft).toEqual({
      draftId: payload.draft_id,
      source: payload.source,
      sourceEventKey: "event/ufc-test",
      sourceUrl: payload.source_url,
      eventId: "ufc-test-2026-08-01",
      name: "UFC Fight Night",
      subtitle: "Red vs. Blue",
      venue: "Test Arena",
      location: "Dallas, Texas",
      startsAt: payload.starts_at,
      locksAt: payload.locks_at,
      season: 2026,
      state: "staged",
      syncedAt: payload.synced_at,
      updatedAt: payload.updated_at,
      warnings: [],
      canPublish: true,
      spotlight: null,
      bouts: [mappedBout],
    });
    expect(pickSetupBoutSection(draft!.bouts[0]!.boutId)).toBe("main-event");
    expect(pickSetupBoutSectionLabel(draft!.bouts[0]!.boutId)).toBe("MAIN EVENT");
    expect(pickSetupDraftCardLabel(draft!)).toBe("MAIN CARD");
  });

  it("recognizes prelim sections as a full card", () => {
    const draft = mapPickSetupDraft({
      ...payload,
      bouts: [
        ...payload.bouts,
        {
          ...payload.bouts[0],
          bout_id: "prelim-fourth-fighter-fifth-fighter",
          position: 2,
        },
      ],
    });
    expect(pickSetupBoutSection(draft!.bouts[1]!.boutId)).toBe("prelim");
    expect(pickSetupBoutSectionLabel(draft!.bouts[1]!.boutId)).toBe("PRELIMS");
    expect(pickSetupDraftCardLabel(draft!)).toBe("FULL CARD");
  });

  it("maps reviewed Spotlight data when the staged draft has it", () => {
    const draft = mapPickSetupDraft({
      ...payload,
      spotlight: {
        bout_id: payload.bouts[0].bout_id,
        watch_spotlights: [{
          fighter_slug: "red-fighter",
          url: "https://youtu.be/red-fighter",
        }],
      },
    });

    expect(draft?.spotlight).toEqual({
      boutId: payload.bouts[0].bout_id,
      watchSpotlights: [{
        fighterSlug: "red-fighter",
        url: "https://youtu.be/red-fighter",
      }],
    });
  });

  it("maps source preview data without mutating staged state", () => {
    expect(mapPickSetupSourcePreview({
      source_hash: "abc123",
      requested_scope: "auto",
      effective_scope: "main",
      source: "MMA Mania",
      source_url: "https://www.mmamania.com/ufc-fight-cards/1/ufc-test",
      fight_count: 1,
      changes: ["Fight order changed."],
      warnings: [],
      event_preview: {
        name: "UFC Fight Night",
        subtitle: "Red vs. Blue",
        venue: "Test Arena",
        location: "Dallas, Texas",
        starts_at: "2026-08-02T00:00:00.000Z",
        locks_at: "2026-08-02T00:00:00.000Z",
        bouts: payload.bouts,
      },
    })).toEqual({
      sourceHash: "abc123",
      requestedScope: "auto",
      effectiveScope: "main",
      source: "MMA Mania",
      sourceUrl: "https://www.mmamania.com/ufc-fight-cards/1/ufc-test",
      fightCount: 1,
      changes: ["Fight order changed."],
      warnings: [],
      event: {
        name: "UFC Fight Night",
        subtitle: "Red vs. Blue",
        venue: "Test Arena",
        location: "Dallas, Texas",
        startsAt: "2026-08-02T00:00:00.000Z",
        locksAt: "2026-08-02T00:00:00.000Z",
        bouts: [mappedBout],
      },
    });
  });

  it("prefers structured Edge Function errors over the generic Functions client message", async () => {
    expect(await pickSetupFunctionErrorMessage({
      message: "Edge Function returned a non-2xx status code",
      context: {
        clone: () => ({
          json: async () => ({ message: "MMA Mania discovery did not find an upcoming UFC card." }),
        }),
      },
    })).toBe("MMA Mania discovery did not find an upcoming UFC card.");
  });

  it("falls back to the Functions client message when no structured response is readable", async () => {
    expect(await pickSetupFunctionErrorMessage(new Error("Edge Function request failed")))
      .toBe("Edge Function request failed");
  });
});
