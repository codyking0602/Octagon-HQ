import { describe, expect, it } from "vitest";
import { expectedSourceChanges } from "../../scripts/event-setup-preview-contract.mjs";

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
});
