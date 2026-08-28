import factualProjectionJson from "../../../data/generated/football/factual-universe-projection.json";
import coverageMatrixJson from "../../../data/generated/football/factual-coverage-matrix.json";
import type { FootballFactSource, FootballFactualRecord } from "./footballFactualStatsCore";

export const footballFactualUniverseSources: readonly FootballFactSource[] = [
  {
    id: "nflverse-factual-universe",
    publisher: "nflverse",
    title: "Pinned NFL factual-universe projection",
    url: "https://github.com/nflverse/nflverse-data",
    reviewedOn: "2026-08-27",
    coverage: "Normalized NFL player/team facts from 1999 through the completed 2025 season, gated to Stage 12 A-C source identities",
  },
  {
    id: "cfbfast-r-factual-universe",
    publisher: "cfbfastR",
    title: "Pinned CFB factual-universe projection",
    url: "https://github.com/sportsdataverse/cfbfastR-data",
    reviewedOn: "2026-08-27",
    coverage: "Normalized CFB player facts from 2014-2025, gated to Stage 12 A-C source identities",
  },
  {
    id: "football-relationships-factual-universe",
    publisher: "nflverse / cfbfastR",
    title: "Pinned football relationship factual projection",
    url: "https://github.com/nflverse/nfldata",
    reviewedOn: "2026-08-27",
    coverage: "NFL 1999-2025 and CFB 2002-2025 team-season, program/franchise, postseason and notable-game relationships",
  },
] as const;

export const footballFactualUniverseProjectedRecords = factualProjectionJson.records as unknown as readonly FootballFactualRecord[];

/** Source-projection audit artifact. The canonical Stage 13 readiness matrix is computed from the registry post-gate universe. */
export const footballFactualUniverseSourceCoverageMatrix = coverageMatrixJson;
