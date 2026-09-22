import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-build-qb.css";
import type {
  FootballWeeklyBuildQbFinal,
  FootballWeeklyBuildQbPriorResult,
  FootballWeeklyBuildQbState,
  FootballWeeklyBuildQbTrait,
} from "../play/footballWeeklyAuctionRepository";
import {
  evaluateFootballWeeklyBuildQbBids,
  type FootballWeeklyBuildQbBidMap,
} from "../play/footballWeeklyAuctionBidSafety";
import { buildQbTeamVisualIdentity } from "./buildQbVisualIdentity";
import { FootballWeeklyBuildQbTableDialog } from "./FootballWeeklyBuildQbTableDialog";

type BidMap = FootballWeeklyBuildQbBidMap;
type FinalTab = "standings" | "build" | "grades";

const TRAITS: readonly FootballWeeklyBuildQbTrait[] = ["Arm", "Accuracy", "Processing", "Mobility"];

const TRAIT_DEFINITIONS: Readonly<Record<FootballWeeklyBuildQbTrait, string>> = {
  Arm: "Functional arm talent: velocity, range, off-platform throws, and access to difficult throws.",
  Accuracy: "Ball placement and consistency across short, intermediate, and deep throws.",
  Processing: "Reads, anticipation, timing, decision-making, and handling defensive pressure and complexity.",
  Mobility: "Escaping pressure, extending plays, movement skill, and creating value as a runner.",
};

function TeamMark({ teamCode }: { teamCode: string }) {
  const identity = buildQbTeamVisualIdentity(teamCode);
  const [failed, setFailed] = useState(false);
  return (
    <span className="football-weekly-build-qb__mark" aria-hidden="true">
      {identity?.logoSrc && !failed ? (
        <img src={identity.logoSrc} alt="" onError={() => setFailed(true)} />
      ) : (
        <span>{teamCode}</span>
      )}
    </span>
  );
}

function TraitDefinitions({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "football-weekly-build-qb__trait-definitions is-compact" : "football-weekly-build-qb__trait-definitions"}>
      {TRAITS.map((trait) => (
        <div key={trait}>
          <strong>{trait}</strong>
          <span>{TRAIT_DEFINITIONS[trait]}</span>
        </div>
      ))}
    </div>
  );
}

function TraitDefinitionsDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="football-weekly-build-qb__trait-backdrop" role="presentation" onClick={onClose}>
      <section
        className="football-weekly-build-qb__trait-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="weekly-build-qb-trait-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <button className="football-weekly-build-qb__sheet-back" type="button" onClick={onClose} aria-label="Back to Build a QB">
            ← BACK
          </button>
          <div>
            <p className="eyebrow">BUILD A QB</p>
            <h2 id="weekly-build-qb-trait-title">Trait definitions</h2>
          </div>
        </header>
        <div className="football-weekly-build-qb__trait-body">
          <TraitDefinitions />
        </div>
      </section>
    </div>
  );
}

function RulesCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="football-weekly-build-qb__cover surface-card">
      <p className="eyebrow">WEEKLY AUCTION · NFL</p>
      <h1>BUILD A QB</h1>
      <strong className="football-weekly-build-qb__lede">4 traits. $40. 7 days.</strong>
      <div className="football-weekly-build-qb__rules">
        <p><strong>$40 bankroll</strong> for the entire week.</p>
        <ul>
          <li>One Arm, Accuracy, Processing and Mobility QB appears every day.</li>
          <li>Win exactly one QB for each trait. Once filled, that trait is closed for you.</li>
          <li>You get <strong>one free pass per trait</strong> for the week. After that pass is used, the trait requires at least a $1 bid until you fill it.</li>
          <li>Highest bid wins. Losing bids cost nothing. Ties favor fewer traits won, then less money spent.</li>
          <li>Your four hidden trait grades are averaged for the final score.</li>
        </ul>
        <div className="football-weekly-build-qb__rules-traits">
          <small>THE FOUR TRAITS</small>
          <TraitDefinitions compact />
        </div>
      </div>
      <button className="football-weekly-build-qb__primary" type="button" onClick={onStart}>
        START TODAY’S AUCTION
      </button>
    </section>
  );
}

