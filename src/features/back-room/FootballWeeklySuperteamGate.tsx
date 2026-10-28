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
  footballWeeklySuperteamSportsReferenceUrl,
  footballWeeklySuperteamStyle,
} from "./footballWeeklySuperteamVisualIdentity";
import { FootballWeeklySuperteamTableDialog } from "./FootballWeeklySuperteamTableDialog";
import { footballWeeklySuperteamAuctionScore } from "./footballWeeklySuperteamAuctionScore";

const ROSTER_SLOTS: readonly FootballWeeklySuperteamRosterSlot[] = [
  "QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach",
];

type SuperteamBidMap = Record<number, FootballWeeklySuperteamBid>;
type FinalTab = "standings" | "rosters" | "grades";

export function FootballWeeklySuperteamRulesCover({
  onStart,
  startLabel = "START TODAY’S AUCTION",
}: {
  onStart: () => void;
  startLabel?: string;
}) {
  return (
    <section className="football-weekly-superteam__cover surface-card">
      <p className="eyebrow">THIS WEEK · CFB SUPERTEAM</p>
      <h1>BUILD YOUR SUPERTEAM</h1>
      <strong>7 days · $50 · 7 roster spots</strong>
      <div className="football-weekly-superteam__rules">
        <div className="football-weekly-superteam__rules-callout">
          <b>YOU CAN BID MORE THAN YOUR BANKROLL</b>
          <span>
            Your submitted bids may add up to more than the cash you have left. Rankings make
            those bids conditional, so you never actually spend more than today’s allowed amount.
          </span>
        </div>
        <p><b>Rank every bid.</b> P1 is your first choice. We work down your list and only award wins that fit your bankroll, roster, and 2-win daily limit.</p>
        <p><b>Win up to 2 per day.</b> Losing bids cost $0.</p>
        <p><b>Save $1 per open spot.</b> Today’s max spend protects the money you still need to finish your roster.</p>
        <p><b>Ties rotate daily.</b> Today’s tie order is shown on the board.</p>
        <div className="football-weekly-superteam__rules-example">
          <b>EXAMPLE</b>
          <span>Max spend today $20 · P1 $11 · P2 $9 · P3 $8 = $28 in submitted bids. That is allowed. Your ranking decides which claims stay alive.</span>
        </div>
       </div>
      <button className="football-weekly-superteam__primary" type="button" onClick={onStart}>
        {startLabel}
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

function SportsReferenceName({ displayName }: { displayName: string }) {
  return (
    <a
      className="football-weekly-superteam__sports-reference-link"
      href={footballWeeklySuperteamSportsReferenceUrl(displayName)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={displayName + " on Sports-Reference"}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {displayName}
    </a>
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
            <span><SportsReferenceName displayName={result.display_name} /> · {result.school} {result.season_year}</span>
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
          const identity = item ? footballWeeklySuperteamIdentity(item.school) : null;
          return (
            <article
              className={item ? "is-filled" : ""}
              key={slot}
              style={identity ? footballWeeklySuperteamStyle(identity) : undefined}
            >
              {item ? (
                <TeamMark school={item.school} />
              ) : (
                <span className="football-weekly-superteam__roster-open-mark" aria-hidden="true">+</span>
              )}
              <div>
                <small>{slot}</small>
                <strong>{item ? <SportsReferenceName displayName={item.display_name} /> : "OPEN"}</strong>
                <span>{item ? item.school + " · " + item.season_year : "$1 reserved"}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CandidateCard({
  card,
  bid,
  disabled,
  eligible,
  dragging,
  onAmount,
  onPriority,
  onDragStart,
  onDragMove,
  onDragEnd,
  priorityCount,
}: {
  card: FootballWeeklySuperteamCard;
  bid: FootballWeeklySuperteamBid;
  disabled: boolean;
  eligible: boolean;
  dragging: boolean;
  onAmount: (amount: number) => void;
  onPriority: (priority: number) => void;
  onDragStart: () => void;
  onDragMove: (clientY: number) => void;
  onDragEnd: () => void;
  priorityCount: number;
}) {
  const identity = footballWeeklySuperteamIdentity(card.school);
  return (
    <article
      className={"football-weekly-superteam__candidate" + (!eligible ? " is-locked" : "") + (dragging ? " is-dragging" : "")}
      style={footballWeeklySuperteamStyle(identity)}
      data-superteam-slot={card.slot}
    >
      <div
        className="football-weekly-superteam__candidate-main"
        onPointerDown={(event) => {
          if (disabled) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          onDragStart();
        }}
        onPointerMove={(event) => {
          if (!disabled && event.buttons === 1) onDragMove(event.clientY);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          onDragEnd();
        }}
        onPointerCancel={onDragEnd}
        aria-label={"Hold and drag " + card.display_name + " to reorder claim priority"}
      >
        <span className="football-weekly-superteam__drag-grip" aria-hidden="true">⋮⋮</span>
        <TeamMark school={card.school} />
        <div>
          <small>{card.group_key.toUpperCase()} · {card.eligible_slots.join(" / ").toUpperCase()}</small>
          <strong><SportsReferenceName displayName={card.display_name} /></strong>
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
        <b>{footballWeeklySuperteamAuctionScore(me.final_score) ?? "—"}</b>
        <span>AUCTION SCORE</span>
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
              <span>{footballWeeklySuperteamAuctionScore(entry.final_score) ?? "—"}</span>
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
                <span>{footballWeeklySuperteamAuctionScore(entry.final_score) ?? "—"}</span>
              </button>
            ))}
          </div>
          <div className="football-weekly-superteam__final-roster-list">
            {ROSTER_SLOTS.map((slot) => {
              const item = roster.find((entry) => entry.roster_slot === slot);
              return (
                <article key={slot}>
                  <small>{slot}</small><strong>{item ? <SportsReferenceName displayName={item.display_name} /> : "—"}</strong>
                  <span>{item ? item.school + " · " + item.season_year + " · $" + item.winning_bid : "—"}</span>
                  <b>{item ? item.grade.toFixed(1) : "—"}</b>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
      {tab === "grades" ? (
        <div className="football-weekly-superteam__grades" aria-label="All CFB Superteam grades">
          {result.all_teams.map((item) => (
            <article key={item.day_index + "-" + item.slot}>
              <span>DAY {item.day_index}</span>
              <strong>
                <SportsReferenceName displayName={item.display_name} />
                <small>{item.school} · {item.season_year} · {item.group_key}</small>
              </strong>
              <em>{item.winner_display_name ? item.winner_display_name + (item.winning_bid ? " · $" + item.winning_bid : "") : "UNCLAIMED"}</em>
              <b>{item.grade.toFixed(1)}</b>
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
  state,
  busy,
  error,
  forceBoard = false,
  showContinueAction = true,
  submittedNote = "Edit until midnight CT.",
  tableMode = "live",
  tableSeatIndex = 1,
  onSubmit,
  onContinue,
}: {
  state: FootballWeeklySuperteamState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  showContinueAction?: boolean;
  submittedNote?: string;
  tableMode?: "live" | "lab" | "hidden";
  tableSeatIndex?: number;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [editing, setEditing] = useState(!state.submitted_today);
  const initialBids = useMemo(() => initialBidMap(state), [state]);
  const [bids, setBids] = useState<SuperteamBidMap>(initialBids);
  const [auctionTableOpen, setAuctionTableOpen] = useState(false);
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);

  useEffect(() => {
    setBids(initialBids);
    setEditing(!state.submitted_today);
  }, [initialBids, state.submitted_today]);

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <FootballWeeklySuperteamRulesCover onStart={() => setIntroDismissed(true)} />;
  }

  const submitted = state.submitted_today && !editing;
  const openSlots = Math.max(0, 7 - state.collection.length);
  const exposure = twoWinExposure(bids, openSlots);
  const highestBid = Math.max(0, ...Object.values(bids).map((bid) => bid.amount));
  const singleWinCap = Math.max(0, state.bankroll - Math.max(openSlots - 1, 0));
  const legal = exposure <= state.max_commit && highestBid <= singleWinCap;
  const orderedCards = [...state.teams].sort(
    (left, right) => (bids[left.slot]?.priority ?? left.slot) - (bids[right.slot]?.priority ?? right.slot),
  );

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

  function moveDraggedClaim(clientY: number) {
    if (draggingSlot === null) return;
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-superteam-slot]"));
    const target = rows
      .map((row) => ({
        row,
        distance: Math.abs((row.getBoundingClientRect().top + row.getBoundingClientRect().bottom) / 2 - clientY),
      }))
      .sort((left, right) => left.distance - right.distance)[0]?.row;
    const targetSlot = Number(target?.dataset.superteamSlot ?? 0);
    if (!targetSlot || targetSlot === draggingSlot) return;
    const targetPriority = bids[targetSlot]?.priority;
    if (targetPriority != null) changePriority(draggingSlot, targetPriority);
  }

  return (
    <div className="football-weekly-superteam">
      {auctionTableOpen && tableMode !== "hidden" ? (
        <FootballWeeklySuperteamTableDialog
          mode={tableMode}
          seatIndex={tableSeatIndex}
          onClose={() => setAuctionTableOpen(false)}
        />
      ) : null}
      <div className="football-weekly-superteam__status">
        {tableMode === "hidden" ? (
          <div><small>ROSTER</small><strong>{state.collection.length}/7</strong></div>
        ) : (
          <button type="button" onClick={() => setAuctionTableOpen(true)} aria-haspopup="dialog" aria-label="Open Auction Table">
            <small>AUCTION TABLE</small>
            <strong>VIEW ›</strong>
            <span>ROSTERS + BANKROLLS</span>
          </button>
        )}
        <div><small>BANKROLL</small><strong>{"$"}{state.bankroll}</strong></div>
        <div><small>MAX SPEND TODAY</small><strong>{"$"}{state.max_commit}</strong><span>UP TO 2 WINS</span></div>
      </div>
      <RosterStrip collection={state.collection} />
      <PriorResults results={state.prior_results} />
      <section className="football-weekly-superteam__board surface-card">
        <header>
          <div><p className="eyebrow">CFB SUPERTEAM</p><h1>DAY {state.day_index} OF 7</h1></div>
          <div><strong>{state.teams.length}</strong><span>CANDIDATES</span></div>
        </header>
        <div className="football-weekly-superteam__tie-order">
          <div className="football-weekly-superteam__tie-heading">
            <small>TODAY’S TIE PRIORITY</small>
            <em>{state.day_index === 1 ? "LIVE · LOCKS MIDNIGHT CT" : "LOCKED FIELD · ROTATES DAILY"}</em>
          </div>
          {state.tie_priority.length ? (
            <div className="football-weekly-superteam__tie-list" aria-label="Today’s tie priority order">
              {state.tie_priority.map((entry) => (
                <span className="football-weekly-superteam__tie-entry" key={entry.profile_id}>
                  {entry.rank}. {entry.display_name}
                </span>
              ))}
            </div>
          ) : (
            <span className="football-weekly-superteam__tie-empty">Preview — field not locked yet</span>
          )}
          {state.day_index === 1 ? (
            <p>New Day 1 entrants can change this order until the field locks.</p>
          ) : null}
        </div>
        <div className="football-weekly-superteam__candidate-stack">
          {orderedCards.map((card) => (
            <CandidateCard
              key={card.slot}
              card={card}
              bid={bids[card.slot]!}
              disabled={submitted || busy}
              eligible={candidateEligible(card, state.collection)}
              dragging={draggingSlot === card.slot}
              onAmount={(amount) => changeAmount(card.slot, amount)}
              onPriority={(priority) => changePriority(card.slot, priority)}
              onDragStart={() => setDraggingSlot(card.slot)}
              onDragMove={moveDraggedClaim}
              onDragEnd={() => setDraggingSlot(null)}
              priorityCount={state.teams.length}
            />
          ))}
        </div>
        <div className="football-weekly-superteam__priority-note">
          <strong>CLAIM PRIORITY</strong>
          <span>Hold + drag a player card to reorder claims. P1 is your first choice. If everything can’t fit, your ranking decides which claims stay alive.</span>
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
            <div><strong>BIDS SUBMITTED</strong><span>{submittedNote}</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT BIDS</button>
            {showContinueAction ? (
              <button className="football-weekly-superteam__primary" type="button" disabled={busy} onClick={onContinue}>
                CONTINUE TO DAILY CHALLENGE
              </button>
            ) : null}
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
