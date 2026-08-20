import type { TodayChallengeProjection } from "./todayChallengeRepository";

export const DAILY_RANK_KEEP_COMBO_CONTENT_VERSION = "daily-rank-keep-combo-v1";
export const DAILY_RANK_KEEP_COMBO_BLIND_RESULT_KEY = "combo_blind_rank_result";

type DailyComboScoreKey = "blind_rank" | "keep_cut";

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function score(value: unknown) {
  const row = record(value);
  return typeof row?.normalized_score === "number" ? row.normalized_score : null;
}

export function isDailyRankKeepCombo(projection: Pick<TodayChallengeProjection, "contentVersion"> | null | undefined) {
  return projection?.contentVersion === DAILY_RANK_KEEP_COMBO_CONTENT_VERSION;
}

export function dailyRankKeepComboStage(projection: Pick<TodayChallengeProjection, "contentVersion" | "gameType"> | null | undefined) {
  if (!isDailyRankKeepCombo(projection)) return null;
  return projection?.gameType === "keep_4_cut_4" ? 2 : 1;
}

export function dailyRankKeepComboComponentScore(
  projection: Pick<TodayChallengeProjection, "contentVersion" | "officialAttempt"> | null | undefined,
  key: DailyComboScoreKey,
) {
  if (!isDailyRankKeepCombo(projection) || !projection?.officialAttempt) return null;
  return score(projection.officialAttempt.publicResult[key]);
}

export function dailyRankKeepComboBlindRankResultState(
  projection: Pick<TodayChallengeProjection, "contentVersion" | "officialAttempt" | "publicState"> | null | undefined,
) {
  if (!isDailyRankKeepCombo(projection) || !projection?.officialAttempt) return null;
  return record(projection.publicState[DAILY_RANK_KEEP_COMBO_BLIND_RESULT_KEY]);
}

export function DailyRankKeepComboStatus({ projection }: { projection: TodayChallengeProjection }) {
  const stage = dailyRankKeepComboStage(projection);
  if (!stage) return null;

  const attempt = projection.officialAttempt;

  if (attempt) {
    return (
      <section className="surface-card" aria-label="Daily double result">
        <p className="eyebrow">DAILY DOUBLE · FINAL RESULT</p>
        <h2>{attempt.normalizedScore}/100</h2>
        <p>Blind Rank 5 and Keep 4, Cut 4 count equally toward one official Daily score.</p>
      </section>
    );
  }

  return (
    <section className="surface-card" aria-label={`Daily double part ${stage} of 2`}>
      <p className="eyebrow">DAILY DOUBLE · PART {stage} OF 2</p>
      <h2>{stage === 1 ? "Blind Rank 5" : "Keep 4, Cut 4"}</h2>
      <p>
        {stage === 1
          ? "Lock your five rankings, then you’ll go straight into Keep 4, Cut 4. Your Daily is not complete until both parts are finished."
          : "Part one is locked. Finish Keep 4, Cut 4 to record one combined official Daily score."}
      </p>
    </section>
  );
}
