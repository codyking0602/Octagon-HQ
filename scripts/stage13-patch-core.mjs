import fs from "node:fs";

const corePath = "src/features/back-room/footballFactualStatsCore.ts";
let core = fs.readFileSync(corePath, "utf8");

function replaceOnce(label, before, after) {
  if (!core.includes(before)) throw new Error(`Stage 13 patch target missing: ${label}`);
  core = core.replace(before, after);
}

replaceOnce(
  "projection import",
  'import { footballFindLeaderProjectedFactualRecords } from "./footballFindLeaderRuntimeProjection";',
  'import { footballFactualUniverseProjectedRecords } from "./footballFactualUniverseProjection";',
);

replaceOnce(
  "metric union",
  '  | "cfb-era-title-game-appearances";\n',
  `  | "cfb-era-title-game-appearances"\n  | "nfl-career-tackles-solo"\n  | "nfl-career-tackles-for-loss"\n  | "nfl-career-forced-fumbles"\n  | "nfl-career-passes-defended"\n  | "nfl-career-field-goals-made"\n  | "nfl-career-field-goals-attempted"\n  | "nfl-career-field-goal-percentage"\n  | "nfl-career-punts"\n  | "nfl-career-punting-yards"\n  | "nfl-career-punting-average"\n  | "nfl-pro-bowl-selections"\n  | "nfl-hall-of-fame"\n  | "nfl-team-regular-season-wins"\n  | "nfl-team-regular-season-losses"\n  | "nfl-team-postseason-games"\n  | "nfl-team-postseason-wins"\n  | "nfl-team-postseason-losses"\n  | "nfl-team-playoff-berth"\n  | "nfl-team-conference-championship-game"\n  | "nfl-team-super-bowl-appearance"\n  | "nfl-team-passing-yards"\n  | "nfl-team-rushing-yards"\n  | "nfl-team-passing-interceptions-thrown"\n  | "nfl-team-defensive-sacks"\n  | "nfl-team-defensive-interceptions"\n  | "nfl-team-field-goals-made"\n  | "nfl-team-punting-average"\n  | "cfb-best-season-completion-percentage"\n  | "cfb-best-season-passing-yards-per-attempt"\n  | "cfb-best-season-rushing-yards-per-attempt"\n  | "cfb-best-season-receiving-yards-per-reception"\n  | "cfb-best-season-pass-breakups"\n  | "cfb-best-season-forced-fumbles"\n  | "cfb-best-season-field-goals-made"\n  | "cfb-best-season-field-goals-attempted"\n  | "cfb-best-season-field-goal-percentage"\n  | "cfb-major-national-award-wins"\n  | "cfb-team-regular-season-wins"\n  | "cfb-team-regular-season-losses"\n  | "cfb-team-postseason-games"\n  | "cfb-team-postseason-wins"\n  | "cfb-team-postseason-losses"\n  | "cfb-team-conference-wins"\n  | "cfb-team-conference-losses";\n`,
);

