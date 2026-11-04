import rosterExpansionArtifact from "../../../data/curated/football/nfl/gm-nfl-roster-expansion-2026-11-03.json";
import contractsArtifact from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import qbGradesArtifact from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-27.json";
import rbGradesArtifact from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-27.json";
import wrGradesArtifact from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-27.json";
import teGradesArtifact from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-28.json";
import frontSevenGradesArtifact from "../../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondaryGradesArtifact from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-28.json";

export const WHEEL_NFL_GM_AUTHORITY = {
  contractFile: "wheel-nfl-gm-contracts-2026-10-05.json",
  gradeFiles: {
    QB: "wheel-nfl-qb-grades-2026-10-27.json",
    RB: "wheel-nfl-rb-grades-2026-10-27.json",
    WR: "wheel-nfl-wr-grades-2026-10-27.json",
    TE: "wheel-nfl-te-grades-2026-10-28.json",
    "Front Seven": "wheel-nfl-front-seven-grades-2026-10-03.json",
    Secondary: "wheel-nfl-secondary-grades-2026-10-28.json",
  },
} as const;

export {
  rosterExpansionArtifact,
  contractsArtifact,
  qbGradesArtifact,
  rbGradesArtifact,
  wrGradesArtifact,
  teGradesArtifact,
  frontSevenGradesArtifact,
  secondaryGradesArtifact,
};
