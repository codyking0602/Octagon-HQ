import projectionJson from "../../../data/generated/football/find-leader-runtime-projection.json";
import type {
  FootballFactMetricId,
  FootballFactScope,
  FootballFactSourceId,
  FootballFactualRecord,
} from "./footballFactualStatsCore";

interface ProjectedSubject {
  id: string;
  name: string;
  kind: "player-career" | "player-season" | "team-season";
  league: "NFL" | "CFB";
  startSeason?: number;
}

interface ProjectedRecord {
  subjectId: string;
  scope: FootballFactScope;
  facts: readonly [FootballFactMetricId, number][];
}

export type FootballFactualRelationshipKind =
  | "draft-selection"
  | "played-for"
  | "played-at"
  | "won-award"
  | "season-of"
  | "team-season-of";

export interface FootballFactualRelationship {
  subjectId: string;
  kind: FootballFactualRelationshipKind;
  targetId?: string;
  targetName?: string;
  season?: number;
  details?: Readonly<Record<string, string | number | undefined>>;
  evidenceSource: FootballFactSourceId;
}

export interface FootballFactualCoverageRow {
  league: "NFL" | "CFB";
  pool: "QB" | "RB" | "WR" | "TE" | "OL" | "DL / EDGE" | "LB" | "Secondary" | "K / P";
  eligibleSubjectCount: number;
  production: number;
  efficiency: number;
  honors: number;
  draft: number;
  relationships: number;
}

const rawSubjects = projectionJson.subjects as readonly ProjectedSubject[];
const rawRecords = projectionJson.records as unknown as readonly ProjectedRecord[];
const subjectById = new Map(rawSubjects.map((subject) => [subject.id, subject]));

const sourceIds = projectionJson.sourceIds as {
  NFL: FootballFactSourceId;
  CFB: FootballFactSourceId;
  NFL_DRAFT: FootballFactSourceId;
  CFB_HONORS: FootballFactSourceId;
};

const nflDraftMetrics = new Set<FootballFactMetricId>([
  "nfl-first-team-all-pros",
  "nfl-pro-bowl-selections",
  "nfl-hall-of-fame",
]);

const derivedFormulaByMetric: Partial<Record<FootballFactMetricId, string>> = {
  "nfl-career-passer-rating": "NFL passer-rating formula from complete projected career passing totals",
  "nfl-career-completion-percentage": "completions / attempts * 100",
  "nfl-career-passing-yards-per-attempt": "passing yards / attempts",
  "nfl-career-passing-touchdown-percentage": "passing touchdowns / attempts * 100",
  "nfl-career-rushing-yards-per-attempt": "rushing yards / carries",
  "nfl-career-field-goal-percentage": "field goals made / field goals attempted * 100",
  "nfl-career-punting-average": "punting yards / punts",
  "nfl-season-passer-rating": "NFL passer-rating formula from projected season passing totals",
  "nfl-team-points-per-game": "points for / overall games",
  "nfl-team-opponent-points-per-game": "points against / overall games",
  "nfl-team-punting-average": "punting yards / punts",
  "cfb-best-season-passer-rating": "NCAA passer-efficiency formula applied per season; maximum observed season value",
  "cfb-best-season-completion-percentage": "season completions / attempts * 100; maximum observed season value",
  "cfb-best-season-passing-yards-per-attempt": "season passing yards / attempts; maximum observed season value",
  "cfb-best-season-rushing-yards-per-attempt": "season rushing yards / attempts; maximum observed season value",
  "cfb-best-season-receiving-yards-per-reception": "season receiving yards / receptions; maximum observed season value",
  "cfb-best-season-field-goal-percentage": "season field goals made / attempted * 100; maximum observed season value",
  "cfb-team-points-per-game": "points for / overall games",
  "cfb-team-opponent-points-per-game": "points against / overall games",
  "cfb-team-point-differential": "points for - points against",
  "cfb-team-scoring-margin-per-game": "(points for - points against) / overall games",
  "cfb-team-points-for-against-ratio": "points for / points against",
  "cfb-team-differential-rate-percentage": "(points for - points against) / points for * 100",
  "cfb-team-total-points": "points for + points against",
};

function evidenceSource(subject: ProjectedSubject, metricId: FootballFactMetricId): FootballFactSourceId {
  if (nflDraftMetrics.has(metricId)) return sourceIds.NFL_DRAFT;
  if (metricId === "cfb-major-national-award-wins") return sourceIds.CFB_HONORS;
  // The checksum-pinned PFR draft release supplies pre-1999 career totals retained by the projection; modern
  // normalized nflverse rows independently reconcile matching values before the generator will emit them.
  if (subject.league === "NFL" && subject.kind === "player-career" && (subject.startSeason ?? 9999) < 1999) return sourceIds.NFL_DRAFT;
  return subject.league === "NFL" ? sourceIds.NFL : sourceIds.CFB;
}

/**
 * Stage 13 source-backed facts. The legacy JSON filename is retained to avoid creating a second generated corpus;
 * factual ownership is here and footballFactualStatsCore remains the only public lookup owner.
 */
export const footballFactualUniverseProjectedRecords: readonly FootballFactualRecord[] = rawRecords.map((record) => {
  const subject = subjectById.get(record.subjectId);
  if (!subject) throw new Error(`Stage 13 projected fact is missing subject ${record.subjectId}.`);
  return {
    subjectId: record.subjectId,
    scope: record.scope,
    facts: record.facts.map(([metricId, value]) => {
      const formula = derivedFormulaByMetric[metricId];
      return {
        metricId,
        value,
        evidence: formula
          ? { sourceIds: [evidenceSource(subject, metricId)], kind: "derived" as const, formula }
          : { sourceIds: [evidenceSource(subject, metricId)], kind: "reported" as const },
      };
    }),
  };
});

export const footballFactualRelationships = projectionJson.relationships as unknown as readonly FootballFactualRelationship[];

export const footballFactualCoverageMatrix = {
  ...projectionJson.coverageMatrix,
  playerPools: projectionJson.coverageMatrix.playerPools as readonly FootballFactualCoverageRow[],
};

export const FOOTBALL_FACTUAL_UNIVERSE_SUMMARY = projectionJson.summary;
export const FOOTBALL_FACTUAL_UNIVERSE_ELIGIBILITY = projectionJson.eligibility;
export const FOOTBALL_FACTUAL_UNIVERSE_SOURCE_INPUTS = projectionJson.generatedFrom;
