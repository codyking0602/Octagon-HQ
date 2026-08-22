import { desiredWavelengthCorrection } from "../play/wavelengthEngine";
import {
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";

export const FOOTBALL_WAVELENGTH_GAME_ID = "football-wavelength";

export type FootballWavelengthCategory =
  | "NFL LEGACY"
  | "GUNSLINGER"
  | "QB CARRY JOB"
  | "OFFENSIVE CHAOS"
  | "FANBASE INSANITY"
  | "PROGRAM TRADITION";

export interface FootballWavelengthClue {
  id: string;
  category: FootballWavelengthCategory;
  text: string;
  rating: number;
}

export interface FootballWavelengthRound {
  target: number;
  clues: FootballWavelengthClue[];
}

export interface FootballWavelengthRun {
  seed: string;
  initialRound: FootballWavelengthRound;
  identity: PlayLineupIdentity;
}

export const footballWavelengthClues: readonly FootballWavelengthClue[] = [
  { id: "legacy-tebow", category: "NFL LEGACY", text: "Tim Tebow", rating: 5 },
  { id: "legacy-reggie-bush", category: "NFL LEGACY", text: "Reggie Bush", rating: 11 },
  { id: "legacy-vince-young", category: "NFL LEGACY", text: "Vince Young", rating: 18 },
  { id: "legacy-matt-leinart", category: "NFL LEGACY", text: "Matt Leinart", rating: 24 },
  { id: "legacy-cam-newton", category: "NFL LEGACY", text: "Cam Newton", rating: 55 },
  { id: "legacy-lamar-jackson", category: "NFL LEGACY", text: "Lamar Jackson", rating: 72 },
  { id: "legacy-peyton-manning", category: "NFL LEGACY", text: "Peyton Manning", rating: 91 },
  { id: "legacy-patrick-mahomes", category: "NFL LEGACY", text: "Patrick Mahomes", rating: 97 },
  { id: "legacy-tom-brady", category: "NFL LEGACY", text: "Tom Brady", rating: 100 },

  { id: "gunslinger-alex-smith", category: "GUNSLINGER", text: "Alex Smith", rating: 12 },
  { id: "gunslinger-brock-purdy", category: "GUNSLINGER", text: "Brock Purdy", rating: 28 },
  { id: "gunslinger-jared-goff", category: "GUNSLINGER", text: "Jared Goff", rating: 43 },
  { id: "gunslinger-tom-brady", category: "GUNSLINGER", text: "Tom Brady", rating: 56 },
  { id: "gunslinger-stafford", category: "GUNSLINGER", text: "Matthew Stafford", rating: 80 },
  { id: "gunslinger-mahomes", category: "GUNSLINGER", text: "Patrick Mahomes", rating: 88 },
  { id: "gunslinger-romo", category: "GUNSLINGER", text: "Tony Romo", rating: 90 },
  { id: "gunslinger-favre", category: "GUNSLINGER", text: "Brett Favre", rating: 97 },
  { id: "gunslinger-josh-allen", category: "GUNSLINGER", text: "Josh Allen", rating: 100 },

  { id: "carry-aj-mccarron", category: "QB CARRY JOB", text: "A.J. McCarron at Alabama", rating: 11 },
  { id: "carry-mac-jones-bama", category: "QB CARRY JOB", text: "Mac Jones at Alabama", rating: 20 },
  { id: "carry-brock-purdy", category: "QB CARRY JOB", text: "Brock Purdy", rating: 35 },
  { id: "carry-jared-goff", category: "QB CARRY JOB", text: "Jared Goff", rating: 48 },
  { id: "carry-joe-burrow", category: "QB CARRY JOB", text: "Joe Burrow", rating: 79 },
  { id: "carry-tom-brady", category: "QB CARRY JOB", text: "Tom Brady", rating: 86 },
  { id: "carry-lamar-jackson", category: "QB CARRY JOB", text: "Lamar Jackson", rating: 92 },
  { id: "carry-mahomes", category: "QB CARRY JOB", text: "Patrick Mahomes", rating: 97 },
  { id: "carry-josh-allen", category: "QB CARRY JOB", text: "Josh Allen", rating: 99 },

  { id: "chaos-iowa", category: "OFFENSIVE CHAOS", text: "Iowa offense", rating: 2 },
  { id: "chaos-2023-steelers", category: "OFFENSIVE CHAOS", text: "2023 Steelers offense", rating: 14 },
  { id: "chaos-harbaugh", category: "OFFENSIVE CHAOS", text: "Jim Harbaugh offense", rating: 35 },
  { id: "chaos-army", category: "OFFENSIVE CHAOS", text: "Army triple option", rating: 48 },
  { id: "chaos-lincoln-riley", category: "OFFENSIVE CHAOS", text: "Lincoln Riley offense", rating: 79 },
  { id: "chaos-chip-kelly", category: "OFFENSIVE CHAOS", text: "Chip Kelly Oregon", rating: 88 },
  { id: "chaos-2019-lsu", category: "OFFENSIVE CHAOS", text: "2019 LSU", rating: 93 },
  { id: "chaos-mike-leach", category: "OFFENSIVE CHAOS", text: "Mike Leach Air Raid", rating: 97 },
  { id: "chaos-band-play", category: "OFFENSIVE CHAOS", text: "Cal–Stanford band play", rating: 100 },

  { id: "fans-chargers", category: "FANBASE INSANITY", text: "Los Angeles Chargers", rating: 14 },
  { id: "fans-falcons", category: "FANBASE INSANITY", text: "Atlanta Falcons", rating: 24 },
  { id: "fans-packers", category: "FANBASE INSANITY", text: "Green Bay Packers", rating: 66 },
  { id: "fans-texas", category: "FANBASE INSANITY", text: "Texas Longhorns", rating: 76 },
  { id: "fans-ohio-state", category: "FANBASE INSANITY", text: "Ohio State", rating: 88 },
  { id: "fans-alabama", category: "FANBASE INSANITY", text: "Alabama", rating: 91 },
  { id: "fans-bills", category: "FANBASE INSANITY", text: "Bills Mafia", rating: 96 },
  { id: "fans-eagles", category: "FANBASE INSANITY", text: "Philadelphia Eagles", rating: 99 },
  { id: "fans-texas-am", category: "FANBASE INSANITY", text: "Texas A&M", rating: 100 },

  { id: "tradition-ucf", category: "PROGRAM TRADITION", text: "UCF", rating: 10 },
  { id: "tradition-oregon", category: "PROGRAM TRADITION", text: "Oregon", rating: 22 },
  { id: "tradition-miami", category: "PROGRAM TRADITION", text: "Miami", rating: 45 },
  { id: "tradition-clemson", category: "PROGRAM TRADITION", text: "Clemson", rating: 57 },
  { id: "tradition-georgia", category: "PROGRAM TRADITION", text: "Georgia", rating: 72 },
  { id: "tradition-texas", category: "PROGRAM TRADITION", text: "Texas", rating: 90 },
  { id: "tradition-ohio-state", category: "PROGRAM TRADITION", text: "Ohio State", rating: 96 },
  { id: "tradition-michigan", category: "PROGRAM TRADITION", text: "Michigan", rating: 98 },
  { id: "tradition-notre-dame", category: "PROGRAM TRADITION", text: "Notre Dame", rating: 100 },
] as const;

function chooseFootballWavelengthClue(
  desiredRating: number,
  options: {
    target: number;
    direction?: number;
    usedIds?: readonly string[];
    usedCategories?: readonly FootballWavelengthCategory[];
    random: () => number;
  },
) {
  const usedIds = new Set(options.usedIds ?? []);
  const usedCategories = new Set(options.usedCategories ?? []);
  const base = footballWavelengthClues.filter((clue) => !usedIds.has(clue.id));
  let candidates = base;
  if ((options.direction ?? 0) > 0) {
    const directional = base.filter((clue) => clue.rating > options.target);
    if (directional.length) candidates = directional;
  } else if ((options.direction ?? 0) < 0) {
    const directional = base.filter((clue) => clue.rating < options.target);
    if (directional.length) candidates = directional;
  }

  return [...candidates]
    .map((clue) => ({
      clue,
      score: Math.abs(clue.rating - desiredRating)
        + (usedCategories.has(clue.category) ? 18 : 0)
        + options.random() * 2,
    }))
    .sort((left, right) => left.score - right.score)[0]!.clue;
}

export function createFootballWavelengthRound(seed: string): FootballWavelengthRound {
  const random = seededLineupRandom(FOOTBALL_WAVELENGTH_GAME_ID, "round", seed);
  const target = 20 + Math.floor(random() * 76);
  const opening = chooseFootballWavelengthClue(target + (random() > 0.5 ? 3 : -3), {
    target,
    random,
  });
  return { target, clues: [opening] };
}

export function nextFootballWavelengthClue(
  round: FootballWavelengthRound,
  lastGuess: number,
  nextClueIndex: number,
  seed: string,
  priorGuesses: readonly number[],
) {
  const random = seededLineupRandom(
    FOOTBALL_WAVELENGTH_GAME_ID,
    "next",
    seed,
    nextClueIndex,
    ...priorGuesses,
    lastGuess,
  );
  const direction = Math.sign(round.target - lastGuess);
  const desired = desiredWavelengthCorrection(round.target, lastGuess, nextClueIndex, random);
  return chooseFootballWavelengthClue(desired, {
    target: round.target,
    direction,
    usedIds: round.clues.map((clue) => clue.id),
    usedCategories: round.clues.map((clue) => clue.category),
    random,
  });
}

export function createFootballWavelengthRun(): FootballWavelengthRun {
  const selected = selectReplayLineup({
    gameId: FOOTBALL_WAVELENGTH_GAME_ID,
    lineupSize: 3,
    attempts: 12,
    build: (seed) => {
      const initialRound = createFootballWavelengthRound(seed);
      const opening = initialRound.clues[0]!;
      return {
        value: { seed, initialRound },
        itemIds: [`target:${initialRound.target}`, `clue:${opening.id}`, `category:${opening.category}`],
      };
    },
  });
  return { ...selected.value, identity: selected.identity };
}
