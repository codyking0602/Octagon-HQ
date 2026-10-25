import { FighterPhoto } from "../rankings/FighterPhoto";
import type { UfcHigherLowerQuestion, UfcHigherLowerSubject } from "./ufcHigherLowerModel";
import "../../styles/football-higher-lower.css";
import "../../styles/ufc-higher-lower.css";

export type UfcHigherLowerAnswerRow = { question_id: string; choice: string; correct: boolean };

export function UfcHigherLowerCard({
  subject, hidden = false, revealed = false,
}: { subject: Partial<UfcHigherLowerSubject>; hidden?: boolean; revealed?: boolean }) {
  const name = subject.name ?? "UFC fighter";
  return <article className={"higher-lower-card " + (hidden ? "is-hidden" : "is-known") + (revealed ? " is-revealed" : "")}>
    <div className="higher-lower-card__identity"><span>UFC · {subject.context || "FIGHTER"}</span></div>
    <div className="ufc-higher-lower__portrait" role="img" aria-label={name + " portrait"}>
      <FighterPhoto name={name} src={subject.photoUrl ?? ""} />
    </div>
    <h3>{name}</h3>
    <strong>{hidden && !revealed ? "?" : (subject.formattedValue ?? String(subject.value ?? "—"))}</strong>
  </article>;
}

export function UfcHigherLowerReview({
  questions, answers,
}: { questions: readonly UfcHigherLowerQuestion[]; answers: readonly UfcHigherLowerAnswerRow[] }) {
  return <section className="higher-lower-review" aria-label="UFC comparison review">
    <header><span>QUESTION + FINAL NUMBERS</span><strong>YOUR CALL</strong><em>ANSWER</em></header>
    {questions.map((question, index) => {
      const answer = answers[index];
      const correct = answer?.choice === question.answer;
      return <div className={correct ? "is-correct" : "is-wrong"} key={question.id}>
        <span className="higher-lower-review__question">
          <small>Q{index + 1} · {question.metricLabel}</small>
          <span className="higher-lower-review__matchup">
            <span><b>{question.known.name}</b><em>{question.known.formattedValue}</em></span>
            <i aria-hidden="true">→</i>
            <span><b>{question.hidden.name}</b><em>{question.hidden.formattedValue}</em></span>
          </span>
          <span className="higher-lower-review__context">{question.scopeLabel}</span>
        </span>
        <strong>{answer?.choice?.toUpperCase() ?? "—"}</strong><em>{question.answer.toUpperCase()}</em>
      </div>;
    })}
  </section>;
}
