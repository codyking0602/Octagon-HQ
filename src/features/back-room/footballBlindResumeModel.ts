import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  getFootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

export const FOOTBALL_BLIND_RESUME_GAME_ID = "football-blind-resume";
export const FOOTBALL_BLIND_RESUME_ROUNDS = 5;

export interface FootballBlindResumeStat {
  label: string;
  valueA: string;
  valueB: string;
}

export interface FootballBlindResumeMatchup {
  id: string;
  packId: FootballRankFivePackId;
  prompt: string;
  leftId: string;
  rightId: string;
  stats: readonly FootballBlindResumeStat[];
}

export interface FootballBlindResumeRound extends FootballBlindResumeMatchup {
  leftName: string;
  rightName: string;
  leftSubtitle: string;
  rightSubtitle: string;
  leftRating: number;
  rightRating: number;
  winnerId: string;
}

export interface FootballBlindResumeRun {
  rounds: FootballBlindResumeRound[];
  identity: PlayLineupIdentity;
}

export const footballBlindResumeMatchups: readonly FootballBlindResumeMatchup[] = [
  {
    id: "peyton-v-rodgers",
    packId: "nfl-quarterbacks",
    prompt: "Which NFL quarterback résumé is greater?",
    leftId: "peyton-manning",
    rightId: "aaron-rodgers",
    stats: [
      { label: "NFL MVPs", valueA: "5", valueB: "4" },
      { label: "Super Bowl titles", valueA: "2", valueB: "1" },
      { label: "1st-team All-Pro", valueA: "7", valueB: "4" },
      { label: "Passing TD titles", valueA: "4", valueB: "2" },
      { label: "Signature edge", valueA: "5 MVP seasons", valueB: "Elite efficiency peak" },
    ],
  },
  {
    id: "marino-v-elway",
    packId: "nfl-quarterbacks",
    prompt: "Which NFL quarterback résumé is greater?",
    leftId: "dan-marino",
    rightId: "john-elway",
    stats: [
      { label: "NFL MVPs", valueA: "1", valueB: "1" },
      { label: "Super Bowl titles", valueA: "0", valueB: "2" },
      { label: "1st-team All-Pro", valueA: "3", valueB: "0" },
      { label: "Career pass yards", valueA: "61,361", valueB: "51,475" },
      { label: "Signature edge", valueA: "Historic passing peak", valueB: "Back-to-back champion" },
    ],
  },
  {
    id: "favre-v-young",
    packId: "nfl-quarterbacks",
    prompt: "Which NFL quarterback résumé is greater?",
    leftId: "brett-favre",
    rightId: "steve-young",
    stats: [
      { label: "NFL MVPs", valueA: "3", valueB: "2" },
      { label: "Super Bowl titles as starter", valueA: "1", valueB: "1" },
      { label: "1st-team All-Pro", valueA: "3", valueB: "3" },
      { label: "Career starts", valueA: "298", valueB: "143" },
      { label: "Signature edge", valueA: "Longevity + volume", valueB: "Efficiency + rushing" },
    ],
  },
  {
    id: "peterson-v-lt",
    packId: "nfl-running-backs",
    prompt: "Which NFL running back résumé is greater?",
    leftId: "adrian-peterson",
    rightId: "ladainian-tomlinson",
    stats: [
      { label: "NFL MVPs", valueA: "1", valueB: "1" },
      { label: "Rushing titles", valueA: "3", valueB: "2" },
      { label: "1st-team All-Pro", valueA: "4", valueB: "3" },
      { label: "Rush TD leader seasons", valueA: "0", valueB: "3" },
      { label: "Signature edge", valueA: "2,097-yard season", valueB: "31-TD season" },
    ],
  },
  {
    id: "henry-v-dickerson",
    packId: "nfl-running-backs",
    prompt: "Which NFL running back résumé is greater?",
    leftId: "derrick-henry",
    rightId: "eric-dickerson",
    stats: [
      { label: "2,000-yard seasons", valueA: "1", valueB: "0" },
      { label: "Rushing titles", valueA: "2", valueB: "4" },
      { label: "Offensive Player of Year", valueA: "1", valueB: "1" },
      { label: "Single-season rush record", valueA: "No", valueB: "2,105" },
      { label: "Signature edge", valueA: "Power + TD dominance", valueB: "Historic volume" },
    ],
  },
  {
    id: "campbell-v-thomas",
    packId: "nfl-running-backs",
    prompt: "Which NFL running back résumé is greater?",
    leftId: "earl-campbell",
    rightId: "thurman-thomas",
    stats: [
      { label: "NFL MVPs", valueA: "1", valueB: "1" },
      { label: "Rushing titles", valueA: "3", valueB: "0" },
      { label: "1st-team All-Pro", valueA: "3", valueB: "2" },
      { label: "Super Bowl starts", valueA: "0", valueB: "4" },
      { label: "Signature edge", valueA: "Three-year peak", valueB: "All-purpose longevity" },
    ],
  },
  {
    id: "reid-v-tomlin",
    packId: "nfl-head-coaches",
    prompt: "Which NFL head-coaching résumé is greater?",
    leftId: "andy-reid",
    rightId: "mike-tomlin",
    stats: [
      { label: "Super Bowl titles", valueA: "3", valueB: "1" },
      { label: "Conference titles", valueA: "5", valueB: "2" },
      { label: "Losing seasons", valueA: "3", valueB: "0" },
      { label: "300-win club", valueA: "Yes", valueB: "No" },
      { label: "Signature edge", valueA: "Dynasty + longevity", valueB: "Floor never collapses" },
    ],
  },
  {
    id: "carroll-v-mcvay",
    packId: "nfl-head-coaches",
    prompt: "Which NFL head-coaching résumé is greater?",
    leftId: "pete-carroll",
    rightId: "sean-mcvay",
    stats: [
      { label: "Super Bowl titles", valueA: "1", valueB: "1" },
      { label: "Conference titles", valueA: "2", valueB: "2" },
      { label: "Coach of the Year", valueA: "0", valueB: "1" },
      { label: "10-win seasons", valueA: "8", valueB: "6" },
      { label: "Signature edge", valueA: "Long elite Seattle run", valueB: "Young offensive peak" },
    ],
  },
  {
    id: "shanahan-v-cowher",
    packId: "nfl-head-coaches",
    prompt: "Which NFL head-coaching résumé is greater?",
    leftId: "mike-shanahan",
    rightId: "bill-cowher",
    stats: [
      { label: "Super Bowl titles", valueA: "2", valueB: "1" },
      { label: "Conference titles", valueA: "2", valueB: "2" },
      { label: "Division titles", valueA: "7", valueB: "8" },
      { label: "Hall of Fame", valueA: "No", valueB: "Yes" },
      { label: "Signature edge", valueA: "Back-to-back champion", valueB: "15-year Pittsburgh floor" },
    ],
  },
  {
    id: "vince-v-tebow",
    packId: "college-quarterbacks",
    prompt: "Which college quarterback résumé is greater?",
    leftId: "vince-young-2005",
    rightId: "tim-tebow-2007",
    stats: [
      { label: "Heisman trophies", valueA: "0", valueB: "1" },
      { label: "National titles", valueA: "1", valueB: "2" },
      { label: "Best season record", valueA: "13–0", valueB: "13–1" },
      { label: "Signature game", valueA: "Rose Bowl title win", valueB: "2008 title game" },
      { label: "Signature edge", valueA: "All-time title-game carry", valueB: "Career hardware" },
    ],
  },
  {
    id: "lamar-v-leinart",
    packId: "college-quarterbacks",
    prompt: "Which college quarterback résumé is greater?",
    leftId: "lamar-jackson-2016",
    rightId: "matt-leinart-2004",
    stats: [
      { label: "Heisman trophies", valueA: "1", valueB: "1" },
      { label: "National titles", valueA: "0", valueB: "1" },
      { label: "Career total TD", valueA: "119", valueB: "104" },
      { label: "Best single season", valueA: "51 total TD", valueB: "13–0 champion" },
      { label: "Signature edge", valueA: "Unique dual-threat peak", valueB: "Title + elite consistency" },
    ],
  },
  {
    id: "manziel-v-colt",
    packId: "college-quarterbacks",
    prompt: "Which college quarterback résumé is greater?",
    leftId: "johnny-manziel-2012",
    rightId: "colt-mccoy-2008",
    stats: [
      { label: "Heisman trophies", valueA: "1", valueB: "0" },
      { label: "Career wins as starter", valueA: "20", valueB: "45" },
      { label: "Best Heisman finish", valueA: "1st", valueB: "2nd" },
      { label: "National title-game starts", valueA: "0", valueB: "1" },
      { label: "Signature edge", valueA: "Explosive peak", valueB: "Four-year body of work" },
    ],
  },
  {
    id: "clemson-v-oklahoma",
    packId: "college-programs",
    prompt: "Which program has the stronger résumé since 2000?",
    leftId: "clemson-program",
    rightId: "oklahoma-program",
    stats: [
      { label: "National titles", valueA: "2", valueB: "1" },
      { label: "CFP appearances", valueA: "6", valueB: "4" },
      { label: "Title-game appearances", valueA: "4", valueB: "1" },
      { label: "Conference dominance", valueA: "ACC dynasty", valueB: "Big 12 dynasty" },
      { label: "Signature edge", valueA: "Higher playoff peak", valueB: "Longer elite runway" },
    ],
  },
  {
    id: "texas-v-michigan",
    packId: "college-programs",
    prompt: "Which program has the stronger résumé since 2000?",
    leftId: "texas-program",
    rightId: "michigan-program",
    stats: [
      { label: "National titles", valueA: "1", valueB: "1" },
      { label: "BCS/CFP title-game trips", valueA: "2", valueB: "1" },
      { label: "Heisman winners", valueA: "0", valueB: "0" },
      { label: "Peak unbeaten champion", valueA: "2005", valueB: "2023" },
      { label: "Signature edge", valueA: "2005 all-time team", valueB: "Recent three-year surge" },
    ],
  },
  {
    id: "florida-v-fsu",
    packId: "college-programs",
    prompt: "Which program has the stronger résumé since 2000?",
    leftId: "florida-program",
    rightId: "florida-state-program",
    stats: [
      { label: "National titles", valueA: "2", valueB: "1" },
      { label: "Heisman winners", valueA: "1", valueB: "1" },
      { label: "Unbeaten title seasons", valueA: "0", valueB: "1" },
      { label: "Peak title stretch", valueA: "2 in 3 years", valueB: "29-game win streak" },
      { label: "Signature edge", valueA: "Two-title Meyer peak", valueB: "2013–14 dominance" },
    ],
  },
  {
    id: "texas05-v-usc04",
    packId: "college-team-seasons",
    prompt: "Which single-season team résumé is greater?",
    leftId: "2005-texas",
    rightId: "2004-usc",
    stats: [
      { label: "Final record", valueA: "13–0", valueB: "13–0" },
      { label: "National title", valueA: "Yes", valueB: "Yes" },
      { label: "Heisman winner", valueA: "No", valueB: "Yes" },
      { label: "Title-game opponent", valueA: "USC", valueB: "Oklahoma" },
      { label: "Signature edge", valueA: "Won all-time classic", valueB: "Wire-to-wire No. 1" },
    ],
  },
  {
    id: "fsu13-v-florida08",
    packId: "college-team-seasons",
    prompt: "Which single-season team résumé is greater?",
    leftId: "2013-florida-state",
    rightId: "2008-florida",
    stats: [
      { label: "Final record", valueA: "14–0", valueB: "13–1" },
      { label: "National title", valueA: "Yes", valueB: "Yes" },
      { label: "Heisman winner", valueA: "Yes", valueB: "Yes" },
      { label: "Average margin", valueA: "Historic blowouts", valueB: "Elite SEC slate" },
      { label: "Signature edge", valueA: "Unbeaten dominance", valueB: "Schedule + championship run" },
    ],
  },
  {
    id: "auburn10-v-osu14",
    packId: "college-team-seasons",
    prompt: "Which single-season team résumé is greater?",
    leftId: "2010-auburn",
    rightId: "2014-ohio-state",
    stats: [
      { label: "Final record", valueA: "14–0", valueB: "14–1" },
      { label: "National title", valueA: "Yes", valueB: "Yes" },
      { label: "Heisman winner", valueA: "Yes", valueB: "No" },
      { label: "Postseason signature", valueA: "SEC + BCS champ", valueB: "Won first CFP" },
      { label: "Signature edge", valueA: "Perfect Cam season", valueB: "Three-QB title run" },
    ],
  },
] as const;

