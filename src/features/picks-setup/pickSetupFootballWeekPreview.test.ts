import { describe, expect, it } from "vitest";
import { mapPickSetupFootballWeekPreview } from "./pickSetupRepository";

describe("Football weekly preview mapping", () => {
  it("maps flexible recommendation guidance and the full FBS game pool", () => {
    const game = (id: string, candidateRank?: number) => ({
      espn_event_id: id,
      league: "college-football",
      name: `Away ${id} at Home ${id}`,
      kickoff_at: "2026-09-12T19:00:00.000Z",
      home_team_name: `Home ${id}`,
      away_team_name: `Away ${id}`,
      home_rank: null,
      away_rank: null,
      ...(candidateRank ? { candidate_rank: candidateRank } : {}),
    });

    const mapped = mapPickSetupFootballWeekPreview({
      week_start: "2026-09-08",
      week_end: "2026-09-14",
      recommended_college_count: 8,
      nfl_games: [],
      college_candidates: [game("501", 1)],
      college_games: [game("501"), game("599")],
    });

    expect(mapped.recommendedCollegeCount).toBe(8);
    expect(mapped.collegeCandidates[0]?.candidateRank).toBe(1);
    expect(mapped.collegeGames.map((value) => value.espnEventId)).toEqual(["501", "599"]);
  });
});
