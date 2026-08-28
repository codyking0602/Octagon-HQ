import fs from "node:fs";
import { describe, it } from "vitest";
import projection from "../../../data/generated/football/recognizability-projection.json";
import { getFootballFactualRecord } from "./footballFactualStatsCore";
import { queryFootballSubjects } from "./footballSubjectRegistry";
import type { FootballCanonicalPosition } from "./footballFactualStatsCatalog";

const ABC = ["A", "B", "C"] as const;
const PLAYER_POOLS = {
  QB: ["QB"],
  RB: ["RB"],
  WR: ["WR"],
  TE: ["TE"],
  OL: ["OL"],
  "DL/EDGE": ["DL"],
  LB: ["LB"],
  Secondary: ["DB"],
  "K/P": ["K", "P"],
} as const satisfies Record<string, readonly FootballCanonicalPosition[]>;

type League = "NFL" | "CFB";
type Tier = "A" | "B" | "C" | "D";
type SourceCorpus = { columns: readonly string[]; rows: readonly (readonly unknown[])[] };
type Aggregate = {
  sourceId: string;
  name: string;
  position: string;
  seasons: Set<number>;
  teams: Set<string>;
  totals: Record<string, number>;
};

function readJson(path: string) {
  return JSON.parse(fs.readFileSync(path, "utf8")) as SourceCorpus;
}
function ixFor(corpus: SourceCorpus) {
  return Object.fromEntries(corpus.columns.map((column, index) => [column, index])) as Record<string, number>;
}
function at(row: readonly unknown[], ix: Record<string, number>, name: string) {
  const index = ix[name];
  return index == null ? undefined : row[index];
}
function n(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;
}
function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
const POSITION_GROUPS = new Map<string, FootballCanonicalPosition>([
  ["QB", "QB"], ["RB", "RB"], ["FB", "RB"], ["HB", "RB"], ["WR", "WR"], ["TE", "TE"],
  ["OL", "OL"], ["C", "OL"], ["G", "OL"], ["OG", "OL"], ["T", "OL"], ["OT", "OL"],
  ["DL", "DL"], ["DE", "DL"], ["DT", "DL"], ["NT", "DL"], ["EDGE", "DL"],
  ["LB", "LB"], ["ILB", "LB"], ["OLB", "LB"], ["DB", "DB"], ["CB", "DB"], ["S", "DB"], ["FS", "DB"], ["SS", "DB"],
  ["K", "K"], ["PK", "K"], ["P", "P"],
]);
function exactPosition(rawValue: unknown) {
  const raw = String(rawValue ?? "").trim().toUpperCase();
  if (!raw) return undefined;
  if (POSITION_GROUPS.has(raw)) return POSITION_GROUPS.get(raw);
  for (const token of raw.split(/[\s/,-]+/).filter(Boolean)) {
    if (POSITION_GROUPS.has(token)) return POSITION_GROUPS.get(token);
  }
  return undefined;
}
function aggregate(corpus: SourceCorpus, league: League) {
  const ix = ixFor(corpus);
  const people = new Map<string, Aggregate>();
  for (const row of corpus.rows) {
    const sourceId = String(at(row, ix, "sourcePlayerId") ?? "");
    const name = String(at(row, ix, "playerDisplayName") ?? at(row, ix, "playerName") ?? "");
    if (!sourceId || sourceId === "0" || !name) continue;
    const key = league === "CFB" ? `${sourceId}:${normalize(name)}` : sourceId;
    const person = people.get(key) ?? { sourceId, name, position: "", seasons: new Set<number>(), teams: new Set<string>(), totals: {} };
    const season = n(at(row, ix, "season"));
    if (season) person.seasons.add(season);
    const team = at(row, ix, "recentTeam") ?? at(row, ix, "team");
    if (team) person.teams.add(String(team));
    person.position ||= String(at(row, ix, "positionGroup") ?? at(row, ix, "position") ?? "");
    for (const field of [
      "attempts", "passAttempts", "rushingAttempts", "rushAttempts", "receptions", "fieldGoalsMade",
    ]) person.totals[field] = (person.totals[field] ?? 0) + n(at(row, ix, field));
    people.set(key, person);
  }
  return [...people.values()];
}
function inferredCfbSkillPosition(person: Aggregate) {
  if ((person.totals.fieldGoalsMade ?? 0) >= 5) return "K" as const;
  if ((person.totals.passAttempts ?? 0) >= 50) return "QB" as const;
  if ((person.totals.receptions ?? 0) >= 20) return "WR" as const;
  if ((person.totals.rushAttempts ?? 0) >= 50) return "RB" as const;
  return undefined;
}
function tierCounts(records: readonly { tier: string }[]) {
  return Object.fromEntries((["A", "B", "C", "D"] as const).map((tier) => [tier, records.filter((record) => record.tier === tier).length])) as Record<Tier, number>;
}

