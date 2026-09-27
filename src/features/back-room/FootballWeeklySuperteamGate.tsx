import { useEffect, useMemo, useState } from "react";
import "../../styles/football-weekly-superteam.css";
import type {
  FootballWeeklyAuctionBidInput,
  FootballWeeklySuperteamBid,
  FootballWeeklySuperteamCard,
  FootballWeeklySuperteamFinal,
  FootballWeeklySuperteamRosterSlot,
  FootballWeeklySuperteamState,
} from "../play/footballWeeklyAuctionRepository";
import {
  footballWeeklySuperteamIdentity,
  footballWeeklySuperteamStyle,
} from "./footballWeeklySuperteamVisualIdentity";

const ROSTER_SLOTS: readonly FootballWeeklySuperteamRosterSlot[] = [
  "QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach",
];

type SuperteamBidMap = Record<number, FootballWeeklySuperteamBid>;
type FinalTab = "standings" | "rosters" | "grades";

function RulesCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="football-weekly-superteam__cover surface-card">
      <p className="eyebrow">WEEKLY AUCTION · CFB</p>
      <h1>BUILD A SUPERTEAM</h1>
      <strong>7 spots. $50. One college football monster.</strong>
      <div className="football-weekly-superteam__rules">
        <p><b>Roster:</b> QB · RB · WR · Flex · Front Seven · Secondary · Head Coach</p>
        <p><b>Every day:</b> 8–12 candidates. The board grows on future days when more players join, and you can win at most 2.</p>
        <p><b>Claim priority matters.</b> Rank every candidate on today’s board. Higher-priority claims resolve first if your wins start filling slots or using bankroll.</p>
        <p><b>$1 reserve.</b> Your bids always preserve at least $1 for every roster spot you could still need. Losing bids cost nothing.</p>
        <p><b>Late joins:</b> New players can enter through Day 4 when enough reserve inventory remains. Today’s board never changes after it opens.</p>\n        <p><b>Peak college season.</b> Each player is graded on the school + season shown. Grades stay hidden until the week ends.</p>
        <p><b>Final score:</b> the equal-weight average of all 7 roster spots. Empty spots after Day 7 are filled by the worst eligible unclaimed option for $1.</p>
      </div>
      <button className="football-weekly-superteam__primary" type="button" onClick={onStart}>
        START TODAY’S AUCTION
      </button>
    </section>
  );
}

function TeamMark({ school }: { school: string }) {
  const identity = footballWeeklySuperteamIdentity(school);
  const [failed, setFailed] = useState(false);
  return (
    <span className="football-weekly-superteam__mark" aria-hidden="true">
      {identity.logoSrc && !failed
        ? <img src={identity.logoSrc} alt="" onError={() => setFailed(true)} />
        : <b>{identity.code}</b>}
    </span>
  );
}

function candidateEligible(
  card: FootballWeeklySuperteamCard,
  collection: FootballWeeklySuperteamState["collection"],
) {
  const filled = new Set(collection.map((item) => item.roster_slot));
  return card.eligible_slots.some((slot) => !filled.has(slot));
}

function initialBidMap(state: FootballWeeklySuperteamState): SuperteamBidMap {
  return Object.fromEntries(state.teams.map((card) => {
    const stored = state.bids[String(card.slot)];
    return [card.slot, stored ?? { amount: 0, priority: card.slot }];
  })) as SuperteamBidMap;
}

function twoWinExposure(bids: SuperteamBidMap, openSlots: number) {
  const maxWins = Math.min(2, Math.max(openSlots, 0));
  return Object.values(bids)
    .map((bid) => bid.amount)
    .sort((left, right) => right - left)
    .slice(0, maxWins)
    .reduce((sum, amount) => sum + amount, 0);
}

function PriorResults({ results }: { results: FootballWeeklySuperteamState["prior_results"] }) {
  if (!results.length) return null;
  return (
    <section className="football-weekly-superteam__prior surface-card">
      <header><p className="eyebrow">YESTERDAY’S RESULTS</p><strong>Resolved board</strong></header>
      {results.map((result) => (
        <article key={result.slot}>
          <div>
            <span>{result.display_name} · {result.school} {result.season_year}</span>
            <strong>
              {result.winner_display_name
                ? result.winner_display_name + " · $" + result.winning_bid + " · " + (result.roster_slot ?? "ROSTER")
                : "No winner"}
            </strong>
          </div>
          <details>
            <summary>View all bids</summary>
            <div className="football-weekly-superteam__bid-history">
              {result.bids.map((bid) => (
                <div key={bid.profile_id}>
                  <span>{bid.display_name}</span>
                  <strong>{bid.amount ? "$" + bid.amount + " · P" + (bid.priority ?? "—") : "Pass"}</strong>
                </div>
              ))}
            </div>
          </details>
        </article>
      ))}
    </section>
  );
}

