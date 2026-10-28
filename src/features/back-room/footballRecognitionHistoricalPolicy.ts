export type FootballHistoricalTier = "A" | "B" | "C" | "D";

const historicalPromotions = new Map<string, Exclude<FootballHistoricalTier, "C" | "D">>([
  ["1972-miami-dolphins", "A"],
  ["1985-chicago-bears", "A"],
  ["1989-san-francisco-49ers", "B"],
  ["1991-washington", "B"],
  ["1996-green-bay-packers", "B"],
  ["1998-denver-broncos", "B"],
]);

export function footballHistoricalTierIssue(
  league: "NFL" | "CFB",
  endSeason: number | undefined,
  tier: FootballHistoricalTier,
) {
  if (tier === "D" || endSeason == null) return null;
  if (league === "NFL") {
    if (endSeason < 1970 && tier !== "A") return "NFL subject ending before 1970 must be Tier A or archived";
    if (endSeason < 2000 && tier === "C") return "NFL subject ending 1970-1999 cannot remain Tier C";
    return null;
  }
  if (endSeason < 1980 && tier !== "A") return "CFB subject ending before 1980 must be Tier A or archived";
  if (endSeason < 2005 && tier === "C") return "CFB subject ending 1980-2004 cannot remain Tier C";
  return null;
}

/** Historical age raises the recognition threshold; it never changes factual coverage. */
export function applyFootballHistoricalRecognitionPolicy(
  subjectId: string,
  league: "NFL" | "CFB",
  endSeason: number | undefined,
  tier: FootballHistoricalTier,
): FootballHistoricalTier {
  if (!footballHistoricalTierIssue(league, endSeason, tier)) return tier;
  return historicalPromotions.get(subjectId) ?? "D";
}
