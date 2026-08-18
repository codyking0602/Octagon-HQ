import { FighterPhoto } from "../rankings/FighterPhoto";
import { keepCutRating, type KeepCutPackId } from "./keepCutEngine";
import type { PlayFighter } from "./playFighterPool";

interface KeepCutResultSummaryProps {
  board: readonly PlayFighter[];
  keptIds: readonly string[];
  packId: KeepCutPackId;
  score: number;
  scoreLabel: string;
  topFourKept: number;
}

interface KeepCutMiss {
  kept: PlayFighter;
  missed: PlayFighter;
  gap: number;
}

function rankedBoard(packId: KeepCutPackId, board: readonly PlayFighter[]) {
  return [...board].sort((left, right) => {
    const ratingDifference = keepCutRating(packId, right) - keepCutRating(packId, left);
    return ratingDifference || left.id.localeCompare(right.id);
  });
}

function missLabel(gap: number) {
  if (gap <= 1) return "KNIFE-EDGE CALL";
  if (gap <= 4) return "CLOSE CALL";
  if (gap <= 8) return "CLEAR EDGE";
  return "BIG MISS";
}

function missReason(miss: KeepCutMiss) {
  if (miss.gap === 0) return `They were level on rating; the model tiebreak put ${miss.missed.name} ahead.`;
  if (miss.gap <= 4) return `Only ${miss.gap} rating ${miss.gap === 1 ? "point" : "points"} separated them.`;
  return `${miss.missed.name} held a ${miss.gap}-point rating edge on this board.`;
}

function CompactResultFighter({ fighter }: { fighter: PlayFighter }) {
  return (
    <article className="keep-cut-result-fighter">
      <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="keep-cut-result-fighter__photo" />
      <strong>{fighter.name}</strong>
    </article>
  );
}

export function KeepCutResultSummary({
  board,
  keptIds,
  packId,
  score,
  scoreLabel,
  topFourKept,
}: KeepCutResultSummaryProps) {
  const ranked = rankedBoard(packId, board);
  const topFour = ranked.slice(0, 4);
  const topFourIds = new Set(topFour.map((fighter) => fighter.id));
  const keptSet = new Set(keptIds);
  const kept = board.filter((fighter) => keptSet.has(fighter.id));
  const cut = board.filter((fighter) => !keptSet.has(fighter.id));
  const wrongKeeps = ranked.filter((fighter) => keptSet.has(fighter.id) && !topFourIds.has(fighter.id));
  const missedTopFour = topFour
    .filter((fighter) => !keptSet.has(fighter.id))
    .sort((left, right) => {
      const ratingDifference = keepCutRating(packId, left) - keepCutRating(packId, right);
      return ratingDifference || left.id.localeCompare(right.id);
    });
  const misses: KeepCutMiss[] = wrongKeeps.map((fighter, index) => {
    const missed = missedTopFour[index]!;
    return {
      kept: fighter,
      missed,
      gap: Math.max(0, keepCutRating(packId, missed) - keepCutRating(packId, fighter)),
    };
  });

  return (
    <>
      <section className="keep-cut-result-hero">
        <p className="eyebrow">EIGHT CALLS LOCKED</p>
        <h1>{score}/100 · {scoreLabel}</h1>
        <p>{topFourKept} OF OCTAGON HQ’S TOP 4 KEPT</p>
      </section>

      <section className="keep-cut-result-breakdown">
        <header className="keep-cut-result-section-heading">
          <span>OCTAGON HQ TOP 4</span>
          <small>STRONGEST ON THIS BOARD</small>
        </header>
        <div className="keep-cut-top-four">
          {topFour.map((fighter, index) => (
            <article className={`keep-cut-top-four__fighter${keptSet.has(fighter.id) ? " is-kept" : " is-missed"}`} key={fighter.id}>
              <b>#{index + 1}</b>
              <FighterPhoto name={fighter.name} src={fighter.thumbUrl} className="keep-cut-top-four__photo" />
              <span><strong>{fighter.name}</strong><small>{keptSet.has(fighter.id) ? "KEPT" : "MISSED"}</small></span>
            </article>
          ))}
        </div>

        <div className="keep-cut-miss-summary">
          {misses.length === 0 ? (
            <article className="keep-cut-miss is-perfect">
              <span>PERFECT READ</span>
              <strong>You kept all four of Octagon HQ’s strongest fighters.</strong>
            </article>
          ) : misses.map((miss) => (
            <article className="keep-cut-miss" key={`${miss.kept.id}-${miss.missed.id}`}>
              <span>{missLabel(miss.gap)}</span>
              <strong>You kept {miss.kept.name} over {miss.missed.name}.</strong>
              <small>{missReason(miss)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="keep-cut-result-board">
        <header className="keep-cut-result-section-heading">
          <span>YOUR BOARD</span>
          <small>FINAL CALLS</small>
        </header>
        <div className="keep-cut-result-board__columns">
          <div className="keep-cut-result-column keep-cut-result-column--keep">
            <strong>KEPT</strong>
            {kept.map((fighter) => <CompactResultFighter fighter={fighter} key={fighter.id} />)}
          </div>
          <div className="keep-cut-result-column keep-cut-result-column--cut">
            <strong>CUT</strong>
            {cut.map((fighter) => <CompactResultFighter fighter={fighter} key={fighter.id} />)}
          </div>
        </div>
      </section>
    </>
  );
}
