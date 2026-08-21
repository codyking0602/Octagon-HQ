import { describe, expect, it } from "vitest";
import type { MonitoringEvent } from "./manualMonitoringRunner";
import { adaptEspnUfcLiveFightState, shouldPollEspnLiveFightState } from "./espnLiveFightState";

const event: MonitoringEvent = {
  event_id: "ufc-fight-night-hernandez-rodrigues",
  name: "UFC Fight Night: Hernandez vs. Rodrigues",
  subtitle: "Hernandez vs. Rodrigues",
  prelims_starts_at: "2026-08-22T21:00:00Z",
  starts_at: "2026-08-23T00:00:00Z",
  locks_at: "2026-08-22T21:00:00Z",
  bouts: [
    {
      bout_id: "anthony-wint-terrance-chatman",
      red_fighter_slug: "anthony-wint",
      red_fighter_name: "Anthony Wint",
      blue_fighter_slug: "terrance-chatman",
      blue_fighter_name: "Terrance Chatman",
    },
    {
      bout_id: "anthony-hernandez-gregory-rodrigues",
      red_fighter_slug: "anthony-hernandez",
      red_fighter_name: "Anthony Hernandez",
      blue_fighter_slug: "gregory-rodrigues",
      blue_fighter_name: "Gregory Rodrigues",
    },
  ],
};

const competitor = (name: string, winner = false) => ({
  winner,
  athlete: { fullName: name },
});

const competition = (
  id: string,
  first: string,
  second: string,
  state: "pre" | "in" | "post",
  winner?: string,
) => ({
  id,
  competitors: [competitor(first, winner === first), competitor(second, winner === second)],
  status: { type: { state, completed: state === "post" } },
});

const sourceEvent = (id: string, competitions: unknown[]) => ({
  id,
  date: "2026-08-22T21:00:00Z",
  competitions,
});

describe("ESPN UFC live fight state", () => {
  it("opens only for the fight-night window using the real prelim boundary when available", () => {
    expect(shouldPollEspnLiveFightState(event, new Date("2026-08-22T20:59:59Z"))).toBe(false);
    expect(shouldPollEspnLiveFightState(event, new Date("2026-08-22T21:00:00Z"))).toBe(true);
    expect(shouldPollEspnLiveFightState(event, new Date("2026-08-23T12:00:00Z"))).toBe(true);
    expect(shouldPollEspnLiveFightState(event, new Date("2026-08-23T12:00:01Z"))).toBe(false);
  });

  it("matches the canonical card by fighter pairs and maps live/final states without applying results", () => {
    const result = adaptEspnUfcLiveFightState({
      event,
      observedAt: "2026-08-23T01:04:05Z",
      body: {
        events: [
          sourceEvent("dwcs", [competition("dwcs-1", "Fighter One", "Fighter Two", "in")]),
          sourceEvent("600060493", [
            competition("401911625", "Terrance Chatman", "Anthony Wint", "post", "Anthony Wint"),
            competition("401881938", "Gregory Rodrigues", "Anthony Hernandez", "in"),
          ]),
        ],
      },
    });

    expect(result.status).toBe("matched");
    expect(result.source_event_id).toBe("600060493");
    expect(result.observations).toEqual([
      {
        bout_id: "anthony-wint-terrance-chatman",
        state: "final",
        provider: "espn",
        source_event_id: "600060493",
        source_competition_id: "401911625",
        winner_fighter_slug: "anthony-wint",
        observed_at: "2026-08-23T01:04:05.000Z",
      },
      {
        bout_id: "anthony-hernandez-gregory-rodrigues",
        state: "live",
        provider: "espn",
        source_event_id: "600060493",
        source_competition_id: "401881938",
        winner_fighter_slug: null,
        observed_at: "2026-08-23T01:04:05.000Z",
      },
    ]);
  });

  it("fails closed when two source events match the canonical card equally well", () => {
    const matchingCompetition = competition(
      "same-fight",
      "Anthony Wint",
      "Terrance Chatman",
      "pre",
    );
    const result = adaptEspnUfcLiveFightState({
      event: { ...event, bouts: [event.bouts[0]] },
      observedAt: "2026-08-22T21:00:00Z",
      body: {
        events: [
          sourceEvent("first", [matchingCompetition]),
          sourceEvent("second", [matchingCompetition]),
        ],
      },
    });

    expect(result.status).toBe("ambiguous");
    expect(result.observations).toEqual([]);
  });

  it("keeps a final draw or no-contest observation final without inventing a winner", () => {
    const result = adaptEspnUfcLiveFightState({
      event: { ...event, bouts: [event.bouts[0]] },
      observedAt: "2026-08-23T01:00:00Z",
      body: {
        events: [sourceEvent("600060493", [
          competition("401911625", "Anthony Wint", "Terrance Chatman", "post"),
        ])],
      },
    });

    expect(result.observations[0]).toMatchObject({
      state: "final",
      winner_fighter_slug: null,
    });
  });
});
