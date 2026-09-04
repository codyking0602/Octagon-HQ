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
