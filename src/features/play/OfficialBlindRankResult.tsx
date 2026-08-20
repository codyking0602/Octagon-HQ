import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  dailyRankKeepComboBlindRankResultState,
  dailyRankKeepComboComponentScore,
} from "./DailyRankKeepComboStatus";
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

function BlindRankOrder({
  title,
  label,
  order,
}: {
  title: string;
  label: string;
  order: BlindRankRevealFighter[];
}) {
  if (!order.length) return null;
  return (
    <section className="blind-rank-game is-complete" aria-label={title}>
      <header><strong>{title}</strong><span>{label}</span></header>
      <div className="blind-rank-finish">
        <div className="blind-rank-results">
          {order.map((row, index) => (
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

export function OfficialBlindRankScoreSummary({
  projection,
}: {
  projection: TodayChallengeProjection;
}) {
  const attempt = projection.officialAttempt;
  if (projection.gameType !== "blind_rank_5" || !attempt) return null;

  return (
    <section className="keep-cut-result-hero" aria-label="Blind Rank official score">
      <p className="eyebrow">FIVE SLOTS LOCKED</p>
      <h1>{attempt.normalizedScore}/100 · OFFICIAL RESULT</h1>
      <p>FIVE PLACEMENTS GRADED AGAINST OCTAGON HQ</p>
      <small>Your five locked placements are graded by their relative order to produce the 100-point score.</small>
    </section>
  );
}

export function OfficialBlindRankComboResult({
  projection,
}: {
  projection: TodayChallengeProjection;
}) {
  const state = dailyRankKeepComboBlindRankResultState(projection);
  const componentScore = dailyRankKeepComboComponentScore(projection, "blind_rank");
  if (!state || componentScore === null) return null;

  const playerOrder = records(state.slots)
    .map(revealFighter)
    .filter((row): row is BlindRankRevealFighter => Boolean(row));
  const reveal = record(state.reveal) ?? {};
  const canonicalOrder = records(reveal.canonical_order)
    .map(revealFighter)
    .filter((row): row is BlindRankRevealFighter => Boolean(row));
  if (!playerOrder.length || !canonicalOrder.length) return null;

  return (
    <>
      <section className="keep-cut-result-hero" aria-label="Blind Rank Daily Double result">
        <p className="eyebrow">BLIND RANK 5 · PART 1 RESULT</p>
        <h1>{componentScore}/100 · BLIND RANK RESULT</h1>
        <p>FIVE PLACEMENTS GRADED AGAINST OCTAGON HQ</p>
      </section>
      <BlindRankOrder title="YOUR FINAL RANKING" label="PART 1" order={playerOrder} />
      <BlindRankOrder title="OCTAGON HQ ORDER" label="MODEL REVEAL" order={canonicalOrder} />
    </>
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

  return <BlindRankOrder title="OCTAGON HQ ORDER" label="MODEL REVEAL" order={canonicalOrder} />;
}
