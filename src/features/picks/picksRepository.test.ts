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

  it("defaults omitted result fields to a pending lifecycle state", () => {
    const event = mapPickEvent(eventPayload);

    expect(event?.bouts[0]?.resultStatus).toBe("pending");
    expect(event?.bouts[0]?.resultRecordedAt).toBeNull();
  });

  it("maps the existing backend result state without creating another query path", () => {
    const event = mapPickEvent({
      ...eventPayload,
      status: "locked",
      bouts: [{
        ...eventPayload.bouts[0],
        winner_fighter_slug: "red-fighter",
        result_status: "red_win",
        result_recorded_at: "2026-07-26T18:00:00.000Z",
      }],
    });

    expect(event?.bouts[0]?.resultStatus).toBe("red_win");
    expect(event?.bouts[0]?.resultRecordedAt).toBe("2026-07-26T18:00:00.000Z");
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
