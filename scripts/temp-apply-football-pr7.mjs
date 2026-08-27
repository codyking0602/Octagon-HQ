import fs from "node:fs";

function patch(path, transforms) {
  let text = fs.readFileSync(path, "utf8");
  for (const [label, before, after] of transforms) {
    if (!text.includes(before)) throw new Error(`${path}: missing ${label}`);
    text = text.replace(before, after);
  }
  fs.writeFileSync(path, text);
}

patch("src/features/back-room/footballSubjectRegistry.ts", [
  [
    "knowledge override type",
    `  type FootballSubjectKnowledgeMetadata,\n} from "./footballSubjectEligibility";`,
    `  type FootballSubjectKnowledgeMetadata,\n  type FootballSubjectKnowledgeOverride,\n} from "./footballSubjectEligibility";`,
  ],
  [
    "runtime projection import",
    `import { footballProjectedPlayerSubjects } from "./footballRecognizabilityProjection";`,
    `import { footballProjectedPlayerSubjects } from "./footballRecognizabilityProjection";\nimport {\n  footballFindLeaderProjectedAdditionalSubjects,\n  footballFindLeaderProjectedKnowledgeOverride,\n} from "./footballFindLeaderRuntimeProjection";`,
  ],
  [
    "enrich override signature",
    `function enrichFootballSubject(subject: FootballCanonicalSubject): FootballSubjectProfile {`,
    `function enrichFootballSubject(\n  subject: FootballCanonicalSubject,\n  knowledgeOverride?: FootballSubjectKnowledgeOverride,\n): FootballSubjectProfile {`,
  ],
  [
    "enrich override use",
    `  const knowledgeMetadata = buildFootballSubjectKnowledgeMetadata(subject);`,
    `  const knowledgeMetadata = buildFootballSubjectKnowledgeMetadata(subject, knowledgeOverride);`,
  ],
  [
    "projected additional subjects",
    `const projectedSourceSubjects: readonly FootballSubjectProfile[] = footballProjectedPlayerSubjects\n  .filter((subject) => !canonicalPlayerNameKeys.has(\`${subject.league}:\${subject.name.toLowerCase()}\`))\n  .map(enrichFootballSubject);`,
    `const projectedSourceSubjects: readonly FootballSubjectProfile[] = footballProjectedPlayerSubjects\n  .filter((subject) => !canonicalPlayerNameKeys.has(\`${subject.league}:\${subject.name.toLowerCase()}\`))\n  .map(enrichFootballSubject);\n\nconst canonicalSubjectIds = new Set(footballSubjects.map((subject) => subject.id));\nconst projectedAdditionalSubjects: readonly FootballSubjectProfile[] = footballFindLeaderProjectedAdditionalSubjects\n  .filter((subject) => !canonicalSubjectIds.has(subject.id))\n  .map((subject) => enrichFootballSubject(subject, footballFindLeaderProjectedKnowledgeOverride(subject.id) ?? undefined));`,
  ],
  [
    "registry id universe",
    `for (const subject of [...footballSubjects, ...projectedSourceSubjects]) {`,
    `for (const subject of [...footballSubjects, ...projectedSourceSubjects, ...projectedAdditionalSubjects]) {`,
  ],
  [
    "query universe",
    `  const universe = query.includeProjectedSourceSubjects ? [...footballSubjects, ...projectedSourceSubjects] : footballSubjects;`,
    `  const universe = query.includeProjectedSourceSubjects\n    ? [...footballSubjects, ...projectedSourceSubjects, ...projectedAdditionalSubjects]\n    : footballSubjects;`,
  ],
]);

patch("src/features/back-room/footballFactualStatsCore.ts", [
  [
    "runtime factual import",
    `import { footballCfbChampionSeasonRows, footballQbCareerRows, footballRbCareerRows } from "./footballFactualStatsCoverage";`,
    `import { footballCfbChampionSeasonRows, footballQbCareerRows, footballRbCareerRows } from "./footballFactualStatsCoverage";\nimport { footballFindLeaderProjectedFactualRecords } from "./footballFindLeaderRuntimeProjection";`,
  ],
  [
    "runtime source ids",
    `  | "cfr-team-season-records";`,
    `  | "cfr-team-season-records"\n  | "nflverse-find-leader-projection"\n  | "cfbfast-r-find-leader-projection";`,
  ],
  [
    "runtime source definitions",
    `  { id: "cfr-2022-georgia", publisher: "College Football at Sports-Reference", title: "2022 Georgia team record", url: "https://www.sports-reference.com/cfb/schools/georgia/2022.html", reviewedOn: "2026-08-22", coverage: "Completed 2022 season" },\n] as const;`,
    `  { id: "cfr-2022-georgia", publisher: "College Football at Sports-Reference", title: "2022 Georgia team record", url: "https://www.sports-reference.com/cfb/schools/georgia/2022.html", reviewedOn: "2026-08-22", coverage: "Completed 2022 season" },\n  { id: "nflverse-find-leader-projection", publisher: "nflverse", title: "Pinned NFL historical player/team projection for Find the Leader", url: "https://github.com/nflverse/nflverse-data", reviewedOn: "2026-08-26", coverage: "Normalized regular-season NFL source data from 1999 through 2025, compacted to A-C recognizable Find the Leader subjects" },\n  { id: "cfbfast-r-find-leader-projection", publisher: "cfbfastR", title: "Pinned CFB historical player/team projection for Find the Leader", url: "https://github.com/sportsdataverse/cfbfastR-data", reviewedOn: "2026-08-26", coverage: "Normalized CFB player data from 2014 through 2025 and team-season relationships from 2002 through 2025, compacted to A-C recognizable Find the Leader subjects" },\n] as const;`,
  ],
  [
    "runtime factual merge",
    `  ...expandedFootballFactualRecords,\n]);`,
    `  ...expandedFootballFactualRecords,\n  ...footballFindLeaderProjectedFactualRecords,\n]);`,
  ],
]);

