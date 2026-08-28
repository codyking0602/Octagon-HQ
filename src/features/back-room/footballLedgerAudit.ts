import { getFootballFactualRecord } from "./footballFactualStatsCore";
import {
  footballRecognitionEvidenceFor,
  footballRecognitionEvidenceRecords,
} from "./footballRecognitionEvidence";
import {
  getFootballSubject,
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "./footballSubjectRegistry";

export type FootballLedgerAuditPool =
  | "QB" | "RB" | "WR" | "TE" | "OL" | "DL / EDGE" | "LB" | "Secondary" | "K / P";
export type FootballLedgerAuditStatus = "green" | "yellow" | "red";

export interface FootballLedgerPlayerAuditRow {
  subjectId: string;
  name: string;
  league: "NFL" | "CFB";
  pool: FootballLedgerAuditPool;
  position: string;
  tier: "A" | "B" | "C";
  startSeason?: number;
  endSeason?: number;
  school?: string;
  franchises?: readonly string[];
  numericFactCount: number;
  coreFactCount: number;
  hasRelationship: boolean;
  expectsHonorFact: boolean;
  hasHonorFact: boolean;
  missing: readonly string[];
  status: FootballLedgerAuditStatus;
}

export interface FootballLedgerRecognitionGap {
  evidenceSubjectId: string;
  name: string;
  league: "NFL" | "CFB";
  kind: string;
  expectedTier: "A" | "B" | "C";
  actualSubjectId?: string;
  actualTier?: "A" | "B" | "C" | "D";
  reason: "missing-from-canonical-a-c" | "tier-below-reviewed-evidence";
}

const PLAYER_TIERS = ["A", "B", "C"] as const;
const TIER_RANK = { A: 3, B: 2, C: 1, D: 0 } as const;

function playerPool(position?: string): FootballLedgerAuditPool | null {
  if (position === "QB") return "QB";
  if (position === "RB") return "RB";
  if (position === "WR") return "WR";
  if (position === "TE") return "TE";
  if (position === "OL") return "OL";
  if (position === "DL") return "DL / EDGE";
  if (position === "LB") return "LB";
  if (position === "DB") return "Secondary";
  if (position === "K" || position === "P") return "K / P";
  return null;
}

function hasCanonicalRelationship(subject: FootballSubjectProfile) {
  return Boolean(
    subject.school
    || subject.franchises?.length
    || subject.draftYear != null
    || subject.sourceIdentityKeys.length,
  );
}

function isHonorMetric(metricId: string) {
  return /all-pro|pro-bowl|mvp|player-of-year|heisman|award|hall-of-fame|all-america|all-conference|outland|rimington|lombardi|butkus|bednarik|nagurski|thorpe|groza|ray-guy|mackey|biletnikoff|doak-walker/.test(metricId);
}

function isCoreMetric(pool: FootballLedgerAuditPool, metricId: string) {
  if (pool === "QB") return /passing-(yards|touchdowns|attempts|completions)|passer-rating|completion-percentage|passing-yards-per-attempt/.test(metricId);
  if (pool === "RB") return /rushing-(yards|touchdowns|attempts)|receiving-(yards|touchdowns)|receptions|scrimmage/.test(metricId);
  if (pool === "WR" || pool === "TE") return /receiving-(yards|touchdowns)|receptions|targets/.test(metricId);
  if (pool === "DL / EDGE" || pool === "LB" || pool === "Secondary") return /sack|tackle|defensive-interception|pass-breakup|passes-defended|forced-fumble|fumble-recover/.test(metricId);
  if (pool === "K / P") return /field-goal|punt/.test(metricId);
  return false;
}

function minimumCoreFacts(pool: FootballLedgerAuditPool) {
  if (pool === "OL") return 0;
  if (pool === "QB") return 3;
  if (pool === "RB" || pool === "WR" || pool === "TE") return 2;
  if (pool === "K / P") return 1;
  return 2;
}

function auditPlayer(subject: FootballSubjectProfile): FootballLedgerPlayerAuditRow | null {
  if (subject.kind !== "player-career" || (subject.league !== "NFL" && subject.league !== "CFB")) return null;
  const pool = playerPool(subject.position);
  if (!pool) return null;
  const facts = getFootballFactualRecord(subject.id)?.facts ?? [];
  const metricIds = facts.map((fact) => fact.metricId);
  const coreFactCount = metricIds.filter((metricId) => isCoreMetric(pool, metricId)).length;
  const evidence = footballRecognitionEvidenceFor(subject);
  const expectsHonorFact = evidence?.basis === "major-award-or-hall-of-fame";
  const hasHonorFact = metricIds.some(isHonorMetric);
  const hasRelationship = hasCanonicalRelationship(subject);
  const missing: string[] = [];

  if (!hasRelationship) missing.push("identity/team-school relationship");
  if (coreFactCount < minimumCoreFacts(pool)) {
    missing.push(pool === "OL" ? "position-appropriate context" : "core position production");
  }
  if (expectsHonorFact && !hasHonorFact) missing.push("known major honor/HOF fact");

  let status: FootballLedgerAuditStatus = "green";
  if (!hasRelationship || (pool !== "OL" && coreFactCount === 0)) status = "red";
  else if (missing.length || (pool !== "OL" && facts.length < minimumCoreFacts(pool) + 1)) status = "yellow";

  return {
    subjectId: subject.id,
    name: subject.name,
    league: subject.league,
    pool,
    position: subject.position ?? "unknown",
    tier: subject.recognizabilityTier as "A" | "B" | "C",
    startSeason: subject.startSeason,
    endSeason: subject.endSeason,
    school: subject.school,
    franchises: subject.franchises,
    numericFactCount: facts.length,
    coreFactCount,
    hasRelationship,
    expectsHonorFact,
    hasHonorFact,
    missing,
    status,
  };
}

function recognitionGaps(aCSubjects: readonly FootballSubjectProfile[]) {
  const aCIds = new Set(aCSubjects.map((subject) => subject.id));
  const gaps: FootballLedgerRecognitionGap[] = [];
  for (const evidence of footballRecognitionEvidenceRecords) {
    if (evidence.tier === "D") continue;
    const resolved = getFootballSubject(evidence.id);
    const present = resolved && aCIds.has(resolved.id);
    if (!present) {
      gaps.push({
        evidenceSubjectId: evidence.id,
        name: evidence.name,
        league: evidence.league,
        kind: evidence.kind,
        expectedTier: evidence.tier,
        actualSubjectId: resolved?.id,
        actualTier: resolved?.recognizabilityTier,
        reason: "missing-from-canonical-a-c",
      });
      continue;
    }
    if (TIER_RANK[resolved.recognizabilityTier] < TIER_RANK[evidence.tier]) {
      gaps.push({
        evidenceSubjectId: evidence.id,
        name: evidence.name,
        league: evidence.league,
        kind: evidence.kind,
        expectedTier: evidence.tier,
        actualSubjectId: resolved.id,
        actualTier: resolved.recognizabilityTier,
        reason: "tier-below-reviewed-evidence",
      });
    }
  }
  return gaps.sort((a, b) => `${a.league}:${a.kind}:${a.name}`.localeCompare(`${b.league}:${b.kind}:${b.name}`));
}

export function buildFootballLedgerAudit() {
  const aCSubjects = queryFootballSubjects({
    recognizabilityTiers: [...PLAYER_TIERS],
    includeProjectedCanonicalRecognition: true,
    includeProjectedSourceSubjects: true,
  });
  const uniqueSubjects = [...new Map(aCSubjects.map((subject) => [subject.id, subject])).values()];
  const players = uniqueSubjects
    .map(auditPlayer)
    .filter((row): row is FootballLedgerPlayerAuditRow => row != null)
    .sort((a, b) => `${a.league}:${a.pool}:${a.tier}:${a.name}`.localeCompare(`${b.league}:${b.pool}:${b.tier}:${b.name}`));

  const highPriorityFactGaps = players.filter((row) => row.tier !== "C" && row.status !== "green");
  const allMaterialFactGaps = players.filter((row) => row.status === "red");
  const rosterReview = players.filter((row) => row.tier !== "C");
  const statusCounts = Object.fromEntries(
    (["NFL", "CFB"] as const).map((league) => [league, Object.fromEntries(
      (["green", "yellow", "red"] as const).map((status) => [status, players.filter((row) => row.league === league && row.status === status).length]),
    )]),
  );
  const poolCounts = Object.fromEntries(
    (["NFL", "CFB"] as const).map((league) => [league, Object.fromEntries(
      (["QB", "RB", "WR", "TE", "OL", "DL / EDGE", "LB", "Secondary", "K / P"] as const).map((pool) => [pool, players.filter((row) => row.league === league && row.pool === pool).length]),
    )]),
  );

  return {
    schemaVersion: 1,
    denominator: "canonical Stage 12 A/B/C player universe after registry/query reconciliation",
    playerCount: players.length,
    statusCounts,
    poolCounts,
    recognitionGaps: recognitionGaps(uniqueSubjects),
    highPriorityFactGaps,
    allMaterialFactGaps,
    rosterReview,
    players,
  } as const;
}

export const footballLedgerAudit = buildFootballLedgerAudit();
