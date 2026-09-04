from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one replacement target, found {count}")
    target.write_text(text.replace(old, new))


replace_once(
    "scripts/generate-football-find-leader-runtime.mjs",
    '''      const season = finite(at(row, nflGrouped.ix, "season"));
      const seasonAttempts = finite(at(row, nflGrouped.ix, "attempts"));
      if (!season || seasonAttempts < 200) continue;
      const seasonCompletions = finite(at(row, nflGrouped.ix, "completions"));''',
    '''      const season = finite(at(row, nflGrouped.ix, "season"));
      const seasonAttempts = finite(at(row, nflGrouped.ix, "attempts"));
      if (!season || seasonAttempts < 200) continue;
      const seasonTeamCode = String(at(row, nflGrouped.ix, "recentTeam") ?? "").trim();
      if (!seasonTeamCode) throw new Error(`NFL QB season ${sourcePlayerId}:${season} is missing recentTeam.`);
      const seasonCompletions = finite(at(row, nflGrouped.ix, "completions"));''',
)
replace_once(
    "scripts/generate-football-find-leader-runtime.mjs",
    '''        position: "QB",
        season,
        tier: recognized.tier,
        sourceProvider: "nflverse",
        sourceId: `${sourcePlayerId}:${season}`,''',
    '''        position: "QB",
        season,
        teamCode: seasonTeamCode,
        tier: recognized.tier,
        sourceProvider: "nflverse",
        sourceId: `${sourcePlayerId}:${season}`,''',
)

replace_once(
    "src/features/back-room/footballFindLeaderRuntimeProjection.ts",
    '''  season?: number;
  school?: string;
  startSeason?: number;''',
    '''  season?: number;
  school?: string;
  teamCode?: string;
  startSeason?: number;''',
)
replace_once(
    "src/features/back-room/footballFindLeaderRuntimeProjection.ts",
    '''export function footballFindLeaderProjectedKnowledgeOverride(subjectId: string): FootballSubjectKnowledgeOverride | null {''',
    '''export function footballFindLeaderProjectedNflTeamCode(subjectId: string): string | null {
  const subject = rawSubjectById.get(subjectId);
  if (!subject || subject.league !== "NFL") return null;
  if (subject.kind === "player-season") return subject.teamCode?.trim() || null;
  if (subject.kind !== "team-season") return null;
  const match = /^\\d{4}:([^:]+)$/.exec(subject.sourceId);
  return match?.[1]?.trim() || null;
}

export function footballFindLeaderProjectedKnowledgeOverride(subjectId: string): FootballSubjectKnowledgeOverride | null {''',
)

replace_once(
    "src/features/back-room/footballMediaIdentity.ts",
    '''export function footballNflTeamMediaId(teamCode: string): FootballTeamMediaId {
  return `nfl:${teamCode.toLowerCase()}`;
}''',
    '''const NFL_TEAM_MEDIA_CODE_ALIASES: Readonly<Record<string, string>> = {
  la: "lar",
  was: "wsh",
};

export function footballNflTeamMediaCode(teamCode: string): string {
  const normalized = teamCode.trim().toLowerCase();
  return NFL_TEAM_MEDIA_CODE_ALIASES[normalized] ?? normalized;
}

export function footballNflTeamMediaId(teamCode: string): FootballTeamMediaId {
  return `nfl:${footballNflTeamMediaCode(teamCode)}`;
}''',
)

