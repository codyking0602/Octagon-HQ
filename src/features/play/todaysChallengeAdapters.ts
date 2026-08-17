import { playGameDefinition, type PlayGameId } from "./playRegistry";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

export type DailyGameType = OfficialDailyGameType;

export interface OfficialAttempt {
  nativeScore: number;
  normalizedScore: number;
  completedAt: string;
  publicResult: Record<string, unknown>;
}

export interface TodayChallengeAdapter {
  gameType: DailyGameType;
  gameId: PlayGameId;
  title: string;
  dailyRoute: string;
  casualRoute: string;
  cta: string;
  instructions: string;
  nativeResultLabel: string;
  nativeDisplay: (attempt: Pick<OfficialAttempt, "nativeScore" | "publicResult">) => string;
}

function hitTheNumberResult(attempt: Pick<OfficialAttempt, "nativeScore" | "publicResult">) {
  const status = attempt.publicResult.status;
  if (status === "perfect") return "PERFECT";
  if (status === "bust") return "BUST";
  const distance = attempt.publicResult.distance;
  return typeof distance === "number" && Number.isFinite(distance)
    ? `${distance} off`
    : String(attempt.nativeScore);
}

export const TODAY_CHALLENGE_ADAPTERS = {
  hit_the_number: {
    gameType: "hit_the_number",
    gameId: "hit-the-number",
    title: "Hit the Number",
    dailyRoute: "/play/hit-the-number?mode=daily",
    casualRoute: "/play/hit-the-number",
    cta: "Hit today’s target",
    instructions: "Pick the required UFC fighters and get as close as possible to the target without going over.",
    nativeResultLabel: "Target result",
    nativeDisplay: hitTheNumberResult,
  },
  find_leader: {
    gameType: "find_leader",
    gameId: "find-leader",
    title: "Find the Leader",
    dailyRoute: "/play/find-leader",
    casualRoute: "/play/find-leader?mode=replayable",
    cta: "Tap to play",
    instructions: "Eliminate nine fighters without removing today’s verified stat leader.",
    nativeResultLabel: "Round score",
    nativeDisplay: (attempt) => `${attempt.nativeScore}/10`,
  },
  blind_resume: {
    gameType: "blind_resume",
    gameId: "blind-resume",
    title: "Blind Resume",
    dailyRoute: "/play/blind-resume?mode=daily",
    casualRoute: "/play/blind-resume",
    cta: "Make today’s picks",
    instructions: "Choose the stronger UFC career five times without seeing either name.",
    nativeResultLabel: "Correct picks",
    nativeDisplay: (attempt) => `${attempt.nativeScore}/5`,
  },
  wavelength: {
    gameType: "wavelength",
    gameId: "wavelength",
    title: "Wavelength",
    dailyRoute: "/play/wavelength?mode=daily",
    casualRoute: "/play/wavelength",
    cta: "Guess the number",
    instructions: "Use four adaptive clues to land as close as possible to the hidden 1–100 target.",
    nativeResultLabel: "Wavelength score",
    nativeDisplay: (attempt) => `${attempt.nativeScore}/100`,
  },
  blind_rank_5: {
    gameType: "blind_rank_5",
    gameId: "blind-rank",
    title: "Blind Rank 5",
    dailyRoute: "/play/blind-rank?mode=daily",
    casualRoute: "/play/blind-rank",
    cta: "Rank today’s five",
    instructions: "Place each mystery fighter before the next fighter is revealed. Every slot locks.",
    nativeResultLabel: "Correct comparisons",
    nativeDisplay: (attempt) => `${attempt.nativeScore} of 10 comparisons`,
  },
  keep_4_cut_4: {
    gameType: "keep_4_cut_4",
    gameId: "keep-cut",
    title: "Keep 4, Cut 4",
    dailyRoute: "/play/keep-cut?mode=daily",
    casualRoute: "/play/keep-cut",
    cta: "Make today’s eight calls",
    instructions: "Decide one fighter at a time. Every call locks, future fighters stay hidden, and a full tray forces the rest to the other side.",
    nativeResultLabel: "Correct comparisons",
    nativeDisplay: (attempt) => `${attempt.nativeScore} of 16 comparisons`,
  },
} as const satisfies Record<DailyGameType, TodayChallengeAdapter>;

export function todayChallengeAdapter(gameType: DailyGameType | string | undefined) {
  if (!gameType || !(gameType in TODAY_CHALLENGE_ADAPTERS)) return null;
  return TODAY_CHALLENGE_ADAPTERS[gameType as DailyGameType];
}

export function todayChallengeGameDefinition(gameType: DailyGameType | string | undefined) {
  const adapter = todayChallengeAdapter(gameType);
  return adapter ? playGameDefinition(adapter.gameId) : null;
}
