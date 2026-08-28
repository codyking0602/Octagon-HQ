import { getFootballFactualRecord } from "./footballFactualStatsCore";
import {
  footballRecognitionCompletenessCandidates,
  type FootballRecognitionCompletenessCandidate,
} from "./footballRecognitionCompletenessEvidence";
import { footballHistoricalTierIssue } from "./footballRecognitionHistoricalPolicy";
import {
  queryFootballSubjects,
  type FootballSubjectProfile,
} from "./footballSubjectRegistry";

export type FootballLedgerAuditPool =
  | "QB" | "RB" | "WR" | "TE" | "OL" | "DL / EDGE" | "LB" | "Secondary" | "K / P"
  | "Player seasons" | "Team seasons" | "Franchises / programs" | "Head coaches" | "Eras / dynasties" | "Notable games / misc";
export type FootballLedgerAuditStatus = "green" | "yellow" | "red";
export type FootballFactualReadiness = "Full" | "Partial" | "Identity-only";
export type FootballLedgerSourceCoverage =
  | "inside-normalized-player-source"
  | "partially-overlaps-normalized-player-source"
  | "before-normalized-player-source"
  | "inside-relationship-source"
  | "partially-overlaps-relationship-source"
  | "before-relationship-source"
  | "unknown-career-window";

export interface FootballLedgerSubjectAuditRow {
  subjectId: string;
  name: string;
  league: "NFL" | "CFB";
  kind: FootballSubjectProfile["kind"];
  pool: FootballLedgerAuditPool;
  position?: string;
  tier: "A" | "B" | "C";
  season?: number;
  startSeason?: number;
  endSeason?: number;
  draftYear?: number;
  school?: string;
  franchises?: readonly string[];
  sourceCoverage: FootballLedgerSourceCoverage;
  sourceEraLimitations: readonly string[];
  numericFactCount: number;
  coreFactCount: number;
  hasRelationship: boolean;
  missing: readonly string[];
  majorMissingFactCount: number;
  readiness: FootballFactualReadiness;
  historicalTierIssue?: string;
  status: FootballLedgerAuditStatus;
}

export type FootballLedgerPlayerAuditRow = FootballLedgerSubjectAuditRow & { position: string };

export interface FootballLedgerRecognitionGap {
  name: string;
  league: "NFL" | "CFB";
  kind: string;
  expectedTier: "A" | "B";
  actualSubjectId?: string;
  actualTier?: "A" | "B" | "C" | "D";
  evidenceFamily: FootballRecognitionCompletenessCandidate["evidenceFamily"];
  source: string;
  reason: "missing-from-canonical-a-c" | "tier-below-independent-evidence";
}

export interface FootballLedgerPoolSummary {
  league: "NFL" | "CFB";
  pool: FootballLedgerAuditPool;
  universeCount: number;
  tierCounts: Readonly<Record<"A" | "B" | "C", number>>;
  readinessCounts: Readonly<Record<FootballFactualReadiness, number>>;
  majorMissingFactCount: number;
  historicalTierReviewCount: number;
  independentOmissionCandidateCount: number;
  sourceEraLimitations: readonly string[];
}

const TIERS = ["A", "B", "C"] as const;
const TIER_RANK = { A: 3, B: 2, C: 1, D: 0 } as const;
const PLAYER_POOLS = ["QB", "RB", "WR", "TE", "OL", "DL / EDGE", "LB", "Secondary", "K / P"] as const;
const NON_PLAYER_POOLS = ["Player seasons", "Team seasons", "Franchises / programs", "Head coaches", "Eras / dynasties", "Notable games / misc"] as const;
const ALL_POOLS = [...PLAYER_POOLS, ...NON_PLAYER_POOLS] as const;

