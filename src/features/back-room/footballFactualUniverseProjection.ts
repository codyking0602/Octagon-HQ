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

const projectedSourceRecords = factualProjectionJson.records as unknown as readonly FootballFactualRecord[];
const footballProgramEraProjectedRecords: readonly FootballFactualRecord[] = footballProgramEraSeeds.map((seed) => ({
  subjectId: seed.id,
  scope: "cfb-program-era",
  facts: [{
    metricId: "cfb-era-national-titles",
    value: seed.titleSelectionSeasons.length,
    evidence: {
      sourceIds: ["ncaa-fbs-championship-history"],
      kind: "reported",
    },
  }],
}));

export const footballFactualUniverseProjectedRecords: readonly FootballFactualRecord[] = [
  ...projectedSourceRecords,
  ...footballProgramEraProjectedRecords,
];

/** Source-projection audit artifact. The canonical Stage 13 readiness matrix is computed from the registry post-gate universe. */
export const footballFactualUniverseSourceCoverageMatrix = coverageMatrixJson;
