import {
  ufcFactualLedgerSubjects,
  type UfcFactualSubject,
} from "../back-room/ufcFactualLedger";
import {
  twentyQuestionsCostForSplit,
  type TwentyQuestionsHumanValue,
  type TwentyQuestionsQuestion,
  type TwentyQuestionsSubject,
  type TwentyQuestionsUniverse,
} from "./twentyQuestionsEngine";

export const UFC_TWENTY_QUESTIONS_SUBJECT_COUNT = 100;
export const UFC_TWENTY_QUESTIONS_RUNTIME_CATEGORY_LIMIT = 30;
export const UFC_TWENTY_QUESTIONS_RUNTIME_MAX_QUESTIONS = 360;

const UFC_DIVISION_BY_ID = new Map<string, string>([
  ["flyweight", "Flyweight"],
  ["bantamweight", "Bantamweight"],
  ["featherweight", "Featherweight"],
  ["lightweight", "Lightweight"],
  ["welterweight", "Welterweight"],
  ["middleweight", "Middleweight"],
  ["light-heavyweight", "Light Heavyweight"],
  ["heavyweight", "Heavyweight"],
  ["strawweight", "Women's Strawweight"],
  ["womens-strawweight", "Women's Strawweight"],
  ["women-s-strawweight", "Women's Strawweight"],
  ["womens-flyweight", "Women's Flyweight"],
  ["women-s-flyweight", "Women's Flyweight"],
  ["womens-bantamweight", "Women's Bantamweight"],
  ["women-s-bantamweight", "Women's Bantamweight"],
  ["womens-featherweight", "Women's Featherweight"],
  ["women-s-featherweight", "Women's Featherweight"],
]);

const UFC_DECADES = [1990, 2000, 2010, 2020] as const;

type CandidateQuestion = {
  id: string;
  label: string;
  values: ReadonlyMap<string, boolean>;
  humanValue: TwentyQuestionsHumanValue;
  recommendationFamily: string;
};

