import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recordLineupCompletion } from "../play/lineupModel";
import {
  createFootballFindLeaderRun,
  formatFootballFindLeaderValue,
  type FootballFindLeaderRun,
} from "./footballFindLeaderModel";
import "../../styles/football-find-leader.css";

interface ResultState {
  score: number;
  perfect: boolean;
  fatalId: string | null;
}

export default function FootballFindLeaderPage() {
  const navigate = useNavigate();
  const [run, setRun] = useState<FootballFindLeaderRun>(() => createFootballFindLeaderRun());
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [result, setResult] = useState<ResultState | null>(null);
  const board = run.board;
  const eliminatedSet = new Set(eliminated);

  function eliminate(id: string) {
    if (result || eliminatedSet.has(id)) return;
    const round = eliminated.length + 1;
    const next = [...eliminated, id];
    setEliminated(next);
    if (id === board.leaderId) {
      const nextResult = { score: round * 10, perfect: false, fatalId: id };
      setResult(nextResult);
      recordLineupCompletion(run.identity, { ...nextResult, eliminated: next });
      return;
    }
    if (next.length === 9) {
      const nextResult = { score: 100, perfect: true, fatalId: null };
      setResult(nextResult);
      recordLineupCompletion(run.identity, { ...nextResult, eliminated: next });
    }
  }

  function startNew() {
    setRun(createFootballFindLeaderRun());
    setEliminated([]);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    const leader = board.candidates.find((candidate) => candidate.id === board.leaderId)!;
    const sorted = [...board.candidates].sort((left, right) => right.value - left.value || left.name.localeCompare(right.name));
    return (
      <div className="page football-find-leader-page">
        <section className={`football-find-result${result.perfect ? " is-perfect" : ""}`}>
          <p className="eyebrow">{result.perfect ? "PERFECT RUN" : "RUN ENDED"}</p>
          <h1>{result.score}/100</h1>
          <p>{result.perfect
            ? `You cleared all nine decoys and left ${leader.name} standing.`
            : `You eliminated the group leader, ${leader.name}.`}</p>
          <div><small>GROUP LEADER</small><strong>{leader.name}</strong><b>{formatFootballFindLeaderValue(board, leader.value)} {board.shortLabel}</b></div>
        </section>

        <section className="football-find-reveal">
          <header><p className="eyebrow">FULL STAT REVEAL</p><h2>{board.question}</h2></header>
          <div>
            {sorted.map((candidate, index) => (
              <article className={`${candidate.id === board.leaderId ? "is-leader" : ""}${candidate.id === result.fatalId ? " is-fatal" : ""}`} key={candidate.id}>
                <em>#{index + 1}</em>
                <span><strong>{candidate.name}</strong><small>{candidate.subtitle}</small></span>
                <b>{formatFootballFindLeaderValue(board, candidate.value)}<small>{board.shortLabel}</small></b>
              </article>
            ))}
          </div>
        </section>

        <div className="football-debate-actions">
          <button className="is-primary" type="button" onClick={startNew}>NEW BOARD</button>
          <button type="button" onClick={() => navigate("/back-room/football")}>ALL FOOTBALL GAMES</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page football-find-leader-page">
      <section className="football-find-hero">
        <p className="eyebrow">FIND THE LEADER · FOOTBALL</p>
        <h1>{board.question}</h1>
        <p>{board.context}</p>
        <div><strong>{10 - eliminated.length}</strong><span>STILL STANDING</span><small>Eliminate players or teams until only the leader remains.</small></div>
      </section>

      <section className="football-find-grid" aria-label="Football Find the Leader candidates">
        {board.candidates.map((candidate) => {
          const gone = eliminatedSet.has(candidate.id);
          return (
            <button className={gone ? "is-eliminated" : ""} type="button" disabled={gone} onClick={() => eliminate(candidate.id)} key={candidate.id}>
              <small>{candidate.subtitle}</small>
              <strong>{candidate.name}</strong>
              <span>{gone ? "ELIMINATED" : "TAP TO ELIMINATE"}</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
