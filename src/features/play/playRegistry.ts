import type { PlayLineupType, PlayReplayBehavior } from "./lineupModel";

export type PlayGameId =
  | "find-leader"
  | "wavelength"
  | "blind-resume"
  | "blind-rank"
  | "keep-cut"
  | "better-than"
  | "auction"
  | "hit-the-number";

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
  | "claim-locked"
  | "auction-complete"
  | "target-selection-locked";

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
    | "challenge-completion"
    | "casual-only";
  difficultyModel: string;
}

export interface PlayGameDefinition {
  id: PlayGameId;
  icon: string;
  title: string;
  description: string;
  availability?: "preview";
  lineup: PlayGameLineupDefinition;
}

export const playGames: readonly PlayGameDefinition[] = [
  {
    id: "auction",
    icon: "$",
    title: "Auction",
    description: "Choose a UFC auction, bid privately, and build the stronger collection.",
    lineup: {
      defaultType: "curated",
      supportedTypes: ["curated"],
      replayBehavior: "same-curated-challenge",
      newLineupControl: "none",
      repetitionPolicy: "fixed-curated",
      lineupSize: "variable",
      completionState: "auction-complete",
      challengeEligible: true,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "challenge-completion",
      difficultyModel: "One selected auction mode with fixed public rounds, collection size, and starting bankroll.",
    },
  },
  {
    id: "hit-the-number",
    icon: "◎",
    title: "Hit the Number",
    description: "Pick 4–7 UFC fighters and hit the target without going over. Use the open roster or a random pool.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: "variable",
      completionState: "target-selection-locked",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
      difficultyModel: "A verified UFC stat target with 4–7 required picks, optional division filtering, and either the full eligible roster or a 12-fighter random pool.",
    },
  },
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
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 1,
      completionState: "fourth-guess-locked",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
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
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 10,
      completionState: "five-picks-complete",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
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
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 5,
      completionState: "five-slots-locked",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
      difficultyModel: "Five versioned lineup shapes with tier, cluster, and low-end pressure.",
    },
  },
  {
    id: "keep-cut",
    icon: "4/4",
    title: "Keep 4, Cut 4",
    description: "Reveal eight UFC fighters one at a time, lock four keeps and four cuts, and receive a private 0–100 score.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-fighters-deprioritized",
      lineupSize: 8,
      completionState: "eight-decisions-locked",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
      difficultyModel: "A cutoff-centered eight-fighter board revealed one fighter at a time with every Keep/Cut decision locked.",
    },
  },
  {
    id: "better-than",
    icon: "VS",
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