function resolveMatchup(matchup: FootballBlindResumeMatchup): FootballBlindResumeRound {
  const pack = getFootballRankFivePack(matchup.packId);
  const left = pack.items.find((item) => item.id === matchup.leftId);
  const right = pack.items.find((item) => item.id === matchup.rightId);
  if (!left || !right) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} references an item outside ${matchup.packId}.`);
  }
  if (left.rating === right.rating) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} cannot use a tied canonical rating.`);
  }
  return {
    ...matchup,
    leftName: left.name,
    rightName: right.name,
    leftSubtitle: left.subtitle,
    rightSubtitle: right.subtitle,
    leftRating: left.rating,
    rightRating: right.rating,
    winnerId: left.rating > right.rating ? left.id : right.id,
  };
}

export function resolvedFootballBlindResumeMatchups() {
  return footballBlindResumeMatchups.map(resolveMatchup);
}

export function buildFootballBlindResumeRounds(seed: string) {
  const random = seededLineupRandom(FOOTBALL_BLIND_RESUME_GAME_ID, seed);
  const shuffled = shuffleLineup(resolvedFootballBlindResumeMatchups(), random);
  const selected: FootballBlindResumeRound[] = [];
  const usedIds = new Set<string>();

  for (const matchup of shuffled) {
    if (usedIds.has(matchup.leftId) || usedIds.has(matchup.rightId)) continue;
    selected.push(matchup);
    usedIds.add(matchup.leftId);
    usedIds.add(matchup.rightId);
    if (selected.length === FOOTBALL_BLIND_RESUME_ROUNDS) break;
  }

  if (selected.length !== FOOTBALL_BLIND_RESUME_ROUNDS) {
    throw new Error("Football Blind Resume catalog cannot build five unique rounds.");
  }
  return selected;
}

