import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../../styles/football-weekly-superteam-lab.css";
import "../../styles/football-weekly-nfl-team-seasons.css";
import "../../styles/football-weekly-nfl-team-seasons-lab.css";
import { useIdentity } from "../identity/IdentityProvider";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionBidInput,
  type FootballWeeklyNflTeamSeasonLabState,
} from "../play/footballWeeklyAuctionRepository";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import {
  FootballWeeklyNflTeamSeasonFinalResult,
  FootballWeeklyNflTeamSeasonGate,
} from "./FootballWeeklyNflTeamSeasonGate";

export default function FootballWeeklyNflTeamSeasonLabPage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const owner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const [lab, setLab] = useState<FootballWeeklyNflTeamSeasonLabState | null>(null);
  const [seatIndex, setSeatIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [introDismissed, setIntroDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!identity.ready) return () => { active = false; };

    if (!owner || !repository) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    repository.loadNflTeamSeasonLab(1)
      .then((next) => {
        if (!active) return;
        setLab(next);
        setSeatIndex(next.seat_index);
      })
      .catch((reason) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "NFL Team-Seasons Playthrough Lab could not be loaded.");
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
      const next = await repository.loadNflTeamSeasonLab(nextSeat);
      setLab(next);
      setSeatIndex(nextSeat);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That simulated seat could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  async function submitNormal(bids: Record<number, FootballWeeklyAuctionBidInput>) {
    if (!repository) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.submitNflTeamSeasonLab(seatIndex, bids));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lab bids could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function submitWildcard(entries: number, rankings: string[]) {
    if (!repository) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.submitNflTeamSeasonLabWildcard(seatIndex, entries, rankings));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lab Wildcard decision could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function advanceDay() {
    if (!repository || !lab || lab.completed || lab.submitted_count !== 5) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.advanceNflTeamSeasonLab(seatIndex));
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
      const next = await repository.resetNflTeamSeasonLab();
      setLab(next);
      setSeatIndex(1);
      setIntroDismissed(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A fresh NFL Team-Seasons playthrough could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  if (identity.ready && !owner) return <Navigate to="/football" replace />;

  if (!identity.ready || loading) {
    return (
      <div className="page football-weekly-superteam-lab nfl-ts-lab">
        <section className="football-weekly-superteam-lab__hero surface-card">
          <p className="eyebrow">OWNER QA · NFL WEEKLY AUCTION</p>
          <h1>Building the Team-Seasons Lab…</h1>
        </section>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="page football-weekly-superteam-lab nfl-ts-lab">
        <section className="football-weekly-superteam-lab__hero surface-card">
          <p className="eyebrow">OWNER QA · NFL WEEKLY AUCTION</p>
          <h1>Playthrough unavailable</h1>
          {error ? <p role="status">{error}</p> : null}
          <button type="button" onClick={() => navigate("/football/weekly-auction")}>BACK TO AUCTION CENTER</button>
        </section>
      </div>
    );
  }

  if (!introDismissed) {
    return (
      <div className="page football-weekly-superteam-lab nfl-ts-lab">
        <section className="nfl-ts-lab__intro surface-card">
          <p className="eyebrow">OWNER QA · REAL PRODUCTION ENGINE</p>
          <h1>BEST NFL TEAM-SEASONS<br />FULL WEEK PLAYTHROUGH</h1>
          <p>
            Control all five simulated seats across six sealed-bid days, then play the exact Day 7
            Wildcard, Priority wheel, Reaping wheel, completion autofill, and best-four finalizer.
            The shadow week cannot alter the live competition.
          </p>
          <div>
            <button className="nfl-ts__primary" type="button" onClick={() => setIntroDismissed(true)}>START PLAYTHROUGH</button>
            <button type="button" onClick={() => navigate("/football/weekly-auction")}>BACK TO AUCTION CENTER</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page football-weekly-superteam-lab nfl-ts-lab">
      <section className="football-weekly-superteam-lab__hero surface-card">
        <div>
          <p className="eyebrow">OWNER QA · BEST NFL TEAM-SEASONS</p>
          <h1>WEEKLY AUCTION PLAYTHROUGH</h1>
          <p>
            Five real profile seats on an isolated shadow week. Normal bids, ties, max-two/day,
            max-five/week, Wildcard tickets, Reaping, autofill, and final scoring all use the production functions.
          </p>
        </div>
        <div className="football-weekly-superteam-lab__hero-actions">
          <button type="button" disabled={busy} onClick={() => void resetLab()}>NEW BOARD</button>
          <button type="button" onClick={() => navigate("/football/weekly-auction")}>DONE</button>
        </div>
      </section>

      <section className="football-weekly-superteam-lab__run surface-card">
        <div><small>RUN</small><strong>#{lab.run_number}</strong></div>
        <div><small>{lab.completed ? "STATUS" : "DAY"}</small><strong>{lab.completed ? "FINAL" : lab.day_index + "/7"}</strong></div>
        <div><small>SEATS IN</small><strong>{lab.completed ? "5/5" : lab.submitted_count + "/5"}</strong></div>
        <div><small>LIVE IMPACT</small><strong>NONE</strong></div>
      </section>

      <section className="football-weekly-superteam-lab__seats nfl-ts-lab__seats" aria-label="Simulated NFL auction seats">
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
            <span>
              {lab.completed
                ? seat.owned_count + " normal · $" + seat.bankroll
                : seat.submitted_today
                  ? lab.day_index === 7 ? "DECISION IN ✓" : "BIDS IN ✓"
                  : lab.day_index === 7 ? "NEEDS DECISION" : "NEEDS BIDS"}
            </span>
          </button>
        ))}
      </section>

      {!lab.completed ? (
        <section className="football-weekly-superteam-lab__day-control surface-card">
          <div>
            <small>{lab.day_index === 7 ? "WILDCARD FINALE" : "ACCELERATED DAY " + lab.day_index}</small>
            <strong>{lab.submitted_count === 5 ? "All five seats are locked in." : "Submit " + (5 - lab.submitted_count) + " more seat" + (5 - lab.submitted_count === 1 ? "" : "s") + "."}</strong>
            <span>
              {lab.day_index === 7
                ? "Resolve once to persist both literal-ticket wheels, apply claims/autofill, and grade the week."
                : "Resolve with the real sealed-bid resolver, then expose the next day’s previously hidden reserve supply."}
            </span>
          </div>
          <button type="button" disabled={busy || lab.submitted_count !== 5} onClick={() => void advanceDay()}>
            {lab.day_index === 7 ? "SPIN + RESOLVE WEEK" : "RESOLVE DAY " + lab.day_index} →
          </button>
        </section>
      ) : null}

      {error ? <p className="football-weekly-superteam-lab__error" role="status">{error}</p> : null}

      {lab.completed && lab.final ? (
        <FootballWeeklyNflTeamSeasonFinalResult
          key={"final-" + lab.run_number + "-" + seatIndex}
          result={lab.final}
          busy={false}
          onAcknowledge={() => undefined}
          showNewWeekAction={false}
        />
      ) : lab.state ? (
        <FootballWeeklyNflTeamSeasonGate
          key={"run-" + lab.run_number + "-day-" + lab.day_index + "-seat-" + seatIndex}
          state={lab.state}
          busy={busy}
          error={error}
          forceBoard
          showContinueAction={false}
          submittedNote={lab.day_index === 7
            ? "Saved for this simulated seat. Switch seats above or edit this decision."
            : "Saved for this simulated seat. Switch seats above or edit these bids."}
          onSubmit={submitNormal}
          onSubmitWildcard={submitWildcard}
          onContinue={() => undefined}
        />
      ) : null}
    </div>
  );
}
