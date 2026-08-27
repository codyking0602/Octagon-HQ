from pathlib import Path

core_path = Path('src/features/back-room/footballFactualStatsCore.ts')
core = core_path.read_text()
old = '''/**
 * Canonical reusable quantitative Football ledger.
 * Reviewed/curated facts retain ownership of subject+metric keys they already define. PR7 source projection is an
 * explicit gap-fill only: it may deepen missing facts but cannot compete with an existing canonical fact. The final
 * strict merge still rejects any conflicting facts that survive that ownership boundary.
 */
export const footballFactualRecords: readonly FootballFactualRecord[] = mergeCanonicalFactualRecords([
  ...preFindLeaderFactualRecords,
  ...findLeaderGapFillFactualRecords,
]);

const recordIds = footballFactualRecords.map((record) => record.subjectId);
if (new Set(recordIds).size !== recordIds.length) {
  throw new Error("Canonical Football factual ledger contains duplicate subject records.");
}

const recordsBySubjectId = new Map(footballFactualRecords.map((record) => [record.subjectId, record]));
'''
new = '''/**
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
]);

const recordIds = footballFactualLookupRecords.map((record) => record.subjectId);
if (new Set(recordIds).size !== recordIds.length) {
  throw new Error("Canonical Football factual lookup ledger contains duplicate subject records.");
}

const recordsBySubjectId = new Map(footballFactualLookupRecords.map((record) => [record.subjectId, record]));
'''
if old not in core:
    raise SystemExit('factual ledger merge block not found')
core_path.write_text(core.replace(old, new))

competition_path = Path('src/features/play/findLeaderCompetition.test.ts')
competition = competition_path.read_text()
anchor = '''const SUPPLEMENTAL_CATEGORY_IDS = new Set([
  "ufc-main-events-all-time",
  "ufc-bonus-awards-all-time",
  "first-round-ufc-finishes-all-time",
  "ufc-knockdowns-landed-all-time",
]);
'''
if anchor not in competition:
    raise SystemExit('competition audit anchor not found')
competition = competition.replace(anchor, anchor + '\nconst competitionAudit = findLeaderCompetitionAudit();\n')
competition = competition.replace('findLeaderCompetitionAudit().filter((row) => row.boardValid)', 'competitionAudit.filter((row) => row.boardValid)')
competition = competition.replace('findLeaderCompetitionAudit()\n      .filter((row) => row.boardValid && row.nonRecordLeaderAvailable)', 'competitionAudit\n      .filter((row) => row.boardValid && row.nonRecordLeaderAvailable)')
competition = competition.replace('findLeaderCompetitionAudit()\n      .filter((row) => SUPPLEMENTAL_CATEGORY_IDS.has(row.definitionId))', 'competitionAudit\n      .filter((row) => SUPPLEMENTAL_CATEGORY_IDS.has(row.definitionId))')
if competition.count('findLeaderCompetitionAudit()') != 1:
    raise SystemExit('unexpected remaining competition audit calls')
competition_path.write_text(competition)

runtime_path = Path('src/features/back-room/footballFindLeaderRuntimeProjection.test.ts')
runtime = runtime_path.read_text()
runtime = runtime.replace(
'''  getFootballFact,
  getFootballSubject,
  queryFootballSubjects,
''',
'''  footballFactualRecords,
  getFootballFact,
  getFootballFactualRecord,
  getFootballSubject,
  queryFootballSubjects,
''')
needle = '''  it("reconciles every projected fact subject through the canonical registry", () => {
    for (const record of footballFindLeaderProjectedFactualRecords) {
      expect(getFootballSubject(record.subjectId), record.subjectId).not.toBeNull();
    }
  });
'''
regression = needle + '''
  it("keeps PR7 depth lookup-only for games that have not opted into projected exposure", () => {
    const enumerableIds = new Set(footballFactualRecords.map((record) => record.subjectId));
    const projectedOnly = footballFindLeaderProjectedFactualRecords.find((record) => !enumerableIds.has(record.subjectId));
    expect(projectedOnly).toBeDefined();
    expect(getFootballFactualRecord(projectedOnly!.subjectId)).not.toBeNull();
    expect(footballFactualRecords.some((record) => record.subjectId === projectedOnly!.subjectId)).toBe(false);
  });
'''
if needle not in runtime:
    raise SystemExit('runtime projection regression anchor not found')
runtime_path.write_text(runtime.replace(needle, regression))
