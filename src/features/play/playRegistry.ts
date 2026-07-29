import type { PlayLineupType, PlayReplayBehavior } from "./lineupModel";

export type PlayGameId =
  | "find-leader"
  | "wavelength"
  | "blind-resume"
  | "blind-rank"
  | "keep-cut"
  | "better-than";

export interface PlayGameLineupDefinition {
  defaultType: PlayLineupType;
  supportedTypes: readonly PlayLineupType[];
  replayBehavior: PlayReplayBehavior;
  lineupSize: number | "variable";
  challengeEligible: boolean;
  dailyEligible: boolean;
  historyRecording: "official-daily" | "casual-and-challenge" | "challenge-completion";
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
    description: "Eliminate nine fighters without removing the verified stat leader.",
    lineup: {
      defaultType: "daily",
      supportedTypes: ["daily", "curated"],
      replayBehavior: "same-daily-lineup",
      lineupSize: 10,
      challengeEligible: true,
      dailyEligible: true,
      historyRecording: "official-daily",
      difficultyModel: "Verified metric leader plus nine lower-value UFC fighters.",
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
      lineupSize: 1,
      challengeEligible: true,
      dailyEligible: false,
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
      lineupSize: 10,
      challengeEligible: true,
      dailyEligible: false,
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
      lineupSize: 5,
      challengeEligible: true,
      dailyEligible: false,
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
      lineupSize: 8,
      challengeEligible: true,
      dailyEligible: false,
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
      lineupSize: "variable",
      challengeEligible: true,
      dailyEligible: false,
      historyRecording: "challenge-completion",
      difficultyModel: "User-selected target, comparison lens, valid pool, claim size, and exact fighter list.",
    },
  },
] as const;

export function playGameDefinition(gameId: PlayGameId) {
  return playGames.find((game) => game.id === gameId)!;
}