type UfcTwentyQuestionsStats = {
  fights: number;
  wins: number;
  finishes: number;
  koTkoWins: number;
  submissionWins: number;
  titleFights: number;
  titleFightWins: number;
  undisputedTitleWins: number;
  interimTitleWins: number;
  sanctionedDivisions: number;
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

function canonicalUfcDivision(value: string) {
  return UFC_DIVISION_BY_ID.get(normalizedId(value)) ?? null;
}

function fighterDivisions(fighter: UfcFactualSubject) {
  return [...new Set([
    fighter.primaryDivision,
    ...fighter.secondaryDivisions,
    ...fighter.fights.map((fight) => fight.division),
  ].map(canonicalUfcDivision).filter((division): division is string => division != null))];
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
  humanValue: TwentyQuestionsHumanValue,
  recommendationFamily: string,
): CandidateQuestion {
  return {
    id,
    label,
    humanValue,
    recommendationFamily,
    values: new Map(ufcFactualLedgerSubjects.map((fighter) => [fighter.id, answer(fighter)])),
  };
}

function deriveStats(fighter: UfcFactualSubject): UfcTwentyQuestionsStats {
  const wins = fighter.fights.filter((fight) => fight.result === "win");
  const titleFights = fighter.fights.filter((fight) => fight.titleFight);
  const titleWins = wins.filter((fight) => fight.titleFight);
  return {
    fights: fighter.fights.length,
    wins: wins.length,
    finishes: wins.filter((fight) => fight.methodCategory === "ko-tko" || fight.methodCategory === "submission").length,
    koTkoWins: wins.filter((fight) => fight.methodCategory === "ko-tko").length,
    submissionWins: wins.filter((fight) => fight.methodCategory === "submission").length,
    titleFights: titleFights.length,
    titleFightWins: titleWins.length,
    undisputedTitleWins: titleWins.filter((fight) => !fight.interimTitleFight).length,
    interimTitleWins: titleWins.filter((fight) => fight.interimTitleFight).length,
    sanctionedDivisions: fighterDivisions(fighter).length,
  };
}

function runtimeCategory(row: CandidateQuestion) {
  const id = row.id.toLowerCase();
  if (id.startsWith("division:") || id.startsWith("division-history:")) return "role";
  if (id.startsWith("era:")) return "era";
  if (id.startsWith("faced:") || id.startsWith("beat:")) return "matchups";
  if (id.startsWith("championship:")) return "achievements";
  return "career";
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
      family: row.recommendationFamily,
      usefulSplit: Math.min(yes, subjects.length - yes),
      imbalance: Math.abs(yes - (subjects.length - yes)),
    };
  });
  const compare = (left: (typeof scored)[number], right: (typeof scored)[number]) => (
    right.row.humanValue - left.row.humanValue
    || right.usefulSplit - left.usefulSplit
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
  const add = (
    id: string,
    label: string,
    answer: (fighter: UfcFactualSubject) => boolean,
    humanValue: TwentyQuestionsHumanValue,
    recommendationFamily: string,
  ) => rows.push(candidate(id, label, answer, humanValue, recommendationFamily));

  const stats = new Map(ufcFactualLedgerSubjects.map((fighter) => [fighter.id, deriveStats(fighter)]));
  const statFor = (fighter: UfcFactualSubject) => stats.get(fighter.id)!;

  const divisions = [...new Set(ufcFactualLedgerSubjects.flatMap(fighterDivisions))].sort();
  for (const division of divisions) {
    add(
      `division:${normalizedId(division)}`,
      `Has this fighter competed at ${division} in the UFC?`,
      (fighter) => fighterDivisions(fighter).includes(division),
      4,
      "division",
    );
  }
  add(
    "division-history:multiple",
    "Has this fighter competed in multiple UFC divisions?",
    (fighter) => statFor(fighter).sanctionedDivisions >= 2,
    4,
    "division-history",
  );

  for (const decade of UFC_DECADES) {
    add(
      `era:active-${decade}s`,
      `Did this fighter have a UFC fight in the ${decade}s?`,
      (fighter) => fighter.fights.some((fight) => {
        const year = Number(fight.date.slice(0, 4));
        return year >= decade && year < decade + 10;
      }),
      4,
      "era-active",
    );
    add(
      `era:debut-${decade}s`,
      `Did this fighter make their UFC debut in the ${decade}s?`,
      (fighter) => {
        const year = Number(fighter.activeFrom.slice(0, 4));
        return year >= decade && year < decade + 10;
      },
      4,
      "era-debut",
    );
    add(
      `era:last-fight-${decade}s`,
      `Was this fighter's last UFC fight in the ${decade}s?`,
      (fighter) => {
        const year = Number(fighter.activeTo.slice(0, 4));
        return year >= decade && year < decade + 10;
      },
      4,
      "era-last-fight",
    );
  }

  add(
    "championship:title-challenger",
    "Has this fighter competed in a UFC title fight?",
    (fighter) => statFor(fighter).titleFights > 0,
    4,
    "championship-status",
  );
  add(
    "championship:title-winner",
    "Has this fighter won a UFC title fight?",
    (fighter) => statFor(fighter).titleFightWins > 0,
    4,
    "championship-status",
  );
  add(
    "championship:undisputed-title-winner",
    "Has this fighter won a non-interim UFC title fight?",
    (fighter) => statFor(fighter).undisputedTitleWins > 0,
    4,
    "championship-status",
  );
  add(
    "championship:interim-title-winner",
    "Has this fighter won an interim UFC title fight?",
    (fighter) => statFor(fighter).interimTitleWins > 0,
    4,
    "championship-status",
  );
  add(
    "championship:multiple-title-wins",
    "Has this fighter won multiple UFC title fights?",
    (fighter) => statFor(fighter).titleFightWins >= 2,
    4,
    "championship-resume",
  );

  add("career:20-plus-fights", "Does this fighter have at least 20 UFC fights?", (fighter) => statFor(fighter).fights >= 20, 2, "career-volume");
  add("career:10-plus-wins", "Does this fighter have at least 10 UFC wins?", (fighter) => statFor(fighter).wins >= 10, 2, "career-wins");
  add("career:10-plus-finishes", "Does this fighter have at least 10 UFC finishes?", (fighter) => statFor(fighter).finishes >= 10, 2, "career-finishes");
  add("style:5-plus-ko-tko-wins", "Does this fighter have at least 5 UFC KO/TKO wins?", (fighter) => statFor(fighter).koTkoWins >= 5, 2, "finishing-style");
  add("style:5-plus-submission-wins", "Does this fighter have at least 5 UFC submission wins?", (fighter) => statFor(fighter).submissionWins >= 5, 2, "finishing-style");

  const recognizableOpponentNames = new Map(
    ufcFactualLedgerSubjects.map((fighter) => [normalizedOpponent(fighter.name), fighter.name]),
  );
  const opponentNames = new Map<string, string>();
  for (const fighter of ufcFactualLedgerSubjects) {
    for (const fight of fighter.fights) {
      const key = normalizedOpponent(fight.opponent);
      if (key && !opponentNames.has(key)) opponentNames.set(key, fight.opponent.trim());
    }
  }
  for (const [opponentKey, opponent] of [...opponentNames.entries()].sort((left, right) => left[1].localeCompare(right[1]))) {
    const recognizableName = recognizableOpponentNames.get(opponentKey);
    const humanValue: TwentyQuestionsHumanValue = recognizableName ? 3 : 1;
    const labelName = recognizableName ?? opponent;
    add(
      `faced:${normalizedId(opponentKey)}`,
      `Has this fighter faced ${labelName} in the UFC?`,
      (fighter) => fighter.fights.some((fight) => normalizedOpponent(fight.opponent) === opponentKey),
      humanValue,
      "matchups",
    );
    add(
      `beat:${normalizedId(opponentKey)}`,
      `Has this fighter beaten ${labelName} in the UFC?`,
      (fighter) => fighter.fights.some((fight) => normalizedOpponent(fight.opponent) === opponentKey && fight.result === "win"),
      humanValue,
      "matchups",
    );
  }

  const byPartition = new Map<string, CandidateQuestion>();
  for (const row of rows) {
    const yes = subjects.filter((subject) => row.values.get(subject.id) === true).length;
    if (yes === 0 || yes === subjects.length) continue;
    const signature = partitionSignature(subjects, row.values);
    const existing = byPartition.get(signature);
    if (!existing || row.humanValue > existing.humanValue) byPartition.set(signature, row);
  }

  return selectRuntimeRows([...byPartition.values()], subjects).map((row) => {
    const yes = subjects.filter((subject) => row.values.get(subject.id) === true).length;
    const internalCost = twentyQuestionsCostForSplit(yes, subjects.length);
    return {
      id: row.id,
      label: row.label,
      internalCost,
      humanValue: row.humanValue,
      recommendationFamily: row.recommendationFamily,
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
