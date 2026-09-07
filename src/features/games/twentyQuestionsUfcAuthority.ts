import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { deriveUfcCareerStats } from "../play/ufcCareerStats";
import {
  twentyQuestionsCostForSplit,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export const UFC_TWENTY_QUESTIONS_SUBJECT_COUNT = 100;

type UfcInput = (typeof canonicalRankingInputs.fighters)[number];

type CandidateQuestion = {
  id: string;
  label: string;
  values: ReadonlyMap<string, boolean>;
};

function normalizedId(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function partitionSignature(subjects: readonly TwentyQuestionsSubject[], values: ReadonlyMap<string, boolean>) {
  const direct = subjects.map((subject) => values.get(subject.id) ? "1" : "0").join("");
  const inverse = subjects.map((subject) => values.get(subject.id) ? "0" : "1").join("");
  return direct < inverse ? direct : inverse;
}

function candidate(
  subjects: readonly TwentyQuestionsSubject[],
  id: string,
  label: string,
  answer: (fighter: UfcInput) => boolean,
): CandidateQuestion {
  return {
    id,
    label,
    values: new Map(canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, answer(fighter)])),
  };
}

function buildUfcQuestions(subjects: readonly TwentyQuestionsSubject[]): TwentyQuestionsQuestion[] {
  const rows: CandidateQuestion[] = [];
  const add = (id: string, label: string, answer: (fighter: UfcInput) => boolean) => {
    rows.push(candidate(subjects, id, label, answer));
  };

  const stats = new Map(canonicalRankingInputs.fighters.map((fighter) => [
    fighter.presentation.slug,
    deriveUfcCareerStats(fighter.facts.fights, "official"),
  ]));
  const statFor = (fighter: UfcInput) => stats.get(fighter.presentation.slug)!;

  add("identity:womens", "Is this a women's-division fighter?", (fighter) => fighter.board === "women");

  const divisions = [...new Set(canonicalRankingInputs.fighters.flatMap((fighter) => [
    fighter.facts.identity.primaryDivision,
    ...fighter.facts.identity.secondaryDivisions,
  ]))].sort();
  for (const division of divisions) {
    add(`division:${normalizedId(division)}`, `Has this fighter competed at ${division} in the UFC?`, (fighter) => (
      fighter.facts.identity.primaryDivision === division || fighter.facts.identity.secondaryDivisions.includes(division)
    ));
  }

  const firstFightYear = (fighter: UfcInput) => Math.min(...fighter.facts.fights.map((fight) => Number(fight.date.slice(0, 4))));
  const lastFightYear = (fighter: UfcInput) => Math.max(...fighter.facts.fights.map((fight) => Number(fight.date.slice(0, 4))));
  for (const decade of [1990, 2000, 2010, 2020]) {
    add(`era:active-${decade}s`, `Did this fighter have a UFC fight in the ${decade}s?`, (fighter) => (
      fighter.facts.fights.some((fight) => Number(fight.date.slice(0, 4)) >= decade && Number(fight.date.slice(0, 4)) < decade + 10)
    ));
  }
  for (const cutoff of [2000, 2005, 2010, 2015, 2020, 2025]) {
    add(`era:debut-before-${cutoff}`, `Did this fighter make their UFC debut before ${cutoff}?`, (fighter) => firstFightYear(fighter) < cutoff);
    add(`era:last-fight-before-${cutoff}`, `Was this fighter's last UFC fight before ${cutoff}?`, (fighter) => lastFightYear(fighter) < cutoff);
  }

  const metricSpecs = [
    ["fights", "UFC fights", (fighter: UfcInput) => statFor(fighter).fights, [5, 10, 15, 20, 25, 30, 35]],
    ["wins", "UFC wins", (fighter: UfcInput) => statFor(fighter).wins, [5, 10, 15, 20, 25]],
    ["decision-wins", "UFC decision wins", (fighter: UfcInput) => statFor(fighter).decisionWins, [3, 5, 8, 10, 12]],
    ["finishes", "UFC finishes", (fighter: UfcInput) => statFor(fighter).finishes, [3, 5, 8, 10, 12, 15]],
    ["ko-tko-wins", "UFC KO/TKO wins", (fighter: UfcInput) => statFor(fighter).koTkoWins, [3, 5, 8, 10, 12]],
    ["submission-wins", "UFC submission wins", (fighter: UfcInput) => statFor(fighter).submissionWins, [2, 3, 5, 8, 10]],
    ["title-fights", "UFC title fights", (fighter: UfcInput) => statFor(fighter).titleFights, [1, 3, 5, 8, 10, 15]],
    ["title-wins", "UFC title-fight wins", (fighter: UfcInput) => statFor(fighter).titleFightWins, [1, 3, 5, 8, 10]],
    ["active-years", "UFC active years", (fighter: UfcInput) => statFor(fighter).activeYears, [3, 5, 8, 10, 12, 15]],
    ["win-streak", "UFC consecutive wins", (fighter: UfcInput) => statFor(fighter).longestWinStreak, [3, 5, 7, 10, 12]],
    ["opponents-beaten", "unique UFC opponents beaten", (fighter: UfcInput) => statFor(fighter).uniqueOpponentsBeaten, [5, 10, 15, 20]],
  ] as const;
  for (const [id, label, valueFor, thresholds] of metricSpecs) {
    for (const threshold of thresholds) {
      add(`stat:${id}:${threshold}`, `Does this fighter have at least ${threshold} ${label}?`, (fighter) => valueFor(fighter) >= threshold);
    }
  }

  const opponents = [...new Set(canonicalRankingInputs.fighters.flatMap((fighter) => fighter.facts.fights.map((fight) => fight.opponent.trim())).filter(Boolean))].sort();
  for (const opponent of opponents) {
    add(`faced:${normalizedId(opponent)}`, `Has this fighter faced ${opponent} in the UFC?`, (fighter) => (
      fighter.facts.fights.some((fight) => fight.opponent.trim() === opponent)
    ));
    add(`beat:${normalizedId(opponent)}`, `Has this fighter beaten ${opponent} in the UFC?`, (fighter) => (
      fighter.facts.fights.some((fight) => fight.opponent.trim() === opponent && fight.officialResult === "win")
    ));
  }

  const byPartition = new Map<string, CandidateQuestion>();
  for (const row of rows) {
    const yes = subjects.filter((subject) => row.values.get(subject.id) === true).length;
    if (yes === 0 || yes === subjects.length) continue;
    const signature = partitionSignature(subjects, row.values);
    if (!byPartition.has(signature)) byPartition.set(signature, row);
  }

  return [...byPartition.values()].map((row) => {
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
}

let cachedUniverse: TwentyQuestionsUniverse | null = null;

/** Canonical UFC Games factual universe. No rankings or Play-only ratings are consulted. */
export function getUfcTwentyQuestionsUniverse(): TwentyQuestionsUniverse {
  if (cachedUniverse) return cachedUniverse;

  const subjects: TwentyQuestionsSubject[] = canonicalRankingInputs.fighters.map((fighter) => ({
    id: fighter.presentation.slug,
    name: fighter.fighter,
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
