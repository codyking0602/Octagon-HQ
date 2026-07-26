import { describe, expect, it } from "vitest";
import { mapPickControlEvent } from "./pickControlRepository";

const payload = {
  event_id: "ufc-control",
  name: "UFC Control",
  subtitle: "Red vs. Blue",
  venue: "Test Arena",
  location: "Dallas, Texas",
  starts_at: "2026-08-01T02:00:00.000Z",
  locks_at: "2026-08-01T01:00:00.000Z",
  season: 2026,
  status: "locked",
  can_lock: false,
  can_complete: true,
  bouts: [{
    bout_id: "red-blue",
    position: 1,
    weight_class: "Lightweight",
    red_fighter_slug: "red-fighter",
    red_fighter_name: "Red Fighter",
    blue_fighter_slug: "blue-fighter",
    blue_fighter_name: "Blue Fighter",
    result_status: "red_win",
    winner_fighter_slug: "red-fighter",
    result_recorded_at: "2026-08-01T02:30:00.000Z",
  }],
};

describe("Fight Night control mapping", () => {
  it("maps the owner-only operational projection", () => {
    const event = mapPickControlEvent(payload);

    expect(event).toMatchObject({
      eventId: "ufc-control",
      status: "locked",
      canLock: false,
      canComplete: true,
    });
    expect(event?.bouts[0]).toMatchObject({
      boutId: "red-blue",
      resultStatus: "red_win",
      winnerFighterSlug: "red-fighter",
    });
  });

  it("returns null when there is no active event", () => {
    expect(mapPickControlEvent(null)).toBeNull();
  });
});
