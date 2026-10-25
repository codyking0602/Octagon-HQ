import type { CSSProperties } from "react";
import type { TodayChallengeProjection } from "./todayChallengeRepository";
import { footballHigherLowerBrandForSubject } from "../back-room/footballHigherLowerBranding";
import "../../styles/football-higher-lower.css";

type RecordValue = Record<string, unknown>;
const obj = (value: unknown): RecordValue => value && typeof value === "object" && !Array.isArray(value)
  ? value as RecordValue : {};
const items = (value: unknown): RecordValue[] => Array.isArray(value) ? value.map(obj) : [];
const brandStyle = (id: unknown): CSSProperties | undefined => {
  const brand = footballHigherLowerBrandForSubject(String(id ?? ""));
  return brand ? {
    "--hl-team-primary": brand.primaryColor,
    "--hl-team-secondary": brand.secondaryColor,
  } as CSSProperties : undefined;
};
function SubjectCard({ subject, hidden }: { subject: RecordValue; hidden: boolean }) {
  const brand = footballHigherLowerBrandForSubject(String(subject.subjectId ?? ""));
  return <article className={"higher-lower-card " + (hidden ? "is-hidden" : "is-known")} style={brandStyle(subject.subjectId)}>
    <div className="higher-lower-card__identity">
      {brand?.logoSrc ? <span className="higher-lower-card__logo">
        <img src={brand.logoSrc} alt="" aria-hidden="true" /></span> : null}
      <span>{String(subject.context ?? "")}</span>
    </div>
    <h3>{String(subject.name ?? "")}</h3>
    <strong>{hidden ? "?" : String(subject.formattedValue ?? subject.value ?? "")}</strong>
  </article>;
}

export function OfficialFootballHigherLowerDailyView({
  projection, busy, onAdvance,
}: {
  projection: TodayChallengeProjection;
  busy: boolean;
  onAdvance: (action: RecordValue) => void;
}) {
  const state = projection.publicState;
  const attempt = projection.officialAttempt;
  if (attempt) {
    const answers = items(attempt.publicResult.answers);
    const revealQuestions = items(obj(projection.revealSetup).questions);
    return <main className="page football-higher-lower" data-sport="football">
      <section className="higher-lower-result">
        <p className="eyebrow">OFFICIAL FOOTBALL DAILY · FINAL RESULT</p>
        <h1>{attempt.nativeScore} / 10</h1>
        <strong>{attempt.normalizedScore} HQ POINTS</strong>
        <p>Your ten comparisons are complete and your official score is saved.</p>
      </section>
      <section className="higher-lower-review" aria-label="Official Higher or Lower answers">
        <header><span>QUESTION + FINAL NUMBERS</span><strong>YOUR CALL</strong><em>ANSWER</em></header>
        {revealQuestions.map((question, index) => {
          const answer = answers[index] ?? {};
          const known = obj(question.known), hidden = obj(question.hidden);
          return <div className={answer.correct === true ? "is-correct" : "is-wrong"} key={String(question.id ?? index)}>
            <span className="higher-lower-review__question">
              <small>Q{index + 1} · {String(question.metricLabel ?? "")}</small>
              <span className="higher-lower-review__matchup">
                <span><b>{String(known.name ?? "")}</b><em>{String(known.formattedValue ?? "")}</em></span>
                <i aria-hidden="true">→</i>
                <span><b>{String(hidden.name ?? "")}</b><em>{String(hidden.formattedValue ?? "")}</em></span>
              </span>
            </span>
            <strong>{String(answer.choice ?? "—").toUpperCase()}</strong>
            <em>{String(question.answer ?? "—").toUpperCase()}</em>
          </div>;
        })}
      </section>
    </main>;
  }

  const question = obj(state.current_question);
  const known = obj(question.known), hidden = obj(question.hidden);
  const feedback = obj(state.last_result);
  const index = Number(state.index ?? 0);
  return <main className="page football-higher-lower" data-sport="football">
    <section className="higher-lower-game-header">
      <div><small>OFFICIAL FOOTBALL DAILY · NFL + CFB · QUESTION {index + 1} OF 10</small>
        <strong>HIGHER OR LOWER</strong></div>
      <span>{Number(state.correct_count ?? 0)}/{index}</span>
    </section>
    <div className="higher-lower-progress" aria-hidden="true"><i style={{ width: index * 10 + "%" }} /></div>
    {feedback.correct !== undefined ? <div className="higher-lower-feedback is-visible" role="status">
      <strong>{feedback.correct ? "CORRECT" : "MISS"}</strong>
      <span>{String(obj(feedback.hidden).formattedValue ?? "")} · {String(feedback.choice ?? "").toUpperCase()}</span>
    </div> : null}
    <section className="higher-lower-stat-label">
      <small>{String(question.league ?? "")} · {String(question.category ?? "").replace("-", " ").toUpperCase()}</small>
      <h2>{String(question.metricLabel ?? "")}</h2>
      {question.note ? <p>{String(question.note)}</p> : null}
    </section>
    <section className="higher-lower-matchup">
      <SubjectCard subject={known} hidden={false} />
      <div className="higher-lower-vs">VS</div>
      <SubjectCard subject={hidden} hidden />
    </section>
    <section className="higher-lower-controls" aria-label="Higher or lower choice">
      <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "higher" })}><b>↑</b><span>HIGHER</span></button>
      <button type="button" disabled={busy} onClick={() => onAdvance({ choice: "lower" })}><b>↓</b><span>LOWER</span></button>
    </section>
    {busy ? <p role="status">Saving your pick…</p> : null}
  </main>;
}
