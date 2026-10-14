/**
 * Approved future Daily rotation weights. This is intentionally NOT the live
 * schedule: Higher or Lower must become a first-class server-owned Daily game
 * before the 28/30-day cycles can safely be activated together.
 */
export const APPROVED_DAILY_ROTATION_WEIGHTS = {
  football: {
    average_fan: 4,
    sports_feud: 4,
    millionaire: 4,
    who_am_i: 3,
    find_leader: 3,
    wavelength: 3,
    bar_trivia: 3,
    hit_the_number: 2,
    higher_or_lower: 2,
    blind_resume: 0,
  },
  ufc: {
    average_fan: 4,
    sports_feud: 4,
    millionaire: 4,
    who_am_i: 3,
    find_leader: 3,
    wavelength: 3,
    bar_trivia: 3,
    hit_the_number: 2,
    higher_or_lower: 2,
    blind_resume: 2,
  },
} as const;

export type DailyQuestionSport = "nfl" | "cfb" | "ufc";

export type DailyContentAuditEntry = {
  game: string;
  sport: DailyQuestionSport;
  questionId: string;
  prompt: string;
  /** Canonical answer for comparison; do not include distractors. */
  answer?: string;
  /** Editorially assigned fact/topic ID; catches reworded questions. */
  factKey?: string;
};

export type DailyContentOverlapReason =
  | "identical_prompt"
  | "same_fact"
  | "near_duplicate";

export type DailyContentOverlap = {
  left: DailyContentAuditEntry;
  right: DailyContentAuditEntry;
  scope: "within_game" | "across_games";
  reason: DailyContentOverlapReason;
};

const PROMPT_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "by", "did", "do", "does",
  "for", "from", "in", "into", "is", "it", "of", "on", "or", "the",
  "to", "was", "were", "what", "when", "where", "which", "who",
  "whose", "with", "won",
]);

/** Deliberately conservative: automated overlap detection is not fact checking. */
export function normalizeDailyQuestionText(value: string): string {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase("en-US")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function meaningfulTokens(normalizedPrompt: string): Set<string> {
  return new Set(
    normalizedPrompt.split(" ").filter((token) =>
      token.length > 2 && !PROMPT_STOP_WORDS.has(token)),
  );
}

function isNearDuplicate(leftPrompt: string, rightPrompt: string): boolean {
  const left = meaningfulTokens(leftPrompt);
  const right = meaningfulTokens(rightPrompt);
  const union = new Set([...left, ...right]);
  if (union.size < 5) return false;
  const matching = [...left].filter((token) => right.has(token)).length;
  return matching / union.size >= 0.8;
}

/**
 * Returns review candidates, NOT a claim that every question is correct or
 * that every conceptually similar question can be detected automatically.
 * Requires an editorial pass on every game bank before release.
 */
export function findDailyContentOverlaps(
  entries: readonly DailyContentAuditEntry[],
): DailyContentOverlap[] {
  const normalized = entries.map((entry) => ({
    entry,
    prompt: normalizeDailyQuestionText(entry.prompt),
    answer: normalizeDailyQuestionText(entry.answer ?? ""),
    factKey: normalizeDailyQuestionText(entry.factKey ?? ""),
  }));
  const overlaps: DailyContentOverlap[] = [];

  for (let i = 0; i < normalized.length; i += 1) {
    const left = normalized[i]!;
    for (let j = i + 1; j < normalized.length; j += 1) {
      const right = normalized[j]!;
      if (left.entry.sport !== right.entry.sport) continue;
      if (left.entry.game === right.entry.game
          && left.entry.questionId === right.entry.questionId) continue;

      let reason: DailyContentOverlapReason | undefined;
      if (left.prompt && left.prompt === right.prompt) {
        reason = "identical_prompt";
      } else if (left.factKey && left.factKey === right.factKey) {
        reason = "same_fact";
      } else if (left.answer && left.answer === right.answer
          && isNearDuplicate(left.prompt, right.prompt)) {
        reason = "near_duplicate";
      }

      if (reason) {
        overlaps.push({
          left: left.entry,
          right: right.entry,
          scope: left.entry.game === right.entry.game ? "within_game" : "across_games",
          reason,
        });
      }
    }
  }
  return overlaps;
}
