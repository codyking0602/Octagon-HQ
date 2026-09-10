type ReviewedRecognitionTier = "A" | "B" | "C" | "D";

const iconicIds = new Set([
  "program-alabama", "program-michigan", "program-notre-dame", "program-ohio-state", "program-texas",
  "bill-belichick", "andy-reid", "pete-carroll",
  "2005-texas", "2019-lsu", "2001-miami", "2007-patriots",
]);

const reviewedTierOverrides = new Map<string, ReviewedRecognitionTier>([
  ["nflverse-player-00-0031409", "B"], // Johnny Manziel
  ["nflverse-player-00-0027876", "B"], // Tim Tebow
  ["nflverse-player-00-0024218", "B"], // Vince Young
  ["nflverse-player-00-0024217", "B"], // Reggie Bush
  ["nick-saban", "D"],
  ["urban-meyer", "D"],
]);

/** Reviewed iconic recognition only. This is not a roster and contains no factual or ranking values. */
export function isFootballExplicitlyApprovedIconicSubject(subjectId: string) {
  return iconicIds.has(subjectId);
}

/** Narrow human-review corrections for subjects whose source projection clearly overstates NFL recognizability. */
export function footballExplicitlyReviewedRecognitionTier(subjectId: string) {
  return reviewedTierOverrides.get(subjectId) ?? null;
}