import recognitionProjectionJson from "../../../data/generated/football/recognizability-projection.json";
import {
  footballLedgerAudit,
  type FootballLedgerAuditPool,
  type FootballLedgerSubjectAuditRow,
} from "./footballLedgerAudit";
import { getFootballSubject } from "./footballSubjectRegistry";

export type FootballLedgerCensusTier = "A" | "B" | "C";
export type FootballLedgerCensusEraId = "historical" | "middle" | "modern" | "unknown" | "timeless";

export interface FootballLedgerCensusEraDefinition {
  id: FootballLedgerCensusEraId;
  label: string;
}

export interface FootballLedgerCensusRow {
  league: "NFL" | "CFB";
  pool: FootballLedgerAuditPool;
  eras: Readonly<Record<FootballLedgerCensusEraId, Readonly<Record<FootballLedgerCensusTier, number>>>>;
  tierCounts: Readonly<Record<FootballLedgerCensusTier, number>>;
  total: number;
}

interface RecognitionProjectionRecord {
  id: string;
  kind: string;
  name: string;
  league: "NFL" | "CFB";
  position?: string;
  school?: string;
  startSeason?: number;
  endSeason?: number;
}

const TIERS = ["A", "B", "C"] as const;
const ERA_IDS = ["historical", "middle", "modern", "unknown", "timeless"] as const;
const recognitionProjectionRecords = recognitionProjectionJson.records as readonly RecognitionProjectionRecord[];
const recognitionProjectionById = new Map(recognitionProjectionRecords.map((record) => [record.id, record]));
const recognitionProjectionByIdentity = new Map<string, RecognitionProjectionRecord[]>();

function normalizedIdentity(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

for (const record of recognitionProjectionRecords) {
  const key = `${record.kind}:${record.league}:${normalizedIdentity(record.name)}`;
  const values = recognitionProjectionByIdentity.get(key) ?? [];
  values.push(record);
  recognitionProjectionByIdentity.set(key, values);
}

export const FOOTBALL_LEDGER_CENSUS_POOLS: readonly FootballLedgerAuditPool[] = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL / EDGE",
  "LB",
  "Secondary",
  "K / P",
  "Player seasons",
  "Team seasons",
  "Franchises / programs",
  "Head coaches",
  "Eras / dynasties",
  "Notable games / misc",
] as const;

export const FOOTBALL_LEDGER_CENSUS_ERAS: Readonly<Record<"NFL" | "CFB", readonly FootballLedgerCensusEraDefinition[]>> = {
  NFL: [
    { id: "historical", label: "Pre-1970" },
    { id: "middle", label: "1970-1999" },
    { id: "modern", label: "2000-Today" },
    { id: "unknown", label: "Unknown" },
    { id: "timeless", label: "Timeless" },
  ],
  CFB: [
    { id: "historical", label: "Pre-1980" },
    { id: "middle", label: "1980-2004" },
    { id: "modern", label: "2005-Today" },
    { id: "unknown", label: "Unknown" },
    { id: "timeless", label: "Timeless" },
  ],
} as const;

function emptyTierCounts(): Record<FootballLedgerCensusTier, number> {
  return { A: 0, B: 0, C: 0 };
}

function emptyEraCounts(): Record<FootballLedgerCensusEraId, Record<FootballLedgerCensusTier, number>> {
  return {
    historical: emptyTierCounts(),
    middle: emptyTierCounts(),
    modern: emptyTierCounts(),
    unknown: emptyTierCounts(),
    timeless: emptyTierCounts(),
  };
}

function projectionKindFor(row: FootballLedgerSubjectAuditRow) {
  if (row.kind === "program-era") return "era";
  return row.kind;
}

