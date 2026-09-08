import {
  ufcFactualLedgerSubjects,
  type UfcFactualSubject,
} from "../back-room/ufcFactualLedger";
import {
  selectTwentyQuestionsQuestionBank,
  twentyQuestionsCostForSplit,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export const UFC_TWENTY_QUESTIONS_SUBJECT_COUNT = 100;

type CandidateQuestion = {
  id: string;
  label: string;
  values: ReadonlyMap<string, boolean>;
};

type UfcTwentyQuestionsStats = {
  fights: number;
  wins: number;
  decisionWins: number;
  finishes: number;
  koTkoWins: number;
  submissionWins: number;
  titleFights: number;
  titleFightWins: number;
  activeYears: number;
  longestWinStreak: number;
  uniqueOpponentsBeaten: number;
};

function normalizedId(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizedOpponent(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .trim()
    .toLowerCase();
}

function partitionSignature(subjects: readonly TwentyQuestionsSubject[], values: ReadonlyMap<string, boolean>) {
  const direct = subjects.map((subject) => values.get(subject.id) ? "1" : "0").join("");
  const inverse = subjects.map((subject) => values.get(subject.id) ? "0" : "1").join("");
  return direct < inverse ? direct : inverse;
}

function candidate(
  id: string,
  label: string,
  answer: (fighter: UfcFactualSubject) => boolean,
): CandidateQuestion {
  return {
    id,
    label,
    values: new Map(ufcFactualLedgerSubjects.map((fighter) => [fighter.id, answer(fighter)])),
  };
}

function distinctCount(values: readonly string[]) {
  return new Set(values.map(normalizedOpponent).filter(Boolean)).size;
}

function longestWinStreak(fighter: UfcFactualSubject) {
  let current = 0;
  let longest = 0;
  [...fighter.fights]
    .sort((left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id))
    .forEach((fight) => {
      if (fight.result === "win") {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    });
  return longest;
}

function deriveStats(fighter: UfcFactualSubject): UfcTwentyQuestionsStats {
  const wins = fighter.fights.filter((fight) => fight.result === "win");
  const finishes = wins.filter((fight) => fight.methodCategory === "ko-tko" || fight.methodCategory === "submission");
  const titleFights = fighter.fights.filter((fight) => fight.titleFight);
  const titleWins = wins.filter((fight) => fight.titleFight);
  return {
    fights: fighter.fights.length,
    wins: wins.length,
    decisionWins: wins.filter((fight) => fight.methodCategory === "decision").length,
    finishes: finishes.length,
    koTkoWins: wins.filter((fight) => fight.methodCategory === "ko-tko").length,
    submissionWins: wins.filter((fight) => fight.methodCategory === "submission").length,
    titleFights: titleFights.length,
    titleFightWins: titleWins.length,
    activeYears: distinctCount(fighter.fights.map((fight) => fight.date.slice(0, 4))),
    longestWinStreak: longestWinStreak(fighter),
    uniqueOpponentsBeaten: distinctCount(wins.map((fight) => fight.opponent)),
  };
}

function buildUfcQuestions(subjects: readonly TwentyQuestionsSubject[]): TwentyQuestionsQuestion[] {
  const rows: CandidateQuestion[] = [];
  const add = (id: string, label: string, answer: (fighter: UfcFactualSubject) => boolean) => {
    rows.push(candidate(id, label, answer));
  };

  const stats = new Map(ufcFactualLedgerSubjects.map((fighter) => [fighter.id, deriveStats(fighter)]));
  const statFor = (fighter: UfcFactualSubject) => stats.get(fighter.id)!;

  const divisions = [...new Set(ufcFactualLedgerSubjects.flatMap((fighter) => [
    fighter.primaryDivision,
    ...fighter.secondaryDivisions,
    ...fighter.fights.map((fight) => fight.division),
  ]).filter((division) => division && division !== "Unknown"))].sort();
  for (const division of divisions) {
    add(`division:${normalizedId(division)}`, `Has this fighter competed at ${division} in the UFC?`, (fighter) => (
      fighter.primaryDivision === division
      || fighter.secondaryDivisions.includes(division)
      || fighter.fights.some((fight) => fight.division === division)
    ));
  }

  for (const decade of [1990, 2000, 2010, 2020]) {
    add(`era:active-${decade}s`, `Did this fighter have a UFC fight in the ${decade}s?`, (fighter) => (
      fighter.fights.some((fight) => Number(fight.date.slice(0, 4)) >= decade && Number(fight.date.slice(0, 4)) < decade + 10)
    ));
  }
  for (const cutoff of [2000, 2005, 2010, 2015, 2020, 2025]) {
    add(`era:debut-before-${cutoff}`, `Did this fighter make their UFC debut before ${cutoff}?`, (fighter) => Number(fighter.activeFrom.slice(0, 4)) < cutoff);
    add(`era:last-fight-before-${cutoff}`, `Was this fighter's last UFC fight before ${cutoff}?`, (fighter) => Number(fighter.activeTo.slice(0, 4)) < cutoff);
  }

  const metricSpecs = [
    ["fights", "UFC fights", (fighter: UfcFactualSubject) => statFor(fighter).fights, [5, 10, 15, 20, 25, 30, 35]],
    ["wins", "UFC wins", (fighter: UfcFactualSubject) => statFor(fighter).wins, [5, 10, 15, 20, 25]],
    ["decision-wins", "UFC decision wins", (fighter: UfcFactualSubject) => statFor(fighter).decisionWins, [3, 5, 8, 10, 12]],
    ["finishes", "UFC finishes", (fighter: UfcFactualSubject) => statFor(fighter).finishes, [3, 5, 8, 10, 12, 15]],
    ["ko-tko-wins", "UFC KO/TKO wins", (fighter: UfcFactualSubject) => statFor(fighter).koTkoWins, [3, 5, 8, 10, 12]],
    ["submission-wins", "UFC submission wins", (fighter: UfcFactualSubject) => statFor(fighter).submissionWins, [2, 3, 5, 8, 10]],
    ["title-fights", "UFC title fights", (fighter: UfcFactualSubject) => statFor(fighter).titleFights, [1, 3, 5, 8, 10, 15]],
    ["title-wins", "UFC title-fight wins", (fighter: UfcFactualSubject) => statFor(fighter).titleFightWins, [1, 3, 5, 8, 10]],
    ["active-years", "UFC active years", (fighter: UfcFactualSubject) => statFor(fighter).activeYears, [3, 5, 8, 10, 12, 15]],
    ["win-streak", "UFC consecutive wins", (fighter: UfcFactualSubject) => statFor(fighter).longestWinStreak, [3, 5, 7, 10, 12]],
    ["opponents-beaten", "unique UFC opponents beaten", (fighter: UfcFactualSubject) => statFor(fighter).uniqueOpponentsBeaten, [5, 10, 15, 20]],
  ] as const;
  const singularMetricLabels: Partial<Record<(typeof metricSpecs)[number][0], string>> = {
    "title-fights": "UFC title fight",
    "title-wins": "UFC title-fight win",
  };
  for (const [id, label, valueFor, thresholds] of metricSpecs) {
    for (const threshold of thresholds) {
      const quantity = threshold === 1 && singularMetricLabels[id]
        ? `one ${singularMetricLabels[id]}`
        : `${threshold} ${label}`;
      add(`stat:${id}:${threshold}`, `Does this fighter have at least ${quantity}?`, (fighter) => valueFor(fighter) >= threshold);
    }
  }

  // Matchup questions stay tied to recognizable identities in the same 100-fighter game pool.
  // The factual ledger contains hundreds of one-off opponents; surfacing all of them made the
  // player-facing bank balloon into the hundreds without improving normal play.
  const surfacedOpponentKeys = new Set(subjects.map((subject) => normalizedOpponent(subject.name)));
  const opponentNames = new Map<string, string>();
  for (const fighter of ufcFactualLedgerSubjects) {
    for (const fight of fighter.fights) {
      const key = normalizedOpponent(fight.opponent);
      if (key && surfacedOpponentKeys.has(key) && !opponentNames.has(key)) opponentNames.set(key, fight.opponent.trim());
    }
  }
  for (const [opponentKey, opponent] of [...opponentNames.entries()].sort((left, right) => left[1].localeCompare(right[1]))) {
    add(`faced:${normalizedId(opponentKey)}`, `Has this fighter faced ${opponent} in the UFC?`, (fighter) => (
      fighter.fights.some((fight) => normalizedOpponent(fight.opponent) === opponentKey)
    ));
    add(`beat:${normalizedId(opponentKey)}`, `Has this fighter beaten ${opponent} in the UFC?`, (fighter) => (
      fighter.fights.some((fight) => normalizedOpponent(fight.opponent) === opponentKey && fight.result === "win")
    ));
  }

  const byPartition = new Map<string, CandidateQuestion>();
  for (const row of rows) {
    const yes = subjects.filter((subject) => row.values.get(subject.id) === true).length;
    if (yes === 0 || yes === subjects.length) continue;
    const signature = partitionSignature(subjects, row.values);
    if (!byPartition.has(signature)) byPartition.set(signature, row);
  }

  const liveCandidates = [...byPartition.values()].map((row) => {
    const yes = subjects.filter((subject) => row.values.get(subject.id) === true).length;
    const internalCost = twentyQuestionsCostForSplit(yes, subjects.length);
    return {
      id: row.id,
      label: row.label,
      internalCost,
      answer: (subjectId: string) => {
        const value = row.values.get(subjectId);
        if (value == null) throw new Error(`Unknown UFC 20 Questions subject: ${subjectId}`);
        return value;
      },
    };
  });
  return selectTwentyQuestionsQuestionBank(liveCandidates, subjects);
}

let cachedUniverse: TwentyQuestionsUniverse | null = null;

/** Canonical UFC Games factual universe. Rankings remain separate from the 100-subject launch ledger. */
export function getUfcTwentyQuestionsUniverse(): TwentyQuestionsUniverse {
  if (cachedUniverse) return cachedUniverse;

  const subjects: TwentyQuestionsSubject[] = ufcFactualLedgerSubjects.map((fighter) => ({
    id: fighter.id,
    name: fighter.name,
    kind: "fighter",
    league: "UFC",
  }));
  if (subjects.length !== UFC_TWENTY_QUESTIONS_SUBJECT_COUNT) {
    throw new Error(`UFC 20 Questions expected ${UFC_TWENTY_QUESTIONS_SUBJECT_COUNT} canonical factual subjects; found ${subjects.length}.`);
  }

  cachedUniverse = {
    league: "UFC",
    subjects,
    questions: buildUfcQuestions(subjects),
  };
  return cachedUniverse;
}
