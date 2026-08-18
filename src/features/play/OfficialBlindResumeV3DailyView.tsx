import { useEffect, useRef, useState } from "react";
import { FighterPhoto } from "../rankings/FighterPhoto";
import { getPlayFighter } from "./playFighterPool";
import type { TodayChallengeProjection } from "./todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

interface FighterPresentation {
  id: string;
  name: string;
  gender: string;
  thumbUrl: string;
  profileUrl: string;
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

function integer(value: unknown, fallback = 0) {
  return Number.isInteger(value) ? Number(value) : fallback;
}

function fighter(value: unknown): FighterPresentation | null {
  const row = record(value);
  if (!row || typeof row.id !== "string" || typeof row.name !== "string") return null;
  return {
    id: row.id,
    name: row.name,
    gender: typeof row.gender === "string" ? row.gender : "",
    thumbUrl: typeof row.thumb_url === "string" ? row.thumb_url : "",
    profileUrl: typeof row.profile_url === "string" ? row.profile_url : "",
  };
}

function rankCopy(row: FighterPresentation) {
  const ranked = getPlayFighter(row.id)?.model;
  if (!ranked) return "UFC career ranking";
  return `${row.gender === "women" ? "Women’s" : "Men’s"} UFC GOAT #${ranked.rank}`;
}

export function OfficialBlindResumeV3DailyView({
  projection,
  busy,
  onAdvance,
  onNavigate,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: Record<string, unknown>) => void;
  onNavigate: (route: string) => void;
}) {
  const state = projection.publicState;
  const results = records(state.results);
  const currentRound = record(state.current_round);
  const previousCount = useRef(results.length);
  const [pendingReveal, setPendingReveal] = useState<number | null>(null);
  const newlyAdded = results.length > previousCount.current ? results.length - 1 : null;
  const revealIndex = pendingReveal ?? newlyAdded;

  useEffect(() => {
    if (results.length > previousCount.current) setPendingReveal(results.length - 1);
    previousCount.current = results.length;
  }, [results.length]);

  if (revealIndex !== null) {
    const result = results[revealIndex];
    const fighterA = fighter(result?.fighter_a);
    const fighterB = fighter(result?.fighter_b);
    const winnerId = String(result?.winner_id ?? "");
    const pickedId = String(result?.picked_id ?? "");
    const winner = fighterA?.id === winnerId ? fighterA : fighterB;
    const loser = fighterA?.id === winnerId ? fighterB : fighterA;
    const correct = result?.correct === true;
    const points = integer(result?.points_awarded);
    const finalRound = results.length >= 5 && Boolean(projection.officialAttempt);

    if (fighterA && fighterB && winner && loser) {
      const params = new URLSearchParams({
        mode: "compare",
        fighter: fighterA.id,
        opponent: fighterB.id,
        returnTo: "/play/blind-resume?mode=daily",
        returnLabel: "Back to Blind Resume",
      });
      return (
        <div className="page blind-resume-page" data-game="blind_resume" data-version="v3">
          <section className={`blind-resume-verdict ${correct ? "is-correct" : "is-miss"}`}>
            <p className="eyebrow">{correct ? "YOU PICKED THE MODEL WINNER" : "THE MODEL DISAGREES"}</p>
            <h1>{winner.name} ranks higher</h1>
            <p>{rankCopy(winner)}. {loser.name} is {rankCopy(loser).replace(/^(Men’s|Women’s) UFC GOAT /, "")}.</p>
            <strong>+{points} POINTS</strong>
          </section>
          <section className="blind-resume-reveal-grid">
            {[fighterA, fighterB].map((row, index) => (
              <article className={`${row.id === winnerId ? "is-winner" : ""}${row.id === pickedId ? " is-picked" : ""}`} key={row.id}>
                <FighterPhoto className="blind-resume-reveal-photo" name={row.name} src={row.profileUrl || row.thumbUrl} />
                <span>FIGHTER {index === 0 ? "A" : "B"}</span>
                <strong>{row.name}</strong>
                <small>{rankCopy(row)}</small>
                {row.id === pickedId ? <em>YOUR PICK</em> : null}
              </article>
            ))}
          </section>
          <button className="blind-resume-intelligence" type="button" onClick={() => onNavigate(`/intelligence?${params.toString()}`)}>TAKE MATCHUP TO INTELLIGENCE</button>
          <button className="primary-action" type="button" onClick={() => setPendingReveal(null)}>{finalRound ? "SEE FINAL SCORE" : "NEXT ROUND"}</button>
        </div>
      );
    }
  }

  const attempt = projection.officialAttempt;
  const correctCount = results.filter((row) => row.correct === true).length;
  const earnedPoints = results.reduce((sum, row) => sum + integer(row.points_awarded), 0);

  if (attempt) {
    return (
      <div className="page blind-resume-page blind-resume-page--final" data-game="blind_resume" data-version="v3">
        <section className="blind-resume-final">
          <div>
            <p className="eyebrow">FIVE-ROUND RESULTS</p>
            <strong>{attempt.normalizedScore}/100</strong>
            <h1>{correctCount === 5 ? "Perfect card" : "Official card complete"}</h1>
          </div>
          <p>{correctCount}-{5 - correctCount} record · {earnedPoints} points earned. Your official score is saved to Today’s Challenge.</p>
        </section>
        <section className="blind-resume-recap" aria-label="Five-round Blind Resume recap">
          {results.map((result, index) => {
            const fighterA = fighter(result.fighter_a);
            const fighterB = fighter(result.fighter_b);
            const winnerId = String(result.winner_id ?? "");
            const pickedId = String(result.picked_id ?? "");
            if (!fighterA || !fighterB) return null;
            return (
              <article className="blind-resume-recap__round" key={`${index}-${fighterA.id}-${fighterB.id}`}>
                <header>
                  <span>R{index + 1}</span>
                  <b className={result.correct === true ? "is-correct" : "is-miss"}>{result.correct === true ? "CORRECT" : "MISS"} · +{integer(result.points_awarded)}</b>
                </header>
                <div>
                  {[fighterA, fighterB].map((row) => (
                    <section className={row.id === winnerId ? "is-winner" : ""} key={row.id}>
                      <FighterPhoto className="blind-resume-recap__photo" name={row.name} src={row.thumbUrl} />
                      <span><strong>{row.name}</strong><small>{rankCopy(row).replace(/^(Men’s|Women’s) UFC /, "")}</small></span>
                      <em>{row.id === winnerId ? "WINNER" : row.id === pickedId ? "PICK" : ""}</em>
                    </section>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  const stats = records(currentRound?.stats);
  const revealedCount = integer(currentRound?.revealed_count, 2);
  const correctPoints = integer(currentRound?.correct_points, 20);
  const missPoints = integer(currentRound?.miss_points, 2);

  return (
    <div className="page blind-resume-page" data-game="blind_resume" data-version="v3">
      <section className="blind-resume-scoreboard">
        <div><p className="eyebrow">TODAY’S CHALLENGE</p><h1>Which UFC career ranks higher?</h1></div>
        <aside><span>ROUND {integer(currentRound?.round_number, results.length + 1)} OF 5</span><b>{earnedPoints} PTS · {correctCount}-{results.length - correctCount}</b></aside>
      </section>
      {currentRound ? (
        <section className="blind-resume-card">
          <header><div><span>FIGHTER A</span><strong>?</strong></div><b>RESUME</b><div><span>FIGHTER B</span><strong>?</strong></div></header>
          <div className="blind-resume-stats">
            {stats.map((stat, index) => {
              const revealed = stat.revealed === true;
              return (
                <div key={`${String(stat.label)}-${index}`}>
                  <strong>{revealed ? String(stat.value_a ?? "—") : "•••"}</strong>
                  <span>{String(stat.label ?? "STAT")}</span>
                  <strong>{revealed ? String(stat.value_b ?? "—") : "•••"}</strong>
                </div>
              );
            })}
          </div>
          <p className="blind-resume-apex-note">{revealedCount} OF 8 STATS SHOWN · LOCK NOW: CORRECT +{correctPoints} · MISS +{missPoints}</p>
          <div className="blind-resume-picks">
            <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "A" })}>PICK A</button>
            <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "B" })}>PICK B</button>
          </div>
          {revealedCount < 8 ? (
            <button className="primary-action" type="button" disabled={busy} onClick={() => onAdvance({ reveal: true })}>
              {busy ? "REVEALING…" : "REVEAL 2 MORE STATS"}
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
