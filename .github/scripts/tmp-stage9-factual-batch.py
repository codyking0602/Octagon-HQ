from pathlib import Path

core = Path("src/features/back-room/footballFactualStatsCore.ts")
text = core.read_text()
text = text.replace(
    'metric("nfl-franchise-best-season-win-percentage-since-1999", "Best franchise season win percentage", "percent", 1),',
    'metric("nfl-franchise-best-season-win-percentage-since-1999", "Best franchise season win percentage since 1999", "percent", 1),',
)
core.write_text(text)

facts_path = Path("src/features/back-room/footballStage16CfbQbCareerFacts.ts")
facts_text = facts_path.read_text()
anchor = '  facts("cfb-deion-sanders", ['
addition = '''  facts("cfb-khalil-mack", [
    ["cfb-career-games", 48], ["cfb-career-sacks", 28.5], ["cfb-career-defensive-interceptions", 4],
    ["cfb-career-pass-breakups", 21], ["cfb-career-forced-fumbles", 16], ["cfb-career-fumble-recoveries", 3],
    ["cfb-best-season-sacks", 10.5], ["cfb-best-season-defensive-interceptions", 3],
  ]),
  facts("cfb-tyrann-mathieu", [
    ["cfb-career-games", 26], ["cfb-career-sacks", 6], ["cfb-career-defensive-interceptions", 4],
    ["cfb-career-pass-breakups", 16], ["cfb-career-forced-fumbles", 11], ["cfb-career-fumble-recoveries", 8],
    ["cfb-best-season-sacks", 4.5], ["cfb-best-season-defensive-interceptions", 2],
  ]),
  facts("cfb-sean-taylor", [
    ["cfb-career-games", 25], ["cfb-career-defensive-interceptions", 14],
    ["cfb-career-fumble-recoveries", 0], ["cfb-best-season-defensive-interceptions", 10],
  ]),
  facts("cfb-julius-peppers", [
    ["cfb-career-games", 34], ["cfb-career-sacks", 30.5], ["cfb-career-defensive-interceptions", 5],
    ["cfb-career-pass-breakups", 13], ["cfb-career-forced-fumbles", 5], ["cfb-career-fumble-recoveries", 2],
    ["cfb-best-season-sacks", 15], ["cfb-best-season-defensive-interceptions", 3],
  ]),
  facts("cfb-terrell-suggs", [
    ["cfb-career-sacks", 44], ["cfb-career-defensive-interceptions", 2], ["cfb-career-pass-breakups", 9],
    ["cfb-career-forced-fumbles", 14], ["cfb-career-fumble-recoveries", 3], ["cfb-best-season-sacks", 24],
  ]),
'''
if 'facts("cfb-khalil-mack"' not in facts_text:
    if anchor not in facts_text:
        raise SystemExit("CFB factual insertion anchor missing")
    facts_text = facts_text.replace(anchor, addition + anchor, 1)
facts_path.write_text(facts_text)

