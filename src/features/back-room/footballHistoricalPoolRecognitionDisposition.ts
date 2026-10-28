/**
 * Durable archive dispositions for the independent historical game censuses.
 *
 * Every ranked source candidate is accounted for exactly once: either its
 * source rank appears on an admitted A-C record in
 * footballHistoricalPoolRecognitionEvidence.ts, or it appears here as a
 * reviewed archive/D disposition. These ranks are evidence identities only;
 * they are never ranking inputs.
 */
export const FOOTBALL_NFL100_REVIEWED_ARCHIVE_RANKS = [
  30, 32, 35, 37, 45, 49, 51, 53, 55, 58, 59, 62, 63, 65, 66, 71, 73, 74,
  75, 76, 77, 79, 80, 81, 82, 85, 91, 92, 93, 94, 95, 96, 97, 100,
] as const;

export const FOOTBALL_ESPN_CFB150_REVIEWED_ARCHIVE_RANKS = [
  8, 11, 23, 24, 28, 31, 32, 33, 35, 36, 37, 41, 43, 44, 45, 47, 52, 53, 55,
  56, 57, 59, 61, 63, 64, 66, 67, 68, 70, 71, 73, 74, 75, 76, 77, 78, 80, 81,
  83, 88, 89, 92, 93, 94, 95, 96, 98, 99, 103, 104, 107, 108, 109, 110, 111,
  112, 114, 115, 116, 117, 119, 121, 122, 124, 126, 127, 128, 129, 130, 132,
  133, 134, 135, 136, 139, 140, 141, 142, 146, 147, 148, 149, 150,
] as const;
