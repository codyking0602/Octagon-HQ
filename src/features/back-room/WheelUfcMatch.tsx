import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayChallenges } from "../challenges/ChallengeProvider";
import {
  createWheelUfcRepository,
  type WheelUfcCandidate,
  type WheelUfcState,
} from "../play/wheelUfcRepository";
import {
  WHEEL_UFC_CATEGORY_META,
  wheelUfcOtherParticipant,
  wheelUfcRosterForProfile,
  wheelUfcSpinLabel,
} from "./wheelUfcModel";
import {
  WheelUfcCandidateBoard,
  WheelUfcDisc,
  WheelUfcFinal,
  WheelUfcRoster,
} from "./WheelUfcComponents";

export function WheelUfcMatch({ code }: { code: string }) {
  const navigate = useNavigate();
  const challenges = usePlayChallenges();
  const repository = useMemo(() => createWheelUfcRepository(), []);
  const activeProfileId = challenges.activeProfile?.id ?? null;
  const [state, setState] = useState<WheelUfcState | null>(null);
  const [candidates, setCandidates] = useState<WheelUfcCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState("");
  const [showForfeit, setShowForfeit] = useState(false);
  const openedRef = useRef(false);

  async function syncMatch(showLoading = false) {
    if (!repository) return;
    if (showLoading) setLoading(true);
    try {
      const next = await repository.load(code);
      setState(next);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wheel of UFC match could not be loaded.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    void syncMatch(true);
    const timer = window.setInterval(() => void syncMatch(false), 10_000);
    const onFocus = () => void syncMatch(false);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [code, repository]);

  useEffect(() => {
    if (
      !repository
      || !state
      || openedRef.current
      || state.opened_at
      || state.completed_at
      || activeProfileId !== state.recipient.id
    ) return;
    openedRef.current = true;
    repository.open(code)
      .then(() => Promise.all([syncMatch(false), challenges.refresh()]))
      .catch((reason) => {
        openedRef.current = false;
        setError(reason instanceof Error ? reason.message : "Challenge could not be accepted.");
      });
  }, [activeProfileId, challenges, code, repository, state]);

  const isMyTurn = Boolean(
    state && activeProfileId && state.current_turn_profile_id === activeProfileId,
  );
  const myRoster = state ? wheelUfcRosterForProfile(state, activeProfileId) : [];
  const opponent = state ? wheelUfcOtherParticipant(state, activeProfileId) : null;
  const opponentRoster = state && opponent
    ? wheelUfcRosterForProfile(state, opponent.id)
    : [];

  useEffect(() => {
    setCandidates([]);
    if (!repository || !state || !isMyTurn || state.phase !== "pick") return;
    setCandidateLoading(true);
    repository.candidates(code)
      .then(setCandidates)
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : "Eligible fighters could not be loaded.");
      })
      .finally(() => setCandidateLoading(false));
  }, [
    code,
    isMyTurn,
    repository,
    state?.pending_category_key,
    state?.pending_country,
    state?.phase,
  ]);

  async function spin() {
    if (
      !repository
      || !state
      || !isMyTurn
      || state.phase !== "spin"
      || spinning
      || !state.opened_at
    ) return;

    setSpinning(true);
    setError("");
    try {
      const next = await repository.spin(code);
      const category = next.pending_category_key;
      if (!category) throw new Error("The wheel did not resolve a category.");
      const center = WHEEL_UFC_CATEGORY_META[category].center;
      setRotation((current) => {
        const currentModulo = ((current % 360) + 360) % 360;
        const targetModulo = ((360 - center) % 360 + 360) % 360;
        const correction = (targetModulo - currentModulo + 360) % 360;
        return current + 1080 + correction;
      });
      window.setTimeout(() => {
        setState(next);
        setSpinning(false);
        void challenges.refresh();
      }, 1500);
    } catch (reason) {
      setSpinning(false);
      setError(reason instanceof Error ? reason.message : "The wheel could not be spun.");
    }
  }

  async function pick(candidate: WheelUfcCandidate) {
    if (!repository || !state || !isMyTurn || state.phase !== "pick" || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await repository.pick(code, candidate.fighter_slug);
      setState(next);
      setCandidates([]);
      await challenges.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That fighter could not be drafted.");
    } finally {
      setBusy(false);
    }
  }

  async function forfeit() {
    if (!repository || !state?.opened_at || state.phase === "complete" || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await repository.forfeit(code);
      setState(next);
      setShowForfeit(false);
      await challenges.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The matchup could not be forfeited.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="page football-wheel-page ufc-wheel-page">
        <section className="football-wheel-setup__hero surface-card">
          <p className="eyebrow">WHEEL OF UFC</p>
          <h1>Loading matchup…</h1>
        </section>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="page football-wheel-page ufc-wheel-page">
        <section className="football-wheel-setup__hero surface-card">
          <p className="eyebrow">WHEEL OF UFC</p>
          <h1>Match unavailable</h1>
          <p>{error || "This challenge could not be found."}</p>
          <button type="button" onClick={() => navigate("/play")}>BACK TO UFC GAMES</button>
        </section>
      </div>
    );
  }

  if (state.phase === "complete") {
    return (
      <div className="page football-wheel-page ufc-wheel-page ufc-wheel-page--result">
        <WheelUfcFinal state={state} activeProfileId={activeProfileId} />
        <div className="football-wheel-setup__actions">
          <button type="button" className="secondary-action" onClick={() => navigate("/play")}>
            ALL GAMES
          </button>
          <button type="button" className="primary-action" onClick={() => navigate("/play/wheel")}>
            NEW CHALLENGE →
          </button>
        </div>
      </div>
    );
  }

  const turnLabel = !state.opened_at
    ? activeProfileId === state.recipient.id
      ? "ACCEPTING CHALLENGE…"
      : `WAITING FOR ${state.recipient.display_name.toUpperCase()} TO ACCEPT`
    : isMyTurn
      ? state.phase === "spin" ? "YOUR TURN · SPIN" : "YOUR TURN · DRAFT"
      : state.phase === "pick"
        ? `${opponent?.display_name.toUpperCase() ?? "OPPONENT"} IS DRAFTING`
        : `${opponent?.display_name.toUpperCase() ?? "OPPONENT"}'S TURN`;

  return (
    <div className="page football-wheel-page ufc-wheel-page">
      <section className="ufc-wheel-match-status surface-card">
        <div>
          <p className="eyebrow">WHEEL OF UFC</p>
          <h1>{state.creator.display_name} <span>vs</span> {state.recipient.display_name}</h1>
        </div>
        <strong>{turnLabel}</strong>
      </section>

      <WheelUfcRoster
        title={activeProfileId === state.creator.id
          ? state.creator.display_name
          : state.recipient.display_name}
        roster={myRoster}
        active
      />

      <section className="ufc-wheel-turn surface-card">
        <WheelUfcDisc
          rotation={rotation}
          spinning={spinning}
          outcome={wheelUfcSpinLabel(state)}
        />
        {isMyTurn && state.phase === "spin" && state.opened_at ? (
          <button
            className="primary-action ufc-wheel-spin-button"
            type="button"
            disabled={spinning || busy}
            onClick={() => void spin()}
          >
            {spinning ? "SPINNING…" : "SPIN THE WHEEL"}
          </button>
        ) : null}
        {!isMyTurn ? (
          <p className="ufc-wheel-turn__waiting">
            Your team is locked until the other player finishes this turn.
          </p>
        ) : null}
      </section>

      {isMyTurn && state.phase === "pick" ? (
        candidateLoading ? (
          <section className="ufc-wheel-picker surface-card">
            <p>Loading eligible fighters…</p>
          </section>
        ) : (
          <WheelUfcCandidateBoard
            candidates={candidates}
            busy={busy}
            onPick={(candidate) => void pick(candidate)}
          />
        )
      ) : null}

      <WheelUfcRoster title={opponent?.display_name ?? "Opponent"} roster={opponentRoster} />

      {error ? <p className="football-wheel-page__error" role="status">{error}</p> : null}

      <div className="ufc-wheel-match-actions">
        <button type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
        {state.opened_at ? (
          <button type="button" className="is-danger" onClick={() => setShowForfeit(true)}>
            FORFEIT
          </button>
        ) : null}
      </div>

      {showForfeit ? (
        <section
          className="ufc-wheel-forfeit surface-card"
          role="dialog"
          aria-modal="true"
          aria-label="Forfeit Wheel of UFC"
        >
          <strong>Forfeit this matchup?</strong>
          <p>Your completed picks stay visible, but your opponent wins immediately.</p>
          <div>
            <button type="button" disabled={busy} onClick={() => setShowForfeit(false)}>
              CANCEL
            </button>
            <button
              type="button"
              className="is-danger"
              disabled={busy}
              onClick={() => void forfeit()}
            >
              {busy ? "ENDING…" : "FORFEIT MATCH"}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