const nflPeople = aggregate(readJson("data/generated/football/nfl/player-seasons-1999-2025.json"), "NFL");
const nflByName = new Map<string, FootballCanonicalPosition[]>();
for (const person of nflPeople) {
  const position = exactPosition(person.position);
  if (!position) continue;
  const key = normalize(person.name);
  const list = nflByName.get(key) ?? [];
  list.push(position);
  nflByName.set(key, list);
}
const cfbPeople = aggregate(readJson("data/generated/football/cfb/player-seasons-2014-2025.json"), "CFB");

function rawPosition(person: Aggregate, league: League) {
  if (league === "NFL") return exactPosition(person.position);
  const nflMatches = nflByName.get(normalize(person.name)) ?? [];
  const uniqueNfl = new Set(nflMatches);
  return uniqueNfl.size === 1 ? [...uniqueNfl][0] : inferredCfbSkillPosition(person);
}
function inPool(position: FootballCanonicalPosition | undefined, pool: readonly FootballCanonicalPosition[]) {
  return Boolean(position && pool.includes(position));
}

const projectionRecords = projection.records as readonly {
  kind: string;
  league: League;
  position?: FootballCanonicalPosition;
  tier: Tier;
}[];

function playerPoolAudit(league: League, pool: readonly FootballCanonicalPosition[]) {
  const rawPeople = league === "NFL" ? nflPeople : cfbPeople;
  const raw = rawPeople.filter((person) => inPool(rawPosition(person, league), pool));
  const projected = projectionRecords.filter((record) => record.kind === "player-career" && record.league === league && inPool(record.position, pool));
  const product = queryFootballSubjects({
    kind: "player-career",
    league,
    positions: pool,
    recognizabilityTiers: ABC,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  });
  const withFacts = product.filter((subject) => (getFootballFactualRecord(subject.id)?.facts.length ?? 0) > 0);
  const averageFactCount = product.length
    ? product.reduce((sum, subject) => sum + (getFootballFactualRecord(subject.id)?.facts.length ?? 0), 0) / product.length
    : 0;
  return {
    sourceRawAssignable: raw.length,
    generatedProjectedABC: projected.length,
    generatedTiers: tierCounts(projected),
    canonicalProductABC: product.length,
    canonicalProductByTier: Object.fromEntries(ABC.map((tier) => [tier, product.filter((subject) => subject.recognizabilityTier === tier).length])),
    canonicalWithAnyFacts: withFacts.length,
    canonicalAverageFactCount: Number(averageFactCount.toFixed(2)),
  };
}

function relationshipRaw(path: string) {
  return readJson(path).rows.length;
}
function productCount(league: League, kind: "team-season" | "program" | "program-era" | "coach") {
  return queryFootballSubjects({
    kind,
    league,
    recognizabilityTiers: ABC,
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).length;
}

const nonPlayer = {
  NFL: {
    "team-seasons": { sourceRaw: relationshipRaw("data/generated/football/relationships/nfl-team-season-results-1999-2025.json"), productABC: productCount("NFL", "team-season") },
    franchises: { sourceRaw: relationshipRaw("data/generated/football/relationships/nfl-franchises-1999-2025.json"), productABC: 0 },
    "head-coach-stops": { sourceRaw: relationshipRaw("data/generated/football/relationships/nfl-coach-stints-1999-2025.json"), productABC: productCount("NFL", "coach") },
    eras: { sourceRaw: relationshipRaw("data/generated/football/relationships/nfl-coach-stints-1999-2025.json"), productABC: productCount("NFL", "program-era") },
    games: { sourceRaw: relationshipRaw("data/generated/football/relationships/nfl-games-1999-2025.json"), productABC: 0 },
  },
  CFB: {
    "team-seasons": { sourceRaw: relationshipRaw("data/generated/football/relationships/cfb-team-season-results-2002-2025.json"), productABC: productCount("CFB", "team-season") },
    programs: { sourceRaw: relationshipRaw("data/generated/football/relationships/cfb-programs-2002-2025.json"), productABC: productCount("CFB", "program") },
    "head-coach-stops": { sourceRaw: relationshipRaw("data/generated/football/relationships/cfb-coach-stints-2002-2025.json"), productABC: productCount("CFB", "coach") },
    eras: { sourceRaw: relationshipRaw("data/generated/football/relationships/cfb-championship-eras-2002-2025.json"), productABC: productCount("CFB", "program-era") },
    games: { sourceRaw: relationshipRaw("data/generated/football/relationships/cfb-games-2002-2025.json"), productABC: 0 },
  },
};

describe("Football Stage 11 census diagnostic", () => {
  it("reports the clean-main ledger census before the durable contract is locked", () => {
    const playerPools = Object.fromEntries((["NFL", "CFB"] as const).map((league) => [
      league,
      Object.fromEntries(Object.entries(PLAYER_POOLS).map(([name, positions]) => [name, playerPoolAudit(league, positions)])),
    ]));
    const cfbUnknownRaw = cfbPeople.filter((person) => rawPosition(person, "CFB") == null).length;
    throw new Error(`FOOTBALL_STAGE11_CENSUS ${JSON.stringify({
      projectionSummary: projection.summary,
      playerPools,
      cfbSourceRawUnassignablePosition: cfbUnknownRaw,
      nonPlayer,
    })}`);
  });
});
