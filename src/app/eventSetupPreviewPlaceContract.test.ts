import { describe, expect, it } from "vitest";
import { assertCurrentEventPreview } from "../../scripts/event-setup-preview-contract.mjs";

const now = new Date("2026-08-06T12:00:00.000Z");

function preview(overrides: Record<string, unknown> = {}) {
  return {
    name: "UFC Fight Night",
    subtitle: "Mateusz Gamrot vs. Steven Nguyen",
    venue: "Meta APEX",
    location: "Las Vegas, United States",
    starts_at: "2026-08-09T01:00:00.000Z",
    locks_at: "2026-08-09T01:00:00.000Z",
    source_url: "https://www.cbssports.com/ufc/event/31009998/ufc-fight-night-gamrot-vs-nguyen-august-8-2026/",
    bouts: [
      { bout_id: "main-event-1", red_fighter_name: "Mateusz Gamrot", blue_fighter_name: "Steven Nguyen", weight_class: "Lightweight" },
      { bout_id: "main-2", red_fighter_name: "Fighter Two", blue_fighter_name: "Opponent Two", weight_class: "Welterweight" },
      { bout_id: "main-3", red_fighter_name: "Fighter Three", blue_fighter_name: "Opponent Three", weight_class: "Middleweight" },
      { bout_id: "main-4", red_fighter_name: "Fighter Four", blue_fighter_name: "Opponent Four", weight_class: "Bantamweight" },
    ],
    ...overrides,
  };
}

describe("production Event Setup place evidence", () => {
  it("accepts the UFC description format that combines venue and location", () => {
    expect(() => assertCurrentEventPreview(preview({
      venue: "Meta APEX, Las Vegas United States",
      location: "",
    }), now)).not.toThrow();
  });

  it("still rejects a preview with no separate or combined location evidence", () => {
    expect(() => assertCurrentEventPreview(preview({ location: "" }), now))
      .toThrow("Preview is missing location.");
  });

  it("continues to accept separately structured venue and location fields", () => {
    expect(() => assertCurrentEventPreview(preview(), now)).not.toThrow();
  });
});
