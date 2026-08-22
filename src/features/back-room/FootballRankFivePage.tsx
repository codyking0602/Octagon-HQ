import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import { scoreBlindRankOrderedRatings } from "../play/officialScoreContract";
import { FootballSubjectVisual } from "./FootballSubjectVisual";
import {
  createRandomFootballRankFiveRun,
  type FootballRankFiveItem,
} from "./footballRankFiveModel";

export default function FootballRankFivePage() {
  const navigate = useNavigate();
  const [run, setRun] = useState(() => createRandomFootballRankFiveRun());
  const [placements, setPlacements] = useState<Array<FootballRankFiveItem | null>>(Array(5).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const complete = currentIndex >= 5;
  const current = run.lineup[currentIndex];
  const completedScore = complete
    ? scoreBlindRankOrderedRatings(
      placements.flatMap((item) => item ? [item.rating] : []),
    )
    : null;
  const canonicalOrder = complete
    ? run.lineup
      .map((item, boardIndex) => ({ item, boardIndex }))
      .sort((left, right) => right.item.rating - left.item.rating || left.boardIndex - right.boardIndex)
    : [];

  useEffect(() => {
    if (!complete) return;
    recordLineupCompletion(run.identity, {
      packId: run.pack.id,
      placements: placements.flatMap((item) => item ? [item.id] : []),
      score: completedScore?.normalizedScore ?? 0,
    });
  }, [complete, completedScore?.normalizedScore, placements, run.identity, run.pack.id]);

  function resetBoard() {
    setPlacements(Array(5).fill(null));
    setCurrentIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewLineup() {
    setRun(createRandomFootballRankFiveRun(run.pack.id));
    resetBoard();
  }

  function placeCurrent(slotIndex: number) {
    if (complete || !current || placements[slotIndex]) return;
    const next = [...placements];
    next[slotIndex] = current;
    setPlacements(next);
    setCurrentIndex((index) => index + 1);
  }

  return (
    <div className="page football-rank-five-page">
      <section className="football-rank-five-intro">
        <div>
          <p className="eyebrow">THE BACK ROOM · FOOTBALL</p>
          <h1>{run.pack.prompt}</h1>
          <p>{run.pack.intro}</p>
        </div>
        <div className="football-rank-five-category">
          <small>CURRENT CATEGORY</small>
          <strong>{run.pack.name}</strong>
          {!complete ? <button type="button" onClick={startNewLineup}>NEW LINEUP</button> : null}
        </div>
      </section>

      <section className={`football-rank-five-board${complete ? " is-complete" : ""}`}>
        <header>
          <span>{complete ? "BOARD LOCKED" : `LOCKED ${currentIndex} OF 5`}</span>
          <strong>BLIND RANK 5</strong>
        </header>

        {!complete ? (
          <div className="football-rank-five-slots" aria-label="Football Blind Rank 5 locked slots">
            {placements.map((item, index) => item ? (
              <button className="football-rank-five-slot is-filled" type="button" disabled key={index}>
                <b>#{index + 1}</b>
                <FootballSubjectVisual className="football-rank-five-slot__visual" item={item} packId={run.pack.id} />
                <span>{item.name}</span>
              </button>
            ) : (
              <button
                className="football-rank-five-slot"
                type="button"
                key={index}
                aria-label={`Place current item at rank ${index + 1}`}
                onClick={() => placeCurrent(index)}
              >
                <b>#{index + 1}</b>
                <span>PLACE HERE</span>
              </button>
            ))}
          </div>
        ) : null}

        {complete ? (
          <div className="football-rank-five-finish">
            <section className="football-rank-five-score" aria-label="Football Blind Rank 5 score">
              <p className="eyebrow">FIVE SPOTS. NO TAKEBACKS.</p>
              <h2>{completedScore?.normalizedScore ?? 0}/100</h2>
              <p>Graded against the Back Room order using the same pairwise Blind Rank 5 scoring as UFC.</p>
            </section>

            <div className="football-rank-five-reveal-grid">
              <section>
                <p className="eyebrow">YOUR FINAL RANKING</p>
                <div className="football-rank-five-results">
                  {placements.map((item, index) => item ? (
                    <article key={item.id}>
                      <b>#{index + 1}</b>
                      <FootballSubjectVisual item={item} packId={run.pack.id} />
                      <span><strong>{item.name}</strong><small>{item.subtitle}</small></span>
                      <em>{item.league}</em>
                    </article>
                  ) : null)}
                </div>
              </section>

              <section>
                <p className="eyebrow">BACK ROOM ORDER</p>
                <div className="football-rank-five-results is-canonical">
                  {canonicalOrder.map(({ item }, index) => (
                    <article key={item.id}>
                      <b>#{index + 1}</b>
                      <FootballSubjectVisual item={item} packId={run.pack.id} />
                      <span><strong>{item.name}</strong><small>{item.subtitle}</small></span>
                      <em>{item.league}</em>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="football-rank-five-actions">
              <button className="football-rank-five-primary" type="button" onClick={startNewLineup}>NEW LINEUP</button>
              <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
            </div>
          </div>
        ) : current ? (
          <article className="football-rank-five-current">
            <FootballSubjectVisual className="football-rank-five-current__visual" item={current} packId={run.pack.id} />
            <div>
              <p className="eyebrow">{current.league} · REVEAL {currentIndex + 1} OF 5</p>
              <h2>{current.name}</h2>
              <p>{current.subtitle}</p>
              <strong>Choose an open slot. Once placed, it’s locked.</strong>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
