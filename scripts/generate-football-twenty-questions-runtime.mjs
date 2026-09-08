import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "src/features/games/generated/twentyQuestionsFootballRuntime.json");
const CATEGORY_LIMIT = 30;
const MAX_QUESTIONS = 360;
const MAX_INITIAL_QUESTIONS_PER_FAMILY = 3;
const CATEGORY_ORDER = ["role", "era", "career", "achievements", "affiliations", "matchups"];

function normalized(value) {
  return String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

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

function humanValueForQuestion(question) {
  const id = question.id.toLowerCase();
  if (id.includes("-fine:") || id.includes("coach:losses:")) return 0;
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
  if (id.startsWith("production:") || id.startsWith("coach:")) return 2;
  return 1;
}

function compareScored(left, right) {
  return right.humanValue - left.humanValue
    || right.usefulSplit - left.usefulSplit
    || left.imbalance - right.imbalance
    || left.question.internalCost - right.question.internalCost
    || left.question.label.localeCompare(right.question.label);
}

function canonicalPartitionSignature(values) {
  const direct = values.map((value) => value ? "1" : "0").join("");
  const inverse = values.map((value) => value ? "0" : "1").join("");
  return direct < inverse ? direct : inverse;
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

function completePairCoverage(universe, scored, selected) {
  const selectedIds = new Set(selected.map((row) => row.question.id));
  let unresolved = unresolvedSubjectPairs(universe.subjects.length, selected);

  while (unresolved.length) {
    let best = null;
    let bestCoverage = 0;
    for (const row of scored) {
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
    if (!best || bestCoverage === 0) break;
    selected.push(best);
    selectedIds.add(best.question.id);
    unresolved = unresolved.filter(([left, right]) => best.answers[left] === best.answers[right]);
  }

  if (unresolved.length) {
    throw new Error(`${universe.league} Football 20 Questions authority cannot distinguish ${unresolved.length} subject pairs.`);
  }
  if (selected.length > MAX_QUESTIONS) {
    throw new Error(`${universe.league} Football 20 Questions runtime needs ${selected.length} questions, above the ${MAX_QUESTIONS} compact-runtime limit.`);
  }
}

function metadataHistory(history, footballTeamSchoolMetadataFor) {
  if (!history) return null;
  const rows = history.affiliations.map((affiliation) => ({
    affiliation,
    metadata: footballTeamSchoolMetadataFor(affiliation),
  }));
  return {
    rows,
    complete: history.complete && rows.every((row) => row.metadata != null),
  };
}

function derivedHumanQuestions(
  universe,
  getFootballSubject,
  footballCareerAffiliationHistoryFor,
  footballTeamSchoolMetadataFor,
  twentyQuestionsCostForSplit,
) {
  const profiles = universe.subjects.map((subject) => {
    const separator = subject.id.indexOf(":");
    const canonicalId = separator >= 0 ? subject.id.slice(separator + 1) : subject.id;
    return getFootballSubject(canonicalId);
  });
  const histories = profiles.map((profile) => (
    profile ? metadataHistory(footballCareerAffiliationHistoryFor(profile), footballTeamSchoolMetadataFor) : null
  ));
  const occupiedPartitions = new Set(universe.questions.map((question) => canonicalPartitionSignature(
    universe.subjects.map((subject) => question.answer(subject.id)),
  )));
  const questions = [];

  const add = (id, label, resolve) => {
    const rawAnswers = universe.subjects.map((subject, index) => resolve(subject, profiles[index], histories[index]));
    if (rawAnswers.some((answer) => answer == null)) return;
    const answers = rawAnswers.map(Boolean);
    const yes = answers.filter(Boolean).length;
    if (yes === 0 || yes === answers.length) return;
    const signature = canonicalPartitionSignature(answers);
    if (occupiedPartitions.has(signature)) return;
    occupiedPartitions.add(signature);
    const answerById = new Map(universe.subjects.map((subject, index) => [subject.id, answers[index]]));
    questions.push({
      id,
      label,
      internalCost: twentyQuestionsCostForSplit(yes, answers.length),
      answer: (subjectId) => {
        const answer = answerById.get(subjectId);
        if (answer == null) throw new Error(`Unknown ${universe.league} 20 Questions subject: ${subjectId}`);
        return answer;
      },
    });
  };

  const metadataValues = histories.flatMap((history) => history?.rows.flatMap((row) => row.metadata ? [row.metadata] : []) ?? []);
  const regions = [...new Set(metadataValues.map((metadata) => metadata.region))].sort();
  const colors = [...new Set(metadataValues.flatMap((metadata) => metadata.colors))].sort();
  const affiliationAnswer = (history, predicate) => {
    if (!history) return null;
    if (history.rows.some((row) => row.metadata && predicate(row.metadata))) return true;
    return history.complete ? false : null;
  };

  for (const region of regions) {
    add(
      universe.league === "NFL" ? `team:region:${normalized(region)}` : `program:region:${normalized(region)}`,
      universe.league === "NFL"
        ? `Did this person's NFL career include a franchise from the ${region}?`
        : `Did this person play or coach at a program in the ${region}?`,
      (_subject, _profile, history) => affiliationAnswer(history, (metadata) => metadata.region === region),
    );
  }

  for (const color of colors) {
    add(
      universe.league === "NFL" ? `team:color:${normalized(color)}` : `program:color:${normalized(color)}`,
      universe.league === "NFL"
        ? `Did this person's team history include a franchise that wears ${color}?`
        : `Did this person's program history include a school that wears ${color}?`,
      (_subject, _profile, history) => affiliationAnswer(history, (metadata) => metadata.colors.includes(color)),
    );
  }

  if (universe.league === "NFL") {
    for (const conference of ["AFC", "NFC"]) {
      add(
        `team:conference:${conference.toLowerCase()}`,
        `Did this person's career include a franchise that is currently in the ${conference}?`,
        (_subject, _profile, history) => affiliationAnswer(history, (metadata) => metadata.nflConference === conference),
      );
    }
    for (const conference of ["AFC", "NFC"]) {
      for (const division of ["East", "North", "South", "West"]) {
        add(
          `team:division:${conference.toLowerCase()}-${division.toLowerCase()}`,
          `Did this person's career include a franchise that is currently in the ${conference} ${division}?`,
          (_subject, _profile, history) => affiliationAnswer(
            history,
            (metadata) => metadata.nflConference === conference && metadata.nflDivision === division,
          ),
        );
      }
    }

    add(
      "award:draft:first-round",
      "Was this NFL player a first-round draft pick?",
      (subject, profile) => {
        if (subject.kind !== "player") return false;
        if (!profile) return null;
        if (typeof profile.firstRoundPick === "boolean") return profile.firstRoundPick;
        if (typeof profile.draftRound === "number") return profile.draftRound === 1;
        if (profile.undrafted === true) return false;
        return null;
      },
    );
    add(
      "award:draft:first-overall",
      "Was this NFL player drafted first overall?",
      (subject, profile) => {
        if (subject.kind !== "player") return false;
        if (!profile) return null;
        if (typeof profile.firstOverallPick === "boolean") return profile.firstOverallPick;
        if (profile.undrafted === true || (typeof profile.draftRound === "number" && profile.draftRound !== 1)) return false;
        return null;
      },
    );
    add(
      "career:draft:undrafted",
      "Did this NFL player enter the league undrafted?",
      (subject, profile) => {
        if (subject.kind !== "player") return false;
        if (!profile) return null;
        if (typeof profile.undrafted === "boolean") return profile.undrafted;
        if (typeof profile.draftRound === "number") return false;
        return null;
      },
    );
  } else {
    add(
      "program:transfer:multiple",
      "Did this player play college football for more than one program?",
      (subject, _profile, history) => {
        if (subject.kind !== "player") return false;
        if (!history) return null;
        if (history.rows.length > 1) return true;
        return history.complete ? false : null;
      },
    );
  }

  return questions;
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
      humanValue: humanValueForQuestion(question),
      usefulSplit: Math.min(yes, answers.length - yes),
      imbalance: Math.abs(yes - (answers.length - yes)),
    };
  });

  const selected = [];
  for (const category of CATEGORY_ORDER) {
    const categoryRows = scored.filter((row) => row.category === category && row.usefulSplit > 0 && row.humanValue > 0);
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
        if ((familyCounts.get(family) ?? 0) >= MAX_INITIAL_QUESTIONS_PER_FAMILY) continue;
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
let getFootballSubject;
let footballCareerAffiliationHistoryFor;
let footballTeamSchoolMetadataFor;
let twentyQuestionsCostForSplit;
try {
  ({ getFootballTwentyQuestionsUniverse } = await gateServer.ssrLoadModule(
    "/src/features/games/twentyQuestionsFootballAuthority.ts",
  ));
  ({ getFootballSubject } = await gateServer.ssrLoadModule(
    "/src/features/back-room/footballSubjectRegistry.ts",
  ));
  ({ footballCareerAffiliationHistoryFor } = await gateServer.ssrLoadModule(
    "/src/features/back-room/footballCareerAffiliationProjection.ts",
  ));
  ({ footballTeamSchoolMetadataFor } = await gateServer.ssrLoadModule(
    "/src/features/back-room/footballTeamSchoolMetadata.ts",
  ));
  ({ twentyQuestionsCostForSplit } = await gateServer.ssrLoadModule(
    "/src/features/games/twentyQuestionsEngine.ts",
  ));

  const output = {
    version: 2,
    categoryLimit: CATEGORY_LIMIT,
    maxQuestions: MAX_QUESTIONS,
  };

  for (const league of ["NFL", "CFB"]) {
    const baseUniverse = getFootballTwentyQuestionsUniverse(league);
    const humanQuestions = derivedHumanQuestions(
      baseUniverse,
      getFootballSubject,
      footballCareerAffiliationHistoryFor,
      footballTeamSchoolMetadataFor,
      twentyQuestionsCostForSplit,
    );
    const universe = {
      ...baseUniverse,
      questions: [...baseUniverse.questions, ...humanQuestions],
    };
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
    console.log(`${league} Football 20 Questions runtime: ${selected.length}/${universe.questions.length} questions (${humanQuestions.length} human metadata additions).`);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(output)}\n`);
} finally {
  await gateServer.close();
}
