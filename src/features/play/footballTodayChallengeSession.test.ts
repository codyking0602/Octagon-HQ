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
  FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION,
  advanceFootballOfficialDailyRuntime,
} from "./footballTodayChallengeRuntime";
import {
  buildFootballTodayPersistenceSetup,
  buildFootballTodayProjection,
  footballTodayGameForDay,
  footballTodayScheduleVersionForDay,
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

function setupScheduleVersion(day: string) {
  return day >= "2026-09-12" ? FOOTBALL_TODAY_SCHEDULE_VERSION : "football-daily-v1";
}

function setupUsesNonReviewedSubject(gameType: "blind_rank_5" | "keep_4_cut_4", day: string) {
  const setup = buildFootballOfficialDailySetup(gameType, day, setupScheduleVersion(day));
  const pack = setup.publicSetup.pack as Record<string, unknown>;
  const packId = String(pack.id) as Parameters<typeof getFootballReviewedRankFivePack>[0];
  const reviewedIds = new Set(getFootballReviewedRankFivePack(packId).items.map((item) => item.id));
  const publishedIds = setup.privateSetupEvidence.fighter_ids as string[];
  return publishedIds.some((id) => !reviewedIds.has(id));
}

function blindResumePrivateRounds(day: string) {
  const setup = buildFootballOfficialDailySetup("blind_resume", day, setupScheduleVersion(day));
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
  it("preserves historical Football days and uses the exact 20-slot future rotation", () => {
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
    expect(footballTodayGameForDay("2026-09-04")).toBe("blind_resume");
    expect(footballTodayGameForDay("2026-09-07")).toBe("blind_resume");
    expect(footballTodayGameForDay("2026-09-11")).toBe("find_leader");
    expect(footballTodayScheduleVersionForDay("2026-08-22")).toBe("football-daily-v1");
    expect(footballTodayScheduleVersionForDay("2026-09-04")).toBe("football-daily-v2");
    expect(footballTodayScheduleVersionForDay("2026-09-05")).toBe("football-daily-v3");
    expect(footballTodayScheduleVersionForDay("2026-09-11")).toBe("football-daily-v3");
    expect(footballTodayScheduleVersionForDay("2026-09-12")).toBe(FOOTBALL_TODAY_SCHEDULE_VERSION);
    expect(FOOTBALL_TODAY_SCHEDULE_VERSION).toBe("football-daily-v4");

    const future = Array.from({ length: 20 }, (_unused, offset) => {
      const day = new Date(Date.UTC(2026, 8, 12 + offset)).toISOString().slice(0, 10);
      return footballTodayGameForDay(day);
    });
    expect(future.filter((game) => game === "find_leader")).toHaveLength(5);
    expect(future.filter((game) => game === "wavelength")).toHaveLength(5);
    expect(future.filter((game) => game === "hit_the_number")).toHaveLength(4);
    expect(future.filter((game) => game === "who_am_i")).toHaveLength(4);
    expect(future.filter((game) => game === "keep_4_cut_4")).toHaveLength(2);
    expect(future).not.toContain("blind_resume");
    expect(future).not.toContain("blind_rank_5");

    const historicalProjection = buildFootballTodayProjection("2026-09-11");
    const historicalPersistence = buildFootballTodayPersistenceSetup("2026-09-11");
    expect(historicalProjection.schedule_version).toBe("football-daily-v3");
    expect(historicalProjection.game_type).toBe("find_leader");
    expect(historicalProjection.setup_key).toContain("football-daily-v1");
    expect(historicalPersistence.scheduleVersion).toBe("football-daily-v3");
    expect(historicalPersistence.setupKey).toBe(historicalProjection.setup_key);

    const projection = buildFootballTodayProjection("2026-09-12");
    expect(projection.schedule_version).toBe("football-daily-v4");
    expect(projection.game_type).toBe("find_leader");
    expect(projection.setup_key).toContain("football-daily-v4");
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

  it("reveals only safely eliminated Find the Leader values before completion", () => {
    const day = "2026-08-22";
    const setup = buildFootballOfficialDailySetup("find_leader", day, setupScheduleVersion(day));
    const candidateIds = setup.privateSetupEvidence.candidate_ids as string[];
    const leaderId = String(setup.privateSetupEvidence.leader_id);
    const safeId = candidateIds.find((id) => id !== leaderId)!;
    const projection = buildFootballTodayProjection(day, [{ eliminated_id: safeId }]);
    const revealed = projection.public_state.revealed_candidates as Array<Record<string, unknown>>;

    expect(projection.official_attempt).toBeNull();
    expect(projection.reveal_setup).toBeNull();
    expect(revealed).toHaveLength(1);
    expect(revealed[0]?.id).toBe(safeId);
    expect(typeof revealed[0]?.value).toBe("number");
    expect(JSON.stringify(projection)).not.toContain(`"leader_id":"${leaderId}"`);
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
    const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|wavelength|${setupScheduleVersion(day)}|${day}`;
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

  it("keeps Football Daily Hit the Number on the replayable progression rules", () => {
    let setup: ReturnType<typeof buildFootballOfficialDailySetup> | null = null;
    for (let offset = 0; offset < 240; offset += 1) {
      const day = isoDay(offset);
      const candidate = buildFootballOfficialDailySetup(
        "hit_the_number",
        day,
        setupScheduleVersion(day),
      );
      const formatId = candidate.publicSetup.format_id;
      if (formatId === "one-from-each" || formatId === "build-the-team") {
        setup = candidate;
        break;
      }
    }

    expect(setup).not.toBeNull();
    if (!setup) return;
    expect(setup.contentVersion).toBe(FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION);
    expect(setup.publicSetup.slots).toBeTruthy();

    const initialState = setup.publicSetup.initial_state as JsonRecord;
    const firstAvailable = initialState.available_subject_ids as string[];
    expect(firstAvailable.length).toBeGreaterThan(0);

    const context = {
      gameType: "hit_the_number" as const,
      setupKey: setup.setupKey,
      publicSetup: setup.publicSetup,
      revealSetup: setup.revealSetup,
      privateSetupEvidence: setup.privateSetupEvidence,
      privateGradingEvidence: setup.privateGradingEvidence,
      submissionState: {},
      publicState: initialState,
    };
    const first = advanceFootballOfficialDailyRuntime(context, { fighter_id: firstAvailable[0] });
    const firstState = first.publicState as JsonRecord;
    expect((firstState.selected_ids as string[])).toEqual([firstAvailable[0]]);
    expect((firstState.active_slot as JsonRecord).index).toBe(1);

    const nextAvailable = firstState.available_subject_ids as string[];
    const allIds = setup.privateSetupEvidence.fighter_ids as string[];
    const illegalForSlot = allIds.find((id) => id !== firstAvailable[0] && !nextAvailable.includes(id));
    expect(illegalForSlot).toBeTruthy();
    if (illegalForSlot) {
      expect(() => advanceFootballOfficialDailyRuntime({
        ...context,
        submissionState: first.submissionState,
        publicState: first.publicState,
      }, { fighter_id: illegalForSlot })).toThrow(/active Football Hit the Number slot/);
    }
    expect(() => advanceFootballOfficialDailyRuntime({
      ...context,
      submissionState: first.submissionState,
      publicState: first.publicState,
    }, { lock: true })).toThrow(/do not satisfy this board/);
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
