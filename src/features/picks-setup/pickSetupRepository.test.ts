import { describe, expect, it } from "vitest";
import { mapPickSetupDraft } from "./pickSetupRepository";

const payload = {
  draft_id: "11111111-1111-4111-8111-111111111111",
  source: "ufc.com",
  source_event_key: "event/ufc-test",
  source_url: "https://www.ufc.com/event/ufc-test",
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
    bout_id: "red-blue",
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
  it("maps private staged metadata and fight review fields", () => {
    expect(mapPickSetupDraft(payload)).toEqual({
      draftId: payload.draft_id,
      source: "ufc.com",
      sourceEventKey: "event/ufc-test",
      sourceUrl: "https://www.ufc.com/event/ufc-test",
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
        boutId: "red-blue",
        position: 1,
        weightClass: "Lightweight",
        redFighterSlug: "red-fighter",
        redFighterName: "Red Fighter",
        blueFighterSlug: "blue-fighter",
        blueFighterName: "Blue Fighter",
        included: true,
      }],
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
