import { describe, expect, it } from "vitest";
import {
  createFootballWavelengthRound,
  nextFootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES } from "../back-room/footballBlindResumeModel";
import { FOOTBALL_DAILY_RUNTIME_VERSION } from "./footballTodayChallengeRuntime";
import {
  buildFootballTodayProjection,
  footballTodayGameForDay,
  FOOTBALL_TODAY_SCHEDULE_VERSION,
} from "./footballTodayChallengeSession";

describe("Football Today’s Challenge session", () => {
  it("uses one deterministic five-day rotation with the Daily Double anchor", () => {
    expect([
      footballTodayGameForDay("2026-08-22"),
      footballTodayGameForDay("2026-08-23"),
      footballTodayGameForDay("2026-08-24"),
      footballTodayGameForDay("2026-08-25"),
      footballTodayGameForDay("2026-08-26"),
    ]).toEqual([
      "find_leader",
      "blind_resume",
      "wavelength",
      "keep_4_cut_4",
      "hit_the_number",
    ]);
    expect(footballTodayGameForDay("2026-08-27")).toBe("find_leader");
  });

  it("builds the same public board for the same Central day without leaking Find the Leader evidence", () => {
    const first = buildFootballTodayProjection("2026-08-22");
    const second = buildFootballTodayProjection("2026-08-22");

    expect(first.id).toBe(second.id);
    expect(first.setup_key).toBe(second.setup_key);
    expect(first.public_setup).toEqual(second.public_setup);
    expect(first.reveal_setup).toBeNull();
    expect(first.official_attempt).toBeNull();
    expect(JSON.stringify(first)).not.toContain("leader_id");
    expect(JSON.stringify(first)).not.toContain("leader_value");
  });

  it("opens Daily Blind Resume fully anonymous on the tougher authored difficulty mix", () => {
    const projection = buildFootballTodayProjection("2026-08-23");
    const round = projection.public_state.current_round as Record<string, unknown>;

    expect(projection.game_type).toBe("blind_resume");
    expect(projection.public_setup.difficulty_mix).toEqual([...FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES]);
    expect(round.revealed_count).toBe(0);
    expect(round.stats).toHaveLength(0);
    expect(["villain", "hard", "medium"]).toContain(round.difficulty);
    expect(round).not.toHaveProperty("left_name");
    expect(round).not.toHaveProperty("right_name");
    expect(projection.reveal_setup).toBeNull();
  });

  it("reveals Daily Blind Resume in two-row stages and preserves the early-conviction score", () => {
    const afterReveal = buildFootballTodayProjection("2026-08-23", [{ reveal: true }]);
    const round = afterReveal.public_state.current_round as Record<string, unknown>;
    expect(round.revealed_count).toBe(2);
    expect(round.stats).toHaveLength(2);

    const afterPick = buildFootballTodayProjection("2026-08-23", [{ choice: "A" }]);
    const result = (afterPick.public_state.results as Array<Record<string, unknown>>)[0]!;
    expect(result.revealed_count).toBe(0);
    expect([0, 20]).toContain(result.points_awarded);
  });

  it("keeps daily Wavelength adaptive clue selection identical to the replayable engine", () => {
    const day = "2026-08-24";
    const guess = 50;
    const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|wavelength|${FOOTBALL_TODAY_SCHEDULE_VERSION}|${day}`;
    const replayableRound = createFootballWavelengthRound(seed);
    const expectedNext = nextFootballWavelengthClue(replayableRound, guess, 1, seed, []);
    const daily = buildFootballTodayProjection(day, [{ guess }]);
    const clues = daily.public_state.clues as Array<Record<string, unknown>>;

    expect(clues[1]?.id).toBe(expectedNext.id);
  });

  it("makes Daily Double use opposite leagues before Keep/Cut begins", () => {
    const start = buildFootballTodayProjection("2026-08-25");
    const rankLeague = (start.public_setup.pack as Record<string, unknown>).league;
    const actions = [1, 2, 3, 4, 5].map((slot) => ({ slot }));
    const keep = buildFootballTodayProjection("2026-08-25", actions);
    const keepLeague = (keep.public_setup.pack as Record<string, unknown>).league;

    expect(start.game_type).toBe("blind_rank_5");
    expect(keep.game_type).toBe("keep_4_cut_4");
    expect(rankLeague).not.toBe(keepLeague);
    expect(keep.public_state.combo_blind_rank_result).toBeTruthy();
    expect(keep.reveal_setup).toBeNull();
  });

  it("keeps Hit the Number subject values private before the final lock", () => {
    const projection = buildFootballTodayProjection("2026-08-26");
    const candidates = projection.public_setup.candidates as Array<Record<string, unknown>>;

    expect(projection.game_type).toBe("hit_the_number");
    expect(candidates.length).toBeGreaterThan(7);
    expect(candidates.every((candidate) => !("value" in candidate))).toBe(true);
    expect(projection.reveal_setup).toBeNull();
  });
});
