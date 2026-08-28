import {
  footballLedgerAudit,
  type FootballLedgerAuditPool,
  type FootballLedgerSubjectAuditRow,
} from "./footballLedgerAudit";

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

const TIERS = ["A", "B", "C"] as const;
const ERA_IDS = ["historical", "middle", "modern", "unknown", "timeless"] as const;

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

/**
 * Census eras use the same ending-season boundaries as the canonical Stage 13.5 historical recognition policy.
 * Permanent franchise/program identities are timeless. Dated subjects with no resolved ending season remain Unknown;
 * the census never invents an era merely to make the table look complete.
 */
export function footballLedgerCensusEraFor(row: FootballLedgerSubjectAuditRow): FootballLedgerCensusEraId {
  if (row.pool === "Franchises / programs") return "timeless";
  const endingSeason = row.endSeason ?? row.season;
  if (endingSeason == null) return "unknown";
  if (row.league === "NFL") {
    if (endingSeason < 1970) return "historical";
    if (endingSeason < 2000) return "middle";
    return "modern";
  }
  if (endingSeason < 1980) return "historical";
  if (endingSeason < 2005) return "middle";
  return "modern";
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
    schemaVersion: 1,
    denominator: footballLedgerAudit.denominator,
    eraBasis: "subject endSeason, falling back to season; franchises/programs are timeless; unresolved dated subjects remain unknown",
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
    "Counts are shown as A/B/C. Unknown is intentionally preserved when a dated canonical subject lacks a resolved ending season; franchises/programs are Timeless.",
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