function playerPool(position?: string): (typeof PLAYER_POOLS)[number] | null {
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

function poolFor(subject: FootballSubjectProfile): FootballLedgerAuditPool | null {
  if (subject.kind === "player-career") return playerPool(subject.position);
  if (subject.kind === "player-season") return "Player seasons";
  if (subject.kind === "team-season") return "Team seasons";
  if (subject.kind === "franchise" || subject.kind === "program") return "Franchises / programs";
  if (subject.kind === "coach") return "Head coaches";
  if (subject.kind === "program-era") return "Eras / dynasties";
  if (subject.kind === "game") return "Notable games / misc";
  return null;
}

function normalized(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function sourceCoverage(subject: FootballSubjectProfile, hasCoreFact: boolean): FootballLedgerSourceCoverage {
  if (subject.kind === "player-career" || subject.kind === "player-season") {
    const earliest = subject.league === "NFL" ? 1999 : 2014;
    const end = subject.endSeason ?? subject.season;
    const start = subject.startSeason ?? subject.season;
    if (end != null && end < earliest) return "before-normalized-player-source";
    if (start != null && start < earliest) return "partially-overlaps-normalized-player-source";
    if (start != null || end != null) return "inside-normalized-player-source";
    if (subject.league === "CFB" && subject.draftYear != null) {
      return subject.draftYear <= earliest ? "before-normalized-player-source" : "inside-normalized-player-source";
    }
    const provider = subject.league === "NFL" ? "nflverse" : "cfbfastR";
    if (subject.sourceIdentityKeys.some((key) => key.provider === provider) && hasCoreFact) return "inside-normalized-player-source";
    return "unknown-career-window";
  }
  const earliest = subject.league === "NFL" ? 1999 : 2002;
  const end = subject.endSeason ?? subject.season;
  const start = subject.startSeason ?? subject.season;
  if (end != null && end < earliest) return "before-relationship-source";
  if (start != null && start < earliest) return "partially-overlaps-relationship-source";
  return "inside-relationship-source";
}

function sourceEraLimitations(subject: FootballSubjectProfile, coverage: FootballLedgerSourceCoverage) {
  const notes: string[] = [];
  if (coverage === "before-normalized-player-source") notes.push(`${subject.league} normalized player stats do not reach this career/season`);
  if (coverage === "partially-overlaps-normalized-player-source") notes.push(`${subject.league} normalized player stats cover only part of this career/season`);
  if (coverage === "unknown-career-window") notes.push("career timing is unresolved, so normalized-source completeness cannot be inferred");
  if (coverage === "before-relationship-source") notes.push(`${subject.league} relationship results do not reach this subject's historical window`);
  if (coverage === "partially-overlaps-relationship-source") notes.push(`${subject.league} relationship results cover only part of this subject's historical window`);
  if (subject.league === "CFB" && (subject.kind === "player-career" || subject.kind === "player-season")) notes.push("normalized CFB player production begins in 2014");
  if (subject.league === "CFB" && !["player-career", "player-season"].includes(subject.kind)) notes.push("normalized CFB relationship coverage begins in 2002");
  if (subject.league === "NFL") notes.push(subject.kind === "player-career" || subject.kind === "player-season" ? "normalized NFL player production begins in 1999" : "normalized NFL relationship coverage begins in 1999");
  return [...new Set(notes)];
}

function hasRelationship(subject: FootballSubjectProfile) {
  return Boolean(
    subject.school || subject.franchises?.length || subject.teamId || subject.playerId || subject.coachId
    || subject.draftYear != null || subject.season != null || subject.sourceIdentityKeys.length,
  );
}

function hasMetric(metricIds: readonly string[], pattern: RegExp) {
  return metricIds.some((metricId) => pattern.test(metricId));
}

function playerCareerGroups(pool: FootballLedgerAuditPool, metricIds: readonly string[], relationship: boolean) {
  const groups: [string, boolean][] = [["identity/team-school relationship", relationship]];
  if (pool === "QB") groups.push(["QB passing facts", hasMetric(metricIds, /passing-(yards|touchdowns|attempts|completions)|passer-rating|completion-percentage/)]);
  else if (pool === "RB") groups.push(["RB rushing/scrimmage facts", hasMetric(metricIds, /rushing-(yards|touchdowns|attempts)|scrimmage/)]);
  else if (pool === "WR" || pool === "TE") groups.push([`${pool} receiving facts`, hasMetric(metricIds, /receiving-(yards|touchdowns)|receptions|targets/)]);
  else if (pool === "OL") groups.push(["OL starts/draft/honors/continuity context", relationship || hasMetric(metricIds, /start|draft|all-pro|all-america|award|honor/)]);
  else if (pool === "DL / EDGE") groups.push(["DL/EDGE disruption facts", hasMetric(metricIds, /sack|tackle-for-loss|forced-fumble/)]);
  else if (pool === "LB") groups.push(["LB tackle/disruption/turnover facts", hasMetric(metricIds, /tackle|sack|interception|forced-fumble/)]);
  else if (pool === "Secondary") groups.push(["secondary interception/PBU/tackle facts", hasMetric(metricIds, /interception|pass-breakup|passes-defended|tackle/)]);
  else if (pool === "K / P") groups.push(["specialist kicking/punting facts", hasMetric(metricIds, /field-goal|punt/)]);
  return groups;
}

function readinessGroups(subject: FootballSubjectProfile, pool: FootballLedgerAuditPool, metricIds: readonly string[], relationship: boolean) {
  if (subject.kind === "player-career") return playerCareerGroups(pool, metricIds, relationship);
  if (subject.kind === "player-season") return [
    ["bounded season identity", subject.season != null || subject.startSeason === subject.endSeason],
    ["bounded season facts", metricIds.length > 0 && hasMetric(metricIds, /season|team-|game|passing|rushing|receiving|sack|tackle|interception|field-goal|punt/)],
  ] as [string, boolean][];
  if (subject.kind === "team-season") return [
    ["season record", hasMetric(metricIds, /team-(overall-)?wins|team-losses|team-overall-losses/)],
    ["season scoring/result facts", hasMetric(metricIds, /points-for|points-against|postseason|title|championship/)],
  ] as [string, boolean][];
  if (subject.kind === "franchise" || subject.kind === "program") return [
    ["organization results", hasMetric(metricIds, /program-wins|franchise-wins/)],
    ["organization postseason/championship context", hasMetric(metricIds, /postseason|playoff|title|super-bowl/)],
  ] as [string, boolean][];
  if (subject.kind === "coach") return [
    ["coaching results", hasMetric(metricIds, /coach.*wins|coach.*losses/)],
    ["coaching championship/postseason context", hasMetric(metricIds, /coach.*title|coach.*playoff|coach.*championship/)],
  ] as [string, boolean][];
  if (subject.kind === "program-era") return [
    ["objective era results", hasMetric(metricIds, /era-wins|era-losses/)],
    ["era championship/postseason context", hasMetric(metricIds, /era.*title|era.*playoff|era.*championship|era.*appearance/)],
  ] as [string, boolean][];
  return [
    ["game final score", hasMetric(metricIds, /game-home-score/) && hasMetric(metricIds, /game-away-score/)],
    ["game context", hasMetric(metricIds, /game-postseason|game-championship|game-overtime/)],
  ] as [string, boolean][];
}

function auditSubject(subject: FootballSubjectProfile): FootballLedgerSubjectAuditRow | null {
  if (subject.league !== "NFL" && subject.league !== "CFB") return null;
  const pool = poolFor(subject);
  if (!pool || !TIERS.includes(subject.recognizabilityTier as typeof TIERS[number])) return null;
  const facts = getFootballFactualRecord(subject.id)?.facts ?? [];
  const metricIds = facts.map((fact) => fact.metricId as string);
  const relationship = hasRelationship(subject);
  const groups = readinessGroups(subject, pool, metricIds, relationship);
  const missing = groups.filter(([, present]) => !present).map(([label]) => label);
  const satisfied = groups.length - missing.length;
  const readiness: FootballFactualReadiness = missing.length === 0
    ? "Full"
    : (facts.length > 0 || relationship || satisfied > 0 ? "Partial" : "Identity-only");
  const coverage = sourceCoverage(subject, satisfied > 0);
  const historicalIssue = footballHistoricalTierIssue(
    subject.league,
    subject.endSeason ?? subject.season,
    subject.recognizabilityTier,
  );
  return {
    subjectId: subject.id,
    name: subject.name,
    league: subject.league,
    kind: subject.kind,
    pool,
    position: subject.position,
    tier: subject.recognizabilityTier as "A" | "B" | "C",
    season: subject.season,
    startSeason: subject.startSeason,
    endSeason: subject.endSeason,
    draftYear: subject.draftYear,
    school: subject.school,
    franchises: subject.franchises,
    sourceCoverage: coverage,
    sourceEraLimitations: sourceEraLimitations(subject, coverage),
    numericFactCount: facts.length,
    coreFactCount: satisfied,
    hasRelationship: relationship,
    missing,
    majorMissingFactCount: missing.length,
    readiness,
    ...(historicalIssue ? { historicalTierIssue: historicalIssue } : {}),
    status: readiness === "Full" ? "green" : readiness === "Partial" ? "yellow" : "red",
  };
}

function kindMatches(candidate: FootballRecognitionCompletenessCandidate, subject: FootballSubjectProfile) {
  if (candidate.kind === subject.kind) return true;
  return false;
}

function independentRecognitionGaps(subjects: readonly FootballSubjectProfile[]) {
  return footballRecognitionCompletenessCandidates.flatMap((candidate): FootballLedgerRecognitionGap[] => {
    const matches = subjects.filter((subject) => (
      subject.league === candidate.league
      && kindMatches(candidate, subject)
      && normalized(subject.name) === normalized(candidate.name)
      && (candidate.season == null || subject.season === candidate.season || subject.startSeason === candidate.season)
    ));
    const resolved = matches.sort((a, b) => TIER_RANK[b.recognizabilityTier] - TIER_RANK[a.recognizabilityTier])[0];
    if (!resolved) return [{
      name: candidate.name,
      league: candidate.league,
      kind: candidate.kind,
      expectedTier: candidate.minimumTier,
      evidenceFamily: candidate.evidenceFamily,
      source: candidate.source,
      reason: "missing-from-canonical-a-c",
    }];
    if (TIER_RANK[resolved.recognizabilityTier] < TIER_RANK[candidate.minimumTier]) return [{
      name: candidate.name,
      league: candidate.league,
      kind: candidate.kind,
      expectedTier: candidate.minimumTier,
      actualSubjectId: resolved.id,
      actualTier: resolved.recognizabilityTier,
      evidenceFamily: candidate.evidenceFamily,
      source: candidate.source,
      reason: "tier-below-independent-evidence",
    }];
    return [];
  }).sort((a, b) => `${a.league}:${a.kind}:${a.name}`.localeCompare(`${b.league}:${b.kind}:${b.name}`));
}

export function buildFootballLedgerAudit() {
  const queried = queryFootballSubjects({
    recognizabilityTiers: [...TIERS],
    includeProjectedCanonicalRecognition: true,
    includeProjectedSourceSubjects: true,
  });
  const subjects = [...new Map(queried.map((subject) => [subject.id, subject])).values()];
  const rows = subjects.map(auditSubject).filter((row): row is FootballLedgerSubjectAuditRow => row != null)
    .sort((a, b) => `${a.league}:${a.pool}:${a.tier}:${a.name}`.localeCompare(`${b.league}:${b.pool}:${b.tier}:${b.name}`));
  const players = rows.filter((row): row is FootballLedgerPlayerAuditRow => row.kind === "player-career" && row.position != null);
  const recognitionGaps = independentRecognitionGaps(subjects);
  const historicalTierIssues = rows.filter((row) => row.historicalTierIssue != null);
  const highPriorityFactGaps = rows.filter((row) => row.tier !== "C" && row.readiness !== "Full");
  const allMaterialFactGaps = rows.filter((row) => row.readiness === "Identity-only");
  const sourceEraFactGaps = allMaterialFactGaps.filter((row) => /before-|partially-overlaps/.test(row.sourceCoverage));
  const inSourceWindowFactGaps = allMaterialFactGaps.filter((row) => row.sourceCoverage === "inside-normalized-player-source" || row.sourceCoverage === "inside-relationship-source");
  const unknownCareerWindowFactGaps = allMaterialFactGaps.filter((row) => row.sourceCoverage === "unknown-career-window");
  const statusCounts = Object.fromEntries((["NFL", "CFB"] as const).map((league) => [league, Object.fromEntries(
    (["green", "yellow", "red"] as const).map((status) => [status, rows.filter((row) => row.league === league && row.status === status).length]),
  )]));
  const poolCounts = Object.fromEntries((["NFL", "CFB"] as const).map((league) => [league, Object.fromEntries(
    PLAYER_POOLS.map((pool) => [pool, players.filter((row) => row.league === league && row.pool === pool).length]),
  )]));
  const poolSummaries: FootballLedgerPoolSummary[] = [];
  for (const league of ["NFL", "CFB"] as const) for (const pool of ALL_POOLS) {
    const poolRows = rows.filter((row) => row.league === league && row.pool === pool);
    const omissions = recognitionGaps.filter((gap) => gap.league === league && (
      pool === "Head coaches" ? gap.kind === "coach"
        : pool === "Team seasons" ? gap.kind === "team-season"
        : pool === "Franchises / programs" ? gap.kind === "franchise" || gap.kind === "program"
        : pool === "Eras / dynasties" ? gap.kind === "program-era"
        : pool === "Notable games / misc" ? gap.kind === "game"
        : pool === "Player seasons" ? gap.kind === "player-season"
        : gap.kind === "player-career"
    ));
    poolSummaries.push({
      league,
      pool,
      universeCount: poolRows.length,
      tierCounts: Object.fromEntries(TIERS.map((tier) => [tier, poolRows.filter((row) => row.tier === tier).length])) as Record<"A" | "B" | "C", number>,
      readinessCounts: Object.fromEntries((["Full", "Partial", "Identity-only"] as const).map((readiness) => [readiness, poolRows.filter((row) => row.readiness === readiness).length])) as Record<FootballFactualReadiness, number>,
      majorMissingFactCount: poolRows.reduce((sum, row) => sum + row.majorMissingFactCount, 0),
      historicalTierReviewCount: poolRows.filter((row) => row.historicalTierIssue).length,
      independentOmissionCandidateCount: omissions.length,
      sourceEraLimitations: [...new Set(poolRows.flatMap((row) => row.sourceEraLimitations))],
    });
  }
  return {
    schemaVersion: 3,
    denominator: "canonical footballSubjectRegistry A/B/C universe after projected recognition/source reconciliation",
    subjectCount: rows.length,
    playerCount: players.length,
    statusCounts,
    poolCounts,
    poolSummaries,
    recognitionGaps,
    independentOmissionCandidates: recognitionGaps,
    historicalTierIssues,
    highPriorityFactGaps,
    allMaterialFactGaps,
    sourceEraFactGaps,
    inSourceWindowFactGaps,
    unknownCareerWindowFactGaps,
    rosterReview: rows.filter((row) => row.tier !== "C"),
    players,
    rows,
  } as const;
}

export function formatFootballLedgerAuditMarkdown(audit = buildFootballLedgerAudit()) {
  const lines = [
    "# Football Knowledge Ledger — Stage 13.5 Human Review",
    "",
    `Canonical A/B/C subjects: **${audit.subjectCount.toLocaleString()}**`,
    `Independent omission candidates: **${audit.independentOmissionCandidates.length}**`,
    `Historical tier violations: **${audit.historicalTierIssues.length}**`,
    "",
    "Recognition decides membership. Facts decide readiness. Partial or identity-only subjects remain canonical and are only excluded from games whose factual requirements they cannot satisfy.",
    "",
  ];
  for (const league of ["NFL", "CFB"] as const) {
    lines.push(`## ${league}`, "", "| Pool | Universe | A | B | C | Full | Partial | Identity-only | Missing fact groups | Historical review | Omissions |", "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
    for (const summary of audit.poolSummaries.filter((row) => row.league === league)) {
      lines.push(`| ${summary.pool} | ${summary.universeCount} | ${summary.tierCounts.A} | ${summary.tierCounts.B} | ${summary.tierCounts.C} | ${summary.readinessCounts.Full} | ${summary.readinessCounts.Partial} | ${summary.readinessCounts["Identity-only"]} | ${summary.majorMissingFactCount} | ${summary.historicalTierReviewCount} | ${summary.independentOmissionCandidateCount} |`);
    }
    lines.push("");
  }
  lines.push("## Independent omission queue", "");
  if (!audit.independentOmissionCandidates.length) lines.push("None.", "");
  else for (const gap of audit.independentOmissionCandidates) lines.push(`- ${gap.league} ${gap.kind}: **${gap.name}** — ${gap.reason}; expected ${gap.expectedTier}+ from ${gap.evidenceFamily}.`);
  lines.push("", "## Historical tier review queue", "");
  if (!audit.historicalTierIssues.length) lines.push("None.", "");
  else for (const row of audit.historicalTierIssues) lines.push(`- ${row.league} ${row.pool}: **${row.name}** (${row.tier}) — ${row.historicalTierIssue}`);
  lines.push("", "## Factual-readiness problems", "");
  for (const row of audit.rows.filter((candidate) => candidate.readiness !== "Full")) {
    lines.push(`- ${row.league} ${row.pool}: **${row.name}** — ${row.tier}, ${row.readiness}; missing ${row.missing.join(", ") || "no required group"}; source limits: ${row.sourceEraLimitations.join("; ") || "none"}.`);
  }
  return `${lines.join("\n")}\n`;
}

export const footballLedgerAudit = buildFootballLedgerAudit();
