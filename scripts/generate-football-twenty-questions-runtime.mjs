import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src/features/games/generated/twentyQuestionsFootballRuntime.json");
const CATEGORY_LIMIT = 20;
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

function compareScored(left, right) {
  return right.usefulSplit - left.usefulSplit
    || left.imbalance - right.imbalance
    || left.question.internalCost - right.question.internalCost
    || left.question.label.localeCompare(right.question.label);
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
      usefulSplit: Math.min(yes, answers.length - yes),
      imbalance: Math.abs(yes - (answers.length - yes)),
    };
  });

  const selected = [];
  for (const category of CATEGORY_ORDER) {
    const categoryRows = scored.filter((row) => row.category === category && row.usefulSplit > 0);
    const byFamily = new Map();
    for (const row of categoryRows) {
      const bucket = byFamily.get(row.family) ?? [];
      bucket.push(row);
      byFamily.set(row.family, bucket);
    }
    for (const bucket of byFamily.values()) bucket.sort(compareScored);

    const familyOrder = [...byFamily.entries()]
      .sort((left, right) => compareScored(left[1][0], right[1][0]));

    const categorySelection = [];
    while (categorySelection.length < CATEGORY_LIMIT) {
      let added = false;
      for (const [, bucket] of familyOrder) {
        const next = bucket.shift();
        if (!next) continue;
        categorySelection.push(next);
        added = true;
        if (categorySelection.length >= CATEGORY_LIMIT) break;
      }
      if (!added) break;
    }
    selected.push(...categorySelection);
  }

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
    version: 1,
    categoryLimit: CATEGORY_LIMIT,
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
