import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-weekly-superteam.css";
import "../../styles/football-weekly-superteam-lab.css";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionBidInput,
  type FootballWeeklySuperteamLabState,
} from "../play/footballWeeklyAuctionRepository";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import {
  FootballWeeklySuperteamFinalResult,
  FootballWeeklySuperteamGate,
  FootballWeeklySuperteamRulesCover,
} from "./FootballWeeklySuperteamGate";

export default function FootballWeeklySuperteamLabPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const owner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const [lab, setLab] = useState<FootballWeeklySuperteamLabState | null>(null);
  const [seatIndex, setSeatIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rulesDismissed, setRulesDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!identity.ready) return () => { active = false; };

    if (!owner || !repository) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    repository.loadSuperteamLab(1)
      .then((next) => {
        if (!active) return;
        setLab(next);
        setSeatIndex(next.seat_index);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Playthrough Lab could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [identity.ready, owner, repository]);

  async function loadSeat(nextSeat: number) {
    if (!repository || nextSeat === seatIndex || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repository.loadSuperteamLab(nextSeat);
      setLab(next);
      setSeatIndex(nextSeat);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That simulated seat could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(bids: Record<number, FootballWeeklyAuctionBidInput>) {
    if (!repository) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repository.submitSuperteamLab(seatIndex, bids);
      setLab(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lab bids could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function advanceDay() {
    if (!repository || !lab || lab.completed || lab.submitted_count !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repository.advanceSuperteamLab(seatIndex);
      setLab(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The simulated day could not be resolved.");
    } finally {
      setBusy(false);
    }
  }

  async function resetLab() {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      const next = await repository.resetSuperteamLab();
      setLab(next);
      setSeatIndex(1);
      setRulesDismissed(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A fresh playthrough could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  if (identity.ready && !owner) return <Navigate to="/football" replace />;

  if (!identity.ready || loading) {
    return (
      <div className="page football-weekly-superteam-lab">
        <section className="football-weekly-superteam-lab__hero surface-card">
          <p className="eyebrow">OWNER QA · WEEKLY AUCTION</p>
          <h1>Building the Playthrough Lab…</h1>
        </section>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="page football-weekly-superteam-lab">
        <section className="football-weekly-superteam-lab__hero surface-card">
          <p className="eyebrow">OWNER QA · WEEKLY AUCTION</p>
          <h1>Playthrough unavailable</h1>
          {error ? <p role="status">{error}</p> : null}
          <button type="button" onClick={() => navigate("/football/weekly-auction")}>BACK TO AUCTION CENTER</button>
        </section>
      </div>
    );
  }

  if (!rulesDismissed) {
    return (
      <div className="page football-weekly-superteam-lab">
        <FootballWeeklySuperteamRulesCover
          startLabel="START PLAYTHROUGH"
          onStart={() => setRulesDismissed(true)}
        />
      </div>
    );
  }

  return (
    <div className="page football-weekly-superteam-lab">
      <section className="football-weekly-superteam-lab__hero surface-card">
        <div>
          <p className="eyebrow">OWNER QA · REAL AUCTION ENGINE</p>
          <h1>WEEKLY AUCTION PLAYTHROUGH</h1>
          <p>
            Run the same six simulated players through all seven days on an isolated alternate
            board. The Standard generator, bankroll rules, claim priority, ties, assignments,
            day resolver, autofill, and final grading are the same engine used by the live game.
          </p>
        </div>
        <div className="football-weekly-superteam-lab__hero-actions">
          <button type="button" disabled={busy} onClick={() => void resetLab()}>NEW BOARD</button>
          <button type="button" onClick={() => navigate("/football/weekly-auction")}>DONE</button>
        </div>
      </section>

      <section className="football-weekly-superteam-lab__run surface-card">
        <div><small>RUN</small><strong>#{lab.run_number}</strong></div>
        <div><small>{lab.completed ? "STATUS" : "DAY"}</small><strong>{lab.completed ? "FINAL" : `${lab.day_index}/7`}</strong></div>
        <div><small>SEATS IN</small><strong>{lab.completed ? "6/6" : `${lab.submitted_count}/6`}</strong></div>
        <div><small>LIVE IMPACT</small><strong>NONE</strong></div>
      </section>

      <section className="football-weekly-superteam-lab__seats" aria-label="Simulated auction seats">
        {lab.seats.map((seat) => (
          <button
            type="button"
            key={seat.seat_index}
            className={seatIndex === seat.seat_index ? "is-active" : ""}
            disabled={busy}
            onClick={() => void loadSeat(seat.seat_index)}
          >
            <small>SEAT {seat.seat_index}</small>
            <strong>{seat.display_name}</strong>
            <span>{lab.completed ? `${seat.owned_count}/7 · $${seat.bankroll}` : seat.submitted_today ? "BIDS IN ✓" : "NEEDS BIDS"}</span>
          </button>
        ))}
      </section>

      {!lab.completed ? (
        <section className="football-weekly-superteam-lab__day-control surface-card">
          <div>
            <small>ACCELERATED DAY {lab.day_index}</small>
            <strong>{lab.submitted_count === 6 ? "All six seats are locked in." : `Submit ${6-lab.submitted_count} more seat${6-lab.submitted_count === 1 ? "" : "s"}.`}</strong>
            <span>Resolving uses the real server-owned auction resolver, then immediately opens the next simulated day.</span>
          </div>
          <button
            type="button"
            disabled={busy || lab.submitted_count !== 6}
            onClick={() => void advanceDay()}
          >
            {lab.day_index === 7 ? "RESOLVE WEEK" : `RESOLVE DAY ${lab.day_index}`} →
          </button>
        </section>
      ) : null}

      {error ? <p className="football-weekly-superteam-lab__error" role="status">{error}</p> : null}

      {lab.completed && lab.final ? (
        <FootballWeeklySuperteamFinalResult
          key={`final-${lab.run_number}-${seatIndex}`}
          result={lab.final}
          busy={false}
          onAcknowledge={() => undefined}
          showNewWeekAction={false}
        />
      ) : lab.state ? (
        <FootballWeeklySuperteamGate
          key={`run-${lab.run_number}-day-${lab.day_index}-seat-${seatIndex}`}
          state={lab.state}
          busy={busy}
          error={error}
          forceBoard
          showContinueAction={false}
          submittedNote="Saved for this simulated seat. Switch seats above or edit these bids."
          onSubmit={submit}
          onContinue={() => undefined}
        />
      ) : null}
    </div>
  );
}