function PriorResults({ results }: { results: FootballWeeklyBuildQbPriorResult[] }) {
  if (!results.length) return null;
  return (
    <section className="football-weekly-build-qb__prior surface-card">
      <header><div><p className="eyebrow">YESTERDAY’S RESULTS</p><strong>Resolved traits</strong></div></header>
      {results.map((result) => (
        <article key={result.trait}>
          <div className="football-weekly-build-qb__prior-summary">
            <span><b>{result.trait}</b> · {result.display_name}</span>
            <strong>{result.winner_display_name ?? "No winner"} · {result.winning_bid ? "$" + result.winning_bid : "Pass"}</strong>
          </div>
          <details>
            <summary>View all bids</summary>
            <div className="football-weekly-build-qb__bid-history">
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

function TraitSlots({ state }: { state: FootballWeeklyBuildQbState }) {
  const won = new Map(state.collection.map((item) => [item.trait, item]));
  return (
    <div className="football-weekly-build-qb__slots" aria-label="Your Build a QB traits">
      {TRAITS.map((trait) => {
        const item = won.get(trait);
        const passUsed = state.trait_passes[trait] === true;
        return (
          <article className={item ? "is-filled" : ""} key={trait}>
            <small>{trait}</small>
            {item ? (
              <div><TeamMark teamCode={item.team_code} /><strong>{item.display_name}</strong></div>
            ) : (
              <strong>OPEN</strong>
            )}
            {!item ? <span>{passUsed ? "PASS USED · $1 MIN" : "FREE PASS AVAILABLE"}</span> : <span>LOCKED IN</span>}
          </article>
        );
      })}
    </div>
  );
}

function PlayerCard({
  state,
  slot,
  value,
  disabled,
  onChange,
}: {
  state: FootballWeeklyBuildQbState;
  slot: 1 | 2 | 3 | 4;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const card = state.teams.find((team) => team.slot === slot)!;
  const won = state.collection.some((item) => item.trait === card.trait);
  const passUsed = state.trait_passes[card.trait] === true;
  const minBid = won ? 0 : passUsed ? 1 : 0;
  const identity = buildQbTeamVisualIdentity(card.team_code);

  return (
    <article
      className={"football-weekly-build-qb__card" + (won ? " is-filled" : "")}
      style={identity ? {
        "--weekly-qb-primary": identity.primary,
        "--weekly-qb-rgb": identity.primaryRgb,
        "--weekly-qb-secondary": identity.secondary,
      } as React.CSSProperties : undefined}
    >
      <div className="football-weekly-build-qb__card-main">
        <TeamMark teamCode={card.team_code} />
        <div>
          <small>{card.trait}</small>
          <strong>{card.display_name}</strong>
          <span>{identity?.teamName ?? card.team_code}</span>
        </div>
      </div>
      {won ? (
        <div className="football-weekly-build-qb__filled-badge">TRAIT FILLED</div>
      ) : (
        <>
          <div className="football-weekly-build-qb__bid">
            <button
              type="button"
              disabled={disabled || value <= minBid}
              onClick={() => onChange(Math.max(minBid, value - 1))}
              aria-label={"Lower " + card.trait + " bid"}
            >−</button>
            <label>
              <span>BID</span><b>$</b>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                type="number"
                min={minBid}
                max={40}
                step={1}
                disabled={disabled}
                value={value}
                onChange={(event) => {
                  const next = Math.floor(Number(event.currentTarget.value));
                  onChange(Number.isFinite(next) ? Math.max(minBid, Math.min(40, next)) : minBid);
                }}
                aria-label={card.trait + " bid"}
              />
            </label>
            <button
              type="button"
              disabled={disabled || value >= 40}
              onClick={() => onChange(Math.min(40, value + 1))}
              aria-label={"Raise " + card.trait + " bid"}
            >+</button>
          </div>
        </>
      )}
    </article>
  );
}

export function FootballWeeklyBuildQbFinalResult({
  result,
  busy,
  onAcknowledge,
  showNewWeekAction = true,
}: {
  result: FootballWeeklyBuildQbFinal;
  busy: boolean;
  onAcknowledge: () => void;
  showNewWeekAction?: boolean;
}) {
  const [tab, setTab] = useState<FinalTab>("standings");
  const me = result.my_result;

  return (
    <section className="football-weekly-build-qb__final surface-card">
      <header>
        <p className="eyebrow">WEEKLY AUCTION · NFL BUILD A QB</p>
        <h1>FINAL RESULTS</h1>
        <span>Four-trait average decides the week.</span>
      </header>

      <div className={me.is_winner ? "football-weekly-build-qb__champion" : "football-weekly-build-qb__finish"}>
        <small>{me.is_winner ? "WEEKLY CHAMPION" : "YOUR FINISH"}</small>
        <strong>{me.is_winner ? "You" : me.final_rank ? "#" + me.final_rank : "—"}</strong>
        <b>{me.final_score?.toFixed(1) ?? "—"}</b>
        <span>{me.final_score == null ? "Incomplete four-trait build" : "four-trait average"}</span>
      </div>

      <nav className="football-weekly-build-qb__tabs" aria-label="Build a QB final views">
        <button className={tab === "standings" ? "is-active" : ""} type="button" onClick={() => setTab("standings")}>Standings</button>
        <button className={tab === "build" ? "is-active" : ""} type="button" onClick={() => setTab("build")}>Your QB</button>
        <button className={tab === "grades" ? "is-active" : ""} type="button" onClick={() => setTab("grades")}>All Grades</button>
      </nav>

      {tab === "standings" ? (
        <div className="football-weekly-build-qb__rows">
          {result.standings.map((entry) => (
            <div className={entry.is_current_user ? "is-current" : ""} key={entry.profile_id}>
              <b>#{entry.rank ?? "—"}</b>
              <strong>{entry.display_name}</strong>
              <span>{entry.final_score == null ? "—" : entry.final_score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "build" ? (
        <div className="football-weekly-build-qb__grade-grid">
          {TRAITS.map((trait) => {
            const entry = result.collection.find((item) => item.trait === trait);
            return entry ? (
              <article key={trait}>
                <TeamMark teamCode={entry.team_code} />
                <div><small>{trait}</small><strong>{entry.display_name}</strong><span>Paid ${entry.winning_bid}</span></div>
                <b>{entry.grade.toFixed(1)}</b>
              </article>
            ) : (
              <article key={trait}><div><small>{trait}</small><strong>EMPTY</strong></div><b>—</b></article>
            );
          })}
          <footer><span>FOUR-TRAIT AVERAGE</span><strong>{me.final_score?.toFixed(1) ?? "—"}</strong></footer>
        </div>
      ) : null}

      {tab === "grades" ? (
        <div className="football-weekly-build-qb__all-grades">
          {result.all_teams.map((entry) => (
            <article key={entry.day_index + "-" + entry.trait}>
              <small>DAY {entry.day_index} · {entry.trait}</small>
              <strong>{entry.display_name}</strong>
              <span>{entry.winner_display_name ?? "No winner"} · {entry.winning_bid ? "$" + entry.winning_bid : "Pass"}</span>
              <b>{entry.grade.toFixed(1)}</b>
            </article>
          ))}
        </div>
      ) : null}

      {showNewWeekAction ? (
        <button className="football-weekly-build-qb__primary" type="button" disabled={busy} onClick={onAcknowledge}>
          START THE NEW WEEK
        </button>
      ) : null}
    </section>
  );
}

export function FootballWeeklyBuildQbGate({
  state,
  busy,
  error,
  forceBoard = false,
  onSubmit,
  onContinue,
}: {
  state: FootballWeeklyBuildQbState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  onSubmit: (bids: Record<number, number>) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [editing, setEditing] = useState(!state.submitted_today);
  const [auctionTableOpen, setAuctionTableOpen] = useState(false);
  const [traitDefinitionsOpen, setTraitDefinitionsOpen] = useState(false);
  const wonTraits = useMemo(() => new Set(state.collection.map((item) => item.trait)), [state.collection]);
  const initialBids = useMemo<BidMap>(() => ({
    1: state.bids["1"] ?? 0,
    2: state.bids["2"] ?? 0,
    3: state.bids["3"] ?? 0,
    4: state.bids["4"] ?? 0,
  }), [state.bids]);
  const [bids, setBids] = useState<BidMap>(initialBids);

  useEffect(() => {
    const normalized = { ...initialBids };
    for (const card of state.teams) {
      if (wonTraits.has(card.trait)) normalized[card.slot as 1 | 2 | 3 | 4] = 0;
      else if (state.trait_passes[card.trait] && normalized[card.slot as 1 | 2 | 3 | 4] < 1) {
        normalized[card.slot as 1 | 2 | 3 | 4] = 1;
      }
    }
    setBids(normalized);
    setEditing(!state.submitted_today);
  }, [initialBids, state.submitted_today, state.teams, state.trait_passes, wonTraits]);

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <RulesCover onStart={() => setIntroDismissed(true)} />;
  }

  const bidSafety = evaluateFootballWeeklyBuildQbBids(state.bankroll, state.owned_count, bids);
  const passLegal = state.teams.every((card) => {
    if (wonTraits.has(card.trait)) return bids[card.slot as 1 | 2 | 3 | 4] === 0;
    return !state.trait_passes[card.trait] || bids[card.slot as 1 | 2 | 3 | 4] >= 1;
  });
  const committed = bidSafety.committed;
  const legal = bidSafety.legal && committed <= state.max_commit && passLegal;
  const submitted = state.submitted_today && !editing;

  return (
    <div className="football-weekly-build-qb">
      {auctionTableOpen ? <FootballWeeklyBuildQbTableDialog onClose={() => setAuctionTableOpen(false)} /> : null}
      {traitDefinitionsOpen ? <TraitDefinitionsDialog onClose={() => setTraitDefinitionsOpen(false)} /> : null}

      <div className="football-weekly-build-qb__status">
        <button type="button" onClick={() => setAuctionTableOpen(true)} aria-haspopup="dialog">
          <small>AUCTION TABLE</small><strong>{state.owned_count}/4</strong><span>YOUR TRAITS · VIEW ›</span>
        </button>
        <div><small>COMMITTED</small><strong>${committed}</strong></div>
        <div><small>MAX TODAY</small><strong>${state.max_commit}</strong></div>
      </div>

      <PriorResults results={state.prior_results} />

      <section className="football-weekly-build-qb__board surface-card">
        <header className="football-weekly-build-qb__board-head">
          <div>
            <p className="eyebrow">WEEKLY AUCTION · NFL</p>
            <div className="football-weekly-build-qb__title-row">
              <h1>BUILD A QB</h1>
              <span className="football-weekly-build-qb__day-label">DAY {state.day_index} OF 7</span>
            </div>
          </div>
          <div><strong>${state.bankroll}</strong><span>REMAINING</span></div>
        </header>

        <TraitSlots state={state} />

        <div className="football-weekly-build-qb__lock-note">
          <div className="football-weekly-build-qb__lock-title">
            <strong>TODAY’S FOUR TRAITS</strong>
            <button type="button" onClick={() => setTraitDefinitionsOpen(true)} aria-haspopup="dialog">
              Trait definitions ⓘ
            </button>
          </div>
          <div className="football-weekly-build-qb__lock-copy">
            <span>Bids lock · results reveal at midnight CT</span>
            <span>$0 uses your free pass for that trait.</span>
          </div>
        </div>

        <div className="football-weekly-build-qb__cards">
          {state.teams.map((card) => (
            <PlayerCard
              key={card.trait}
              state={state}
              slot={card.slot as 1 | 2 | 3 | 4}
              value={bids[card.slot as 1 | 2 | 3 | 4]}
              disabled={submitted || busy}
              onChange={(value) => setBids((current) => ({ ...current, [card.slot]: value } as BidMap))}
            />
          ))}
        </div>

        {!legal ? (
          <p className="football-weekly-build-qb__error">
            {!passLegal
              ? "A trait with its free pass already used requires at least a $1 bid."
              : committed > state.max_commit
                ? "Today’s bids can total at most $" + state.max_commit + "."
                : bidSafety.message}
          </p>
        ) : null}
        {error ? <p className="football-weekly-build-qb__error">{error}</p> : null}

        {submitted ? (
          <div className="football-weekly-build-qb__submitted">
            <div><strong>BIDS SUBMITTED</strong><span>Edit until midnight CT.</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT BIDS</button>
            <button className="football-weekly-build-qb__primary" type="button" disabled={busy} onClick={onContinue}>
              CONTINUE TO DAILY CHALLENGE
            </button>
          </div>
        ) : (
          <button
            className="football-weekly-build-qb__primary"
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
