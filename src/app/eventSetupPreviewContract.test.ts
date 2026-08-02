import { describe, expect, it } from "vitest";
import {
  assertCurrentEventPreview,
  assertSafeEventSourceRollover,
  expectedSourceChanges,
} from "../../scripts/event-setup-preview-contract.mjs";

const bout = (bout_id: string, red_fighter_name: string, blue_fighter_name: string) => ({
  bout_id,
  red_fighter_name,
  blue_fighter_name,
  weight_class: "Heavyweight",
});

const draft = {
  name: "UFC Fight Night",
  subtitle: "Uroš Medić vs. Daniel Rodriguez",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  starts_at: "2026-08-01T19:00:00+00:00",
  locks_at: "2026-08-01T19:00:00+00:00",
  source_url: "https://example.com/card",
  bouts: [bout("main-event-medic-rodriguez", "Uroš Medić", "Daniel Rodriguez")],
};

const currentPreview = {
  name: "UFC Fight Night",
  subtitle: "Mateusz Gamrot vs. Quillan Salkilld",
  venue: "Meta APEX",
  location: "Las Vegas, NV, United States",
  starts_at: "2026-08-08T21:00:00.000Z",
  locks_at: "2026-08-08T21:00:00.000Z",
  source_url: "https://www.mmamania.com/ufc-fight-cards/123456/latest-ufc-fight-card",
  bouts: [
    bout("main-event-gamrot-salkilld", "Mateusz Gamrot", "Quillan Salkilld"),
    bout("main-nurgozhay-lopes", "Diyar Nurgozhay", "Bruno Lopes"),
    bout("main-ferreira-quarantillo", "Diego Ferreira", "Billy Quarantillo"),
    bout("main-sutherland-silva", "Louie Sutherland", "Jose Montanha da Silva"),
  ],
};

describe("production Event Setup preview contract", () => {
  it("requires no changes for equivalent timestamps and normalized fighter pairs", () => {
    expect(expectedSourceChanges(draft, {
      ...draft,
      starts_at: "2026-08-01T19:00:00.000Z",
      locks_at: "2026-08-01T19:00:00.000Z",
      bouts: [bout("main-event-rodriguez-medic", "Daniel Rodriguez", "Uros Medic")],
    })).toEqual([]);
  });

  it("accepts only the real membership and order changes in an updated card", () => {
    const second = bout("main-tybura-rakic", "Marcin Tybura", "Aleksandar Rakić");
    const third = bout("main-delija-walker", "Ante Delija", "Johnny Walker");

    expect(expectedSourceChanges(
      { ...draft, bouts: [draft.bouts[0], second] },
      { ...draft, bouts: [second, draft.bouts[0], third] },
    )).toEqual([
      "Added main card: Ante Delija vs. Johnny Walker.",
      "Fight order changed.",
    ]);
  });

  it("validates whichever current event the canonical sources return", () => {
    expect(() => assertCurrentEventPreview(
      currentPreview,
      new Date("2026-08-02T00:00:00.000Z"),
    )).not.toThrow();
  });

  it("rejects malformed or stale successful previews", () => {
    expect(() => assertCurrentEventPreview(
      { ...currentPreview, starts_at: "2026-07-01T00:00:00.000Z" },
      new Date("2026-08-02T00:00:00.000Z"),
    )).toThrow("more than one day in the past");
    expect(() => assertCurrentEventPreview({ ...currentPreview, bouts: [] })).toThrow("implausible");
    expect(() => assertCurrentEventPreview({ ...currentPreview, source_url: "/picks" })).toThrow("specific MMA Mania");
  });

  it("accepts only a structured fail-closed source rollover", () => {
    expect(() => assertSafeEventSourceRollover({
      code: "ARTICLE_IDENTITY_REJECTED",
      stage: "identity-match",
      safeDetails: {
        conflicts: ["Headliners do not match."],
        normalizedUfcEvent: {
          headliners: ["mateusz gamrot", "quillan salkilld"],
          eventDate: "2026-08-08",
          location: "las vegas united states",
        },
        normalizedArticleEvent: {
          headliners: ["uros medic", "daniel rodriguez"],
          eventDate: "2026-08-01",
          location: "belgrade serbia",
        },
      },
    })).not.toThrow();

    expect(() => assertSafeEventSourceRollover({
      code: "UPSTREAM_HTTP_ERROR",
      stage: "mma-fetch",
      safeDetails: {},
    })).toThrow("Expected a safe article identity rejection");
  });
});