export function createFootballBlindResumeRun(): FootballBlindResumeRun {
  const validItemIds = new Set(resolvedFootballBlindResumeMatchups().flatMap((row) => [row.leftId, row.rightId]));
  const selected = selectReplayLineup({
    gameId: FOOTBALL_BLIND_RESUME_GAME_ID,
    lineupSize: FOOTBALL_BLIND_RESUME_ROUNDS * 2,
    attempts: 12,
    validItemIds,
    seedFactory: () => createReplaySeed(FOOTBALL_BLIND_RESUME_GAME_ID),
    build: (seed) => {
      const rounds = buildFootballBlindResumeRounds(seed);
      return {
        value: rounds,
        itemIds: rounds.flatMap((round) => [round.leftId, round.rightId]),
      };
    },
  });
  return { rounds: selected.value, identity: selected.identity };
}

export function footballBlindResumeScore(correct: number) {
  return Math.max(0, Math.min(100, correct * 20));
}

export function footballBlindResumeTier(correct: number) {
  if (correct === 5) return "FRONT OFFICE SAVANT";
  if (correct === 4) return "ELITE BALL KNOWER";
  if (correct === 3) return "SOLID TAPE";
  if (correct === 2) return "GROUP CHAT GM";
  return "BACK TO THE FILM";
}