replaceOnce(
  "metric definitions",
  '  metric("cfb-era-title-game-appearances", "Era national title-game appearances", "count", 0),\n] as const;',
  `  metric("cfb-era-title-game-appearances", "Era national title-game appearances", "count", 0),
  metric("nfl-career-tackles-solo", "Career solo tackles", "count", 0),
  metric("nfl-career-tackles-for-loss", "Career tackles for loss", "count", 1),
  metric("nfl-career-forced-fumbles", "Career forced fumbles", "count", 0),
  metric("nfl-career-passes-defended", "Career passes defended", "count", 0),
  metric("nfl-career-field-goals-made", "Career field goals made", "count", 0),
  metric("nfl-career-field-goals-attempted", "Career field goals attempted", "count", 0),
  metric("nfl-career-field-goal-percentage", "Career field-goal percentage", "percent", 1),
  metric("nfl-career-punts", "Career punts", "count", 0),
  metric("nfl-career-punting-yards", "Career punting yards", "yards", 0),
  metric("nfl-career-punting-average", "Career yards per punt", "per-attempt", 1),
  metric("nfl-pro-bowl-selections", "Pro Bowl selections", "count", 0),
  metric("nfl-hall-of-fame", "Pro Football Hall of Fame", "flag", 0),
  metric("nfl-team-regular-season-wins", "Regular-season wins", "count", 0),
  metric("nfl-team-regular-season-losses", "Regular-season losses", "count", 0),
  metric("nfl-team-postseason-games", "Postseason games", "count", 0),
  metric("nfl-team-postseason-wins", "Postseason wins", "count", 0),
  metric("nfl-team-postseason-losses", "Postseason losses", "count", 0),
  metric("nfl-team-playoff-berth", "Playoff berth", "flag", 0),
  metric("nfl-team-conference-championship-game", "Conference championship game", "flag", 0),
  metric("nfl-team-super-bowl-appearance", "Super Bowl appearance", "flag", 0),
  metric("nfl-team-passing-yards", "Team passing yards", "yards", 0),
  metric("nfl-team-rushing-yards", "Team rushing yards", "yards", 0),
  metric("nfl-team-passing-interceptions-thrown", "Team interceptions thrown", "count", 0),
  metric("nfl-team-defensive-sacks", "Team defensive sacks", "count", 1),
  metric("nfl-team-defensive-interceptions", "Team defensive interceptions", "count", 0),
  metric("nfl-team-field-goals-made", "Team field goals made", "count", 0),
  metric("nfl-team-punting-average", "Team yards per punt", "per-attempt", 1),
  metric("cfb-best-season-completion-percentage", "Best-season completion percentage", "percent", 1),
  metric("cfb-best-season-passing-yards-per-attempt", "Best-season passing yards per attempt", "per-attempt", 2),
  metric("cfb-best-season-rushing-yards-per-attempt", "Best-season rushing yards per attempt", "per-attempt", 2),
  metric("cfb-best-season-receiving-yards-per-reception", "Best-season receiving yards per reception", "per-attempt", 2),
  metric("cfb-best-season-pass-breakups", "Best-season pass breakups", "count", 0),
  metric("cfb-best-season-forced-fumbles", "Best-season forced fumbles", "count", 0),
  metric("cfb-best-season-field-goals-made", "Best-season field goals made", "count", 0),
  metric("cfb-best-season-field-goals-attempted", "Best-season field goals attempted", "count", 0),
  metric("cfb-best-season-field-goal-percentage", "Best-season field-goal percentage", "percent", 1),
  metric("cfb-major-national-award-wins", "Major national award wins", "count", 0),
  metric("cfb-team-regular-season-wins", "Regular-season wins", "count", 0),
  metric("cfb-team-regular-season-losses", "Regular-season losses", "count", 0),
  metric("cfb-team-postseason-games", "Postseason games", "count", 0),
  metric("cfb-team-postseason-wins", "Postseason wins", "count", 0),
  metric("cfb-team-postseason-losses", "Postseason losses", "count", 0),
  metric("cfb-team-conference-wins", "Conference wins", "count", 0),
  metric("cfb-team-conference-losses", "Conference losses", "count", 0),
] as const;`,
);

replaceOnce(
  "source union",
  '  | "nflverse-find-leader-projection"\n  | "cfbfast-r-find-leader-projection";',
  `  | "nflverse-factual-universe-projection"
  | "cfbfast-r-factual-universe-projection"
  | "nflverse-draft-picks-projection"
  | "cfb-major-honors-stage13";`,
);

