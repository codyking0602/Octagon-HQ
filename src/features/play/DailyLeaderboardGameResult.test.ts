import { describe, expect, it } from "vitest";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import {
  buildMillionaireLeaderboardQuestions,
  buildSportsFeudFastMoneyRows,
  buildWhoAmILeaderboardRounds,
} from "./DailyLeaderboardGameResult";

function baseProjection(overrides: Partial<TodayChallengeProjection>): TodayChallengeProjection {
  return {
    available: true,
    sport: "football",
    id: "11111111-1111-4111-8111-111111111111",
    centralDay: "2026-09-24",
    scheduleVersion: "football-daily-v15-weighted-sep24",
    gameType: "millionaire",
    setupKey: "test",
    contentVersion: "test",
    scoringVersion: "test",
    fallbackReason: null,
    publicSetup: {},
    progressRevision: 3,
    publicState: { complete: true },
    revealSetup: null,
    officialAttempt: {
      nativeScore: 23,
      normalizedScore: 23,
      completedAt: "2026-09-24T14:00:00Z",
      publicResult: {
        outcome: "lost",
        completed_questions: 1,
        final_money: 0,
        lifelines_used: 1,
        time_remaining_ms: 104151,
      },
    },
    deploymentSha: "abc123",
    ...overrides,
  };
}

