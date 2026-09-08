import {
  ufcFactualLedgerSubjects,
  type UfcFactualSubject,
} from "../back-room/ufcFactualLedger";
import {
  twentyQuestionsCostForSplit,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export const UFC_TWENTY_QUESTIONS_SUBJECT_COUNT = 100;
export const UFC_TWENTY_QUESTIONS_RUNTIME_CATEGORY_LIMIT = 30;
export const UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS = 360;

type CandidateQuestion = {
  id: string;
  label: string;
  values: ReadonlyMap<string, boolean>;
};

type UfcTwentyQuestionsStats = {
  fights: number;
  wins: number;
  losses: number;
  decisionWins: number;
  finishes: number;
  koTkoWins: number;
  submissionWins: number;
  titleFights: number;
  titleFightWins: number;
  interimTitleFights: number;
  interimTitleFightWins: number;
  activeYears: number;
  longestWinStreak: number;
  uniqueOpponentsBeaten: number;
  divisionsCompeted: number;
};

type MetricSpec = readonly [
  id: string,
  label: string,
  valueFor: (fighter: UfcFactualSubject) => number,
  thresholds: readonly number[],
];

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

function numberRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_value, index) => start + index);
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
  const losses = fighter.fights.filter((fight) => fight.result === "loss");
  const finishes = wins.filter((fight) => fight.methodCategory === "ko-tko" || fight.methodCategory === "submission");
  const titleFights = fighter.fights.filter((fight) => fight.titleFight);
  const titleWins = wins.filter((fight) => fight.titleFight);
  const interimTitleFights = fighter.fights.filter((fight) => fight.interimTitleFight);
  const interimTitleWins = wins.filter((fight) => fight.interimTitleFight);
  return {
    fights: fighter.fights.length,
    wins: wins.length,
    losses: losses.length,
    decisionWins: wins.filter((fight) => fight.methodCategory === "decision").length,
    finishes: finishes.length,
    koTkoWins: wins.filter((fight) => fight.methodCategory === "ko-tko").length,
    submissionWins: wins.filter((fight) => fight.methodCategory === "submission").length,
    titleFights: titleFights.length,
    titleFightWins: titleWins.length,
    interimTitleFights: interimTitleFights.length,
    interimTitleFightWins: interimTitleWins.length,
    activeYears: distinctCount(fighter.fights.map((fight) => fight.date.slice(0, 4))),
    longestWinStreak: longestWinStreak(fighter),
    uniqueOpponentsBeaten: distinctCount(wins.map((fight) => fight.opponent)),
    divisionsCompeted: distinctCount(fighter.fights.map((fight) => fight.division)),
  };
}

function runtimeCategory(row: CandidateQuestion) {
  const id = row.id.toLowerCase();
  if (id.startsWith("division:") || id.startsWith("stat:divisions-competed:")) return "role";
  if (id.startsWith("era:")) return "era";
  if (id.startsWith("faced:") || id.startsWith("beat:")) return "matchups";
  if (id.includes("title")) return "achievements";
  return "career";
}

function runtimeFamily(row: CandidateQuestion) {
  const parts = row.id.split(":");
  return parts.length > 1 ? parts.slice(0, -1).join(":") : row.id;
}

function unresolvedSubjectPairs(
  subjects: readonly TwentyQuestionsSubject[],
  selected: readonly CandidateQuestion[],
) {
  const unresolved: Array<readonly [TwentyQuestionsSubject, TwentyQuestionsSubject]> = [];
  for (let left = 0; left < subjects.length; left += 1) {
    for (let right = left + 1; right < subjects.length; right += 1) {
      const leftSubject = subjects[left]!;
      const rightSubject = subjects[right]!;
      if (selected.every((row) => row.values.get(leftSubject.id) === row.values.get(rightSubject.id))) {
        unresolved.push([leftSubject, rightSubject]);
      }
    }
  }
  return unresolved;
}

