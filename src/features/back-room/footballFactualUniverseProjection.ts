import factualProjectionJson from "../../../data/generated/football/factual-universe-projection.json";
import coverageMatrixJson from "../../../data/generated/football/factual-coverage-matrix.json";
import type { FootballFactSource, FootballFactualRecord } from "./footballFactualStatsCore";
import { footballProgramEraSeeds } from "./footballProgramEraSeeds";

export const footballFactualUniverseSources: readonly FootballFactSource[] = [
  {
    id: "nflverse-factual-universe",
    publisher: "nflverse",
    title: "Pinned NFL factual-universe projection",
    url: "https://github.com/nflverse/nflverse-data",
    reviewedOn: "2026-08-27",
    coverage: "Normalized NFL player/team facts from 1999 through the completed 2025 season, gated to canonical Stage 12 A-C player identities",
  },
  {
    id: "cfbfast-r-factual-universe",
    publisher: "cfbfastR",
    title: "Pinned CFB factual-universe projection",
    url: "https://github.com/sportsdataverse/cfbfastR-data",
    reviewedOn: "2026-08-27",
    coverage: "Normalized CFB player facts from 2014-2025, gated to canonical Stage 12 A-C player identities",
  },
  {
    id: "football-relationships-factual-universe",
    publisher: "nflverse / cfbfastR",
    title: "Pinned football relationship factual projection",
    url: "https://github.com/nflverse/nfldata",
    reviewedOn: "2026-08-27",
    coverage: "NFL 1999-2025 and CFB 2002-2025 team-season, program/franchise, postseason and notable-game relationships",
  },
  {
    id: "ncaa-fbs-championship-history",
    publisher: "NCAA",
    title: "College football national championship history",
    url: "https://www.ncaa.com/news/football/article/college-football-national-championship-history",
    reviewedOn: "2026-08-28",
    coverage: "Official championship-history evidence for reviewed CFB Program Era national-title selections",
  },
] as const;

const footballProgramEraSeedById = new Map(footballProgramEraSeeds.map((seed) => [seed.id, seed]));
const rawProjectedSourceRecords = factualProjectionJson.records as unknown as readonly FootballFactualRecord[];
const projectedSourceRecords: readonly FootballFactualRecord[] = rawProjectedSourceRecords
  .flatMap((record) => {
    if (record.scope !== "cfb-program-era") return [record];
    const seed = footballProgramEraSeedById.get(record.subjectId);
    // Program Era identity belongs to the reviewed seed owner. Relationship-era records for retired identities do not survive.
    if (!seed) return [];

    // The relationship corpus starts in 2002. NCAA championship history therefore owns title counts for every reviewed era,
    // while relationship W/L survives only when the source covers the era from its first season.
    const facts = record.facts.filter((fact) => {
      if (fact.metricId === "cfb-era-national-titles") return false;
      if (seed.startSeason < 2002 && (fact.metricId === "cfb-era-wins" || fact.metricId === "cfb-era-losses")) return false;
      return true;
    });
    return facts.length > 0 ? [{ ...record, facts }] : [];
  });

const projectedRecordBySubjectId = new Map(
  projectedSourceRecords.map((record) => [record.subjectId, record] as const),
);

for (const seed of footballProgramEraSeeds) {
  const titleFact = {
    metricId: "cfb-era-national-titles" as const,
    value: seed.titleSelectionSeasons.length,
    evidence: {
      sourceIds: ["ncaa-fbs-championship-history"],
      kind: "reported" as const,
    },
  };
  const existing = projectedRecordBySubjectId.get(seed.id);
  projectedRecordBySubjectId.set(seed.id, existing
    ? { ...existing, scope: "cfb-program-era", facts: [...existing.facts, titleFact] }
    : { subjectId: seed.id, scope: "cfb-program-era", facts: [titleFact] });
}

/** One canonical projected record per subject; Program Era relationship facts and NCAA title facts share that record. */
export const footballFactualUniverseProjectedRecords: readonly FootballFactualRecord[] = [
  ...projectedRecordBySubjectId.values(),
];

/** Source-projection audit artifact. The canonical Stage 13 readiness matrix is computed from the registry post-gate universe. */
export const footballFactualUniverseSourceCoverageMatrix = coverageMatrixJson;