function sourceProjectionWindowFor(row: FootballLedgerSubjectAuditRow) {
  const direct = recognitionProjectionById.get(row.subjectId);
  if (direct) return direct;

  const key = `${projectionKindFor(row)}:${row.league}:${normalizedIdentity(row.name)}`;
  const matches = recognitionProjectionByIdentity.get(key) ?? [];
  if (matches.length === 1) return matches[0]!;

  const samePosition = row.position ? matches.filter((record) => record.position === row.position) : matches;
  if (samePosition.length === 1) return samePosition[0]!;

  const sameSchool = row.school ? samePosition.filter((record) => record.school === row.school) : samePosition;
  return sameSchool.length === 1 ? sameSchool[0]! : null;
}

/**
 * Stage 12 recognition review can replace a source-projected identity while preserving its canonical id/tier.
 * When that reviewed identity omitted its career window, recover the already-authoritative source window here rather
 * than classifying a known dated subject as Unknown. This is census-only reconciliation of existing canonical inputs;
 * it does not create a second membership or factual provider.
 */
export function footballLedgerCensusEndingSeasonFor(row: FootballLedgerSubjectAuditRow) {
  const explicit = row.endSeason ?? row.season;
  if (explicit != null) return explicit;
  return sourceProjectionWindowFor(row)?.endSeason;
}

/**
 * activeDecades is weaker than an exact end season, but it can still identify an era without guessing whenever the
 * last represented decade sits wholly inside one historical bucket. CFB's 2000s decade straddles the 2005 boundary,
 * so it deliberately remains unresolved unless a real ending season is available elsewhere.
 */
export function footballLedgerCensusEraFromActiveDecades(
  league: "NFL" | "CFB",
  activeDecades?: readonly number[],
): Exclude<FootballLedgerCensusEraId, "unknown" | "timeless"> | null {
  const decades = (activeDecades ?? []).filter((value) => Number.isInteger(value));
  if (!decades.length) return null;
  const lastDecade = Math.max(...decades);
  if (league === "NFL") {
    if (lastDecade < 1970) return "historical";
    if (lastDecade < 2000) return "middle";
    return "modern";
  }
  if (lastDecade < 1980) return "historical";
  if (lastDecade < 2000) return "middle";
  if (lastDecade >= 2010) return "modern";
  return null;
}

/**
 * Census eras use the same ending-season boundaries as the canonical Stage 13.5 historical recognition policy.
 * Permanent franchise/program identities are timeless. After exact/reconciled ending seasons, an existing canonical
 * active-decade window may resolve an era only when that decade cannot cross an era boundary. Everything else stays
 * Unknown rather than inventing a date merely to make the table look complete.
 */
export function footballLedgerCensusEraFor(row: FootballLedgerSubjectAuditRow): FootballLedgerCensusEraId {
  if (row.pool === "Franchises / programs") return "timeless";
  const endingSeason = footballLedgerCensusEndingSeasonFor(row);
  if (endingSeason != null) {
    if (row.league === "NFL") {
      if (endingSeason < 1970) return "historical";
      if (endingSeason < 2000) return "middle";
      return "modern";
    }
    if (endingSeason < 1980) return "historical";
    if (endingSeason < 2005) return "middle";
    return "modern";
  }

  const canonical = getFootballSubject(row.subjectId);
  return footballLedgerCensusEraFromActiveDecades(row.league, canonical?.activeDecades) ?? "unknown";
}

