import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src/features/games/generated/twentyQuestionsFootballRuntime.json");
const CATEGORY_LIMIT = 30;
const MAX_QUESTIONS = 360;
const MAX_INITIAL_QUESTIONS_PER_FAMILY = 3;
const ENDGAME_FINGERPRINT_FAMILY = "endgame-fingerprint";
const CATEGORY_ORDER = ["role", "era", "career", "achievements", "affiliations", "matchups"];

function categoryForQuestion(question) {
  const id = question.id.toLowerCase();
  if (
    id.startsWith("division:")
    || id.startsWith("role:")
    || id.startsWith("position:")
    || id.startsWith("position-family:")
  ) return "role";
  if (id.startsWith("era:") || id.includes(":era:") || id.includes("longevity")) return "era";
  if (id.startsWith("faced:") || id.startsWith("beat:")) return "matchups";
  if (/(franchise|program|conference|college|school|team):/.test(id)) return "affiliations";
  if (/(title|champ|award|mvp|all-pro|pro-bowl|heisman|super-bowl|playoff|trophy|honor)/.test(id)) return "achievements";
  return "career";
}

function familyForQuestion(question) {
  const parts = question.id.split(":");
  return parts.length > 1 ? parts.slice(0, -1).join(":") : question.id;
}

function initialFamilyQuestionLimit(family) {
  if (family === "role") return 2;
  if (family === "position") return 10;
  if (family === "position-family") return 3;
  if (["franchise", "program", "player-college", "player-program", "historical-conference"].includes(family)) return 12;
  return MAX_INITIAL_QUESTIONS_PER_FAMILY;
}

function isEndgameFingerprintQuestion(question) {
  const id = question.id.toLowerCase();
  return id.includes("-fine:") || id.startsWith("coach:losses:");
}

function humanValueForQuestion(question) {
  const id = question.id.toLowerCase();
  if (isEndgameFingerprintQuestion(question)) return 1;
  if (
    id.startsWith("role:")
    || id.startsWith("position:")
    || id.startsWith("position-family:")
    || id.startsWith("era:")
    || id.includes(":era:")
    || id.includes("longevity")
    || /(franchise|program|conference|college|school|team):/.test(id)
    || /(title|champ|award|mvp|all-pro|pro-bowl|heisman|super-bowl|playoff|trophy|honor)/.test(id)
  ) return 4;
  if (id.startsWith("production:") || id.startsWith("coach:")) return 3;
  return 2;
}

function recommendationFamilyForQuestion(question) {
  return isEndgameFingerprintQuestion(question) ? ENDGAME_FINGERPRINT_FAMILY : familyForQuestion(question);
}

function compareScored(left, right) {
  return right.humanValue - left.humanValue
    || right.usefulSplit - left.usefulSplit
    || left.imbalance - right.imbalance
    || left.question.internalCost - right.question.internalCost
    || left.question.label.localeCompare(right.question.label);
}

function unresolvedSubjectPairs(subjectCount, selected) {
  const unresolved = [];
  for (let left = 0; left < subjectCount; left += 1) {
    for (let right = left + 1; right < subjectCount; right += 1) {
      if (selected.every((row) => row.answers[left] === row.answers[right])) unresolved.push([left, right]);
    }
  }
  return unresolved;
}

function bestPairCoverageRow(rows, selectedIds, unresolved) {
  let best = null;
  let bestCoverage = 0;
  for (const row of rows) {
    if (selectedIds.has(row.question.id)) continue;
    const coverage = unresolved.reduce(
      (sum, [left, right]) => sum + Number(row.answers[left] !== row.answers[right]),
      0,
    );
    if (coverage > bestCoverage || (coverage === bestCoverage && coverage > 0 && best && compareScored(row, best) < 0)) {
      best = row;
      bestCoverage = coverage;
    }
  }
  return { best, bestCoverage };
}

