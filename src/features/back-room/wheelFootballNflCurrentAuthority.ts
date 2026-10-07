import contractsArtifact from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import qbGradesArtifact from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rbGradesArtifact from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wrGradesArtifact from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import teGradesArtifact from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import frontSevenGradesArtifact from "../../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondaryGradesArtifact from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";

export const WHEEL_NFL_GM_AUTHORITY = {
  contractFile: "wheel-nfl-gm-contracts-2026-10-05.json",
  gradeFiles: {
    QB: "wheel-nfl-qb-grades-2026-10-03.json",
    RB: "wheel-nfl-rb-grades-2026-10-03.json",
    WR: "wheel-nfl-wr-grades-2026-10-03.json",
    TE: "wheel-nfl-te-grades-2026-10-03.json",
    "Front Seven": "wheel-nfl-front-seven-grades-2026-10-03.json",
    Secondary: "wheel-nfl-secondary-grades-2026-10-03.json",
  },
} as const;

export {
  contractsArtifact,
  qbGradesArtifact,
  rbGradesArtifact,
  wrGradesArtifact,
  teGradesArtifact,
  frontSevenGradesArtifact,
  secondaryGradesArtifact,
};
