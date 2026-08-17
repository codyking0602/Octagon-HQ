import { FighterPhoto } from "../rankings/FighterPhoto";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

interface BlindRankRevealFighter {
  id: string;
  name: string;
  divisions: string[];
  thumbUrl: string;
  tier: string;
}

function record(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function records(value: unknown) {
  return Array.isArray(value)
    ? value.map(record).filter((row): row is JsonRecord => Boolean(row))
    : [];
}

function strings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row): row is string => typeof row === "string")
    : [];
}

function revealFighter(value: unknown): BlindRankRevealFighter | null {
  const row = record(value);
  if (!row || typeof row.id !== "string" || typeof row.name !== "string") return null;
  return {
    id: row.id,
    name: row.name,
    divisions: strings(row.divisions),
    thumbUrl: typeof row.thumb_url === "string"
      ? row.thumb_url
      : typeof row.thumbUrl === "string" ? row.thumbUrl : "",
    tier: typeof row.tier === "string"
      ? row.tier.replace(/-/g, " ").toUpperCase()
      : "—",
  };
}

function comparisonCount(value: unknown, fallback: number) {
  return Number.isInteger(value) ? Number(value) : fallback;
}

export function OfficialBlindRankScoreSummary({
  projection,
}: {
  projection: TodayChallengeProjection;
}) {
  const attempt = projection.officialAttempt;
  if (projection.gameType !== "blind_rank_5" || !attempt) return null;
  const comparisons = comparisonCount(
    attempt.publicResult.correct_comparisons,
    attempt.nativeScore,
  );

  return (
    <section className="keep-cut-result-hero" aria-label="Blind Rank official score">
      <p className="eyebrow">FIVE SLOTS LOCKED</p>
      <h1>{attempt.normalizedScore}/100 · OFFICIAL RESULT</h1>
      <p>{comparisons} OF 10 COMPARISONS CORRECT</p>
      <small>Every pair in your locked ranking is graded. Ten correct comparisons scores 100.</small>
    </section>
  );
}

export function OfficialBlindRankCanonicalOrder({
  projection,
}: {
  projection: TodayChallengeProjection;
}) {
  if (projection.gameType !== "blind_rank_5" || !projection.officialAttempt) return null;
  const reveal = record(projection.publicState.reveal) ?? projection.revealSetup ?? {};
  const canonicalOrder = records(reveal.canonical_order)
    .map(revealFighter)
    .filter((row): row is BlindRankRevealFighter => Boolean(row));
  if (!canonicalOrder.length) return null;

  return (
    <section className="blind-rank-game is-complete" aria-label="Octagon HQ order">
      <header><strong>OCTAGON HQ ORDER</strong><span>MODEL REVEAL</span></header>
      <div className="blind-rank-finish">
        <div className="blind-rank-results">
          {canonicalOrder.map((row, index) => (
            <article key={row.id}>
              <b>#{index + 1}</b>
              <FighterPhoto className="blind-rank-result__photo" name={row.name} src={row.thumbUrl} />
              <span>
                <strong>{row.name}</strong>
                <small>{[row.divisions.join(" / "), row.tier].filter(Boolean).join(" · ")}</small>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