export function buildFootballLedgerCensus(rows: readonly FootballLedgerSubjectAuditRow[] = footballLedgerAudit.rows) {
  const censusRows: FootballLedgerCensusRow[] = [];
  for (const league of ["NFL", "CFB"] as const) {
    for (const pool of FOOTBALL_LEDGER_CENSUS_POOLS) {
      const eras = emptyEraCounts();
      const tierCounts = emptyTierCounts();
      const poolRows = rows.filter((row) => row.league === league && row.pool === pool);
      for (const row of poolRows) {
        const era = footballLedgerCensusEraFor(row);
        eras[era][row.tier] += 1;
        tierCounts[row.tier] += 1;
      }
      censusRows.push({ league, pool, eras, tierCounts, total: poolRows.length });
    }
  }

  const leagueTotals = Object.fromEntries((["NFL", "CFB"] as const).map((league) => {
    const leagueRows = censusRows.filter((row) => row.league === league);
    const eras = emptyEraCounts();
    const tierCounts = emptyTierCounts();
    for (const row of leagueRows) {
      for (const era of ERA_IDS) for (const tier of TIERS) eras[era][tier] += row.eras[era][tier];
      for (const tier of TIERS) tierCounts[tier] += row.tierCounts[tier];
    }
    return [league, {
      eras,
      tierCounts,
      total: leagueRows.reduce((sum, row) => sum + row.total, 0),
    }];
  })) as Record<"NFL" | "CFB", {
    eras: Record<FootballLedgerCensusEraId, Record<FootballLedgerCensusTier, number>>;
    tierCounts: Record<FootballLedgerCensusTier, number>;
    total: number;
  }>;

  const grandTierCounts = emptyTierCounts();
  for (const league of ["NFL", "CFB"] as const) for (const tier of TIERS) grandTierCounts[tier] += leagueTotals[league].tierCounts[tier];

  return {
    schemaVersion: 3,
    denominator: footballLedgerAudit.denominator,
    eraBasis: "subject endSeason, then season, then the reconciled Stage 12 source projection endSeason, then only unambiguous canonical active-decade metadata; franchises/programs are timeless; truly unresolved dated subjects remain unknown",
    eraDefinitions: FOOTBALL_LEDGER_CENSUS_ERAS,
    rows: censusRows,
    leagueTotals,
    grandTotal: {
      tierCounts: grandTierCounts,
      total: leagueTotals.NFL.total + leagueTotals.CFB.total,
    },
  } as const;
}

export function formatFootballLedgerCensusMarkdown(census = buildFootballLedgerCensus()) {
  const lines = [
    "# Football Knowledge Ledger — Canonical Census",
    "",
    `Canonical A/B/C subjects: **${census.grandTotal.total.toLocaleString()}**`,
    "",
    "Counts are shown as A/B/C. Unknown is preserved only when explicit/reconciled ending-season data and unambiguous canonical decade metadata cannot place a dated subject honestly; franchises/programs are Timeless.",
    "",
  ];

  for (const league of ["NFL", "CFB"] as const) {
    const eraDefinitions = census.eraDefinitions[league];
    lines.push(
      `## ${league}`,
      "",
      `| Pool | ${eraDefinitions.map((era) => era.label).join(" | ")} | Total A/B/C | Total |`,
      `|---|${eraDefinitions.map(() => "---:").join("|")}|---:|---:|`,
    );
    for (const row of census.rows.filter((candidate) => candidate.league === league)) {
      const eraCells = eraDefinitions.map((era) => {
        const counts = row.eras[era.id];
        return `${counts.A}/${counts.B}/${counts.C}`;
      });
      lines.push(`| ${row.pool} | ${eraCells.join(" | ")} | ${row.tierCounts.A}/${row.tierCounts.B}/${row.tierCounts.C} | ${row.total} |`);
    }
    const total = census.leagueTotals[league];
    const totalEraCells = eraDefinitions.map((era) => {
      const counts = total.eras[era.id];
      return `${counts.A}/${counts.B}/${counts.C}`;
    });
    lines.push(`| **TOTAL** | ${totalEraCells.join(" | ")} | **${total.tierCounts.A}/${total.tierCounts.B}/${total.tierCounts.C}** | **${total.total}** |`, "");
  }

  lines.push(`Grand total A/B/C: **${census.grandTotal.tierCounts.A}/${census.grandTotal.tierCounts.B}/${census.grandTotal.tierCounts.C}** (**${census.grandTotal.total}**)`, "");
  return `${lines.join("\n")}\n`;
}

export const footballLedgerCensus = buildFootballLedgerCensus();
