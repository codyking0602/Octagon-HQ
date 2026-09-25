import { WAVELENGTH_OPINION_DISCLOSURE, wavelengthDistanceCopy } from "../play/wavelengthEngine";
import {
  footballWavelengthCategoryLabel,
  footballWavelengthClueDescriptor,
} from "./footballWavelengthPresentation";

export interface FootballWavelengthPresentationClue {
  id: string;
  category: string;
  text: string;
  rating?: number;
}

type WavelengthCopy = {
  resultEyebrow?: string;
  progressAriaLabel?: string;
  guessAriaLabel?: string;
  categoryLabel?: (category: string) => string;
  clueDescriptor?: (category: string) => string;
  disclosure?: string;
};

export function FootballWavelengthPresentation({
  clues,
  guesses,
  guess,
  onGuessChange,
  onLock,
  busy = false,
  result,
  copy,
}: {
  clues: readonly FootballWavelengthPresentationClue[];
  guesses: readonly number[];
  guess: number;
  onGuessChange?: (value: number) => void;
  onLock?: () => void;
  busy?: boolean;
  result?: { score: number; target: number } | null;
  copy?: WavelengthCopy;
}) {
  const clueIndex = Math.max(0, Math.min(3, guesses.length));
  const clue = clues[Math.min(clueIndex, Math.max(0, clues.length - 1))];
  const categoryLabel = copy?.categoryLabel ?? ((category: string) => footballWavelengthCategoryLabel(category as never));
  const clueDescriptor = copy?.clueDescriptor ?? ((category: string) => footballWavelengthClueDescriptor(category as never));

  if (result) {
    const finalGuess = guesses[3] ?? guess;
    const distance = Math.abs(finalGuess - result.target);
    return (
      <>
        <section className="football-debate-result-hero">
          <p className="eyebrow">{copy?.resultEyebrow ?? "FOOTBALL WAVELENGTH · FINAL SCORE"}</p>
          <strong>{result.score}<small>/100</small></strong>
          <span>{wavelengthDistanceCopy(distance)}</span>
        </section>

        <section className="football-wavelength-final-numbers">
          <div><small>HIDDEN NUMBER</small><strong>{result.target}</strong></div>
          <div><small>FINAL GUESS</small><strong>{finalGuess}</strong></div>
          <div><small>YOUR PATH</small><strong>{guesses.join(" → ")}</strong></div>
        </section>

        <section className="football-wavelength-reveal">
          <header>
            <p className="eyebrow">CLUE REVEAL</p>
            <h2>How the scale moved.</h2>
          </header>
          <div>
            {clues.map((item, index) => (
              <article key={item.id}>
                <b>{index + 1}</b>
                <span>
                  <small>{categoryLabel(item.category)}</small>
                  <strong>{item.text}</strong>
                </span>
                <em>{item.rating ?? "—"}</em>
              </article>
            ))}
          </div>
          <p className="football-wavelength-rules">{copy?.disclosure ?? WAVELENGTH_OPINION_DISCLOSURE}</p>
        </section>
      </>
    );
  }

  if (!clue) return null;

  return (
    <>
      <section className="wavelength-topline">
        <span>WAVELENGTH</span>
        <b>CLUE {clueIndex + 1} OF 4</b>
      </section>
      <section className="wavelength-intro" aria-label="How to play Wavelength">
        <strong>Find the hidden 1–100 number.</strong>
        <span>Each clue reacts to your last guess. Only your fourth guess scores.</span>
      </section>
      <div className="wavelength-progress" aria-label={copy?.progressAriaLabel ?? "Football Wavelength clue progress"}>
        {[0, 1, 2, 3].map((index) => (
          <i className={`${index < clueIndex ? "is-complete" : ""}${index === clueIndex ? " is-current" : ""}`} key={index} />
        ))}
      </div>

      <section className="wavelength-clue wavelength-clue--hero" aria-live="polite">
        <h1>
          {clue.text}
          <span className="wavelength-clue__descriptor">{clueDescriptor(clue.category)}</span>
        </h1>
      </section>

      <section className="wavelength-guess-panel">
        <div><span>{clueIndex === 3 ? "FINAL GUESS" : "YOUR GUESS"}</span><strong>{guess}</strong></div>
        <input
          aria-label={copy?.guessAriaLabel ?? "Football Wavelength guess from 1 to 100"}
          type="range"
          min="1"
          max="100"
          step="1"
          value={guess}
          disabled={busy}
          onChange={(event) => onGuessChange?.(Number(event.target.value))}
        />
        <div className="wavelength-scale"><span>1 · LOW</span><span>50 · MIDDLE</span><span>100 · HIGH</span></div>
        <button className="primary-action" type="button" disabled={busy} onClick={onLock}>
          {busy ? "LOCKING…" : clueIndex === 3 ? "LOCK FINAL GUESS" : "LOCK GUESS & REVEAL NEXT CLUE"}
        </button>
      </section>

      <div className="wavelength-path">
        <span>YOUR PATH</span>
        {[0, 1, 2, 3].map((index) => (
          <span className="wavelength-path__step" key={index}>
            {index > 0 && <em>→</em>}<b>{guesses[index] ?? "—"}</b>
          </span>
        ))}
      </div>
    </>
  );
}
