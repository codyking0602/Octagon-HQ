import { describe, expect, it } from "vitest";
import { scheduledFootballFinalChecks } from "./scheduled";

describe("scheduled Football final settlement", () => {
  it("checks only past-kickoff pending published games and derives canonical ESPN identity", () => {
    const checks = scheduledFootballFinalChecks({
      bouts: [
        { bout_id: "football-college-football-401856636", locks_at: "2026-09-05T19:30:00Z", included_in_picks: true, result_status: "pending" },
        { bout_id: "football-nfl-401900001", locks_at: "2026-09-10T00:20:00Z", included_in_picks: true, result_status: "pending" },
        { bout_id: "football-college-football-401856667", locks_at: "2026-09-05T19:30:00Z", included_in_picks: true, result_status: "red_win" },
        { bout_id: "football-college-football-401856770", locks_at: "2026-09-05T23:00:00Z", included_in_picks: false, result_status: "pending" },
      ],
    }, new Date("2026-09-08T12:00:00Z"));

    expect(checks).toEqual([{
      boutId: "football-college-football-401856636",
      league: "college-football",
      espnEventId: "401856636",
    }]);
  });

  it("fails closed when a due pending game loses its canonical ESPN-backed bout identity", () => {
    expect(() => scheduledFootballFinalChecks({
      bouts: [{ bout_id: "custom-game", locks_at: "2026-09-05T19:30:00Z", included_in_picks: true, result_status: "pending" }],
    }, new Date("2026-09-08T12:00:00Z"))).toThrow(/canonical ESPN identity/);
  });
});
