import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NBA_WELCOME_REOPEN_EVENT } from "./NbaWelcomeTakeover";
import { NBA_PUBLIC_ENABLED } from "./nbaPreviewAccess";
import { NBA_FUTURES_SELECTIONS, NBA_FUTURES_LOCK_AT, emptyNbaFutures, nbaFuturesProgress } from "./nbaFutures";
import { loadNbaFutures } from "./nbaFuturesRepository";
import "../../styles/nba-hq.css";

export function NbaHomeHq({ signedIn, compact = false }: { signedIn: boolean; compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [locked, setLocked] = useState(Date.now() >= Date.parse(NBA_FUTURES_LOCK_AT));

  useEffect(() => {
    let mounted = true;
    if (!signedIn) {
      setCount(null);
      return () => { mounted = false; };
    }
    void loadNbaFutures().then((snapshot) => {
      if (!mounted) return;
      setCount(snapshot.own
        ? nbaFuturesProgress({ ...emptyNbaFutures(), ...snapshot.own })
        : 0);
      setLocked(snapshot.locked || Date.now() >= Date.parse(NBA_FUTURES_LOCK_AT));
    }).catch(() => {
      if (mounted) setCount(null);
    });
    return () => { mounted = false; };
  }, [signedIn]);

  const remaining = count === null ? null : Math.max(0, NBA_FUTURES_SELECTIONS - count);
  const progressPercent = count === null ? 0 : Math.min(100, 100 * count / NBA_FUTURES_SELECTIONS);
  const status = locked ? "LOCKED" : remaining === 0 ? "PICKS READY" : "OPEN NOW";

  return (
    <section
      className={`home-section home-sport-hq home-sport-hq--nba home-section--nba-hq${compact ? " is-compact" : ""}`}
      data-home-section="nba-hq"
      aria-label="Basketball HQ"
    >
      <header className="home-sport-hq__heading">
        <div>
          <p className="eyebrow">BASKETBALL HQ</p>
          <h2>2026–27 NBA Season</h2>
        </div>
        <small>FUTURES · CUP · PLAYOFFS</small>
      </header>

      {compact ? (
        <Link className="home-weekly-games-row nba-home-compact-link" to="/nba/picks" aria-label="Open NBA Futures picks">
          <span className="home-weekly-games-row__copy">
            <small>NBA FUTURES · {status}</small>
            <strong>{count === null ? "Predict the season" : `${count} OF ${NBA_FUTURES_SELECTIONS} PICKS`}</strong>
          </span>
          <b>OPEN →</b>
        </Link>
      ) : (
        <>
          <section className="surface-card home-event-card home-event-card--compact" aria-label="NBA Futures Picks">
            <div className="home-event-card__topline">
              <p className="eyebrow">NBA FUTURES</p>
              <span>{status}</span>
            </div>
            <div className="home-event-card__picks-grid">
              <div className="picks-progress" aria-label={`NBA Futures ${count === null ? "progress unavailable" : `${count} of ${NBA_FUTURES_SELECTIONS} picks complete`}`}>
                <div>
                  <span>YOUR PICKS</span>
                  <b>{count === null ? "—" : `${count} OF ${NBA_FUTURES_SELECTIONS}`}</b>
                </div>
                <div className="picks-progress__track" aria-hidden="true">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
                <small className="home-event-card__picks-status">
                  {locked ? "PICKS LOCKED"
                    : remaining === null ? "PROGRESS UNAVAILABLE"
                    : remaining === 0 ? "ALL PICKS READY"
                    : `${remaining} PICKS REMAINING`}
                </small>
              </div>
              <Link
                className="home-event-card__standing"
                to="/championship/nba"
                aria-label="Open Basketball Championship"
              >
                <span>CHAMPIONSHIP</span>
                <b>15%</b>
                <small>FUTURES SEASON WEIGHT</small>
              </Link>
            </div>
            <div className="nba-home-futures-actions">
              <span>LOCKS OCT 30</span>
              <Link className="secondary-action" to="/nba/picks">
                {locked ? "REVIEW FUTURES" : "OPEN FUTURES"} →
              </Link>
            </div>
          </section>

          <div className="home-weekly-games-row nba-home-up-next" aria-label="Upcoming NBA Cup Picks">
            <span className="home-weekly-games-row__copy">
              <small>UP NEXT · NBA CUP PICKS</small>
              <strong>December · Cup knockout rounds</strong>
            </span>
            <b>10% OF SEASON</b>
          </div>

          <Link className="home-weekly-games-row nba-home-championship-row" to="/championship/nba" aria-label="View Basketball Championship">
            <span className="home-weekly-games-row__copy">
              <small>BASKETBALL CHAMPIONSHIP</small>
              <strong>Futures 15% · Cup 10% · Playoffs 55% · Games 20%</strong>
            </span>
            <b>VIEW →</b>
          </Link>

          {!NBA_PUBLIC_ENABLED ? (
            <button type="button" className="nba-home-replay" onClick={() => window.dispatchEvent(new Event(NBA_WELCOME_REOPEN_EVENT))}>
              REPLAY INTRODUCTION ↗
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
