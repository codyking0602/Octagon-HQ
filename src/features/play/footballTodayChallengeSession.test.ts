import { describe, expect, it } from "vitest";
import {
  createFootballWavelengthRound,
  nextFootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { getFootballReviewedRankFivePack } from "../back-room/footballRankFivePlayableModel";
import {
  buildFootballOfficialDailySetup,
  FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
  FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION,
  FOOTBALL_DAILY_RUNTIME_VERSION,
} from "./footballTodayChallengeRuntime";
import {
  buildFootballTodayProjection,
  footballTodayGameForDay,
  FOOTBALL_TODAY_SCHEDULE_VERSION,
} from "./footballTodayChallengeSession";

type JsonRecord = Record<string, unknown>;

type BlindResumePrivateRound = {
  left_id: string;
  right_id: string;
  winner_id: string;
  reveal_counts: [number, number, number];
};

function isoDay(offset: number) {
  const day = new Date(Date.UTC(2026, 0, 1 + offset));
  return day.toISOString().slice(0, 10);
}

function setupUsesNonReviewedSubject(gameType: "blind_rank_5" | "keep_4_cut_4", day: string) {
  const setup = buildFootballOfficialDailySetup(gameType, day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const pack = setup.publicSetup.pack as Record<string, unknown>;
  const packId = String(pack.id) as Parameters<typeof getFootballReviewedRankFivePack>[0];
  const reviewedIds = new Set(getFootballReviewedRankFivePack(packId).items.map((item) => item.id));
  const publishedIds = setup.privateSetupEvidence.fighter_ids as string[];
  return publishedIds.some((id) => !reviewedIds.has(id));
}

function blindResumePrivateRounds(day: string) {
  const setup = buildFootballOfficialDailySetup("blind_resume", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  return (setup.privateSetupEvidence as { rounds: BlindResumePrivateRound[] }).rounds;
}

function blindResumeActions(day: string, revealStage: 1 | 2 | 3, correct: boolean): JsonRecord[] {
  return blindResumePrivateRounds(day).flatMap((round) => {
    const winnerSide = round.winner_id === round.left_id ? "A" : "B";
    const choice = correct ? winnerSide : winnerSide === "A" ? "B" : "A";
    return [
      ...Array.from({ length: revealStage - 1 }, () => ({ reveal: true })),
      { choice },
    ];
  });
}

describe("Football Today’s Challenge session", () => {
  it("keeps the deterministic five-day rotation and explicitly schedules Blind Resume for September 4", () => {
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
    expect(footballTodayGameForDay("2026-09-04")).toBe("blind_resume");
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

  it("opens Football Blind Resume as three anonymous rounds with a matchup-specific first reveal", () => {
    const projection = buildFootballTodayProjection("2026-09-04");
    const round = projection.public_state.current_round as Record<string, unknown>;
    const revealCounts = round.reveal_counts as number[];
    const scoringLadder = projection.public_setup.scoring_ladder;

    expect(projection.game_type).toBe("blind_resume");
    expect(projection.content_version).toBe(FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION);
    expect(projection.scoring_version).toBe(FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION);
    expect(projection.public_setup.round_count).toBe(3);
    expect(scoringLadder).toEqual([
      { stage: 1, correct: 10, wrong: -4 },
      { stage: 2, correct: 8, wrong: -1 },
      { stage: 3, correct: 7, wrong: 0 },
    ]);
    expect(revealCounts).toHaveLength(3);
    expect(round.reveal_stage).toBe(1);
    expect(round.revealed_count).toBe(revealCounts[0]);
    expect(round.max_revealed_count).toBe(revealCounts[2]);
    expect(round.stats).toHaveLength(revealCounts[0]);
    expect(round).not.toHaveProperty("left_name");
    expect(round).not.toHaveProperty("right_name");
    expect(round).not.toHaveProperty("winner_id");
    expect(projection.reveal_setup).toBeNull();
  });

  it("reveals matchup-specific fact stages and resets the next round to its own opening state", () => {
    const day = "2026-09-04";
    const initial = buildFootballTodayProjection(day);
    const initialRound = initial.public_state.current_round as Record<string, unknown>;
    const firstCounts = initialRound.reveal_counts as number[];

    const afterReveal = buildFootballTodayProjection(day, [{ reveal: true }]);
    const revealedRound = afterReveal.public_state.current_round as Record<string, unknown>;
    expect(revealedRound.reveal_stage).toBe(2);
    expect(revealedRound.revealed_count).toBe(firstCounts[1]);
    expect(revealedRound.stats).toHaveLength(firstCounts[1]);

    const afterPick = buildFootballTodayProjection(day, [{ choice: "A" }]);
    const result = (afterPick.public_state.results as Array<Record<string, unknown>>)[0]!;
    const nextRound = afterPick.public_state.current_round as Record<string, unknown>;
    const nextCounts = nextRound.reveal_counts as number[];
    expect(result.reveal_stage).toBe(1);
    expect([10, -4]).toContain(result.points_awarded);
    expect(nextRound.reveal_stage).toBe(1);
    expect(nextRound.revealed_count).toBe(nextCounts[0]);
    expect(nextRound.stats).toHaveLength(nextCounts[0]);
  });

  it("normalizes three perfect rounds to 100, 80, and 70 based on reveal timing", () => {
    const day = "2026-09-04";
    const early = buildFootballTodayProjection(day, blindResumeActions(day, 1, true));
    const middle = buildFootballTodayProjection(day, blindResumeActions(day, 2, true));
    const late = buildFootballTodayProjection(day, blindResumeActions(day, 3, true));

    expect(early.official_attempt?.native_score).toBe(30);
    expect(early.official_attempt?.normalized_score).toBe(100);
    expect(middle.official_attempt?.native_score).toBe(24);
    expect(middle.official_attempt?.normalized_score).toBe(80);
    expect(late.official_attempt?.native_score).toBe(21);
    expect(late.official_attempt?.normalized_score).toBe(70);
  });

  it("floors an all-wrong first-reveal card at zero and reconstructs the same result deterministically", () => {
    const day = "2026-09-04";
    const actions = blindResumeActions(day, 1, false);
    const first = buildFootballTodayProjection(day, actions);
    const second = buildFootballTodayProjection(day, actions);

    expect(first.official_attempt?.native_score).toBe(-12);
    expect(first.official_attempt?.normalized_score).toBe(0);
    expect(first.public_setup).toEqual(second.public_setup);
    expect(first.public_state).toEqual(second.public_state);
    expect(first.official_attempt?.native_score).toBe(second.official_attempt?.native_score);
    expect(first.official_attempt?.normalized_score).toBe(second.official_attempt?.normalized_score);
    expect(first.official_attempt?.public_result).toEqual(second.official_attempt?.public_result);
    expect(first.action_history).toEqual(second.action_history);
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

  it("publishes non-legacy canonical subjects through the official daily Blind Rank and Keep/Cut runtime", () => {
    let blindRankExpanded = false;
    let keepCutExpanded = false;

    for (let offset = 0; offset < 96 && (!blindRankExpanded || !keepCutExpanded); offset += 1) {
      const day = isoDay(offset);
      blindRankExpanded ||= setupUsesNonReviewedSubject("blind_rank_5", day);
      keepCutExpanded ||= setupUsesNonReviewedSubject("keep_4_cut_4", day);
    }

    expect(blindRankExpanded).toBe(true);
    expect(keepCutExpanded).toBe(true);
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