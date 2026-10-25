import { HigherLowerRoundHeader, HigherLowerPrompt, HigherLowerChoices, HigherLowerFeedback } from "./HigherLowerStandard";
import { FighterPhoto } from "../rankings/FighterPhoto";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import "../../styles/football-higher-lower.css";
import "../../styles/ufc-higher-lower.css";
import "../../styles/higher-lower-standard.css";

type Row = Record<string, unknown>;
const record = (value: unknown): Row =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const rows = (value: unknown): Row[] => Array.isArray(value) ? value.map(record) : [];

function UfcSubjectCard({ subject, hidden = false }: { subject: Row; hidden?: boolean }) {
  const name = String(subject.name ?? "UFC fighter");
  return <article className={"higher-lower-card ufc-hl__card " + (hidden ? "is-hidden" : "is-known")}>
    <div className="ufc-hl__portrait">
      <FighterPhoto name={name} src={String(subject.photoSrc ?? "")} />
    </div>
    <div className="higher-lower-card__identity"><span>{String(subject.context ?? "UFC")}</span></div>
    <h3>{name}</h3>
    <strong>{hidden ? "?" : String(subject.formattedValue ?? subject.value ?? "")}</strong>
  </article>;
}

export function UfcHigherLowerLeaderboardResult({
  normalizedScore, answers, revealQuestions,
}: { normalizedScore: number; answers: unknown; revealQuestions: unknown }) {
  const questions = rows(revealQuestions);
  const picks = rows(answers);
  const valid = questions.length === 10 && picks.length === 10
    && questions.every((q, index) => q.id === picks[index]?.question_id);
  const hits = picks.filter(q => q.correct === true).length;
  return <section className="football-higher-lower ufc-higher-lower" data-sport="ufc" aria-label="Completed UFC Higher or Lower">
    <header className="higher-lower-result">
      <p className="eyebrow">OFFICIAL UFC DAILY · HIGHER OR LOWER</p>
      <h1>{normalizedScore}/100</h1>
      <strong>{valid ? hits + " OF 10 CORRECT" : "OFFICIAL RESULT SAVED"}</strong>
    </header>
    {valid ? <section className="higher-lower-review">
      <header><span>QUESTION + FINAL NUMBERS</span><strong>YOUR CALL</strong><em>ANSWER</em></header>
      {questions.map((q, index) => {
        const pick = picks[index]!;
        const known = record(q.known);
        const hidden = record(q.hidden);
        return <div className={pick.correct === true ? "is-correct" : "is-wrong"} key={String(q.id)}>
          <span className="higher-lower-review__question">
            <small>Q{index + 1} · {String(q.metricLabel ?? "UFC statistic")}</small>
            <span className="higher-lower-review__matchup">
              <span><b>{String(known.name ?? "")}</b><em>{String(known.formattedValue ?? "")}</em></span>
              <i aria-hidden="true">→</i>
              <span><b>{String(hidden.name ?? "")}</b><em>{String(hidden.formattedValue ?? "")}</em></span>
            </span>
            <span className="higher-lower-review__context">UFC bouts only · through Aug 18, 2026</span>
          </span>
          <strong>{String(pick.choice ?? "").toUpperCase()}</strong>
          <em>{String(q.answer ?? "").toUpperCase()}</em>
        </div>;
      })}
    </section> : <p role="status">Your official result is saved. A question-by-question reveal is unavailable.</p>}
  </section>;
}

export function OfficialUfcHigherLowerDailyView({
  projection, busy, onAdvance,
}: { projection: TodayChallengeProjection; busy: boolean; onAdvance: (action: Row) => void }) {
  const state = record(projection.publicState);
  const attempt = projection.officialAttempt;
  if (attempt) return <UfcHigherLowerLeaderboardResult
    normalizedScore={attempt.normalizedScore}
    answers={attempt.publicResult.answers}
    revealQuestions={record(projection.revealSetup).questions}
  />;
  const current = record(state.current_question);
  const known = record(current.known);
  const hidden = record(current.hidden);
  const index = Number(state.index ?? 0);
  const feedback = record(state.last_result);
  return <section className="football-higher-lower ufc-higher-lower" data-sport="ufc" aria-label="Official UFC Higher or Lower Daily">
    <HigherLowerRoundHeader sport="OFFICIAL UFC DAILY"
      index={index} correct={Number(state.correct_count ?? 0)} />
    {feedback.correct !== undefined ? <HigherLowerFeedback correct={feedback.correct === true}
      detail={"Previous: " + String(record(feedback.known).name ?? "") + " vs " + String(record(feedback.hidden).name ?? "") + " · " + String(record(feedback.hidden).formattedValue ?? "")} /> : null}
    <HigherLowerPrompt category={String(current.category ?? "UFC CAREER")}
      metric={String(current.metricLabel ?? "UFC comparison")} />
    <section className="higher-lower-matchup">
      <UfcSubjectCard subject={known} />
      <div className="higher-lower-vs">VS</div>
      <UfcSubjectCard subject={hidden} hidden />
    </section>
    <HigherLowerChoices disabled={busy || !current.id}
      onChoose={choice => onAdvance({ choice })} />
  </section>;
}