patch("src/features/back-room/footballFindLeaderModel.ts", [
  [
    "version bump",
    `export const FOOTBALL_FIND_LEADER_VERSION = "football-find-leader-v2";`,
    `export const FOOTBALL_FIND_LEADER_VERSION = "football-find-leader-v3";`,
  ],
  [
    "active career copy",
    `  "nfl-qb-career": "retired NFL quarterbacks",\n  "nfl-rb-career": "retired NFL running backs",`,
    `  "nfl-qb-career": "NFL quarterbacks",\n  "nfl-rb-career": "NFL running backs",`,
  ],
  [
    "deep query definitions",
    `const queryByDomain: Readonly<Record<FootballFindLeaderDomainId, FootballSubjectQuery>> = {\n  "nfl-qb-career": { kind: "player-career", league: "NFL", position: "QB" },\n  "nfl-rb-career": { kind: "player-career", league: "NFL", position: "RB" },\n  "nfl-qb-season": { kind: "player-season", league: "NFL", position: "QB" },\n  "nfl-team-season": { kind: "team-season", league: "NFL" },\n  "nfl-receiving-career": { kind: "player-career", league: "NFL", positions: ["WR", "TE"] },\n  "nfl-defense-career": { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },\n  "cfb-champion-season": { kind: "team-season", league: "CFB", nationalChampion: true },\n  "cfb-team-season": { kind: "team-season", league: "CFB" },\n  "cfb-player-rushing": { kind: "player-career", league: "CFB", positions: ["QB", "RB"] },\n  "cfb-player-receiving": { kind: "player-career", league: "CFB" },\n  "cfb-coach-career": { kind: "coach", league: "CFB" },\n};`,
    `const casualProjectedSubjectQuery = {\n  includeProjectedSourceSubjects: true,\n  recognizabilityTiers: ["A", "B", "C"],\n  casualEligible: true,\n} as const satisfies FootballSubjectQuery;\n\nconst queryByDomain: Readonly<Record<FootballFindLeaderDomainId, FootballSubjectQuery>> = {\n  "nfl-qb-career": { ...casualProjectedSubjectQuery, kind: "player-career", league: "NFL", position: "QB" },\n  "nfl-rb-career": { ...casualProjectedSubjectQuery, kind: "player-career", league: "NFL", position: "RB" },\n  "nfl-qb-season": { ...casualProjectedSubjectQuery, kind: "player-season", league: "NFL", position: "QB", sourceProvider: "nflverse" },\n  "nfl-team-season": { ...casualProjectedSubjectQuery, kind: "team-season", league: "NFL", sourceProvider: "nflverse" },\n  "nfl-receiving-career": { ...casualProjectedSubjectQuery, kind: "player-career", league: "NFL", positions: ["WR", "TE"] },\n  "nfl-defense-career": { ...casualProjectedSubjectQuery, kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },\n  "cfb-champion-season": { kind: "team-season", league: "CFB", nationalChampion: true },\n  "cfb-team-season": { ...casualProjectedSubjectQuery, kind: "team-season", league: "CFB", sourceProvider: "cfbfastR" },\n  "cfb-player-rushing": { ...casualProjectedSubjectQuery, kind: "player-career", league: "CFB", positions: ["QB", "RB"] },\n  "cfb-player-receiving": { ...casualProjectedSubjectQuery, kind: "player-career", league: "CFB" },\n  "cfb-coach-career": { kind: "coach", league: "CFB" },\n};`,
  ],
  [
    "active career subtitles",
    `  if (subject.position === "QB") return "Retired NFL quarterback";\n  if (subject.position === "RB") return "Retired NFL running back";`,
    `  if (subject.position === "QB") return "NFL quarterback career";\n  if (subject.position === "RB") return "NFL running back career";`,
  ],
]);

patch("src/features/back-room/footballFindLeaderModel.test.ts", [
  [
    "receiving depth assertions",
    `    expect(footballFindLeaderMetricRows("nfl-receiving-receptions")).toHaveLength(17);\n    expect(footballFindLeaderMetricRows("nfl-receiving-yards")).toHaveLength(17);\n    expect(footballFindLeaderMetricRows("nfl-receiving-touchdowns")).toHaveLength(17);`,
    `    expect(footballFindLeaderMetricRows("nfl-receiving-receptions").length).toBeGreaterThan(40);\n    expect(footballFindLeaderMetricRows("nfl-receiving-yards").length).toBeGreaterThan(40);\n    expect(footballFindLeaderMetricRows("nfl-receiving-touchdowns").length).toBeGreaterThan(40);`,
  ],
  [
    "season team depth assertions",
    `    expect(seasonIds).toHaveLength(11);\n    expect(teamIds).toHaveLength(18);`,
    `    expect(seasonIds.length).toBeGreaterThan(50);\n    expect(teamIds.length).toBeGreaterThan(30);`,
  ],
]);
