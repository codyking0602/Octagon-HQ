import type { TodayChallengeProjection } from "./todayChallengeRepository";
import { UfcHigherLowerCard, UfcHigherLowerReview, type UfcHigherLowerAnswerRow } from "./UfcHigherLowerView";
import type { UfcHigherLowerQuestion, UfcHigherLowerSubject } from "./ufcHigherLowerModel";

type Row = Record<string, unknown>;
const row = (value: unknown): Row => value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const list = (value: unknown): Row[] => Array.isArray(value) ? value.map(row) : [];

export function UfcHigherLowerLeaderboardResult({
  normalizedScore, answers, revealQuestions,
}: { normalizedScore: number; answers: unknown; revealQuestions: unknown }) {
  const questions = list(revealQuestions);
  const picks = list(answers);
  const complete = questions.length === 10 && picks.length === 10
    && questions.every((question, index) => typeof question.id === "string"
      && question.id === picks[index]?.question_id
      && (question.answer === "higher" || question.answer === "lower"));
  return <section className="football-higher-lower ufc-higher-lower" aria-label="Completed UFC Higher or Lower result">
    <header className="higher-lower-result">
      <p className="eyebrow">OFFICIAL UFC DAILY · HIGHER OR LOWER</p>
      <h1>{normalizedScore}/100</h1>
      <strong>{complete ? picks.filter(pick => pick.correct === true).length + " OF 10 CORRECT" : "OFFICIAL RESULT SAVED"}</strong>
    </header>
    {complete
      ? <UfcHigherLowerReview questions={questions as unknown as UfcHigherLowerQuestion[]}
          answers={picks as unknown as UfcHigherLowerAnswerRow[]} />
      : <p role="status">Detailed question evidence is unavailable. The official score remains saved.</p>}
  </section>;
}

export function OfficialUfcHigherLowerDailyView({
  projection, busy, onAdvance,
}: { projection: TodayChallengeProjection; busy: boolean; onAdvance: (action: Row) => void }) {
  const state = row(projection.publicState);
  if (projection.officialAttempt) return <UfcHigherLowerLeaderboardResult
    normalizedScore={projection.officialAttempt.normalizedScore}
    answers={projection.officialAttempt.publicResult.answers}
    revealQuestions={row(projection.revealSetup).questions}
  />;
  const question = row(state.current_question);
  const known = row(question.known) as Partial<UfcHigherLowerSubject>;
  const hidden = row(question.hidden) as Partial<UfcHigherLowerSubject>;
  const last = row(state.last_result);
  const previous = row(last.hidden);
  const index = Number(state.index ?? 0);
  return <section className="football-higher-lower ufc-higher-lower" aria-label="Official UFC Higher or Lower Daily">
    <header className="higher-lower-game-header">
      <span aria-hidden="true">🥊</span>
      <div><small>OFFICIAL UFC DAILY · Q{index + 1} OF 10</small><strong>HIGHER OR LOWER</strong></div>
      <span>{Number(state.correct_count ?? 0)}/{index}</span>
    </header>
    <div className="higher-lower-progress" aria-hidden="true"><i style={{ width: index * 10 + "%" }} /></div>
    {last.correct !== undefined
      ? <div className={"higher-lower-feedback is-visible " + (last.correct ? "is-correct" : "is-wrong")} role="status">
        <strong>{last.correct ? "CORRECT" : "NOT QUITE"}</strong>
        <span>Previous comparison: {String(previous.name ?? "")} had {String(previous.formattedValue ?? "")}.</span>
      </div> : null}
    <section className="higher-lower-stat-label">
      <small>UFC · VERIFIED FIGHT RECORD</small>
      <h2>{String(question.metricLabel ?? "UFC comparison")}</h2>
      <p>{String(question.scopeLabel ?? "UFC ONLY")}</p>
    </section>
    <section className="higher-lower-matchup">
      <UfcHigherLowerCard subject={known} />
      <div className="higher-lower-vs">VS</div>
      <UfcHigherLowerCard subject={hidden} hidden />
    </section>
    <section className="higher-lower-controls" aria-label="Select higher or lower">
      <button type="button" disabled={busy || !question.id} onClick={() => onAdvance({ choice: "higher" })}>↑ HIGHER</button>
      <button type="button" disabled={busy || !question.id} onClick={() => onAdvance({ choice: "lower" })}>↓ LOWER</button>
    </section>
  </section>;
}
