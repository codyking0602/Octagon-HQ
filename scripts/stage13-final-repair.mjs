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
  'const relationshipDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["football-relationships-factual-universe"], kind: "derived", formula } } : null;\nconst specialistFact = (metricId, value) => finite(value) ? { metricId, value, evidence: { sourceIds: ["pfr-nfl-specialists-factual-universe"], kind: "reported" } } : null;\nconst specialistDerived = (metricId, value, formula) => finite(value) ? { metricId, value, evidence: { sourceIds: ["pfr-nfl-specialists-factual-universe"], kind: "derived", formula } } : null;\nconst reviewedNflSpecialists = new Map([\n  ["adamvinatieri", { subjectId: "nfl-adam-vinatieri", position: "K", fieldGoalsMade: 599, fieldGoalsAttempted: 715 }],\n  ["justintucker", { subjectId: "nfl-justin-tucker", position: "K", fieldGoalsMade: 417, fieldGoalsAttempted: 468 }],\n  ["shanelechler", { subjectId: "nfl-shane-lechler", position: "P", punts: 1444, puntingYards: 68676 }],\n]);\nconst reviewedSpecialistFacts = (specialist) => specialist.position === "K" ? compact([\n  specialistFact("nfl-career-field-goals-made", specialist.fieldGoalsMade),\n  specialistFact("nfl-career-field-goals-attempted", specialist.fieldGoalsAttempted),\n  specialistDerived("nfl-career-field-goal-percentage", specialist.fieldGoalsMade / specialist.fieldGoalsAttempted * 100, "field goals made / field goals attempted * 100"),\n]) : compact([\n  specialistFact("nfl-career-punts", specialist.punts),\n  specialistFact("nfl-career-punting-yards", specialist.puntingYards),\n  specialistDerived("nfl-career-punting-average", specialist.puntingYards / specialist.punts, "punting yards / punts"),\n]);\n'
);

replaceOnce(
  "scripts/generate-football-factual-universe.mjs",
  '  const p = subject.position;\n  const facts = [];\n  const games = sumObserved(rows, "games");\n',
  '  const p = subject.position;\n  const facts = [];\n  const reviewedSpecialist = reviewedNflSpecialists.get(normalized(subject.name));\n  if (reviewedSpecialist) facts.push(...reviewedSpecialistFacts(reviewedSpecialist));\n  const games = sumObserved(rows, "games");\n'
);

replaceOnce(
  "scripts/generate-football-factual-universe.mjs",
  'for (const subject of promotedGames) { const facts = gameFacts(subject); if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-game" : "cfb-game", facts }); }\nrecords.sort((a, b) => a.subjectId.localeCompare(b.subjectId));\n',
  'for (const subject of promotedGames) { const facts = gameFacts(subject); if (facts.length) records.push({ subjectId: subject.id, scope: subject.league === "NFL" ? "nfl-game" : "cfb-game", facts }); }\nfor (const specialist of reviewedNflSpecialists.values()) {\n  const facts = reviewedSpecialistFacts(specialist);\n  const existing = records.find((record) => record.subjectId === specialist.subjectId);\n  if (existing) {\n    const ownedMetrics = new Set(existing.facts.map((fact) => fact.metricId));\n    existing.facts.push(...facts.filter((fact) => !ownedMetrics.has(fact.metricId)));\n  } else {\n    records.push({ subjectId: specialist.subjectId, scope: "nfl-player-career", facts });\n  }\n}\nconst canonicalCfbKickers = [\n  { id: "cfb-mike-nugent", name: "Mike Nugent", position: "K", school: "Ohio State" },\n  { id: "cfb-mason-crosby", name: "Mason Crosby", position: "K", school: "Colorado" },\n  { id: "cfb-dan-bailey", name: "Dan Bailey", position: "K", school: "Oklahoma State" },\n  { id: "cfb-roberto-aguayo", name: "Roberto Aguayo", position: "K", school: "Florida State" },\n];\nfor (const specialist of canonicalCfbKickers) {\n  const facts = cfbPlayerFacts(specialist);\n  if (!facts.length) continue;\n  const existing = records.find((record) => record.subjectId === specialist.id);\n  if (existing) {\n    const ownedMetrics = new Set(existing.facts.map((fact) => fact.metricId));\n    existing.facts.push(...facts.filter((fact) => !ownedMetrics.has(fact.metricId)));\n  } else {\n    records.push({ subjectId: specialist.id, scope: "cfb-player-career", facts });\n  }\n}\nrecords.sort((a, b) => a.subjectId.localeCompare(b.subjectId));\n'
);

replaceOnce(
  "src/features/back-room/footballFactualUniverseProjection.ts",
  '  {\n    id: "football-relationships-factual-universe",\n',
  '  {\n    id: "pfr-nfl-specialists-factual-universe",\n    publisher: "Pro Football Reference",\n    title: "Reviewed NFL specialist career records",\n    url: "https://www.pro-football-reference.com/",\n    reviewedOn: "2026-08-27",\n    coverage: "Reviewed career kicking/punting facts for recognizable NFL specialists used to close Stage 13 specialist coverage gaps",\n  },\n  {\n    id: "football-relationships-factual-universe",\n'
);

replaceOnce(
  "src/features/back-room/footballFactualStatsCore.ts",
  '  return projected.flatMap((record)=>{ const subjectId=canonicalFactSubjectId(record.subjectId); const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });\n',
  '  return projected.flatMap((record)=>{ const canonicalSubject=getFootballSubject(record.subjectId); if (!canonicalSubject) return []; const subjectId=canonicalSubject.id; const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });\n'
);

replaceOnce(
  "src/features/back-room/footballComparisonGeneration.ts",
  '    const forceAbsoluteTier = targetTier === "elite" || targetTier === "bad";\n',
  '    const repeatedTargetDepth = targets.filter((tier) => tier === targetTier).length;\n    const forceAbsoluteTier = (\n      targetTier === "elite"\n      || targetTier === "bad"\n      || (targetTier === "great" && availableTierCount(items, targetTier) >= Math.max(3, repeatedTargetDepth))\n    );\n'
);

console.log("Applied Stage 13 final repair.");
