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
      bouts: [{
        boutId: "main-event-red-fighter-blue-fighter",
        position: 1,
        weightClass: "Lightweight",
        redFighterSlug: "red-fighter",
        redFighterName: "Red Fighter",
        blueFighterSlug: "blue-fighter",
        blueFighterName: "Blue Fighter",
        included: true,
      }],
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

  it("maps non-destructive source previews", () => {
    expect(mapPickSetupSourcePreview({
      source_hash: "abc123",
      requested_scope: "auto",
      effective_scope: "main",
      source: payload.source,
      source_url: payload.source_url,
      fight_count: 6,
      changes: ["Added main card: A vs. B."],
      warnings: ["ONE OR MORE WEIGHT CLASSES NEED REVIEW"],
    })).toEqual({
      sourceHash: "abc123",
      requestedScope: "auto",
      effectiveScope: "main",
      source: payload.source,
      sourceUrl: payload.source_url,
      fightCount: 6,
      changes: ["Added main card: A vs. B."],
      warnings: ["ONE OR MORE WEIGHT CLASSES NEED REVIEW"],
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
