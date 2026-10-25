import type { ReactNode, Ref } from "react";

/** Single chrome contract shared by Football, NBA and UFC Casual and Daily. */
export function HigherLowerIntro({ sport, preview = false, onStart, startLabel = "PLAY NOW", children }: {
  sport: string; preview?: boolean; onStart: () => void; startLabel?: string; children?: ReactNode;
}) {
  return <section className="higher-lower-hero higher-lower-standard-intro">
    <p className="eyebrow">{sport} · {preview ? "OWNER PREVIEW" : "CASUAL"}</p>
    <h1>HIGHER OR LOWER</h1>
    <p className="higher-lower-standard-intro__tagline">10 matchups. Pick who has more. How many can you get right?</p>
    {children}
    <button type="button" className="higher-lower-start" onClick={onStart}>{startLabel}</button>
  </section>;
}
export function HigherLowerRoundHeader({ sport, index, total = 10, correct, completed = index, onBack, backLabel, headerRef }: {
  sport: string; index: number; total?: number; correct: number; completed?: number;
  onBack?: () => void; backLabel?: string; headerRef?: Ref<HTMLElement>;
}) {
  const maximum = Math.max(1, total);
  const progress = Math.min(maximum, Math.max(0, completed));
  return <>
    <header className="higher-lower-game-header" ref={headerRef}>
      {onBack ? <button type="button" onClick={onBack} aria-label={backLabel ?? "Back to games"}>←</button>
        : <span className="higher-lower-game-header__mark" aria-hidden="true">↕</span>}
      <div><small>{sport} · QUESTION {Math.min(index + 1, maximum)} OF {maximum}</small>
        <strong>HIGHER OR LOWER</strong></div>
      <span className="higher-lower-game-header__score" aria-label={correct + " correct out of " + maximum}>{correct}/{maximum}</span>
    </header>
    <div className="higher-lower-progress" role="progressbar" aria-label="Questions completed"
      aria-valuemin={0} aria-valuemax={maximum} aria-valuenow={progress}>
      <i style={{ width: progress / maximum * 100 + "%" }} />
    </div>
  </>;
}
export function HigherLowerPrompt({ category, metric, note }: { category: string; metric: string; note?: string }) {
  return <section className="higher-lower-stat-label">
    <small>{category.toUpperCase()}</small><h2>{metric}</h2>{note ? <p>{note}</p> : null}
  </section>;
}
export function HigherLowerChoices({ disabled = false, revealed = null, answer = null, onChoose }: {
  disabled?: boolean; revealed?: "higher" | "lower" | null; answer?: "higher" | "lower" | null;
  onChoose: (choice: "higher" | "lower") => void;
}) {
  return <section className="higher-lower-controls" aria-label="Higher or lower choice">
    {(["higher", "lower"] as const).map(choice =>
      <button type="button" key={choice} disabled={disabled || revealed !== null}
        className={revealed !== null && answer === choice ? "is-answer" : revealed === choice ? "is-miss" : ""}
        onClick={() => onChoose(choice)}>
        <b aria-hidden="true">{choice === "higher" ? "↑" : "↓"}</b><span>{choice.toUpperCase()}</span>
      </button>)}
  </section>;
}
export function HigherLowerFeedback({ correct, detail }: { correct: boolean | null; detail?: string }) {
  return <div className={"higher-lower-feedback" + (correct === null ? "" : " is-visible " + (correct ? "is-correct" : "is-wrong"))}
    role="status" aria-live="polite">
    {correct === null ? null : <><strong>{correct ? "CORRECT" : "NOT QUITE"}</strong>{detail ? <span>{detail}</span> : null}</>}
  </div>;
}
