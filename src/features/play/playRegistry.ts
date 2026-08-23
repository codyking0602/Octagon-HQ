import type { PlayLineupType, PlayReplayBehavior } from "./lineupModel";

export type PlaySport = "ufc" | "football";

export type PlayGameId =
  | "find-leader"
  | "wavelength"
  | "blind-resume"
  | "blind-rank"
  | "keep-cut"
  | "better-than"
  | "auction"
  | "hit-the-number";

export type PlayGameKey = `${PlaySport}:${PlayGameId}`;

export interface PlayGameIdentity {
  sport: PlaySport;
  gameId: PlayGameId;
  key: PlayGameKey;
}

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
  sport: PlaySport;
  id: PlayGameId;
  route: string;
  icon: string;
  title: string;
  description: string;
  availability?: "preview";
  lineup: PlayGameLineupDefinition;
}

export const playGameCatalog = [
  {
    sport: "ufc",
    id: "auction",
    route: "/play/auction",
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
    sport: "ufc",
    id: "hit-the-number",
    route: "/play/hit-the-number",
    icon: "◎",
    title: "Hit the Number",
    description: "Pick 4–7 UFC fighters and hit the target without going over. Use the open roster or a random pool.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["daily", "replayable", "curated"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: "variable",
      completionState: "target-selection-locked",
      challengeEligible: true,
      dailyEligible: true,
      streakEligible: true,
      reminderEligible: true,
      historyRecording: "official-daily-and-casual",
      difficultyModel: "A verified UFC stat target with 4–7 required picks, optional division filtering, and either the full eligible roster or a 12-fighter random pool.",
    },
  },
  {
    sport: "ufc",
    id: "find-leader",
    route: "/play/find-leader",
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
    sport: "ufc",
    id: "wavelength",
    route: "/play/wavelength",
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
    sport: "ufc",
    id: "blind-resume",
    route: "/play/blind-resume",
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
    sport: "ufc",
    id: "blind-rank",
    route: "/play/blind-rank",
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
    sport: "ufc",
    id: "keep-cut",
    route: "/play/keep-cut",
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
    sport: "football",
    id: "blind-rank",
    route: "/back-room/football/rank-five",
    icon: "1–5",
    title: "Blind Rank 5",
    description: "Rank five mystery NFL or college football subjects from 1–5 before the next reveal.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 5,
      completionState: "five-slots-locked",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
      difficultyModel: "Versioned NFL and CFB player, season, team, program, and coach packs with blind locked placement.",
    },
  },
  {
    sport: "football",
    id: "keep-cut",
    route: "/back-room/football/keep-cut",
    icon: "4/4",
    title: "Keep 4, Cut 4",
    description: "Reveal eight NFL or college football subjects one at a time and lock four keeps and four cuts.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "button-and-result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 8,
      completionState: "eight-decisions-locked",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
      difficultyModel: "NFL and CFB comparison boards revealed one subject at a time with every Keep/Cut decision locked.",
    },
  },
  {
    sport: "football",
    id: "wavelength",
    route: "/back-room/football/wavelength",
    icon: "≈",
    title: "Wavelength",
    description: "Find a hidden 1–100 football number through four adaptive NFL and CFB clues.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 1,
      completionState: "fourth-guess-locked",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
      difficultyModel: "One hidden football target with four adaptive clues spanning NFL and college football categories.",
    },
  },
  {
    sport: "football",
    id: "blind-resume",
    route: "/back-room/football/blind-resume",
    icon: "?",
    title: "Blind Resume",
    description: "Choose the stronger football résumé across careers, seasons, teams, programs, and coaches without seeing the names.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 10,
      completionState: "five-picks-complete",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
      difficultyModel: "Five staged NFL and CFB résumé comparisons built across multiple subject types and difficulty bands.",
    },
  },
  {
    sport: "football",
    id: "hit-the-number",
    route: "/back-room/football/hit-the-number",
    icon: "◎",
    title: "Hit the Number",
    description: "Pick from a football board and chase a factual NFL or CFB target without going over.",
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
      difficultyModel: "Verified NFL and CFB factual targets across classic, themed, era, and team-build boards.",
    },
  },
  {
    sport: "football",
    id: "find-leader",
    route: "/back-room/football/find-leader",
    icon: "#1",
    title: "Find the Leader",
    description: "Eliminate nine NFL or college football decoys without removing the hidden statistical leader.",
    lineup: {
      defaultType: "replayable",
      supportedTypes: ["replayable"],
      replayBehavior: "new-lineup",
      newLineupControl: "result-replay",
      repetitionPolicy: "recent-items-deprioritized",
      lineupSize: 10,
      completionState: "leader-eliminated-or-nine-safe",
      challengeEligible: false,
      dailyEligible: false,
      streakEligible: false,
      reminderEligible: false,
      historyRecording: "casual-only",
      difficultyModel: "Verified NFL and CFB leader boards with nine lower-value decoys and balanced league/category depth.",
    },
  },
] as const satisfies readonly PlayGameDefinition[];

export const playGames: readonly PlayGameDefinition[] = playGameCatalog.filter(
  (game) => game.sport === "ufc",
);

export function playGamesForSport(sport: PlaySport): readonly PlayGameDefinition[] {
  return playGameCatalog.filter((game) => game.sport === sport);
}

export function playGameKey(sport: PlaySport, gameId: PlayGameId): PlayGameKey {
  return `${sport}:${gameId}`;
}

export function playGameIdentity(sport: PlaySport, gameId: PlayGameId): PlayGameIdentity {
  return { sport, gameId, key: playGameKey(sport, gameId) };
}

export function playGameDefinition(gameId: PlayGameId, sport: PlaySport = "ufc"): PlayGameDefinition {
  const definition = playGameCatalog.find((game) => game.sport === sport && game.id === gameId);
  if (!definition) throw new Error(`Play game ${playGameKey(sport, gameId)} is not registered.`);
  return definition;
}