replaceOnce(
  "source definitions",
  '  { id: "nflverse-find-leader-projection", publisher: "nflverse", title: "Pinned NFL historical player/team projection for Find the Leader", url: "https://github.com/nflverse/nflverse-data", reviewedOn: "2026-08-26", coverage: "Normalized regular-season NFL source data from 1999 through 2025, compacted to A-C recognizable Find the Leader subjects" },\n  { id: "cfbfast-r-find-leader-projection", publisher: "cfbfastR", title: "Pinned CFB historical player/team projection for Find the Leader", url: "https://github.com/sportsdataverse/cfbfastR-data", reviewedOn: "2026-08-26", coverage: "Normalized CFB player data from 2014 through 2025 and team-season relationships from 2002 through 2025, compacted to A-C recognizable Find the Leader subjects" },',
  `  { id: "nflverse-factual-universe-projection", publisher: "nflverse", title: "Pinned NFL factual-universe projection", url: "https://github.com/nflverse/nflverse-data", reviewedOn: "2026-08-27", coverage: "Normalized NFL player/team source data from 1999 through 2025, compacted only to Stage 12 A/B/C identities" },
  { id: "cfbfast-r-factual-universe-projection", publisher: "cfbfastR", title: "Pinned CFB factual-universe projection", url: "https://github.com/sportsdataverse/cfbfastR-data", reviewedOn: "2026-08-27", coverage: "Normalized CFB player data from 2014 through 2025 and team-season relationships from 2002 through 2025, compacted only to Stage 12 A/B/C identities" },
  { id: "nflverse-draft-picks-projection", publisher: "nflverse / Pro Football Reference", title: "Pinned NFL draft picks and career honors projection", url: "https://github.com/nflverse/nflverse-data/releases/tag/draft_picks", reviewedOn: "2026-08-27", coverage: "Draft, Hall of Fame, AP first-team All-Pro and Pro Bowl evidence; source CSV bytes 1,656,280; SHA-256 91f1ead0d531aec7e219e3f19756b3084d8ef6d8dbf37c8b4ec147dd3985c215" },
  { id: "cfb-major-honors-stage13", publisher: "College Football at Sports-Reference", title: "Stage 13 college major-honors snapshot", url: "https://www.sports-reference.com/cfb/awards/", reviewedOn: "2026-08-27", coverage: "Reviewed major national award evidence for recognizable CFB careers across every permanent player pool; normalized snapshot checked into public/data/football/cfb/stage13-major-honors.json" },`,
);

replaceOnce(
  "projection merge",
  `const preFindLeaderFactualRecords = mergeCanonicalFactualRecords([
  ...compatibilityFactualRecords,
  ...expandedFootballFactualRecords,
]);
const findLeaderGapFillFactualRecords = projectedGapFillRecords(
  footballFindLeaderProjectedFactualRecords,
  preFindLeaderFactualRecords,
);

/**
 * Stable enumerable quantitative Football ledger used by games that have not explicitly migrated to PR7 depth.
 * Find the Leader projection remains opt-in exposure: it must not silently enlarge another game's subject pool.
 */
export const footballFactualRecords: readonly FootballFactualRecord[] = preFindLeaderFactualRecords;

/**
 * Canonical lookup ledger. Reviewed/curated facts retain ownership of subject+metric keys they already define, while
 * PR7 projection gap-fills missing facts behind getFootballFact/getFootballFactualRecord for explicit consumers.
 */
const footballFactualLookupRecords: readonly FootballFactualRecord[] = mergeCanonicalFactualRecords([
  ...preFindLeaderFactualRecords,
  ...findLeaderGapFillFactualRecords,
]);`,
  `const preStage13FactualRecords = mergeCanonicalFactualRecords([
  ...compatibilityFactualRecords,
  ...expandedFootballFactualRecords,
]);
const stage13GapFillFactualRecords = projectedGapFillRecords(
  footballFactualUniverseProjectedRecords,
  preStage13FactualRecords,
);

/**
 * Stable enumerable compatibility ledger. Stage 13 intentionally does not make every A/B/C identity automatic game
 * membership; games keep using canonical registry queries and the factual getters until Stage 18 integrates them.
 */
export const footballFactualRecords: readonly FootballFactualRecord[] = preStage13FactualRecords;

/**
 * Canonical factual lookup ledger. Reviewed facts retain existing subject+metric keys while the deterministic Stage 13
 * A/B/C projection fills only missing facts behind getFootballFact/getFootballFactualRecord.
 */
const footballFactualLookupRecords: readonly FootballFactualRecord[] = mergeCanonicalFactualRecords([
  ...preStage13FactualRecords,
  ...stage13GapFillFactualRecords,
]);

/** Durable Stage 13 factual universe for audits and future canonical consumers; membership still belongs to the registry. */
export const footballFactualUniverseRecords: readonly FootballFactualRecord[] = footballFactualLookupRecords;`,
);

fs.writeFileSync(corePath, core);

const facadePath = "src/features/back-room/footballFactualStats.ts";
let facade = fs.readFileSync(facadePath, "utf8");
const exportLine = 'export * from "./footballFactualUniverseProjection";\n';
if (!facade.includes(exportLine)) {
  facade = facade.replace('export * from "./footballFactualStatsCore";\n', `export * from "./footballFactualStatsCore";\n${exportLine}`);
}
fs.writeFileSync(facadePath, facade);

console.log("Patched canonical Football factual owner for Stage 13.");
