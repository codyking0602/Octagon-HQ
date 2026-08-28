import fs from "node:fs";

function replaceOnce(path, from, to) {
  const original = fs.readFileSync(path, "utf8");
  if (!original.includes(from)) throw new Error(`Expected repair anchor missing in ${path}`);
  const updated = original.replace(from, to);
  if (updated === original) throw new Error(`Repair made no change in ${path}`);
  fs.writeFileSync(path, updated);
}

replaceOnce(
  "scripts/generate-football-factual-universe.mjs",
  'const relationshipDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "derived", formula } } : null;\n',
  'const relationshipDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "derived", formula } } : null;\nconst specialistFact = (metricId, value) => finite(value) ? { metricId, value, evidence: { sourceIds: ["pfr-nfl-specialists-factual-universe"], kind: "reported" } } : null;\nconst specialistDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["pfr-nfl-specialists-factual-universe"], kind: "derived", formula } } : null;\nconst reviewedNflSpecialists = new Map([\n  ["adamvinatieri", { position: "K", fieldGoalsMade: 599, fieldGoalsAttempted: 715 }],\n  ["justintucker", { position: "K", fieldGoalsMade: 417, fieldGoalsAttempted: 468 }],\n  ["shanelechler", { position: "P", punts: 1444, puntingYards: 68676 }],\n]);\n'
);

replaceOnce(
  "scripts/generate-football-factual-universe.mjs",
  '  const p = subject.position;\n  const facts = [];\n  const games = sumObserved(rows, "games");\n',
  '  const p = subject.position;\n  const facts = [];\n  const reviewedSpecialist = reviewedNflSpecialists.get(normalized(subject.name));\n  if (p === "K" && reviewedSpecialist?.position === "K") {\n    facts.push(...compact([\n      specialistFact("nfl-career-field-goals-made", reviewedSpecialist.fieldGoalsMade),\n      specialistFact("nfl-career-field-goals-attempted", reviewedSpecialist.fieldGoalsAttempted),\n      specialistDerived("nfl-career-field-goal-percentage", reviewedSpecialist.fieldGoalsMade / reviewedSpecialist.fieldGoalsAttempted * 100, "field goals made / field goals attempted * 100"),\n    ]));\n  }\n  if (p === "P" && reviewedSpecialist?.position === "P") {\n    facts.push(...compact([\n      specialistFact("nfl-career-punts", reviewedSpecialist.punts),\n      specialistFact("nfl-career-punting-yards", reviewedSpecialist.puntingYards),\n      specialistDerived("nfl-career-punting-average", reviewedSpecialist.puntingYards / reviewedSpecialist.punts, "punting yards / punts"),\n    ]));\n  }\n  const games = sumObserved(rows, "games");\n'
);

replaceOnce(
  "src/features/back-room/footballFactualUniverseProjection.ts",
  '  {\n    id: "football-relationships-factual-universe",\n',
  '  {\n    id: "pfr-nfl-specialists-factual-universe",\n    publisher: "Pro Football Reference",\n    title: "Reviewed NFL specialist career records",\n    url: "https://www.pro-football-reference.com/",\n    reviewedOn: "2026-08-28",\n    coverage: "Reviewed career kicking/punting facts for recognizable NFL specialists used to close Stage 13 specialist coverage gaps",\n  },\n  {\n    id: "football-relationships-factual-universe",\n'
);

replaceOnce(
  "src/features/back-room/footballFactualStatsCore.ts",
  '  return projected.flatMap((record)=>{ const subjectId=canonicalFactSubjectId(record.subjectId); const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });\n',
  '  return projected.flatMap((record)=>{ const canonicalSubject=getFootballSubject(record.subjectId); if (!canonicalSubject) return []; const subjectId=canonicalSubject.id; const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });\n'
);

replaceOnce(
  "src/features/back-room/footballComparisonGeneration.ts",
  '    const forceAbsoluteTier = targetTier === "elite" || targetTier === "bad";\n',
  '    const repeatedTargetDepth = targets.filter((tier) => tier === targetTier).length;\n    const forceAbsoluteTier = (\n      targetTier === "elite"\n      || targetTier === "bad"\n      || availableTierCount(items, targetTier) >= Math.max(3, repeatedTargetDepth)\n    );\n'
);

console.log("Applied Stage 13 final repair.");
