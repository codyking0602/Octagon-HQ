import { HigherLowerRoundHeader, HigherLowerPrompt, HigherLowerChoices, HigherLowerFeedback } from "./HigherLowerStandard";
import type { CSSProperties } from "react";
import { footballHigherLowerBrandForSubject } from "../back-room/footballHigherLowerBranding";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import "../../styles/football-higher-lower.css";
import "../../styles/higher-lower-standard.css";

type Row = Record<string, unknown>;

function object(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
}
function rows(value: unknown): Row[] {
  return Array.isArray(value) ? value.map(object) : [];
}
function brandStyle(subject: Row): CSSProperties | undefined {
  const brand = footballHigherLowerBrandForSubject(String(subject.subjectId ?? ""));
  return brand ? {
    "--hl-team-primary": brand.primaryColor,
    "--hl-team-secondary": brand.secondaryColor,
  } as CSSProperties : undefined;
}
function SubjectCard({ subject, hidden }: { subject: Row; hidden?: boolean }) {
  const brand = footballHigherLowerBrandForSubject(String(subject.subjectId ?? ""));
  return <article className={hidden ? "higher-lower-card is-hidden" : "higher-lower-card is-known"} style={brandStyle(subject)}>
    <div className="higher-lower-card__identity">
      {brand?.logoSrc ? <span className="higher-lower-card__logo"><img src={brand.logoSrc} alt="" /></span> : null}
      <span>{String(subject.context ?? "")}</span>
    </div>
    <h3>{String(subject.name ?? "Football subject")}</h3>
    <strong>{hidden ? "?" : String(subject.formattedValue ?? subject.value ?? "")}</strong>
  </article>;
}

export function FootballHigherLowerLeaderboardResult({
  normalizedScore, answers, revealQuestions,
}: { normalizedScore: number; answers: unknown; revealQuestions: unknown }) {
  const questions = rows(revealQuestions);
  const picks = rows(answers);
  const available = questions.length === 10 && picks.length === 10
    && questions.every((question, index) => question.id === picks[index]?.question_id);
  const hits = picks.filter(answer => answer.correct === true).length;
  return <section className="football-higher-lower" data-sport="football" aria-label="Completed Football Higher or Lower result">
    <header className="higher-lower-result">
      <p className="eyebrow">OFFICIAL FOOTBALL DAILY · HIGHER OR LOWER</p>
      <h1>{normalizedScore}/100</h1>
      <strong>{available ? hits + " OF 10 CORRECT" : "OFFICIAL RESULT SAVED"}</strong>
    </header>
    {available ? <section className="higher-lower-review">
      <header><span>QUESTION + FINAL NUMBERS</span><strong>YOUR CALL</strong><em>ANSWER</em></header>
      {questions.map((question, index) => {
        const answer = picks[index]!;
        const known = object(question.known);
        const hidden = object(question.hidden);
        const correct = answer.choice === question.answer;
        return <div className={correct ? "is-correct" : "is-wrong"} key={String(question.id)}>
          <span className="higher-lower-review__question">
            <small>Q{index + 1} · {String(question.league ?? "FOOTBALL")} · {String(question.metricLabel ?? "")}</small>
            <span className="higher-lower-review__matchup">
              <span><b>{String(known.name ?? "")}</b><em>{String(known.formattedValue ?? "")}</em></span>
              <i aria-hidden="true">→</i>
              <span><b>{String(hidden.name ?? "")}</b><em>{String(hidden.formattedValue ?? "")}</em></span>
            </span>
            <span className="higher-lower-review__context">{String(known.context ?? "")} vs {String(hidden.context ?? "")}</span>
          </span>
          <strong>{String(answer.choice ?? "").toUpperCase()}</strong>
          <em>{String(question.answer ?? "").toUpperCase()}</em>
        </div>;
      })}
    </section> : <p role="status">Question-by-question reveal unavailable. The official score is preserved.</p>}
  </section>;
}

export function OfficialFootballHigherLowerDailyView({
  projection, busy, onAdvance,
}: { projection: TodayChallengeProjection; busy: boolean; onAdvance: (action: Row) => void }) {
  const state = object(projection.publicSetup).format_version === "daily-two-game-average-v1"
    ? object(projection.publicState.active_round) : object(projection.publicState);
  const attempt = projection.officialAttempt;
  if (attempt) return <FootballHigherLowerLeaderboardResult
    normalizedScore={attempt.normalizedScore}
    answers={attempt.publicResult.answers}
    revealQuestions={object(projection.revealSetup).questions}
  />;
  const question = object(state.current_question);
  const known = object(question.known);
  const hidden = object(question.hidden);
  const index = Number(state.index ?? 0);
  const last = object(state.last_result);
  return <section className="football-higher-lower" data-sport="football" aria-label="Official Football Higher or Lower Daily">
    <HigherLowerRoundHeader sport={"OFFICIAL FOOTBALL DAILY · " + String(question.league ?? "NFL + COLLEGE")}
      index={index} correct={Number(state.correct_count ?? 0)} />
    {last.correct !== undefined ? <HigherLowerFeedback correct={last.correct === true}
      detail={"Previous number: " + String(object(last.hidden).formattedValue ?? "")} /> : null}
    <HigherLowerPrompt category={String(question.category ?? "").replace("-", " ")}
      metric={String(question.metricLabel ?? "Football comparison")}
      note={question.note ? String(question.note) : undefined} />
    <section className="higher-lower-matchup">
      <SubjectCard subject={known} />
      <div className="higher-lower-vs">VS</div>
      <SubjectCard subject={hidden} hidden />
    </section>
    <HigherLowerChoices disabled={busy || !question.id}
      onChoose={choice => onAdvance({ choice })} />
  </section>;
}
