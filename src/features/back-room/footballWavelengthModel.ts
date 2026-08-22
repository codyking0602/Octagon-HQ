import {
  desiredWavelengthCorrection,
} from "../play/wavelengthEngine";
import {
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";

export const FOOTBALL_WAVELENGTH_GAME_ID = "football-wavelength";

export type FootballWavelengthAxisId =
  | "overrated-underrated"
  | "college-nfl"
  | "manager-gunslinger"
  | "system-carries"
  | "boring-chaos"
  | "normal-insane"
  | "new-money-tradition";

export interface FootballWavelengthAxis {
  id: FootballWavelengthAxisId;
  name: string;
  left: string;
  right: string;
}

export interface FootballWavelengthClue {
  id: string;
  axisId: FootballWavelengthAxisId;
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

export const footballWavelengthAxes: readonly FootballWavelengthAxis[] = [
  { id: "overrated-underrated", name: "REPUTATION CHECK", left: "OVERRATED", right: "UNDERRATED" },
  { id: "college-nfl", name: "WHERE THE LEGEND LIVES", left: "COLLEGE LEGEND", right: "NFL LEGEND" },
  { id: "manager-gunslinger", name: "QB TEMPERAMENT", left: "GAME MANAGER", right: "GUNSLINGER" },
  { id: "system-carries", name: "QB VALUE", left: "SYSTEM QB", right: "CARRIES THE SYSTEM" },
  { id: "boring-chaos", name: "OFFENSIVE VIBE", left: "BORING", right: "PURE CHAOS" },
  { id: "normal-insane", name: "FANBASE METER", left: "NORMAL", right: "COMPLETELY INSANE" },
  { id: "new-money-tradition", name: "PROGRAM DNA", left: "NEW MONEY", right: "TRADITION" },
] as const;

export const footballWavelengthClues: readonly FootballWavelengthClue[] = [
  { id: "rep-cowboys-hype", axisId: "overrated-underrated", text: "Annual Cowboys Super Bowl hype", rating: 8 },
  { id: "rep-nd-title-talk", axisId: "overrated-underrated", text: "Preseason Notre Dame title talk", rating: 18 },
  { id: "rep-rookie-qb-drive", axisId: "overrated-underrated", text: "A first-round rookie QB after one good drive", rating: 27 },
  { id: "rep-herbert-discourse", axisId: "overrated-underrated", text: "Justin Herbert discourse", rating: 39 },
  { id: "rep-kirk-cousins", axisId: "overrated-underrated", text: "Kirk Cousins", rating: 55 },
  { id: "rep-mike-evans", axisId: "overrated-underrated", text: "Mike Evans", rating: 79 },
  { id: "rep-lane-johnson", axisId: "overrated-underrated", text: "Lane Johnson", rating: 86 },
  { id: "rep-fred-warner", axisId: "overrated-underrated", text: "Fred Warner", rating: 90 },
  { id: "rep-interior-ol", axisId: "overrated-underrated", text: "Elite interior offensive line play", rating: 96 },

  { id: "legacy-tebow", axisId: "college-nfl", text: "Tim Tebow", rating: 5 },
  { id: "legacy-reggie-bush", axisId: "college-nfl", text: "Reggie Bush", rating: 11 },
  { id: "legacy-vince-young", axisId: "college-nfl", text: "Vince Young", rating: 18 },
  { id: "legacy-matt-leinart", axisId: "college-nfl", text: "Matt Leinart", rating: 24 },
  { id: "legacy-cam-newton", axisId: "college-nfl", text: "Cam Newton", rating: 55 },
  { id: "legacy-lamar-jackson", axisId: "college-nfl", text: "Lamar Jackson", rating: 72 },
  { id: "legacy-peyton-manning", axisId: "college-nfl", text: "Peyton Manning", rating: 91 },
  { id: "legacy-patrick-mahomes", axisId: "college-nfl", text: "Patrick Mahomes", rating: 97 },
  { id: "legacy-tom-brady", axisId: "college-nfl", text: "Tom Brady", rating: 100 },

  { id: "temperament-alex-smith", axisId: "manager-gunslinger", text: "Alex Smith", rating: 12 },
  { id: "temperament-brock-purdy", axisId: "manager-gunslinger", text: "Brock Purdy", rating: 28 },
  { id: "temperament-jared-goff", axisId: "manager-gunslinger", text: "Jared Goff", rating: 43 },
  { id: "temperament-tom-brady", axisId: "manager-gunslinger", text: "Tom Brady", rating: 56 },
  { id: "temperament-stafford", axisId: "manager-gunslinger", text: "Matthew Stafford", rating: 80 },
  { id: "temperament-mahomes", axisId: "manager-gunslinger", text: "Patrick Mahomes", rating: 88 },
  { id: "temperament-romo", axisId: "manager-gunslinger", text: "Tony Romo", rating: 90 },
  { id: "temperament-favre", axisId: "manager-gunslinger", text: "Brett Favre", rating: 97 },
  { id: "temperament-josh-allen", axisId: "manager-gunslinger", text: "Josh Allen", rating: 100 },

  { id: "value-aj-mccarron", axisId: "system-carries", text: "A.J. McCarron at Alabama", rating: 11 },
  { id: "value-mac-jones-bama", axisId: "system-carries", text: "Mac Jones at Alabama", rating: 20 },
  { id: "value-brock-purdy", axisId: "system-carries", text: "Brock Purdy", rating: 35 },
  { id: "value-jared-goff", axisId: "system-carries", text: "Jared Goff", rating: 48 },
  { id: "value-joe-burrow", axisId: "system-carries", text: "Joe Burrow", rating: 79 },
  { id: "value-tom-brady", axisId: "system-carries", text: "Tom Brady", rating: 86 },
  { id: "value-lamar-jackson", axisId: "system-carries", text: "Lamar Jackson", rating: 92 },
  { id: "value-mahomes", axisId: "system-carries", text: "Patrick Mahomes", rating: 97 },
  { id: "value-josh-allen", axisId: "system-carries", text: "Josh Allen", rating: 99 },

  { id: "chaos-iowa", axisId: "boring-chaos", text: "Iowa offense", rating: 2 },
  { id: "chaos-2023-steelers", axisId: "boring-chaos", text: "2023 Steelers offense", rating: 14 },
  { id: "chaos-harbaugh", axisId: "boring-chaos", text: "Jim Harbaugh offense", rating: 35 },
  { id: "chaos-army", axisId: "boring-chaos", text: "Army triple option", rating: 48 },
  { id: "chaos-lincoln-riley", axisId: "boring-chaos", text: "Lincoln Riley offense", rating: 79 },
  { id: "chaos-chip-kelly", axisId: "boring-chaos", text: "Chip Kelly Oregon", rating: 88 },
  { id: "chaos-2019-lsu", axisId: "boring-chaos", text: "2019 LSU", rating: 93 },
  { id: "chaos-mike-leach", axisId: "boring-chaos", text: "Mike Leach Air Raid", rating: 97 },
  { id: "chaos-band-play", axisId: "boring-chaos", text: "Cal–Stanford band play", rating: 100 },

  { id: "fans-chargers", axisId: "normal-insane", text: "Los Angeles Chargers fans", rating: 14 },
  { id: "fans-falcons", axisId: "normal-insane", text: "Atlanta Falcons fans", rating: 24 },
  { id: "fans-packers", axisId: "normal-insane", text: "Green Bay Packers fans", rating: 66 },
  { id: "fans-texas", axisId: "normal-insane", text: "Texas Longhorns fans", rating: 76 },
  { id: "fans-ohio-state", axisId: "normal-insane", text: "Ohio State fans", rating: 88 },
  { id: "fans-alabama", axisId: "normal-insane", text: "Alabama fans", rating: 91 },
  { id: "fans-bills", axisId: "normal-insane", text: "Bills Mafia", rating: 96 },
  { id: "fans-eagles", axisId: "normal-insane", text: "Philadelphia Eagles fans", rating: 99 },
  { id: "fans-texas-am", axisId: "normal-insane", text: "Texas A&M fans", rating: 100 },

  { id: "dna-ucf", axisId: "new-money-tradition", text: "UCF", rating: 10 },
  { id: "dna-oregon", axisId: "new-money-tradition", text: "Oregon", rating: 22 },
  { id: "dna-miami", axisId: "new-money-tradition", text: "Miami", rating: 45 },
  { id: "dna-clemson", axisId: "new-money-tradition", text: "Clemson", rating: 57 },
  { id: "dna-georgia", axisId: "new-money-tradition", text: "Georgia", rating: 72 },
  { id: "dna-texas", axisId: "new-money-tradition", text: "Texas", rating: 90 },
  { id: "dna-ohio-state", axisId: "new-money-tradition", text: "Ohio State", rating: 96 },
  { id: "dna-michigan", axisId: "new-money-tradition", text: "Michigan", rating: 98 },
  { id: "dna-notre-dame", axisId: "new-money-tradition", text: "Notre Dame", rating: 100 },
] as const;

export function getFootballWavelengthAxis(axisId: FootballWavelengthAxisId) {
  const axis = footballWavelengthAxes.find((row) => row.id === axisId);
  if (!axis) throw new Error(`Unsupported Football Wavelength axis: ${axisId}`);
  return axis;
}

function chooseFootballWavelengthClue(
  desiredRating: number,
  options: {
    target: number;
    direction?: number;
    usedIds?: readonly string[];
    usedAxisIds?: readonly FootballWavelengthAxisId[];
    random: () => number;
  },
) {
  const usedIds = new Set(options.usedIds ?? []);
  const usedAxisIds = new Set(options.usedAxisIds ?? []);
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
        + (usedAxisIds.has(clue.axisId) ? 14 : 0)
        + options.random() * 2,
    }))
    .sort((left, right) => left.score - right.score)[0]!.clue;
}

export function createFootballWavelengthRound(seed: string): FootballWavelengthRound {
  const random = seededLineupRandom(FOOTBALL_WAVELENGTH_GAME_ID, "round", seed);
  const target = 15 + Math.floor(random() * 78);
  const openingDirection = random() > 0.5 ? 1 : -1;
  const opening = chooseFootballWavelengthClue(target + openingDirection * 4, {
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
    usedAxisIds: round.clues.map((clue) => clue.axisId),
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
        itemIds: [`target:${initialRound.target}`, `clue:${opening.id}`, `axis:${opening.axisId}`],
      };
    },
  });
  return { ...selected.value, identity: selected.identity };
}
