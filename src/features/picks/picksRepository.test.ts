import { describe, expect, it } from "vitest";
import { mapPickEvent } from "./picksRepository";

const eventPayload = {
  event_id: "ufc-test-event",
  name: "UFC Fight Night",
  subtitle: "Main Card",
  venue: "Test Arena",
  location: "Dallas, Texas",
  starts_at: "2099-07-25T16:00:00.000Z",
  locks_at: "2099-07-25T16:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [{
    bout_id: "red-blue",
    position: 1,
    weight_class: "Lightweight",
    red_fighter_slug: "red-fighter",
    red_fighter_name: "Red Fighter",
    blue_fighter_slug: "blue-fighter",
    blue_fighter_name: "Blue Fighter",
    winner_fighter_slug: null,
  }],
};

describe("Picks current-event compatibility", () => {
  it("treats odds omitted by the prior production RPC as unavailable", () => {
    const event = mapPickEvent(eventPayload);

    expect(event?.bouts[0]?.redAmericanOdds).toBeNull();
    expect(event?.bouts[0]?.blueAmericanOdds).toBeNull();
  });

  it("normalizes integer odds returned as JSON strings", () => {
    const event = mapPickEvent({
      ...eventPayload,
      bouts: [{
        ...eventPayload.bouts[0],
        red_american_odds: "-180",
        blue_american_odds: "+155",
      }],
    });

    expect(event?.bouts[0]?.redAmericanOdds).toBe(-180);
    expect(event?.bouts[0]?.blueAmericanOdds).toBe(155);
  });
});