function RosterStrip({ collection }: { collection: FootballWeeklySuperteamState["collection"] }) {
  const bySlot = new Map(collection.map((item) => [item.roster_slot, item]));
  return (
    <section className="football-weekly-superteam__roster surface-card">
      <header><p className="eyebrow">YOUR SUPERTEAM</p><strong>{collection.length}/7 FILLED</strong></header>
      <div>
        {ROSTER_SLOTS.map((slot) => {
          const item = bySlot.get(slot);
          return (
            <article className={item ? "is-filled" : ""} key={slot}>
              <small>{slot}</small>
              <strong>{item?.display_name ?? "OPEN"}</strong>
              <span>{item ? item.school + " · " + item.season_year : "$1 reserved"}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CandidateCard({
  card, bid, disabled, eligible, onAmount, onPriority, priorityCount,
}: {
  card: FootballWeeklySuperteamCard;
  bid: FootballWeeklySuperteamBid;
  disabled: boolean;
  eligible: boolean;
  onAmount: (amount: number) => void;
  onPriority: (priority: number) => void;
  priorityCount: number;
}) {
  const identity = footballWeeklySuperteamIdentity(card.school);
  return (
    <article
      className={"football-weekly-superteam__candidate" + (!eligible ? " is-locked" : "")}
      style={footballWeeklySuperteamStyle(identity)}
    >
      <div className="football-weekly-superteam__candidate-main">
        <TeamMark school={card.school} />
        <div>
          <small>{card.group_key.toUpperCase()} · {card.eligible_slots.join(" / ").toUpperCase()}</small>
          <strong>{card.display_name}</strong>
          <span>{card.school} · {card.season_year}</span>
        </div>
      </div>
      <div className="football-weekly-superteam__controls">
        <label className="football-weekly-superteam__priority">
          <span>CLAIM</span>
          <select
            value={bid.priority}
            disabled={disabled || !eligible}
            onChange={(event) => onPriority(Number(event.currentTarget.value))}
            aria-label={card.display_name + " claim priority"}
          >
            {Array.from({ length: priorityCount }, (_, index) => index + 1).map((priority) => (
              <option value={priority} key={priority}>P{priority}</option>
            ))}
          </select>
        </label>
        <div className="football-weekly-superteam__bid">
          <button
            type="button"
            disabled={disabled || !eligible || bid.amount <= 0}
            onClick={() => onAmount(Math.max(0, bid.amount - 1))}
            aria-label={"Lower " + card.display_name + " bid"}
          >−</button>
          <label>
            <span>BID</span><b>$</b>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              type="number"
              min={0}
              max={50}
              step={1}
              disabled={disabled || !eligible}
              value={bid.amount}
              onChange={(event) => {
                const next = Math.floor(Number(event.currentTarget.value));
                onAmount(Number.isFinite(next) ? Math.max(0, Math.min(50, next)) : 0);
              }}
              aria-label={card.display_name + " bid"}
            />
          </label>
          <button
            type="button"
            disabled={disabled || !eligible || bid.amount >= 50}
            onClick={() => onAmount(Math.min(50, bid.amount + 1))}
            aria-label={"Raise " + card.display_name + " bid"}
          >+</button>
        </div>
      </div>
      <em>{eligible ? "$0 = PASS" : "ELIGIBLE ROSTER SPOT FILLED"}</em>
    </article>
  );
}

function collectionForProfile(result: FootballWeeklySuperteamFinal, profileId: string) {
  return result.all_teams
    .filter((entry) => entry.winner_profile_id === profileId && entry.roster_slot)
    .sort((left, right) => ROSTER_SLOTS.indexOf(left.roster_slot!) - ROSTER_SLOTS.indexOf(right.roster_slot!));
}

export function FootballWeeklySuperteamFinalResult({
  result, busy, onAcknowledge, showNewWeekAction = true,
}: {
  result: FootballWeeklySuperteamFinal;
  busy: boolean;
  onAcknowledge: () => void;
  showNewWeekAction?: boolean;
}) {
  const [tab, setTab] = useState<FinalTab>("standings");
  const me = result.my_result;
  const current = result.standings.find((entry) => entry.is_current_user) ?? result.standings[0] ?? null;
  const [selectedProfileId, setSelectedProfileId] = useState(current?.profile_id ?? "");
  const selected = result.standings.find((entry) => entry.profile_id === selectedProfileId) ?? current;
  const roster = selected ? collectionForProfile(result, selected.profile_id) : [];

  return (
    <section className="football-weekly-superteam__final surface-card">
      <header>
        <p className="eyebrow">CFB SUPERTEAM · FINAL</p>
        <h1>FINAL RESULTS</h1>
        <span>All 7 roster spots count equally.</span>
      </header>
      <div className={me.is_winner ? "football-weekly-superteam__champion" : "football-weekly-superteam__finish"}>
        <small>{me.is_winner ? "WEEKLY CHAMPION" : "YOUR FINISH"}</small>
        <strong>{me.is_winner ? "YOU" : me.final_rank ? "#" + me.final_rank : "—"}</strong>
        <b>{me.final_score == null ? "—" : Number(me.final_score).toFixed(1)}</b>
        <span>7-player Superteam average</span>
      </div>
      <nav className="football-weekly-superteam__tabs">
        <button className={tab === "standings" ? "is-active" : ""} type="button" onClick={() => setTab("standings")}>Standings</button>
        <button className={tab === "rosters" ? "is-active" : ""} type="button" onClick={() => setTab("rosters")}>Superteams</button>
        <button className={tab === "grades" ? "is-active" : ""} type="button" onClick={() => setTab("grades")}>All Grades</button>
      </nav>
      {tab === "standings" ? (
        <div className="football-weekly-superteam__standings">
          {result.standings.map((entry) => (
            <div className={entry.is_current_user ? "is-current" : ""} key={entry.profile_id}>
              <b>#{entry.rank ?? "—"}</b><strong>{entry.display_name}</strong>
              <span>{entry.final_score == null ? "—" : entry.final_score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "rosters" ? (
        <div className="football-weekly-superteam__final-rosters">
          <div className="football-weekly-superteam__player-picker">
            {result.standings.map((entry) => (
              <button
                className={selected?.profile_id === entry.profile_id ? "is-active" : ""}
                type="button"
                key={entry.profile_id}
                onClick={() => setSelectedProfileId(entry.profile_id)}
              >
                <strong>{entry.display_name}</strong>
                <span>{entry.final_score == null ? "—" : entry.final_score.toFixed(1)}</span>
              </button>
            ))}
          </div>
          <div className="football-weekly-superteam__final-roster-list">
            {ROSTER_SLOTS.map((slot) => {
              const item = roster.find((entry) => entry.roster_slot === slot);
              return (
                <article key={slot}>
                  <small>{slot}</small><strong>{item?.display_name ?? "—"}</strong>
                  <span>{item ? item.school + " · " + item.season_year + " · $" + item.winning_bid : "—"}</span>
                  <b>{item ? item.grade.toFixed(1) : "—"}</b>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
      {tab === "grades" ? (
        <div className="football-weekly-superteam__grades">
          {result.all_teams.map((entry) => (
            <article key={entry.item_reference}>
              <span>DAY {entry.day_index}</span>
              <strong>{entry.display_name}<small>{entry.school} · {entry.season_year}</small></strong>
              <em>{entry.winner_display_name ?? "UNCLAIMED"}{entry.roster_slot ? " · " + entry.roster_slot : ""}</em>
              <b>{entry.grade.toFixed(1)}</b>
            </article>
          ))}
        </div>
      ) : null}
      {showNewWeekAction ? (
        <button className="football-weekly-superteam__primary" type="button" disabled={busy} onClick={onAcknowledge}>
          START THE NEW WEEK
        </button>
      ) : null}
    </section>
  );
}

export function FootballWeeklySuperteamGate({
  state, busy, error, forceBoard = false, onSubmit, onContinue,
}: {
  state: FootballWeeklySuperteamState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [editing, setEditing] = useState(!state.submitted_today);
  const initialBids = useMemo(() => initialBidMap(state), [state]);
  const [bids, setBids] = useState<SuperteamBidMap>(initialBids);

  useEffect(() => {
    setBids(initialBids);
    setEditing(!state.submitted_today);
  }, [initialBids, state.submitted_today]);

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <RulesCover onStart={() => setIntroDismissed(true)} />;
  }

  const submitted = state.submitted_today && !editing;
  const openSlots = Math.max(0, 7 - state.collection.length);
  const exposure = twoWinExposure(bids, openSlots);
  const highestBid = Math.max(0, ...Object.values(bids).map((bid) => bid.amount));
  const singleWinCap = Math.max(0, state.bankroll - Math.max(openSlots - 1, 0));
  const legal = exposure <= state.max_commit && highestBid <= singleWinCap;

  function changeAmount(slot: number, amount: number) {
    setBids((current) => ({ ...current, [slot]: { ...current[slot]!, amount } }));
  }

  function changePriority(slot: number, priority: number) {
    setBids((current) => {
      const currentPriority = current[slot]!.priority;
      const swapKey = Object.keys(current).find((key) => current[Number(key)]!.priority === priority);
      const next = { ...current, [slot]: { ...current[slot]!, priority } };
      if (swapKey) {
        const swapSlot = Number(swapKey);
        if (swapSlot !== slot) next[swapSlot] = { ...next[swapSlot]!, priority: currentPriority };
      }
      return next;
    });
  }

  return (
    <div className="football-weekly-superteam">
      <div className="football-weekly-superteam__status">
        <div><small>ROSTER</small><strong>{state.collection.length}/7</strong></div>
        <div><small>BANKROLL</small><strong>{"$"}{state.bankroll}</strong></div>
        <div><small>2-WIN EXPOSURE</small><strong>{"$"}{exposure}</strong><span>MAX {"$"}{state.max_commit}</span></div>
      </div>
      <RosterStrip collection={state.collection} />
      <PriorResults results={state.prior_results} />
      <section className="football-weekly-superteam__board surface-card">
        <header>
          <div><p className="eyebrow">CFB SUPERTEAM</p><h1>DAY {state.day_index} OF 7</h1></div>
          <div><strong>{state.teams.length}</strong><span>CANDIDATES</span></div>
        </header>
        <div className="football-weekly-superteam__tie-order">
          <small>TODAY’S TIE PRIORITY</small>
          <span>{state.tie_priority.length
            ? state.tie_priority.map((entry) => entry.rank + ". " + entry.display_name).join(" · ")
            : "Preview — field can grow through Day 4"}</span>
        </div>
        <div className="football-weekly-superteam__candidate-stack">
          {state.teams.map((card) => (
            <CandidateCard
              key={card.slot}
              card={card}
              bid={bids[card.slot]!}
              disabled={submitted || busy}
              eligible={candidateEligible(card, state.collection)}
              onAmount={(amount) => changeAmount(card.slot, amount)}
              onPriority={(priority) => changePriority(card.slot, priority)}
              priorityCount={state.teams.length}
            />
          ))}
        </div>
        <div className="football-weekly-superteam__priority-note">
          <strong>CLAIM PRIORITY</strong>
          <span>P1 is your first claim. Your ranking only matters when other wins, roster locks, or bankroll make a lower claim conditional.</span>
        </div>
        {!legal ? (
          <p className="football-weekly-superteam__error">
            {highestBid > singleWinCap
              ? <>Any single win can cost at most {"$"}{singleWinCap} right now so the other open roster spots keep their $1 reserve.</>
              : <>Your two highest possible wins total {"$"}{exposure}. Keep that at or below {"$"}{state.max_commit} so every open roster spot retains its $1 reserve.</>}
          </p>
        ) : null}
        {error ? <p className="football-weekly-superteam__error">{error}</p> : null}
        {submitted ? (
          <div className="football-weekly-superteam__submitted">
            <div><strong>BIDS SUBMITTED</strong><span>Edit until midnight CT.</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT BIDS</button>
            <button className="football-weekly-superteam__primary" type="button" disabled={busy} onClick={onContinue}>
              CONTINUE TO DAILY CHALLENGE
            </button>
          </div>
        ) : (
          <button
            className="football-weekly-superteam__primary"
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