replace_once(
    "src/features/back-room/footballSubjectRegistry.ts",
    '''  footballCfbTeamMediaIdFromSeasonSubjectId,
  footballTeamMediaIdFromComparisonAsset,''',
    '''  footballCfbTeamMediaIdFromSeasonSubjectId,
  footballNflTeamMediaId,
  footballTeamMediaIdFromComparisonAsset,''',
)
replace_once(
    "src/features/back-room/footballSubjectRegistry.ts",
    '''  footballFindLeaderProjectedAdditionalSubjects,
  footballFindLeaderProjectedKnowledgeOverride,''',
    '''  footballFindLeaderProjectedAdditionalSubjects,
  footballFindLeaderProjectedKnowledgeOverride,
  footballFindLeaderProjectedNflTeamCode,''',
)
replace_once(
    "src/features/back-room/footballSubjectRegistry.ts",
    '''  const comparisonItem = comparisonItemById.get(subject.id);
  if (comparisonItem) return footballTeamMediaIdFromComparisonAsset(comparisonItem.asset);
  if (subject.kind === "team-season" && subject.league === "CFB")''',
    '''  const comparisonItem = comparisonItemById.get(subject.id);
  if (comparisonItem) return footballTeamMediaIdFromComparisonAsset(comparisonItem.asset);
  const projectedNflTeamCode = footballFindLeaderProjectedNflTeamCode(subject.id);
  if (projectedNflTeamCode) return footballNflTeamMediaId(projectedNflTeamCode);
  if (subject.kind === "team-season" && subject.league === "CFB")''',
)

replace_once(
    "src/features/back-room/footballSubjectAssets.ts",
    '''import {
  footballCfbTeamMediaId,
  footballTeamMediaIdFromComparisonAsset,
  type FootballTeamMediaId,
} from "./footballMediaIdentity";''',
    '''import {
  footballCfbTeamMediaId,
  footballNflTeamMediaCode,
  footballNflTeamMediaId,
  footballTeamMediaIdFromComparisonAsset,
  type FootballTeamMediaId,
} from "./footballMediaIdentity";''',
)
replace_once(
    "src/features/back-room/footballSubjectAssets.ts",
    '''function nflMark(team: string, label: string): FootballSubjectAsset {
  return {
    src: `https://a.espncdn.com/i/teamlogos/nfl/500/${team}.png`,
    kind: "team-mark",
    label,
  };
}''',
    '''function nflMark(team: string, label: string): FootballSubjectAsset {
  const mediaCode = footballNflTeamMediaCode(team);
  return {
    src: `https://a.espncdn.com/i/teamlogos/nfl/500/${mediaCode}.png`,
    kind: "team-mark",
    label,
  };
}''',
)
replace_once(
    "src/features/back-room/footballSubjectAssets.ts",
    '''const coreCfbTeamAssets = [
  ["nebraska", 158, "Nebraska"],''',
    '''const coreNflTeamAssets = [
  ["ARI", "Arizona Cardinals"],
  ["ATL", "Atlanta Falcons"],
  ["BAL", "Baltimore Ravens"],
  ["BUF", "Buffalo Bills"],
  ["CAR", "Carolina Panthers"],
  ["CHI", "Chicago Bears"],
  ["CIN", "Cincinnati Bengals"],
  ["CLE", "Cleveland Browns"],
  ["DAL", "Dallas Cowboys"],
  ["DEN", "Denver Broncos"],
  ["DET", "Detroit Lions"],
  ["GB", "Green Bay Packers"],
  ["HOU", "Houston Texans"],
  ["IND", "Indianapolis Colts"],
  ["JAX", "Jacksonville Jaguars"],
  ["KC", "Kansas City Chiefs"],
  ["LAC", "Los Angeles Chargers"],
  ["LAR", "Los Angeles Rams"],
  ["LV", "Las Vegas Raiders"],
  ["MIA", "Miami Dolphins"],
  ["MIN", "Minnesota Vikings"],
  ["NE", "New England Patriots"],
  ["NO", "New Orleans Saints"],
  ["NYG", "New York Giants"],
  ["NYJ", "New York Jets"],
  ["PHI", "Philadelphia Eagles"],
  ["PIT", "Pittsburgh Steelers"],
  ["SEA", "Seattle Seahawks"],
  ["SF", "San Francisco 49ers"],
  ["TB", "Tampa Bay Buccaneers"],
  ["TEN", "Tennessee Titans"],
  ["WSH", "Washington Commanders"],
] as const;

// NFL team marks are owned here so historical factual seasons do not depend on comparison-catalog coverage.
for (const [teamCode, label] of coreNflTeamAssets) {
  registerFootballTeamAsset(footballNflTeamMediaId(teamCode), nflMark(teamCode, label));
}

const coreCfbTeamAssets = [
  ["nebraska", 158, "Nebraska"],''',
)
