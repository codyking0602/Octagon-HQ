import {
  footballCfbChampionSeasonRows,
  footballQbCareerRows,
  footballRbCareerRows,
} from "../back-room/footballFactualStatsCoverage";
import { footballCanonicalSubjects } from "../back-room/footballFactualStatsCatalog";
import type { FactCheckDifficulty, FactCheckItem } from "../games/factCheckEngine";

const SOURCE_LEDGER = "hq-football-factual-ledger";
const SOURCE_CANONICAL = "hq-football-canonical-subject-ledger";

function item(
  value: Omit<FactCheckItem, "sport" | "recency">,
): FactCheckItem {
  return {
    sport: "football",
    recency: "evergreen",
    ...value,
  };
}

function compactNumber(value: number) {
  return value.toLocaleString("en-US");
}

function midpointThreshold(value: number, step: number) {
  const base = Math.floor(value / step) * step;
  const threshold = base + step / 2;
  return threshold === value ? threshold + step : threshold;
}

function overUnderAnswer(value: number, threshold: number) {
  return value > threshold ? "OVER" : "UNDER";
}

const cfbAwardPool = footballCanonicalSubjects
  .filter((subject) => (
    subject.kind === "player-career"
    && subject.league === "CFB"
    && subject.heismanWinner != null
  ));

const cfbAwardSubjects = [
  ...cfbAwardPool.filter((subject) => subject.heismanWinner === true).slice(0, 20),
  ...cfbAwardPool.filter((subject) => subject.heismanWinner === false).slice(0, 20),
];

const cfbAwardFacts: FactCheckItem[] = cfbAwardSubjects.map((subject) => item({
  id: `canonical-cfb-heisman-${subject.id}`,
  league: "cfb",
  format: "either_or",
  difficulty: 1,
  prompt: `Which describes ${subject.name}'s college career?`,
  choices: ["HEISMAN WINNER", "NOT A WINNER"],
  answer: subject.heismanWinner ? "HEISMAN WINNER" : "NOT A WINNER",
  explanation: subject.heismanWinner
    ? `${subject.name} won the Heisman Trophy.`
    : `${subject.name} did not win the Heisman Trophy.`,
  sourceId: SOURCE_CANONICAL,
}));

const nflDraftSubjects = footballCanonicalSubjects
  .filter((subject) => (
    subject.kind === "player-career"
    && subject.league === "NFL"
    && subject.draftYear != null
    && subject.draftRound != null
    && subject.draftPick != null
  ))
  .slice()
  .sort((a, b) => (a.draftYear! - b.draftYear!) || (a.draftPick! - b.draftPick!));

const nflRoundSubjects = [
  ...nflDraftSubjects.filter((subject) => subject.draftRound === 1).slice(0, 20),
  ...nflDraftSubjects.filter((subject) => subject.draftRound! > 1).slice(0, 20),
];

const nflRoundFacts: FactCheckItem[] = nflRoundSubjects.map((subject) => item({
  id: `canonical-nfl-round-${subject.id}`,
  league: "nfl",
  format: "either_or",
  difficulty: 1,
  prompt: `${subject.name} entered the NFL as...`,
  choices: ["ROUND 1 PICK", "LATER ROUND PICK"],
  answer: subject.draftRound === 1 ? "ROUND 1 PICK" : "LATER ROUND PICK",
  explanation: `${subject.name} was drafted in Round ${subject.draftRound}, pick ${subject.draftPick}, in ${subject.draftYear}.`,
  sourceId: SOURCE_CANONICAL,
}));

const qbFacts = footballQbCareerRows.flatMap((row, index): FactCheckItem[] => {
  const yardsThreshold = midpointThreshold(row.passingYards, 10_000);
  const gamesThreshold = index % 2 === 0 ? 200 : 175;

  return [
    item({
      id: `ledger-qb-yards-${row.id}`,
      league: "nfl",
      format: "over_under",
      difficulty: 3,
      prompt: `${row.name} finished his NFL career with ___ ${compactNumber(yardsThreshold)} passing yards.`,
      choices: ["OVER", "UNDER"],
      answer: overUnderAnswer(row.passingYards, yardsThreshold),
      explanation: `${row.name} finished with ${compactNumber(row.passingYards)} career passing yards.`,
      sourceId: SOURCE_LEDGER,
    }),
    item({
      id: `ledger-qb-games-${row.id}`,
      league: "nfl",
      format: "true_false",
      difficulty: 2,
      prompt: `${row.name} played at least ${gamesThreshold} NFL regular-season games.`,
      choices: ["TRUE", "FALSE"],
      answer: row.games >= gamesThreshold ? "TRUE" : "FALSE",
      explanation: `${row.name} played ${row.games} NFL regular-season games.`,
      sourceId: SOURCE_LEDGER,
    }),
  ];
});

