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
  source: "MMA Mania",
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
  spotlights: [],
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

const fullSpotlight = {
  bout_id: "main-event-red-fighter-blue-fighter",
  preview: "Red Fighter brings the higher striking volume while Blue Fighter answers with the stronger wrestling profile.",
  red: {
    fighter_slug: "red-fighter",
    record: "8-1-0",
    age: "28",
    height: "6' 0\"",
    reach: "75\"",
    stance: "Orthodox",
    edges: ["5.0 significant strikes landed/min"],
  },
  blue: {
    fighter_slug: "blue-fighter",
    record: "10-2-0",
    age: "30",
    height: "5' 11\"",
    reach: "73\"",
    stance: "Southpaw",
    edges: ["3.1 takedowns per 15 min"],
  },
  watch_spotlights: [{ fighter_slug: "red-fighter", url: "https://youtu.be/red-fighter" }],
  source: "UFCStats",
  generated_at: "2026-07-27T00:00:00.000Z",
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
      spotlights: [],
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
          red_fighter_slug: "fourth-fighter",
          red_fighter_name: "Fourth Fighter",
          blue_fighter_slug: "fifth-fighter",
          blue_fighter_name: "Fifth Fighter",
        },
      ],
    });
    expect(pickSetupDraftCardLabel(draft!)).toBe("FULL CARD");
    expect(pickSetupBoutSectionLabel(draft!.bouts[1]!.boutId)).toBe("PRELIMS");
  });

  it("maps multiple complete Spotlight packages on the staged-event projection", () => {
    const second = {
      ...fullSpotlight,
      bout_id: "main-second-third",
      preview: "Second Fighter and Third Fighter present a second independent generated matchup package.",
      red: { ...fullSpotlight.red, fighter_slug: "second-fighter" },
      blue: { ...fullSpotlight.blue, fighter_slug: "third-fighter" },
      watch_spotlights: [],
    };
    const draft = mapPickSetupDraft({ ...payload, spotlights: [fullSpotlight, second] });
    expect(draft?.spotlights).toHaveLength(2);
    expect(draft?.spotlights?.[0]).toEqual({
      boutId: fullSpotlight.bout_id,
      preview: fullSpotlight.preview,
      red: {
        fighterSlug: "red-fighter",
        record: "8-1-0",
        age: "28",
        height: "6' 0\"",
        reach: "75\"",
        stance: "Orthodox",
        edges: ["5.0 significant strikes landed/min"],
      },
      blue: {
        fighterSlug: "blue-fighter",
        record: "10-2-0",
        age: "30",
        height: "5' 11\"",
        reach: "73\"",
        stance: "Southpaw",
        edges: ["3.1 takedowns per 15 min"],
      },
      watchSpotlights: [{ fighterSlug: "red-fighter", url: "https://youtu.be/red-fighter" }],
      source: "UFCStats",
      generatedAt: "2026-07-27T00:00:00.000Z",
    });
  });

  it("maps clean prospective metadata and fights from non-destructive source previews", () => {
    expect(mapPickSetupSourcePreview({
      source_hash: "abc123",
      requested_scope: "auto",
      effective_scope: "main",
      source: payload.source,
      source_url: payload.source_url,
      fight_count: 1,
      changes: ["Venue changed."],
      warnings: [],
      event_preview: {
        name: "UFC Fight Night",
        subtitle: "Uroš Medić vs. Daniel Rodriguez",
        venue: "Belgrade Arena",
        location: "Belgrade, Serbia",
        starts_at: "2026-08-01T17:00:00.000Z",
        locks_at: "2026-08-01T17:00:00.000Z",
        bouts: payload.bouts,
      },
    })).toEqual({
      sourceHash: "abc123",
      requestedScope: "auto",
      effectiveScope: "main",
      source: payload.source,
      sourceUrl: payload.source_url,
      fightCount: 1,
      changes: ["Venue changed."],
      warnings: [],
      event: {
        name: "UFC Fight Night",
        subtitle: "Uroš Medić vs. Daniel Rodriguez",
        venue: "Belgrade Arena",
        location: "Belgrade, Serbia",
        startsAt: "2026-08-01T17:00:00.000Z",
        locksAt: "2026-08-01T17:00:00.000Z",
        bouts: [mappedBout],
      },
    });
  });

  it("normalizes missing optional metadata without inventing values", () => {
    const draft = mapPickSetupDraft({
      ...payload,
      venue: null,
      location: null,
      starts_at: null,
      locks_at: null,
      warnings: ["MISSING EVENT START TIME", "MISSING VENUE"],
      can_publish: false,
    });
    expect(draft?.venue).toBe("");
    expect(draft?.location).toBe("");
    expect(draft?.startsAt).toBeNull();
    expect(draft?.canPublish).toBe(false);
    expect(draft?.warnings).toContain("MISSING VENUE");
  });
});

describe("Event Setup sync errors", () => {
  it("surfaces the Edge Function review error instead of the generic client status", async () => {
    await expect(pickSetupFunctionErrorMessage({
      message: "Edge Function returned a non-2xx status code",
      context: {
        json: async () => ({
          message: "MMA Mania did not return a sectioned fight card matching the next UFC event.",
        }),
      },
    })).resolves.toBe("MMA Mania did not return a sectioned fight card matching the next UFC event.");
  });

  it("keeps the Functions client message when the response body is unavailable", async () => {
    await expect(pickSetupFunctionErrorMessage({
      message: "Edge Function returned a non-2xx status code",
    })).resolves.toBe("Edge Function returned a non-2xx status code");
  });
});