affiliation_path = Path("src/features/back-room/footballCareerAffiliationProjection.ts")
affiliation_text = affiliation_path.read_text()
map_anchor = "function playerHistory(subject: AffiliationSubject) {"
reviewed = '''function reviewedCoachSeasons(affiliation: string, ranges: readonly (readonly [number, number])[]) {
  return ranges.flatMap(([start, end]) => Array.from({ length: end - start + 1 }, (_, index) => ({
    season: start + index,
    affiliation,
  })));
}

const reviewedNflCoachCareerSeasons = new Map<string, readonly FootballCareerAffiliationSeason[]>([
  ["andy-reid", [...reviewedCoachSeasons("PHI", [[1999, 2012]]), ...reviewedCoachSeasons("KC", [[2013, 2025]])]],
  ["bill-belichick", [...reviewedCoachSeasons("CLE", [[1991, 1995]]), ...reviewedCoachSeasons("NE", [[2000, 2023]])]],
  ["bill-parcells", [...reviewedCoachSeasons("NYG", [[1983, 1990]]), ...reviewedCoachSeasons("NE", [[1993, 1996]]), ...reviewedCoachSeasons("NYJ", [[1997, 1999]]), ...reviewedCoachSeasons("DAL", [[2003, 2006]])]],
  ["bill-walsh", reviewedCoachSeasons("SF", [[1979, 1988]])],
  ["chuck-noll", reviewedCoachSeasons("PIT", [[1969, 1991]])],
  ["don-shula", [...reviewedCoachSeasons("IND", [[1963, 1969]]), ...reviewedCoachSeasons("MIA", [[1970, 1995]])]],
  ["earl-curly-lambeau", [...reviewedCoachSeasons("GB", [[1921, 1949]]), ...reviewedCoachSeasons("ARI", [[1950, 1951]]), ...reviewedCoachSeasons("WAS", [[1952, 1953]])]],
  ["george-halas", reviewedCoachSeasons("CHI", [[1920, 1929], [1933, 1942], [1946, 1955], [1958, 1967]])],
  ["jimmy-johnson", [...reviewedCoachSeasons("DAL", [[1989, 1993]]), ...reviewedCoachSeasons("MIA", [[1996, 1999]])]],
  ["joe-gibbs", reviewedCoachSeasons("WAS", [[1981, 1992], [2004, 2007]])],
  ["john-madden", reviewedCoachSeasons("LV", [[1969, 1978]])],
  ["nick-saban", reviewedCoachSeasons("MIA", [[2005, 2006]])],
  ["paul-brown", [...reviewedCoachSeasons("CLE", [[1950, 1962]]), ...reviewedCoachSeasons("CIN", [[1968, 1975]])]],
  ["pete-carroll", [...reviewedCoachSeasons("NYJ", [[1994, 1994]]), ...reviewedCoachSeasons("NE", [[1997, 1999]]), ...reviewedCoachSeasons("SEA", [[2010, 2023]])]],
  ["tom-landry", reviewedCoachSeasons("DAL", [[1960, 1988]])],
  ["urban-meyer", reviewedCoachSeasons("JAX", [[2021, 2021]])],
  ["vince-lombardi", [...reviewedCoachSeasons("GB", [[1959, 1967]]), ...reviewedCoachSeasons("WAS", [[1969, 1969]])]],
  ["bill-cowher", reviewedCoachSeasons("PIT", [[1992, 2006]])],
  ["bud-grant", reviewedCoachSeasons("MIN", [[1967, 1983], [1985, 1985]])],
  ["dick-vermeil", [...reviewedCoachSeasons("PHI", [[1976, 1982]]), ...reviewedCoachSeasons("LAR", [[1997, 1999]]), ...reviewedCoachSeasons("KC", [[2001, 2005]])]],
  ["don-coryell", [...reviewedCoachSeasons("ARI", [[1973, 1977]]), ...reviewedCoachSeasons("LAC", [[1978, 1986]])]],
  ["george-allen", [...reviewedCoachSeasons("LAR", [[1966, 1970]]), ...reviewedCoachSeasons("WAS", [[1971, 1977]])]],
  ["mike-holmgren", [...reviewedCoachSeasons("GB", [[1992, 1998]]), ...reviewedCoachSeasons("SEA", [[1999, 2008]])]],
  ["mike-shanahan", [...reviewedCoachSeasons("LV", [[1988, 1989]]), ...reviewedCoachSeasons("DEN", [[1995, 2008]]), ...reviewedCoachSeasons("WAS", [[2010, 2013]])]],
  ["tony-dungy", [...reviewedCoachSeasons("TB", [[1996, 2001]]), ...reviewedCoachSeasons("IND", [[2002, 2008]])]],
  ["sean-payton", [...reviewedCoachSeasons("NO", [[2006, 2011], [2013, 2021]]), ...reviewedCoachSeasons("DEN", [[2023, 2025]])]],
]);

function reviewedNflCoachHistory(subject: AffiliationSubject) {
  if (subject.league !== "NFL" || subject.kind !== "coach") return null;
  const seasons = reviewedNflCoachCareerSeasons.get(slug(subject.name));
  if (!seasons) return null;
  const history = finishHistory(subject, seasons);
  return { ...history, complete: true } satisfies FootballCareerAffiliationHistory;
}

'''
if "reviewedNflCoachCareerSeasons" not in affiliation_text:
    if map_anchor not in affiliation_text:
        raise SystemExit("Coach-history insertion anchor missing")
    affiliation_text = affiliation_text.replace(map_anchor, reviewed + map_anchor, 1)
old_coach = '''function coachHistory(subject: AffiliationSubject) {
  const sourceRows = (subject.league === "NFL" ? nflCoachSeasonsByKey : cfbCoachSeasonsByKey).get(slug(subject.name)) ?? [];
  const seasons = sourceRows.filter((row) => withinCareerWindow(subject, row.season));
  return seasons.length ? finishHistory(subject, seasons) : null;
}'''
new_coach = '''function coachHistory(subject: AffiliationSubject) {
  const reviewed = reviewedNflCoachHistory(subject);
  if (reviewed) return reviewed;
  const sourceRows = (subject.league === "NFL" ? nflCoachSeasonsByKey : cfbCoachSeasonsByKey).get(slug(subject.name)) ?? [];
  const seasons = sourceRows.filter((row) => withinCareerWindow(subject, row.season));
  return seasons.length ? finishHistory(subject, seasons) : null;
}'''
if old_coach in affiliation_text:
    affiliation_text = affiliation_text.replace(old_coach, new_coach, 1)
elif "const reviewed = reviewedNflCoachHistory(subject);" not in affiliation_text:
    raise SystemExit("Coach-history replacement anchor missing")
affiliation_path.write_text(affiliation_text)

readiness = Path("src/features/games/twentyQuestionsFactualReadiness.audit.test.ts")
readiness_text = readiness.read_text()
old_assert = "      expect(result.predicateCoverage.fullyCovered).toBeGreaterThan(0);"
new_assert = '''      expect(result.predicateCoverage.fullyCovered).toBeGreaterThan(0);
      expect(result.duplicateAnswerFingerprints).toBe(0);
      expect(result.impossibleToDistinguish).toBe(0);
      expect(result.subgroupFairness.coaches.unresolved).toBe(0);
      expect(result.subgroupFairness.offensiveLine.unresolved).toBe(0);
      expect(result.optimalIsolation.p95).not.toBeNull();
      expect(result.optimalIsolation.p95!).toBeLessThanOrEqual(20);'''
if old_assert in readiness_text and "expect(result.duplicateAnswerFingerprints).toBe(0);" not in readiness_text:
    readiness_text = readiness_text.replace(old_assert, new_assert, 1)
readiness.write_text(readiness_text)

for path in [
    Path("src/features/games/twentyQuestionsMetadataCoverage.audit.test.ts"),
    Path("src/features/games/twentyQuestionsCandidateCoverage.audit.test.ts"),
]:
    if path.exists():
        path.unlink()
