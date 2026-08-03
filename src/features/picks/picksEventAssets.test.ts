import { describe, expect, it } from "vitest";
import type { PickEvent } from "./picksModel";
import { pickEventPoster } from "./picksEventAssets";

const event: PickEvent = {
  eventId: "ufc-test-event",
  name: "UFC Fight Night",
  subtitle: "Uroš Medić vs. Daniel Rodriguez",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  startsAt: "2099-08-01T17:00:00.000Z",
  locksAt: "2099-08-01T17:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [{
    boutId: "medic-rodriguez",
    position: 1,
    weightClass: "Welterweight",
    redFighterSlug: "uros-medic",
    redFighterName: "Uroš Medić",
    blueFighterSlug: "daniel-rodriguez",
    blueFighterName: "Daniel Rodriguez",
    redAmericanOdds: -395,
    blueAmericanOdds: 310,
    winnerFighterSlug: null,
  }],
};

const gamrotSalkilldEvent: PickEvent = {
  ...event,
  eventId: "ufc-gamrot-salkilld",
  subtitle: "Mateusz Gamrot vs. Quillan Salkilld",
  bouts: [{
    ...event.bouts[0],
    boutId: "gamrot-salkilld",
    redFighterSlug: "mateusz-gamrot",
    redFighterName: "Mateusz Gamrot",
    blueFighterSlug: "quillan-salkilld",
    blueFighterName: "Quillan Salkilld",
  }],
};

describe("Picks event assets", () => {
  it("resolves posters from canonical main-event fighter identity", () => {
    expect(pickEventPoster(event)).toEqual({
      src: "/events/ufc-fight-night-belgrade.svg",
      aspectRatio: "480 / 321",
    });
    expect(pickEventPoster(gamrotSalkilldEvent)).toEqual({
      src: "/events/ufc-fight-night-gamrot-salkilld.svg",
      aspectRatio: "480 / 221",
    });
  });

  it("does not infer a poster from location or display copy", () => {
    expect(pickEventPoster({
      ...event,
      bouts: [{
        ...event.bouts[0],
        redFighterSlug: "different-red",
        blueFighterSlug: "different-blue",
      }],
    })).toBeNull();
  });

  it("is independent of red and blue corner order", () => {
    expect(pickEventPoster({
      ...event,
      bouts: [{
        ...event.bouts[0],
        redFighterSlug: "daniel-rodriguez",
        blueFighterSlug: "uros-medic",
      }],
    })?.src).toBe("/events/ufc-fight-night-belgrade.svg");
    expect(pickEventPoster({
      ...gamrotSalkilldEvent,
      bouts: [{
        ...gamrotSalkilldEvent.bouts[0],
        redFighterSlug: "quillan-salkilld",
        blueFighterSlug: "mateusz-gamrot",
      }],
    })?.src).toBe("/events/ufc-fight-night-gamrot-salkilld.svg");
  });
});