function completePairCoverage(universe, scored, selected) {
  const selectedIds = new Set(selected.map((row) => row.question.id));
  let unresolved = unresolvedSubjectPairs(universe.subjects.length, selected);

  while (unresolved.length) {
    const humanRows = scored.filter((row) => !row.endgameFingerprint);
    let { best, bestCoverage } = bestPairCoverageRow(humanRows, selectedIds, unresolved);
    if (!best || bestCoverage === 0) {
      ({ best, bestCoverage } = bestPairCoverageRow(scored, selectedIds, unresolved));
    }
    if (!best || bestCoverage === 0) break;
    selected.push(best);
    selectedIds.add(best.question.id);
    unresolved = unresolved.filter(([left, right]) => best.answers[left] === best.answers[right]);
  }

  if (unresolved.length) {
    throw new Error(`${universe.league} Football 20 Questions authority cannot distinguish ${unresolved.length} subject pairs: ${JSON.stringify(unresolved.slice(0, 5).map(([left, right]) => [universe.subjects[left]?.id, universe.subjects[right]?.id]))}`);
  }
  if (selected.length > MAX_QUESTIONS) {
    throw new Error(`${universe.league} Football 20 Questions runtime needs ${selected.length} questions, above the ${MAX_QUESTIONS} compact-runtime limit.`);
  }
}

function selectRuntimeQuestions(universe) {
  const scored = universe.questions.map((question) => {
    const answers = universe.subjects.map((subject) => question.answer(subject.id));
    const yes = answers.filter(Boolean).length;
    return {
      question,
      answers,
      category: categoryForQuestion(question),
      family: familyForQuestion(question),
      recommendationFamily: recommendationFamilyForQuestion(question),
      endgameFingerprint: isEndgameFingerprintQuestion(question),
      humanValue: humanValueForQuestion(question),
      usefulSplit: Math.min(yes, answers.length - yes),
      imbalance: Math.abs(yes - (answers.length - yes)),
    };
  });

  const selected = [];
  for (const category of CATEGORY_ORDER) {
    const categoryRows = scored.filter((row) => row.category === category && row.usefulSplit > 0 && !row.endgameFingerprint);
    const byFamily = new Map();
    for (const row of categoryRows) {
      const bucket = byFamily.get(row.family) ?? [];
      bucket.push(row);
      byFamily.set(row.family, bucket);
    }
    for (const bucket of byFamily.values()) bucket.sort(compareScored);

    const familyOrder = [...byFamily.entries()]
      .sort((left, right) => compareScored(left[1][0], right[1][0]));
    const familyCounts = new Map();
    const categorySelection = [];
    while (categorySelection.length < CATEGORY_LIMIT) {
      let added = false;
      for (const [family, bucket] of familyOrder) {
        if ((familyCounts.get(family) ?? 0) >= initialFamilyQuestionLimit(family)) continue;
        const next = bucket.shift();
        if (!next) continue;
        categorySelection.push(next);
        familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
        added = true;
        if (categorySelection.length >= CATEGORY_LIMIT) break;
      }
      if (!added) break;
    }
    selected.push(...categorySelection);
  }

  completePairCoverage(universe, scored, selected);
  return selected;
}

const gateServer = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

let getFootballTwentyQuestionsUniverse;
try {
  ({ getFootballTwentyQuestionsUniverse } = await gateServer.ssrLoadModule(
    "/src/features/games/twentyQuestionsFootballAuthority.ts",
  ));

  const output = {
    version: 3,
    categoryLimit: CATEGORY_LIMIT,
    maxQuestions: MAX_QUESTIONS,
  };

  for (const league of ["NFL", "CFB"]) {
    const universe = getFootballTwentyQuestionsUniverse(league);
    const selected = selectRuntimeQuestions(universe);
    output[league] = {
      league,
      sourceQuestionCount: universe.questions.length,
      subjects: universe.subjects.map(({ id, name, kind }) => ({ id, name, kind, league })),
      questions: selected.map((row) => ({
        id: row.question.id,
        label: row.question.label,
        internalCost: row.question.internalCost,
        humanValue: row.humanValue,
        recommendationFamily: row.recommendationFamily,
        answers: row.answers.map((answer) => answer ? "1" : "0").join(""),
      })),
    };
    console.log(`${league} Football 20 Questions runtime: ${selected.length}/${universe.questions.length} questions.`);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(output)}\n`);
} finally {
  await gateServer.close();
}