const rbFacts = footballRbCareerRows.flatMap((row, index): FactCheckItem[] => {
  const yardsThreshold = midpointThreshold(row.rushingYards, 2_000);
  const tdThreshold = index % 2 === 0 ? 100 : 90;

  return [
    item({
      id: `ledger-rb-yards-${row.id}`,
      league: "nfl",
      format: "over_under",
      difficulty: 3,
      prompt: `${row.name} finished his NFL career with ___ ${compactNumber(yardsThreshold)} rushing yards.`,
      choices: ["OVER", "UNDER"],
      answer: overUnderAnswer(row.rushingYards, yardsThreshold),
      explanation: `${row.name} finished with ${compactNumber(row.rushingYards)} career rushing yards.`,
      sourceId: SOURCE_LEDGER,
    }),
    item({
      id: `ledger-rb-rush-td-${row.id}`,
      league: "nfl",
      format: "true_false",
      difficulty: 2,
      prompt: `${row.name} scored at least ${tdThreshold} NFL regular-season rushing touchdowns.`,
      choices: ["TRUE", "FALSE"],
      answer: row.rushingTouchdowns >= tdThreshold ? "TRUE" : "FALSE",
      explanation: `${row.name} scored ${row.rushingTouchdowns} career rushing touchdowns.`,
      sourceId: SOURCE_LEDGER,
    }),
  ];
});

const championFacts = footballCfbChampionSeasonRows.flatMap((row): FactCheckItem[] => [
  item({
    id: `ledger-cfb-points-${row.id}`,
    league: "cfb",
    format: "over_under",
    difficulty: 3,
    prompt: `${row.name} scored ___ 500 points during its championship season.`,
    choices: ["OVER", "UNDER"],
    answer: overUnderAnswer(row.pointsFor, 500),
    explanation: `${row.name} scored ${row.pointsFor} points that season.`,
    sourceId: SOURCE_LEDGER,
  }),
  item({
    id: `ledger-cfb-defense-${row.id}`,
    league: "cfb",
    format: "true_false",
    difficulty: 4,
    prompt: `${row.name} allowed fewer than 15 points per game during its championship season.`,
    choices: ["TRUE", "FALSE"],
    answer: row.opponentPointsPerGame < 15 ? "TRUE" : "FALSE",
    explanation: `${row.name} allowed ${row.opponentPointsPerGame.toFixed(1)} points per game.`,
    sourceId: SOURCE_LEDGER,
  }),
]);

function draftComesBefore(
  a: (typeof nflDraftSubjects)[number],
  b: (typeof nflDraftSubjects)[number],
) {
  if (a.draftYear !== b.draftYear) return a.draftYear! < b.draftYear!;
  return a.draftPick! < b.draftPick!;
}

const draftChronologyFacts: FactCheckItem[] = Array.from(
  { length: Math.min(30, Math.max(0, nflDraftSubjects.length - 1)) },
  (_, index) => {
    const first = nflDraftSubjects[index]!;
    const offset = Math.max(7, Math.floor(nflDraftSubjects.length / 3));
    const second = nflDraftSubjects[(index + offset) % nflDraftSubjects.length]!;
    const left = index % 2 === 0 ? first : second;
    const right = index % 2 === 0 ? second : first;
    const before = draftComesBefore(left, right);
    const yearGap = Math.abs(left.draftYear! - right.draftYear!);
    const sameYear = left.draftYear === right.draftYear;
    const explanation = sameYear
      ? `${left.name} was pick ${left.draftPick} in ${left.draftYear}; ${right.name} was pick ${right.draftPick}.`
      : `${left.name} was drafted in ${left.draftYear}; ${right.name} was drafted in ${right.draftYear}.`;

    return item({
      id: `canonical-draft-order-${index}-${left.id}-${right.id}`,
      league: "nfl",
      format: "before_after",
      difficulty: (yearGap <= 4 ? 3 : 2) as FactCheckDifficulty,
      prompt: `${left.name} was drafted ___ ${right.name}.`,
      choices: ["BEFORE", "AFTER"],
      answer: before ? "BEFORE" : "AFTER",
      explanation,
      sourceId: SOURCE_CANONICAL,
    });
  },
);

export const FOOTBALL_FACT_CHECK_AUTHORITY_BANK: readonly FactCheckItem[] = [
  ...cfbAwardFacts,
  ...nflRoundFacts,
  ...qbFacts,
  ...rbFacts,
  ...championFacts,
  ...draftChronologyFacts,
];

export const FOOTBALL_FACT_CHECK_AUTHORITY_COUNTS = {
  cfbAward: cfbAwardFacts.length,
  nflRound: nflRoundFacts.length,
  qb: qbFacts.length,
  rb: rbFacts.length,
  champion: championFacts.length,
  draftChronology: draftChronologyFacts.length,
  total: FOOTBALL_FACT_CHECK_AUTHORITY_BANK.length,
} as const;
