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
    '''    const sourceId = league === "NFL"
      ? `${season}:${String(at(row, ix, "franchiseId") ?? "")}`
      : `${season}:${String(at(row, ix, "sourceProgramId") ?? "")}`;
    const recognized = recognitionBySource.get(sourceId);''',
    '''    const cfbProgramId = league === "CFB" ? String(at(row, ix, "sourceProgramId") ?? "").trim() : "";
    const cfbProgramName = league === "CFB" ? String(at(row, ix, "programName") ?? "").trim() : "";
    if (league === "CFB" && (!/^\\d+$/.test(cfbProgramId) || !cfbProgramName)) {
      throw new Error(`CFB team season ${season} is missing canonical program media identity.`);
    }
    const sourceId = league === "NFL"
      ? `${season}:${String(at(row, ix, "franchiseId") ?? "")}`
      : `${season}:${cfbProgramId}`;
    const recognized = recognitionBySource.get(sourceId);''',
)
replace_once(
    "scripts/generate-football-find-leader-runtime.mjs",
    '''      kind: "team-season",
      league,
      season,
      tier: recognized.tier,''',
    '''      kind: "team-season",
      league,
      season,
      ...(league === "CFB" ? { programName: cfbProgramName, sourceProgramId: cfbProgramId } : {}),
      tier: recognized.tier,''',
)

replace_once(
    "src/features/back-room/footballFindLeaderRuntimeProjection.ts",
    '''  school?: string;
  teamCode?: string;
  startSeason?: number;''',
    '''  school?: string;
  teamCode?: string;
  programName?: string;
  sourceProgramId?: string;
  startSeason?: number;''',
)
replace_once(
    "src/features/back-room/footballFindLeaderRuntimeProjection.ts",
    '''export function footballFindLeaderProjectedKnowledgeOverride(subjectId: string): FootballSubjectKnowledgeOverride | null {''',
    '''export function footballFindLeaderProjectedCfbTeamMedia(subjectId: string): { programName: string; sourceProgramId: string } | null {
  const subject = rawSubjectById.get(subjectId);
  if (!subject || subject.kind !== "team-season" || subject.league !== "CFB") return null;
  if (!subject.programName || !subject.sourceProgramId) return null;
  return { programName: subject.programName, sourceProgramId: subject.sourceProgramId };
}

export const footballFindLeaderProjectedCfbTeamMediaOwners = rawSubjects.flatMap((subject) => {
  if (subject.kind !== "team-season" || subject.league !== "CFB" || !subject.programName || !subject.sourceProgramId) return [];
  return [{ programName: subject.programName, sourceProgramId: subject.sourceProgramId }];
});

export function footballFindLeaderProjectedKnowledgeOverride(subjectId: string): FootballSubjectKnowledgeOverride | null {''',
)

replace_once(
    "src/features/back-room/footballSubjectRegistry.ts",
    '''  footballFindLeaderProjectedKnowledgeOverride,
  footballFindLeaderProjectedNflTeamCode,''',
    '''  footballFindLeaderProjectedCfbTeamMedia,
  footballFindLeaderProjectedKnowledgeOverride,
  footballFindLeaderProjectedNflTeamCode,''',
)
replace_once(
    "src/features/back-room/footballSubjectRegistry.ts",
    '''  const projectedNflTeamCode = footballFindLeaderProjectedNflTeamCode(subject.id);
  if (projectedNflTeamCode) return footballNflTeamMediaId(projectedNflTeamCode);
  if (subject.kind === "team-season" && subject.league === "CFB")''',
    '''  const projectedNflTeamCode = footballFindLeaderProjectedNflTeamCode(subject.id);
  if (projectedNflTeamCode) return footballNflTeamMediaId(projectedNflTeamCode);
  const projectedCfbTeam = footballFindLeaderProjectedCfbTeamMedia(subject.id);
  if (projectedCfbTeam) return footballCfbTeamMediaId(projectedCfbTeam.programName);
  if (subject.kind === "team-season" && subject.league === "CFB")''',
)

replace_once(
    "src/features/back-room/footballSubjectAssets.ts",
    '''import { footballComparisonDepthItems } from "./footballComparisonDepthCatalog";''',
    '''import { footballComparisonDepthItems } from "./footballComparisonDepthCatalog";
import { footballFindLeaderProjectedCfbTeamMediaOwners } from "./footballFindLeaderRuntimeProjection";''',
)
replace_once(
    "src/features/back-room/footballSubjectAssets.ts",
    '''// Comparison records contribute team relationships, but duplicate seasons collapse onto one team owner.
for (const item of footballComparisonDepthItems) {''',
    '''// Projected factual CFB seasons carry their source program identity, so every eligible school owns one mark here.
for (const { programName, sourceProgramId } of footballFindLeaderProjectedCfbTeamMediaOwners) {
  registerFootballTeamAsset(
    footballCfbTeamMediaId(programName),
    cfbMark(Number(sourceProgramId), programName),
  );
}

// Comparison records contribute team relationships, but duplicate seasons collapse onto one team owner.
for (const item of footballComparisonDepthItems) {''',
)
