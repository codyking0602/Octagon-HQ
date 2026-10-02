import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createFootballWeeklyAuctionRepository,
  type FootballWeeklyAuctionBidInput,
  type FootballWeeklyNflTeamSeasonLabState,
} from "../play/footballWeeklyAuctionRepository";
import { useIdentity } from "../identity/IdentityProvider";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import {
  FootballWeeklyNflTeamSeasonFinalResult,
  FootballWeeklyNflTeamSeasonGate,
} from "./FootballWeeklyNflTeamSeasonGate";
import "../../styles/football-weekly-nfl-team-season-lab.css";

export default function FootballWeeklyNflTeamSeasonLabPage() {
  const navigate = useNavigate();
  const identity = useIdentity();
  const owner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const repository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [lab, setLab] = useState<FootballWeeklyNflTeamSeasonLabState | null>(null);
  const [seatIndex, setSeatIndex] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSeat(nextSeat: number) {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.loadNflTeamSeasonLab(nextSeat));
      setSeatIndex(nextSeat);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "NFL Team-Seasons lab could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!owner || !repository) return;
    let active = true;
    setBusy(true);
    repository.loadNflTeamSeasonLab(1)
      .then((next) => { if (active) setLab(next); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "NFL Team-Seasons lab could not be loaded.");
      })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [owner, repository]);

  async function reset() {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.resetNflTeamSeasonLab());
      setSeatIndex(1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A fresh lab week could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function submitBids(bids: Record<number, FootballWeeklyAuctionBidInput>) {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.submitNflTeamSeasonLab(seatIndex, bids));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Those lab bids could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function submitWildcard(entries: number, rankings: string[], cutItemReference: string | null) {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.submitNflTeamSeasonLabWildcard(seatIndex, entries, rankings, cutItemReference));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "That lab Wildcard choice could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function continueToNextSeat() {
    if (!lab || busy) return;
    const openSeats = lab.seats.filter((seat) => !seat.submitted_today);
    const next = openSeats.find((seat) => seat.seat_index > seatIndex) ?? openSeats[0];
    if (next && next.seat_index !== seatIndex) void loadSeat(next.seat_index);
  }

  async function advance() {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.advanceNflTeamSeasonLab(seatIndex));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The lab day could not be resolved.");
    } finally {
      setBusy(false);
    }
  }

  async function jumpToDay7() {
    if (!repository || busy) return;
    setBusy(true);
    setError(null);
    try {
      setLab(await repository.jumpNflTeamSeasonLabToDay7(1));
      setSeatIndex(1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Day 7 could not be prepared.");
    } finally {
      setBusy(false);
    }
  }

  if (!owner) {
    return (
      <div className="page football-weekly-nfl-lab">
        <section className="surface-card football-weekly-nfl-lab__message">
          <h1>Owner lab unavailable</h1>
          <button type="button" onClick={() => navigate("/football/weekly-auction")}>BACK TO AUCTION CENTER</button>
        </section>
      </div>
    );
  }

  return (
    <div className="page football-weekly-nfl-lab">
      <header className="football-weekly-nfl-lab__header">
        <button type="button" onClick={() => navigate("/football/weekly-auction")}>←</button>
        <div>
          <p className="eyebrow">OWNER QA · ISOLATED SHADOW WEEK</p>
          <h1>NFL TEAM-SEASONS PLAYTHROUGH</h1>
          <span>Five seats · six sealed-bid days · full Wildcard/Reaping finale · no live competition state.</span>
        </div>
        <button type="button" disabled={busy} onClick={() => void reset()}>RESET</button>
      </header>

      {error ? <p className="football-weekly-nfl-lab__error">{error}</p> : null}
      {!lab ? <section className="surface-card football-weekly-nfl-lab__message">Loading owner lab…</section> : null}

      {lab ? (
        <>
          <section className="football-weekly-nfl-lab__controls surface-card">
            <div className="football-weekly-nfl-lab__run">
              <span><small>RUN</small><strong>#{lab.run_number}</strong></span>
              <span><small>DAY</small><strong>{lab.completed ? "FINAL" : lab.day_index + "/7"}</strong></span>
              <span><small>READY</small><strong>{lab.submitted_count}/5</strong></span>
            </div>

            <div className="football-weekly-nfl-lab__seats" aria-label="Lab seats">
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
                  <span>{seat.submitted_today ? "READY" : "OPEN"} · {seat.owned_count} teams · {"$"}{seat.bankroll}</span>
                </button>
              ))}
            </div>

            {!lab.completed && lab.day_index < 7 ? (
              <button
                className="football-weekly-nfl-lab__jump"
                type="button"
                disabled={busy}
                onClick={() => void jumpToDay7()}
              >
                <strong>JUMP TO DAY 7</strong>
                <span>Fresh seeded QA run · real Days 1–6 engines · no live competition state</span>
              </button>
            ) : null}

            {!lab.completed ? (
              <button
                className="football-weekly-nfl-lab__resolve"
                type="button"
                disabled={busy || lab.submitted_count !== 5}
                onClick={() => void advance()}
              >
                {lab.submitted_count === 5 ? "RESOLVE DAY " + lab.day_index + " →" : "ALL FIVE SEATS MUST SUBMIT"}
              </button>
            ) : null}
          </section>

          {lab.completed && lab.final ? (
            <FootballWeeklyNflTeamSeasonFinalResult
              result={lab.final}
              busy={busy}
              onAcknowledge={() => undefined}
              showNewWeekAction={false}
              playerLabel={lab.seats.find((seat) => seat.seat_index === seatIndex)?.display_name}
            />
          ) : lab.state ? (
            <FootballWeeklyNflTeamSeasonGate
              state={lab.state}
              busy={busy}
              error={error}
              forceBoard
              tableMode="lab"
              tableSeatIndex={seatIndex}
              onSubmit={submitBids}
              onSubmitWildcard={submitWildcard}
              onContinue={continueToNextSeat}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