function selectRuntimeRows(rows: readonly CandidateQuestion[], subjects: readonly TwentyQuestionsSubject[]) {
  const scored = rows.map((row) => {
    const yes = subjects.filter((subject) => row.values.get(subject.id) === true).length;
    return {
      row,
      category: runtimeCategory(row),
      family: runtimeFamily(row),
      usefulSplit: Math.min(yes, subjects.length - yes),
      imbalance: Math.abs(yes - (subjects.length - yes)),
    };
  });
  const compare = (left: (typeof scored)[number], right: (typeof scored)[number]) => (
    right.usefulSplit - left.usefulSplit
    || left.imbalance - right.imbalance
    || left.row.label.localeCompare(right.row.label)
  );

  const selected: CandidateQuestion[] = [];
  for (const category of ["role", "era", "career", "achievements", "matchups"] as const) {
    const byFamily = new Map<string, (typeof scored)>();
    for (const entry of scored.filter((candidateRow) => candidateRow.category === category && candidateRow.usefulSplit > 0)) {
      const bucket = byFamily.get(entry.family) ?? [];
      bucket.push(entry);
      byFamily.set(entry.family, bucket);
    }
    for (const bucket of byFamily.values()) bucket.sort(compare);
    const familyOrder = [...byFamily.entries()].sort((left, right) => compare(left[1][0]!, right[1][0]!));
    let categoryCount = 0;
    while (categoryCount < UFC_TWENTY_QUESTIONS_RUNTIME_CATEGORY_LIMIT) {
      let added = false;
      for (const [, bucket] of familyOrder) {
        const entry = bucket.shift();
        if (!entry) continue;
        selected.push(entry.row);
        categoryCount += 1;
        added = true;
        if (categoryCount >= UFC_TWENTY_QUESTIONS_RUNTIME_CATEGORY_LIMIT) break;
      }
      if (!added) break;
    }
  }

  const selectedIds = new Set(selected.map((row) => row.id));
  let unresolved = unresolvedSubjectPairs(subjects, selected);
  while (unresolved.length) {
    let best: (typeof scored)[number] | null = null;
    let bestCoverage = 0;
    for (const entry of scored) {
      if (selectedIds.has(entry.row.id)) continue;
      const coverage = unresolved.reduce((sum, [left, right]) => (
        sum + Number(entry.row.values.get(left.id) !== entry.row.values.get(right.id))
      ), 0);
      if (coverage > bestCoverage || (coverage === bestCoverage && coverage > 0 && best && compare(entry, best) < 0)) {
        best = entry;
        bestCoverage = coverage;
      }
    }
    if (!best || bestCoverage === 0) break;
    selected.push(best.row);
    selectedIds.add(best.row.id);
    unresolved = unresolved.filter(([left, right]) => best!.row.values.get(left.id) === best!.row.values.get(right.id));
  }

  if (unresolved.length) {
    throw new Error(`UFC 20 Questions factual authority cannot distinguish ${unresolved.length} fighter pairs.`);
  }
  if (selected.length > UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS) {
    throw new Error(`UFC 20 Questions runtime needs ${selected.length} questions, above the ${UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS} runtime limit.`);
  }
  return selected;
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
  for (const cutoff of numberRange(1995, 2026)) {
    add(`era:debut-before-${cutoff}`, `Did this fighter make their UFC debut before ${cutoff}?`, (fighter) => Number(fighter.activeFrom.slice(0, 4)) < cutoff);
    add(`era:last-fight-before-${cutoff}`, `Was this fighter's last UFC fight before ${cutoff}?`, (fighter) => Number(fighter.activeTo.slice(0, 4)) < cutoff);
  }

  const metricSpecs: readonly MetricSpec[] = [
    ["fights", "UFC fights", (fighter) => statFor(fighter).fights, numberRange(3, 40)],
    ["wins", "UFC wins", (fighter) => statFor(fighter).wins, numberRange(2, 30)],
    ["losses", "UFC losses", (fighter) => statFor(fighter).losses, numberRange(1, 20)],
    ["decision-wins", "UFC decision wins", (fighter) => statFor(fighter).decisionWins, numberRange(1, 15)],
    ["finishes", "UFC finishes", (fighter) => statFor(fighter).finishes, numberRange(1, 20)],
    ["ko-tko-wins", "UFC KO/TKO wins", (fighter) => statFor(fighter).koTkoWins, numberRange(1, 15)],
    ["submission-wins", "UFC submission wins", (fighter) => statFor(fighter).submissionWins, numberRange(1, 12)],
    ["title-fights", "UFC title fights", (fighter) => statFor(fighter).titleFights, numberRange(1, 20)],
    ["title-wins", "UFC title-fight wins", (fighter) => statFor(fighter).titleFightWins, numberRange(1, 15)],
    ["interim-title-fights", "UFC interim title fights", (fighter) => statFor(fighter).interimTitleFights, numberRange(1, 8)],
    ["interim-title-wins", "UFC interim title-fight wins", (fighter) => statFor(fighter).interimTitleFightWins, numberRange(1, 5)],
    ["active-years", "UFC active years", (fighter) => statFor(fighter).activeYears, numberRange(2, 20)],
    ["win-streak", "UFC consecutive wins", (fighter) => statFor(fighter).longestWinStreak, numberRange(2, 15)],
    ["opponents-beaten", "unique UFC opponents beaten", (fighter) => statFor(fighter).uniqueOpponentsBeaten, numberRange(2, 30)],
    ["divisions-competed", "UFC weight classes", (fighter) => statFor(fighter).divisionsCompeted, [2, 3, 4]],
  ];
  const singularMetricLabels: Record<string, string> = {
    losses: "UFC loss",
    "decision-wins": "UFC decision win",
    finishes: "UFC finish",
    "ko-tko-wins": "UFC KO/TKO win",
    "submission-wins": "UFC submission win",
    "title-fights": "UFC title fight",
    "title-wins": "UFC title-fight win",
    "interim-title-fights": "UFC interim title fight",
    "interim-title-wins": "UFC interim title-fight win",
  };
  for (const [id, label, valueFor, thresholds] of metricSpecs) {
    for (const threshold of thresholds) {
      const quantity = threshold === 1 && singularMetricLabels[id]
        ? `one ${singularMetricLabels[id]}`
        : `${threshold} ${label}`;
      add(`stat:${id}:${threshold}`, `Does this fighter have at least ${quantity}?`, (fighter) => valueFor(fighter) >= threshold);
    }
  }

  const opponentNames = new Map<string, string>();
  for (const fighter of ufcFactualLedgerSubjects) {
    for (const fight of fighter.fights) {
      const key = normalizedOpponent(fight.opponent);
      if (key && !opponentNames.has(key)) opponentNames.set(key, fight.opponent.trim());
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

  return selectRuntimeRows([...byPartition.values()], subjects).map((row) => {
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
