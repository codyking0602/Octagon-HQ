import type { ReactNode } from "react";
import "../../styles/football-find-leader.css";

export interface FootballFindLeaderPresentationCandidate {
  id: string;
  name: string;
  subtitle: string;
  value?: number;
}

export interface FootballFindLeaderPresentationResult {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}

export function footballFindLeaderRankLabel(rows: readonly { value?: number }[], index: number) {
  const value = rows[index]?.value;
  if (value == null) return "";
  const rank = rows.findIndex((row) => row.value === value) + 1;
  const tied = rows.filter((row) => row.value === value).length > 1;
  return tied ? `T-${rank}` : `#${rank}`;
}

export function FootballFindLeaderPresentation({
  question,
  context,
  categoryLabel,
  statLabel,
  shortLabel,
  candidates,
  leaderId,
  eliminatedIds,
  result,
  busy = false,
  eyebrow,
  intro,
  onNewLineup,
  onEliminate,
  renderVisual,
}: {
  question: string;
  context: string;
  categoryLabel: string;
  statLabel: string;
  shortLabel: string;
  candidates: readonly FootballFindLeaderPresentationCandidate[];
  leaderId?: string | null;
  eliminatedIds: readonly string[];
  result?: FootballFindLeaderPresentationResult | null;
  busy?: boolean;
  eyebrow: string;
  intro?: string;
  onNewLineup?: (() => void) | null;
  onEliminate?: ((id: string) => void) | null;
  renderVisual: (candidate: FootballFindLeaderPresentationCandidate, compact?: boolean) => ReactNode;
}) {
  const eliminatedSet = new Set(eliminatedIds);
  const showCandidateContext = new Set(candidates.map((candidate) => candidate.subtitle)).size > 1;

  if (result) {
    const revealed = [...candidates]
      .filter((candidate): candidate is FootballFindLeaderPresentationCandidate & { value: number } => typeof candidate.value === "number")
      .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    const leader = revealed.find((candidate) => candidate.id === leaderId) ?? revealed[0];
    const fatalRound = result.perfect ? null : result.score / 10;

    return (
      <>
        <section className={`football-find-result${result.perfect ? " is-perfect" : ""}`}>
          <div className="football-find-result__copy">
            <p className="eyebrow">{result.perfect ? "PERFECT RUN" : "RUN ENDED"}</p>
            <h1>{result.score}/100</h1>
            <p>{result.perfect
              ? `You cleared all nine decoys and left ${leader?.name ?? "the group leader"} standing.`
              : `You eliminated the group leader, ${leader?.name ?? "the leader"}, in Round ${fatalRound}.`}</p>
          </div>
          {leader ? (
            <article className="football-find-result__leader">
              {renderVisual(leader, true)}
              <span>
                <small>GROUP LEADER</small>
                <strong>{leader.name}</strong>
                {showCandidateContext ? <em>{leader.subtitle}</em> : null}
                <b>{leader.value.toLocaleString("en-US")} {shortLabel}</b>
              </span>
            </article>
          ) : null}
        </section>

        <section className="football-find-reveal">
          <header><p className="eyebrow">FULL STAT REVEAL</p><h2>{question}</h2></header>
          <div>
            {revealed.map((candidate, index) => (
              <article className={`${candidate.id === leaderId ? "is-leader" : ""}${candidate.id === result.fatalId ? " is-fatal" : ""}`} key={candidate.id}>
                <em>{footballFindLeaderRankLabel(revealed, index)}</em>
                <span>
                  <strong>{candidate.name}</strong>
                  {showCandidateContext ? <small>{candidate.subtitle}</small> : null}
                </span>
                <b>{candidate.value.toLocaleString("en-US")}<small>{shortLabel || statLabel}</small></b>
              </article>
            ))}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="football-find-hero">
        <div className="football-find-hero__copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{question}</h1>
          <p>{intro ?? context}</p>
          <small className="football-find-hero__category">{categoryLabel}</small>
          {onNewLineup ? (
            <button className="primary-action football-find-hero__new-lineup" type="button" onClick={onNewLineup}>
              NEW LINEUP
            </button>
          ) : null}
        </div>
        <aside className="football-find-hero__status" aria-label="Find the Leader progress">
          <div><span>ROUND</span><strong>{Math.min(10, eliminatedIds.length + 1)}</strong></div>
          <div><span>STANDING</span><strong>{Math.max(1, 10 - eliminatedIds.length)}</strong></div>
          <div><span>SAFE</span><strong>{eliminatedIds.length}/9</strong></div>
        </aside>
      </section>

      <section className="football-find-grid" aria-label="Football Find the Leader candidates">
        {candidates.map((candidate, index) => {
          const safe = eliminatedSet.has(candidate.id);
          return (
            <button
              className={`football-find-card${safe ? " is-safe" : ""}`}
              type="button"
              disabled={safe || busy || !onEliminate}
              onClick={() => onEliminate?.(candidate.id)}
              key={candidate.id}
            >
              <span className="football-find-card__number">{index + 1}</span>
              {renderVisual(candidate)}
              <span className="football-find-card__copy">
                {showCandidateContext ? <small>{candidate.subtitle}</small> : null}
                <strong>{candidate.name}</strong>
              </span>
              <em>{safe
                ? typeof candidate.value === "number"
                  ? <>SAFE · <b>{candidate.value.toLocaleString("en-US")} {shortLabel}</b></>
                  : "SAFE"
                : busy ? "LOCKING…" : "ELIMINATE"}</em>
            </button>
          );
        })}
      </section>
    </>
  );
}