describe("Daily leaderboard game result reconstruction", () => {
  it("reconstructs a completed Millionaire run from sanitized action history", () => {
    const questions = Array.from({ length: 8 }, (_, index) => ({
      id: `q${index + 1}`,
      prompt: `Question ${index + 1}`,
      choices: [
        { id: "A", text: `A${index + 1}` },
        { id: "B", text: `B${index + 1}` },
        { id: "C", text: `C${index + 1}` },
        { id: "D", text: `D${index + 1}` },
      ],
    }));
    const projection = baseProjection({
      publicSetup: { questions },
      revealSetup: {
        questions: questions.map((question, index) => ({
          id: question.id,
          correct_choice_id: index === 0 ? "A" : index === 1 ? "B" : "C",
        })),
      },
    });

    const rows = buildMillionaireLeaderboardQuestions(projection, {
      action_history: [
        { type: "answer", choice_id: "A", time_remaining_ms: 116278 },
        { type: "use_lifeline", lifeline: "fifty-fifty", time_remaining_ms: 108397 },
        { type: "answer", choice_id: "C", time_remaining_ms: 104151 },
      ],
    });

    expect(rows[0]).toMatchObject({
      status: "correct",
      selectedChoiceIds: ["A"],
      correctChoiceId: "A",
    });
    expect(rows[1]).toMatchObject({
      status: "wrong",
      selectedChoiceIds: ["C"],
      correctChoiceId: "B",
      lifelines: ["fifty-fifty"],
    });
    expect(rows[2]?.status).toBe("unreached");
  });

  it("reconstructs both Who Am I rounds with guesses, recovery, and seen clues", () => {
    const projection = baseProjection({
      sport: "ufc",
      gameType: "who_am_i",
      publicSetup: {
        format_version: "who-am-i-two-round-v1",
        rounds: [
          {
            league: "UFC",
            subjects: [
              { id: "ufc:faber", name: "Urijah Faber", kind: "fighter" },
              { id: "ufc:aldo", name: "Jose Aldo", kind: "fighter" },
            ],
          },
          {
            league: "UFC",
            subjects: [
              { id: "ufc:rose", name: "Rose Namajunas", kind: "fighter" },
              { id: "ufc:joanna", name: "Joanna Jedrzejczyk", kind: "fighter" },
              { id: "ufc:weili", name: "Zhang Weili", kind: "fighter" },
            ],
          },
        ],
      },
      revealSetup: {
        format_version: "who-am-i-two-round-v1",
        rounds: [
          {
            league: "UFC",
            identity: { id: "ufc:faber", name: "Urijah Faber", kind: "fighter" },
            clues: Array.from({ length: 10 }, (_, index) => ({
              id: "faber-" + (index + 1),
              text: "Faber clue " + (index + 1),
            })),
          },
          {
            league: "UFC",
            identity: { id: "ufc:rose", name: "Rose Namajunas", kind: "fighter" },
            clues: Array.from({ length: 10 }, (_, index) => ({
              id: "rose-" + (index + 1),
              text: "Rose clue " + (index + 1),
            })),
          },
        ],
      },
      officialAttempt: {
        nativeScore: 65,
        normalizedScore: 65,
        completedAt: "2026-09-25T12:00:00Z",
        publicResult: {
          score: 65,
          rounds: [
            {
              round_index: 0,
              league: "UFC",
              subject_id: "ufc:faber",
              score: 70,
              outcome: "natural",
              revealed_count: 10,
              wrong_guesses: 0,
              recovery_misses: 0,
            },
            {
              round_index: 1,
              league: "UFC",
              subject_id: "ufc:rose",
              score: 60,
              outcome: "natural",
              revealed_count: 10,
              wrong_guesses: 1,
              recovery_misses: 0,
            },
          ],
        },
      },
    });

    const rounds = buildWhoAmILeaderboardRounds(projection, {
      rounds: [
        {
          outcome: "natural",
          revealed_count: 10,
          natural_guesses: ["ufc:faber"],
          recovery_choices: [],
          recovery_guesses: [],
        },
        {
          outcome: "natural",
          revealed_count: 10,
          natural_guesses: ["ufc:joanna", "ufc:rose"],
          recovery_choices: [],
          recovery_guesses: [],
        },
      ],
    });

    expect(rounds).toHaveLength(2);
    expect(rounds[0]).toMatchObject({
      identityName: "Urijah Faber",
      score: 70,
      outcome: "natural",
      wrongGuesses: 0,
      naturalGuesses: [{ id: "ufc:faber", name: "Urijah Faber", correct: true }],
    });
    expect(rounds[1]).toMatchObject({
      identityName: "Rose Namajunas",
      score: 60,
      outcome: "natural",
      wrongGuesses: 1,
      naturalGuesses: [
        { id: "ufc:joanna", name: "Joanna Jedrzejczyk", correct: false },
        { id: "ufc:rose", name: "Rose Namajunas", correct: true },
      ],
    });
    expect(rounds[1]?.clues).toHaveLength(10);
    expect(rounds[1]?.clues.every((clue) => clue.seen)).toBe(true);
  });

  it("shows Recovery Board picks without exposing anything beyond the completed board", () => {
    const projection = baseProjection({
      sport: "football",
      gameType: "who_am_i",
      publicSetup: {
        rounds: [{
          league: "NFL",
          subjects: [
            { id: "nfl:qb1", name: "Quarterback One", kind: "player" },
            { id: "nfl:qb2", name: "Quarterback Two", kind: "player" },
            { id: "nfl:qb3", name: "Quarterback Three", kind: "player" },
          ],
        }],
      },
      revealSetup: {
        rounds: [{
          league: "NFL",
          identity: { id: "nfl:qb1", name: "Quarterback One", kind: "player" },
          clues: Array.from({ length: 10 }, (_, index) => ({
            id: "nfl-" + (index + 1),
            text: "NFL clue " + (index + 1),
          })),
        }],
      },
      officialAttempt: {
        nativeScore: 45,
        normalizedScore: 45,
        completedAt: "2026-09-25T12:00:00Z",
        publicResult: {
          score: 45,
          rounds: [{
            round_index: 0,
            league: "NFL",
            subject_id: "nfl:qb1",
            score: 45,
            outcome: "recovered",
            revealed_count: 10,
            wrong_guesses: 1,
            recovery_misses: 0,
          }],
        },
      },
    });

    const [round] = buildWhoAmILeaderboardRounds(projection, {
      rounds: [{
        outcome: "recovered",
        revealed_count: 10,
        natural_guesses: ["nfl:qb2"],
        recovery_choices: ["nfl:qb1", "nfl:qb2", "nfl:qb3"],
        recovery_guesses: ["nfl:qb1"],
      }],
    });

    expect(round?.recoveryChoices).toEqual([
      {
        id: "nfl:qb1",
        name: "Quarterback One",
        guessed: true,
        correct: true,
        guessOrder: 1,
      },
      {
        id: "nfl:qb2",
        name: "Quarterback Two",
        guessed: false,
        correct: false,
        guessOrder: null,
      },
      {
        id: "nfl:qb3",
        name: "Quarterback Three",
        guessed: false,
        correct: false,
        guessOrder: null,
      },
    ]);
  });

  it("keeps the player's raw Fast Money text while showing the canonical match", () => {
    const projection = baseProjection({
      sport: "ufc",
      gameType: "sports_feud",
      publicState: {
        complete: true,
        fast_money: {
          results: [{
            question_id: "trash-talk",
            prompt: "Name a UFC fighter famous for trash talk.",
            submitted_answer: "Conor McGregor",
            board_rank: 1,
            points: 8,
          }],
        },
      },
    });

    expect(buildSportsFeudFastMoneyRows(projection, {
      fast_money_results: [{
        question_id: "trash-talk",
        submitted_text: "Conor Mcgegor",
      }],
    })).toEqual([{
      questionId: "trash-talk",
      prompt: "Name a UFC fighter famous for trash talk.",
      rawAnswer: "Conor Mcgegor",
      matchedAnswer: "Conor McGregor",
      rank: 1,
      points: 8,
    }]);
  });
});
