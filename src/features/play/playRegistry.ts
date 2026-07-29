import type { PlayLineupType, PlayReplayBehavior } from "./lineupModel";

export type PlayGameId =
  | "find-leader"
  | "wavelength"
  | "blind-resume"
  | "blind-rank"
  | "keep-cut"
  | "better-than";

export type PlayNewLineupControl =
  | "none"
  | "result-replay"
  | "button-and-result-replay"
  | "builder-reset";

export type PlayRepetitionPolicy =
  | "fixed-daily"
  | "recent-items-deprioritized"
  | "recent-fighters-deprioritized"
  | "fixed-curated";

export type PlayCompletionState =
  | "leader-eliminated-or-nine-safe"
  | "fourth-guess-locked"
  | "five-picks-complete"
  | "five-slots-locked"
  | "eight-decisions-locked"
  | "claim-locked";

export interface PlayGameLineupDefinition {
  defaultType: PlayLineupType;
  supportedTypes: readonly PlayLineupType[];
  replayBehavior: PlayReplayBehavior;
  newLineupControl: PlayNewLineupControl;
  repetitionPolicy: PlayRepetitionPolicy;
  lineupSize: number | "variable";
  completionState: PlayCompletionState;
  challengeEligible: boolean;
  dailyEligible: boolean;
  streakEligible: boolean;
  reminderEligible: boolean;
  historyRecording:
    | "official-daily"
    | "official-daily-and-casual"
    | "casual-and-challenge"
    | "challenge-completion";
  difficultyModel: string;
}

export interface PlayGameDefinition {
  id: PlayGameId;
  icon: string;
  title: string;
  description: string;
  lineup: PlayGameLineupDefinition;
}

export const playGames: readonly PlayGameDefinition[] = [
  {
    id: "find-leader",
    icon: "#1",
    title: "Find the Leader",
    description: "Generate a fresh stat category and ten-fighter lineup, then leave the leader standing.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 10,
      completionState: "leader-eliminated-or-nine-safe",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
      difficultyModel: "A verified metric leader plus nine lower-value UFC fighters on either the fixed daily board or a generated casual board.",
    },
  },
  {
    id: "wavelength",
    icon: "≈",
    title: "Wavelength",
    description: "Find a hidden 1–100 rating through four adaptive UFC clues. Each clue reacts to your last guess.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 1,
      completionState: "fourth-guess-locked",
      challengeEligible: true,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-and-challenge",
      difficultyModel: "One hidden target with four adaptive clues and category-repeat pressure.",
    },
  },
  {
    id: "blind-resume",
    icon: "?",
    title: "Blind Resume",
    description: "Choose the stronger UFC career five times without seeing either fighter’s name.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 10,
      completionState: "five-picks-complete",
      challengeEligible: true,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-and-challenge",
      difficultyModel: "Five gender-valid matchup bands weighted toward close UFC résumé calls.",
    },
  },
  {
    id: "blind-rank",
    icon: "1–5",
    title: "Blind Rank 5",
    description: "Rank five mystery UFC fighters from 1–5. Once you place a fighter, that slot is locked.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 5,
      completionState: "five-slots-locked",
      challengeEligible: true,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-and-challenge",
      difficultyModel: "Five tiered roles with one maximum bad-fighter wildcard.",
    },
  },
  {
    id: "keep-cut",
    icon: "4/4",
    title: "Keep 4, Cut 4",
    description: "Make eight locked decisions without knowing which fighter is waiting at the end.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 8,
      completionState: "eight-decisions-locked",
      challengeEligible: true,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-and-challenge",
      difficultyModel: "Eight role-balanced fighters with controlled traps and wildcard variance.",
    },
  },
  {
    id: "better-than",
    icon: ">",
    title: "Better Than…",
    description: "Build a claim, choose your number, and name the exact fighters you can defend.",
    lineup: {
      defaultType: "curated",
      supportedTypes: ["curated"],
      replayBehavior: "same-curated-challenge",
      newLineupControl: "builder-reset",
      repetitionPolicy: "fixed-curated",
      lineupSize: "variable",
      completionState: "claim-locked",
      challengeEligible: true,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "challenge-completion",
      difficultyModel: "User-selected target, comparison lens, valid pool, claim size, and exact fighter list.",
    },
  },
] as const;

export function playGameDefinition(gameId: PlayGameId) {
  return playGames.find((game) => game.id === gameId)!;
}
