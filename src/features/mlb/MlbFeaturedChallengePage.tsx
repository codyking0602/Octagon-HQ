import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/mlb-playoffs.css";

const STORAGE_KEY = "the-hq:mlb-featured:2026-october-legend-rivera";

const clues = [
  "I spent all 19 of my MLB seasons with one franchise.",
  "I won five World Series championships.",
  "I finished my career with 652 regular-season saves.",
  "I recorded 42 postseason saves with a 0.70 postseason ERA.",
];

const choices = ["Trevor Hoffman", "Dennis Eckersley", "Mariano Rivera", "John Smoltz"] as const;
const answer = "Mariano Rivera";

export default function MlbFeaturedChallengePage() {
  const [clueCount, setClueCount] = useState(1);
  const [selected, setSelected] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    try {
      setCompleted(window.localStorage.getItem(STORAGE_KEY) === "complete");
    } catch {
      // Local completion is only a convenience for this one-off challenge.
    }
  }, []);

  const correct = selected === answer;
  const status = useMemo(() => {
    if (completed) return "COMPLETED";
    if (selected) return correct ? "CORRECT" : "TRY AGAIN";
    return `CLUE ${clueCount} OF ${clues.length}`;
  }, [clueCount, completed, correct, selected]);

  function choose(choice: string) {
    setSelected(choice);
    if (choice !== answer) return;
    setCompleted(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "complete");
    } catch {
      // Completion still works for the current session.
    }
  }

  return (
    <div className="page mlb-challenge-page">
      <section className="page-heading mlb-challenge-page__heading">
        <p className="eyebrow">FEATURED CHALLENGE · WHO AM I</p>
        <h1>October Legend</h1>
        <p>Use the clues to identify a postseason icon.</p>
      </section>

      <section className="surface-card mlb-challenge-card">
        <div className="mlb-challenge-card__status">{status}</div>
        <div className="mlb-challenge-card__clues">
          {clues.slice(0, clueCount).map((clue, index) => (
            <p key={clue}><span>{index + 1}</span>{clue}</p>
          ))}
        </div>

        {!completed && clueCount < clues.length ? (
          <button className="secondary-action" type="button" onClick={() => {
            setSelected("");
            setClueCount((count) => Math.min(clues.length, count + 1));
          }}>
            REVEAL NEXT CLUE
          </button>
        ) : null}

        <div className="mlb-challenge-card__choices" aria-label="Answer choices">
          {choices.map((choice) => (
            <button
              type="button"
              key={choice}
              className={choice === answer && completed ? "is-correct" : selected === choice ? "is-missed" : ""}
              disabled={completed}
              onClick={() => choose(choice)}
            >
              {choice}
            </button>
          ))}
        </div>

        {completed ? (
          <div className="mlb-challenge-card__result">
            <strong>Mariano Rivera</strong>
            <p>Five-time World Series champion · 42 postseason saves · 0.70 postseason ERA.</p>
            <Link className="primary-action" to="/mlb">BACK TO MLB PLAYOFFS</Link>
          </div>
        ) : selected ? (
          <p className="mlb-challenge-card__try">Not quite. Reveal another clue or choose again.</p>
        ) : null}
      </section>
    </div>
  );
}
