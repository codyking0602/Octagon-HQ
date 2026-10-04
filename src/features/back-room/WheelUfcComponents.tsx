import { FighterPhoto } from "../rankings/FighterPhoto";
import type {
  WheelUfcCandidate,
  WheelUfcPick,
  WheelUfcState,
} from "../play/wheelUfcRepository";
import {
  WHEEL_UFC_CATEGORY_KEYS,
  WHEEL_UFC_CATEGORY_META,
  WHEEL_UFC_WEIGHT_CLASSES,
  wheelUfcPickForWeight,
  wheelUfcRankLabel,
} from "./wheelUfcModel";

export function WheelUfcDisc({
  rotation,
  spinning,
  outcome,
}: {
  rotation: number;
  spinning: boolean;
  outcome: string;
}) {
  return (
    <div className="ufc-wheel-stage" aria-label="Wheel of UFC">
      <span className="ufc-wheel-pointer" aria-hidden="true">▼</span>
      <div
        className={`ufc-wheel-disc${spinning ? " is-spinning" : ""}`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {WHEEL_UFC_CATEGORY_KEYS.map((key) => {
          const meta = WHEEL_UFC_CATEGORY_META[key];
          return (
            <span
              className="ufc-wheel-disc__label"
              style={{
                transform: `rotate(${meta.center}deg) translateY(-118px) rotate(${-meta.center}deg)`,
              }}
              key={key}
            >
              {meta.label}
            </span>
          );
        })}
        <span className="ufc-wheel-disc__hub">UFC</span>
      </div>
      <div className="ufc-wheel-outcome" aria-live="polite">
        <small>{spinning ? "SPINNING" : outcome ? "YOUR RESTRICTION" : "WEIGHTED WHEEL"}</small>
        <strong>{spinning ? "…" : outcome || "SPIN TO DRAFT"}</strong>
      </div>
    </div>
  );
}

export function WheelUfcRoster({
  title,
  roster,
  active = false,
}: {
  title: string;
  roster: readonly WheelUfcPick[];
  active?: boolean;
}) {
  return (
    <section className={`ufc-wheel-roster surface-card${active ? " is-active" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">{active ? "YOUR FIGHT TEAM" : "FIGHT TEAM"}</p>
          <h2>{title}</h2>
        </div>
        <strong>{roster.length}/8</strong>
      </header>
      <div className="ufc-wheel-roster__grid">
        {WHEEL_UFC_WEIGHT_CLASSES.map((weightClass) => {
          const pick = wheelUfcPickForWeight(roster, weightClass);
          return (
            <article className={pick ? "is-filled" : ""} key={weightClass}>
              <span className="ufc-wheel-roster__slot">{weightClass}</span>
              {pick ? (
                <>
                  <FighterPhoto name={pick.display_name} src={pick.headshot_url ?? ""} />
                  <div>
                    <strong>{pick.display_name}</strong>
                    <small>
                      {wheelUfcRankLabel(pick)}
                      {pick.country ? ` · ${pick.country}` : ""}
                    </small>
                  </div>
                </>
              ) : (
                <div className="ufc-wheel-roster__open">
                  <strong>OPEN</strong>
                  <small>Waiting for a legal spin</small>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function WheelUfcCandidateBoard({
  candidates,
  busy,
  onPick,
}: {
  candidates: readonly WheelUfcCandidate[];
  busy: boolean;
  onPick: (candidate: WheelUfcCandidate) => void;
}) {
  const groups = WHEEL_UFC_WEIGHT_CLASSES
    .map((weightClass) => ({
      weightClass,
      fighters: candidates.filter((candidate) => candidate.weight_class === weightClass),
    }))
    .filter((group) => group.fighters.length > 0);

  return (
    <section className="ufc-wheel-picker surface-card">
      <header>
        <div>
          <p className="eyebrow">MAKE YOUR PICK</p>
          <h2>Choose the division you want to fill</h2>
        </div>
        <span>{candidates.length} ELIGIBLE</span>
      </header>
      <div className="ufc-wheel-picker__groups">
        {groups.map((group) => (
          <section key={group.weightClass}>
            <header>
              <strong>{group.weightClass}</strong>
              <small>{group.fighters.length} OPTION{group.fighters.length === 1 ? "" : "S"}</small>
            </header>
            <div>
              {group.fighters.map((candidate) => (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onPick(candidate)}
                  key={candidate.fighter_slug}
                >
                  <FighterPhoto name={candidate.display_name} src={candidate.headshot_url ?? ""} />
                  <span>
                    <strong>{candidate.display_name}</strong>
                    <small>
                      {wheelUfcRankLabel(candidate)}
                      {candidate.country ? ` · ${candidate.country}` : ""}
                    </small>
                  </span>
                  <em>SELECT →</em>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export function WheelUfcFinal({
  state,
  activeProfileId,
}: {
  state: WheelUfcState;
  activeProfileId: string | null;
}) {
  const forfeited = state.forfeited_by_profile_id === state.creator.id
    ? state.creator
    : state.forfeited_by_profile_id === state.recipient.id
      ? state.recipient
      : null;
  const winner = state.result?.winner_profile_id === state.creator.id
    ? state.creator
    : state.result?.winner_profile_id === state.recipient.id
      ? state.recipient
      : null;

  return (
    <>
      <section className="ufc-wheel-final surface-card">
        <p className="eyebrow">WHEEL OF UFC · {forfeited ? "FORFEIT" : "FINAL"}</p>
        <h1>
          {forfeited
            ? `${forfeited.display_name} forfeited`
            : state.result
              ? winner ? `${winner.display_name} wins` : "Dead even"
              : "Match complete"}
        </h1>
        {state.result && !forfeited ? (
          <div className="ufc-wheel-final__grades">
            <div className={state.result.winner_profile_id === state.creator.id ? "is-winner" : ""}>
              <small>{state.creator.id === activeProfileId ? "YOU" : state.creator.display_name}</small>
              <strong>{state.result.creator_final_grade.toFixed(1)}</strong>
              <span>FINAL GRADE</span>
            </div>
            <b>VS</b>
            <div className={state.result.winner_profile_id === state.recipient.id ? "is-winner" : ""}>
              <small>{state.recipient.id === activeProfileId ? "YOU" : state.recipient.display_name}</small>
              <strong>{state.result.recipient_final_grade.toFixed(1)}</strong>
              <span>FINAL GRADE</span>
            </div>
          </div>
        ) : (
          <p>{forfeited ? "The other fighter wins by forfeit." : "Final grades unavailable."}</p>
        )}
      </section>

      <div className="ufc-wheel-final__rosters">
        <WheelUfcRoster
          title={state.creator.display_name}
          roster={state.creator_roster}
          active={state.creator.id === activeProfileId}
        />
        <WheelUfcRoster
          title={state.recipient.display_name}
          roster={state.recipient_roster}
          active={state.recipient.id === activeProfileId}
        />
      </div>
    </>
  );
}
