const ids = new Set([
  "program-alabama", "program-michigan", "program-notre-dame", "program-ohio-state", "program-texas",
  "nick-saban", "bill-belichick", "andy-reid", "pete-carroll", "urban-meyer",
  "2005-texas", "2019-lsu", "2001-miami", "2007-patriots",
]);

/** Reviewed iconic recognition only. This is not a roster and contains no factual or ranking values. */
export function isFootballExplicitlyApprovedIconicSubject(subjectId: string) { return ids.has(subjectId); }
