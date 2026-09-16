import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-auction.css";
import type {
  FootballWeeklyAuctionActiveState,
  FootballWeeklyAuctionFinal,
  FootballWeeklyAuctionPriorResult,
  FootballWeeklyAuctionTeam,
} from "../play/footballWeeklyAuctionRepository";
import {
  evaluateFootballWeeklyAuctionBids,
  type FootballWeeklyAuctionBidMap,
} from "../play/footballWeeklyAuctionBidSafety";
import {
  footballWeeklyAuctionTeamIdentity,
  footballWeeklyAuctionTeamStyle,
  type FootballWeeklyAuctionTeamIdentity,
} from "./footballWeeklyAuctionPresentation";

type BidMap = FootballWeeklyAuctionBidMap;
type FinalTab = "standings" | "collection" | "grades";

function TeamMark({ identity, school }: { identity: FootballWeeklyAuctionTeamIdentity; school: string }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(identity.logoSrc) && !logoFailed;
  return (
    <span className="football-weekly-auction__mark" aria-hidden="true">
      {showLogo ? (
        <img src={identity.logoSrc ?? ""} alt="" onError={() => setLogoFailed(true)} />
      ) : (
        <span>{school.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

function rankedResume(identity: FootballWeeklyAuctionTeamIdentity) {
  const cleaned = identity.resume
    .replace(/ · No\. \d+ Final AP/, "")
    .replace(/No\. \d+ Final AP · /, "");
  const rank = identity.finalApRank == null ? "NR" : `#${identity.finalApRank}`;
  return `${rank} · ${cleaned}`;
}

function RulesCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="football-weekly-auction__cover surface-card">
      <p className="eyebrow">FOOTBALL DAILY · TUESDAY–MONDAY</p>
      <h1>WEEKLY AUCTION</h1>
      <strong className="football-weekly-auction__lede">3 teams. $40. 7 days.</strong>
      <div className="football-weekly-auction__rules">
        <p><strong>$40 bankroll</strong> for the entire week.</p>
        <small>HOW IT WORKS</small>
        <ul>
          <li>Bid on any or all 3 teams</li>
          <li>Highest bid wins. Losing bids cost nothing.</li>
          <li>Bids lock + results reveal at <strong>midnight CT</strong></li>
          <li>Your best <strong>3 teams</strong> count toward your final score</li>
        </ul>
        <p><strong>Tie?</strong> Fewer teams won gets priority, then less money spent.</p>
        <p>Highest best-3 average is worth a <strong>bonus Daily Challenge win.</strong></p>
      </div>
      <button className="football-weekly-auction__primary" type="button" onClick={onStart}>
        START TODAY’S AUCTION
      </button>
    </section>
  );
}

function PriorResults({ results }: { results: FootballWeeklyAuctionPriorResult[] }) {
  if (!results.length) return null;
  return (
    <section className="football-weekly-auction__prior surface-card">
      <header><div><p className="eyebrow">YESTERDAY’S RESULTS</p><strong>Resolved board</strong></div></header>
      {results.map((result) => (
        <article key={result.slot}>
          <div className="football-weekly-auction__prior-summary">
            <span>{result.school} · {result.season_year}</span>
            <strong>
              {result.winner_display_name ?? "No winner"} · {result.winning_bid ? "$" + result.winning_bid : "Pass"}
            </strong>
          </div>
          <details>
            <summary>View all bids</summary>
            <div className="football-weekly-auction__bid-history">
              {result.bids.map((bid) => (
                <div key={bid.profile_id}>
                  <span>{bid.display_name}</span>
                  <strong>{bid.amount ? "$" + bid.amount : "Pass"}</strong>
                </div>
              ))}
            </div>
          </details>
        </article>
      ))}
    </section>
  );
}

function MyTeamsDialog({
  state,
  onClose,
}: {
  state: FootballWeeklyAuctionActiveState;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="football-weekly-auction__collection-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="football-weekly-auction__collection-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="My Weekly Auction teams"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p className="eyebrow">WEEKLY AUCTION</p>
            <h2>MY TEAMS</h2>
            <span>{state.collection.length} won this week</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close my teams">×</button>
        </header>
        <div className="football-weekly-auction__collection-list">
          {state.collection.map((entry) => {
            const identity = footballWeeklyAuctionTeamIdentity(
              entry.season_reference,
              entry.school,
              entry.season_year,
            );
            return (
              <article
                key={entry.season_reference}
                style={footballWeeklyAuctionTeamStyle(identity)}
              >
                <TeamMark identity={identity} school={entry.school} />
                <div>
                  <strong>{entry.school} <span>· {entry.season_year}</span></strong>
                  <small>{rankedResume(identity)}</small>
                </div>
                <b><small>PAID</small>{"$"}{entry.winning_bid}</b>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TeamCard({
  team,
  value,
  disabled,
  onChange,
}: {
  team: FootballWeeklyAuctionTeam;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const identity = footballWeeklyAuctionTeamIdentity(team.season_reference, team.school, team.season_year);
  return (
    <article className="football-weekly-auction__team" style={footballWeeklyAuctionTeamStyle(identity)}>
      <div className="football-weekly-auction__team-main">
        <TeamMark identity={identity} school={team.school} />
        <div>
          <strong>{team.school} <span>· {team.season_year}</span></strong>
          <small>{rankedResume(identity)}</small>
          <a href={identity.sportsReferenceUrl} target="_blank" rel="noopener noreferrer">View season ↗</a>
        </div>
      </div>
      <div className="football-weekly-auction__bid">
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={"Lower " + team.school + " bid"}
        >−</button>
        <label>
          <span>BID</span><b>$</b>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            type="number"
            min={0}
            max={40}
            step={1}
            disabled={disabled}
            value={value}
            onChange={(event) => {
              const next = Math.floor(Number(event.currentTarget.value));
              onChange(Number.isFinite(next) ? Math.max(0, Math.min(40, next)) : 0);
            }}
            aria-label={team.school + " bid"}
          />
        </label>
        <button
          type="button"
          disabled={disabled || value >= 40}
          onClick={() => onChange(Math.min(40, value + 1))}
          aria-label={"Raise " + team.school + " bid"}
        >+</button>
      </div>
      <span className="football-weekly-auction__pass">$0 = pass</span>
    </article>
  );
}

function FinalResult({
  result,
  busy,
  onAcknowledge,
}: {
  result: FootballWeeklyAuctionFinal;
  busy: boolean;
  onAcknowledge: () => void;
}) {
  const [tab, setTab] = useState<FinalTab>("standings");
  const me = result.my_result;

  return (
    <section className="football-weekly-auction__final surface-card">
      <header className="football-weekly-auction__final-header">
        <p className="eyebrow">WEEKLY AUCTION</p>
        <h1>FINAL RESULTS</h1>
        <span>Best 3 average decides the week.</span>
      </header>

      {me.is_winner ? (
        <div className="football-weekly-auction__champion">
          <small>WEEKLY CHAMPION</small>
          <strong>You</strong>
          <b>{me.final_score?.toFixed(1) ?? "—"}</b>
          <span>+1 bonus Daily Challenge win</span>
        </div>
      ) : (
        <div className="football-weekly-auction__finish">
          <small>YOUR FINISH</small>
          <strong>{me.final_rank ? "#" + me.final_rank : "—"}</strong>
          <span>{me.final_score == null ? "Fewer than 3 teams owned" : me.final_score.toFixed(1) + " best-3 average"}</span>
        </div>
      )}

      <nav className="football-weekly-auction__tabs" aria-label="Weekly Auction final views">
        <button className={tab === "standings" ? "is-active" : ""} type="button" onClick={() => setTab("standings")}>Standings</button>
        <button className={tab === "collection" ? "is-active" : ""} type="button" onClick={() => setTab("collection")}>Your Collection</button>
        <button className={tab === "grades" ? "is-active" : ""} type="button" onClick={() => setTab("grades")}>All Grades</button>
      </nav>

      {tab === "standings" ? (
        <div className="football-weekly-auction__rows football-weekly-auction__standings">
          {result.standings.map((entry) => (
            <div className={entry.is_current_user ? "is-current" : ""} key={entry.profile_id}>
              <b>#{entry.rank ?? "—"}</b>
              <strong>{entry.display_name}</strong>
              <span>{entry.final_score == null ? "—" : entry.final_score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "collection" ? (
        <div className="football-weekly-auction__rows">
          <header><span>TEAM</span><span>PAID</span><span>GRADE</span></header>
          {result.collection.map((entry) => {
            const identity = footballWeeklyAuctionTeamIdentity(entry.season_reference, entry.school, entry.season_year);
            return (
              <div
                className={"football-weekly-auction__result-team" + (entry.counts ? " is-counting" : "")}
                key={entry.season_reference}
                style={footballWeeklyAuctionTeamStyle(identity)}
              >
                <strong>{entry.display_label}{entry.counts ? <small>COUNTS</small> : null}</strong>
                <span>{"$"}{entry.winning_bid}</span>
                <b>{entry.grade.toFixed(1)}</b>
              </div>
            );
          })}
          <footer><span>BEST 3 AVERAGE</span><strong>{me.final_score?.toFixed(1) ?? "—"}</strong></footer>
        </div>
      ) : null}

      {tab === "grades" ? (
        <div className="football-weekly-auction__rows">
          <header><span>TEAM</span><span>WIN BID</span><span>GRADE</span></header>
          {result.all_teams.map((entry) => {
            const identity = footballWeeklyAuctionTeamIdentity(entry.season_reference, entry.school, entry.season_year);
            return (
              <div
                className="football-weekly-auction__result-team"
                key={entry.season_reference}
                style={footballWeeklyAuctionTeamStyle(identity)}
              >
                <strong>{entry.display_label}</strong>
                <span>{entry.winning_bid ? "$" + entry.winning_bid : "Pass"}</span>
                <b>{entry.grade.toFixed(1)}</b>
              </div>
            );
          })}
        </div>
      ) : null}

      <button className="football-weekly-auction__primary" disabled={busy} type="button" onClick={onAcknowledge}>
        START THE NEW WEEK
      </button>
    </section>
  );
}

export function FootballWeeklyAuctionGate({
  state,
  busy,
  error,
  forceBoard = false,
  onSubmit,
  onAcknowledgeFinal,
  onContinue,
}: {
  state: FootballWeeklyAuctionActiveState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  onSubmit: (bids: BidMap) => Promise<void>;
  onAcknowledgeFinal: (weekStart: string) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [editing, setEditing] = useState(!state.submitted_today);
  const initialBids = useMemo<BidMap>(() => ({
    1: state.bids["1"] ?? 0,
    2: state.bids["2"] ?? 0,
    3: state.bids["3"] ?? 0,
  }), [state.bids]);
  const [bids, setBids] = useState<BidMap>(initialBids);
  const [collectionOpen, setCollectionOpen] = useState(false);

  useEffect(() => {
    setBids(initialBids);
    setEditing(!state.submitted_today);
  }, [initialBids, state.submitted_today]);

  if (state.previous_final) {
    return (
      <FinalResult
        result={state.previous_final}
        busy={busy}
        onAcknowledge={() => void onAcknowledgeFinal(state.previous_final!.week_start)}
      />
    );
  }

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <RulesCover onStart={() => setIntroDismissed(true)} />;
  }

  const bidSafety = evaluateFootballWeeklyAuctionBids(state.bankroll, state.owned_count, bids);
  const committed = bidSafety.committed;
  const legal = bidSafety.legal && committed <= state.max_commit;
  const submitted = state.submitted_today && !editing;

  return (
    <div className="football-weekly-auction">
      {collectionOpen ? <MyTeamsDialog state={state} onClose={() => setCollectionOpen(false)} /> : null}
      <PriorResults results={state.prior_results} />
      <section className="football-weekly-auction__board surface-card">
        <header className="football-weekly-auction__board-head">
          <div><p className="eyebrow">WEEKLY AUCTION</p><h1>DAY {state.day_index} OF 7</h1></div>
          <div className="football-weekly-auction__bank"><strong>{"$"}{state.bankroll}</strong><span>REMAINING</span></div>
        </header>

        <div className="football-weekly-auction__status">
          <button
            className="football-weekly-auction__status-action"
            type="button"
            disabled={!state.collection.length}
            onClick={() => setCollectionOpen(true)}
            aria-haspopup="dialog"
          >
            <small>MY TEAMS</small>
            <strong>{state.owned_count}</strong>
            <span>{state.collection.length ? "VIEW ›" : "NONE YET"}</span>
          </button>
          <div><small>COMMITTED</small><strong>{"$"}{committed}</strong></div>
          <div><small>MAX TODAY</small><strong>{"$"}{state.max_commit}</strong></div>
        </div>

        <div className="football-weekly-auction__theme">
          <div>
            <small>TODAY’S BOARD</small>
            <strong>{state.theme} TEAMS</strong>
          </div>
          <span>BIDS LOCK · RESULTS REVEAL AT MIDNIGHT CT</span>
        </div>

        <div className="football-weekly-auction__team-stack">
          {state.teams.map((team) => (
            <TeamCard
              key={team.slot}
              team={team}
              value={bids[team.slot as 1 | 2 | 3]}
              disabled={submitted || busy}
              onChange={(value) => setBids((current) => ({ ...current, [team.slot]: value } as BidMap))}
            />
          ))}
        </div>

        {!legal ? (
          <p className="football-weekly-auction__error">
            {committed > state.max_commit
              ? "Today’s bids can total at most $" + state.max_commit + "."
              : bidSafety.message}
          </p>
        ) : null}
        {error ? <p className="football-weekly-auction__error">{error}</p> : null}

        {submitted ? (
          <div className="football-weekly-auction__submitted-actions">
            <div><strong>BIDS SUBMITTED</strong><span>Edit until midnight CT. Results reveal then.</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT BIDS</button>
            <button className="football-weekly-auction__primary" type="button" disabled={busy} onClick={onContinue}>
              CONTINUE TO DAILY CHALLENGE
            </button>
          </div>
        ) : (
          <button
            className="football-weekly-auction__primary"
            type="button"
            disabled={busy || !legal}
            onClick={() => void onSubmit(bids)}
          >
            {state.submitted_today ? "SAVE BID CHANGES" : "SUBMIT TODAY’S BIDS"}
          </button>
        )}
      </section>
    </div>
  );
}
