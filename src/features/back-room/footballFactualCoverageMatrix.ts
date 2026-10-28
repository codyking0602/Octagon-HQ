import { footballFactualRecords, getFootballFactualRecord } from "./footballFactualStatsCore";
import { queryFootballSubjects, type FootballSubjectProfile } from "./footballSubjectRegistry";

export type FootballFactMetricFamily = "production" | "efficiency" | "defense" | "specialist" | "honors" | "team-success" | "relationship";

export function footballFactMetricFamily(metricId: string): FootballFactMetricFamily {
  if (/field-goal|punt/.test(metricId)) return "specialist";
  if (/all-pro|mvp|player-of-year|heisman|award|hall-of-fame/.test(metricId)) return "honors";
  if (/sack|tackle|defensive|forced-fumble|pass-breakup|passes-defended/.test(metricId)) return "defense";
  if (/percentage|per-attempt|per-game|rating|average|ratio/.test(metricId)) return "efficiency";
  if (/postseason|playoff|super-bowl|national-title|championship/.test(metricId)) return "team-success";
  if (/game-|program-|franchise-/.test(metricId)) return "relationship";
  return "production";
}

const tiers = ["A", "B", "C"] as const;
const playerPools = [
  ["QB", ["QB"]], ["RB", ["RB"]], ["WR", ["WR"]], ["TE", ["TE"]], ["OL", ["OL"]],
  ["DL / EDGE", ["DL"]], ["LB", ["LB"]], ["Secondary", ["DB"]], ["K / P", ["K", "P"]],
] as const;

function postGateSubjects() {
  const rows = queryFootballSubjects({ recognizabilityTiers: [...tiers], includeProjectedCanonicalRecognition: true, includeProjectedSourceSubjects: true });
  return [...new Map(rows.map((subject) => [subject.id, subject])).values()];
}

function hasCanonicalRelationship(subject: FootballSubjectProfile) {
  if (subject.kind === "player-career") return Boolean(subject.school || subject.franchises?.length || subject.draftYear != null || subject.sourceIdentityKeys.length);
  return Boolean(subject.teamId || subject.coachId || subject.sourceIdentityKeys.length || subject.season != null || subject.startSeason != null || subject.endSeason != null);
}

function familiesFor(subject: FootballSubjectProfile) {
  const families = new Set<FootballFactMetricFamily>((getFootballFactualRecord(subject.id)?.facts ?? []).map((fact) => footballFactMetricFamily(fact.metricId)));
  if (hasCanonicalRelationship(subject)) families.add("relationship");
  return families;
}

export function buildFootballFactualCoverageMatrix() {
  const universe = postGateSubjects();
  const rows = [];
  for (const league of ["NFL", "CFB"] as const) {
    for (const [pool, positions] of playerPools) {
      const subjects = universe.filter((subject) => subject.kind === "player-career" && subject.league === league && subject.position && (positions as readonly string[]).includes(subject.position));
      const ready = subjects.filter((subject) => (getFootballFactualRecord(subject.id)?.facts.length ?? 0) > 0 || hasCanonicalRelationship(subject));
      const familyCounts: Partial<Record<FootballFactMetricFamily, number>> = {};
      for (const subject of subjects) for (const family of familiesFor(subject)) familyCounts[family] = (familyCounts[family] ?? 0) + 1;
      rows.push({ league, pool, universeSubjects: subjects.length, subjectsReady: ready.length, subjectsWithNumericFacts: subjects.filter((subject) => getFootballFactualRecord(subject.id)?.facts.length).length, readinessPct: subjects.length ? Number((ready.length / subjects.length * 100).toFixed(1)) : 0, metricFamilySubjectCounts: familyCounts });
    }
  }
  for (const league of ["NFL", "CFB"] as const) {
    for (const kind of ["team-season", "franchise", "program", "coach-stop", "era", "game"] as const) {
      const subjects = universe.filter((subject) => subject.league === league && subject.kind === kind);
      if (!subjects.length) continue;
      const ready = subjects.filter((subject) => (getFootballFactualRecord(subject.id)?.facts.length ?? 0) > 0 || hasCanonicalRelationship(subject));
      rows.push({ league, pool: kind, universeSubjects: subjects.length, subjectsReady: ready.length, subjectsWithNumericFacts: subjects.filter((subject) => getFootballFactualRecord(subject.id)?.facts.length).length, readinessPct: Number((ready.length / subjects.length * 100).toFixed(1)), metricFamilySubjectCounts: {} });
    }
  }
  return { schemaVersion: 1, universeSubjects: universe.length, factualRecordCount: footballFactualRecords.length, rows, denominator: "canonical Stage 12 A/B/C registry universe (curated + recognition bridge + source projection); Tier D excluded" } as const;
}

export const footballFactualCoverageMatrix = buildFootballFactualCoverageMatrix();
