import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "../../styles/football-weekly-nfl-team-season.css";
import type {
  FootballWeeklyAuctionBidInput,
  FootballWeeklyNflTeamSeasonFinal,
  FootballWeeklyNflTeamSeasonState,
  FootballWeeklyNflWildcardState,
  FootballWeeklySuperteamBid,
} from "../play/footballWeeklyAuctionRepository";
import { footballNflTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import { FootballWeeklyAuctionTableDialog } from "./FootballWeeklyAuctionTableDialog";

type BidMap = Record<number, FootballWeeklySuperteamBid>;
type FinalTab = "standings" | "collections" | "grades";

const PFR_TEAM_CODES: Record<string, string> = {
  ARI: "crd", ATL: "atl", BAL: "rav", BUF: "buf", CAR: "car", CHI: "chi",
  CIN: "cin", CLE: "cle", DAL: "dal", DEN: "den", DET: "det", GB: "gnb",
  HOU: "htx", IND: "clt", JAX: "jax", KC: "kan", LAC: "sdg", LAR: "ram",
  LV: "rai", MIA: "mia", MIN: "min", NE: "nwe", NO: "nor", NYG: "nyg",
  NYJ: "nyj", PHI: "phi", PIT: "pit", SEA: "sea", SF: "sfo", TB: "tam",
  TEN: "oti", WAS: "was",
};

function nflTeamSeasonUrl(teamCode: string, seasonYear: number) {
  const pfrCode = PFR_TEAM_CODES[teamCode];
  return pfrCode
    ? `https://www.pro-football-reference.com/teams/${pfrCode}/${seasonYear}.htm`
    : "https://www.pro-football-reference.com/";
}

function TeamSeasonLink({
  teamCode,
  teamName,
  seasonYear,
}: {
  teamCode: string;
  teamName: string;
  seasonYear: number;
}) {
  return (
    <a
      className="football-weekly-nfl-team-season__season-link"
      href={nflTeamSeasonUrl(teamCode, seasonYear)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={teamName + " " + seasonYear + " season"}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <strong>{teamName}</strong>
      <b className="football-weekly-nfl-team-season__year">{seasonYear}</b>
    </a>
  );
}

function nflAsset(teamCode: string) {
  return footballTeamAssets[footballNflTeamMediaId(teamCode)] ?? null;
}

function TeamMark({ teamCode, label }: { teamCode: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const asset = nflAsset(teamCode);
  return (
    <span className="football-weekly-nfl-team-season__mark" aria-hidden="true">
      {asset && !failed
        ? <img src={asset.src} alt="" onError={() => setFailed(true)} />
        : <b>{teamCode || label.slice(0, 2).toUpperCase()}</b>}
    </span>
  );
}

function RulesCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="football-weekly-nfl-team-season__cover surface-card">
      <p className="eyebrow">WEEKLY AUCTION · NFL</p>
      <h1>BEST TEAM-SEASONS SINCE 2000</h1>
      <strong>Six auction days. One Wildcard finale. Best four team-seasons win the week.</strong>

      <div className="football-weekly-nfl-team-season__explainer">
        <article>
          <b>DAYS 1–6</b>
          <strong>BUILD UP TO FIVE TEAMS</strong>
          <span>You have a $50 bankroll for the week. Bid + rank your claims each day, win at most two teams per day, and finish with up to five normal team-seasons.</span>
        </article>
        <article>
          <b>HOW BIDDING WORKS</b>
          <strong>YOU CAN BID MORE THAN YOUR BANKROLL IN TOTAL</strong>
          <span>Your bids are conditional. Claims run P1, P2, P3… and any later win that no longer fits your remaining bankroll is skipped. Losing bids cost $0.</span>
        </article>
        <article>
          <b>DAY 7 · WILDCARD</b>
          <strong>OPTIONAL · NO MONEY INVOLVED</strong>
          <span>The auction is over. Four Wildcards appear. If you enter, choose which one of your teams you would replace, rank the Wildcards you would take, then choose 1–5 entries. No dollars are spent.</span>
        </article>
        <article>
          <b>FINAL SCORE</b>
          <strong>BEST FOUR GRADES COUNT</strong>
          <span>Your fifth team is insurance. After the Wildcard round, every grade is revealed and the best-four average decides the standings.</span>
        </article>
      </div>

      <details className="football-weekly-nfl-team-season__rules-details">
        <summary>MORE ON THE WILDCARD ROUND</summary>
        <div>
          <p>Each entry adds one slice to <b>Claim Order</b> and one slice to the separate <b>Risk Draw</b>.</p>
          <p><b>0 entries = safe pass.</b> You cannot win a Wildcard, but you also cannot be hit by the Risk Draw.</p>
          <p>The Risk Draw does not change this week’s score. It only makes that player start the next Weekly Auction with <b>$45 instead of $50</b>.</p>
        </div>
      </details>

      <button type="button" onClick={onStart}>START WEEKLY AUCTION</button>
    </section>
  );
}

function WildcardRulesCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="football-weekly-nfl-team-season__cover football-weekly-nfl-team-season__wildcard-cover surface-card">
      <p className="eyebrow">DAY 7 · FINALE</p>
      <h1>WILDCARD ROUND</h1>
      <strong>Optional. Make your strategy before you put any entries at risk.</strong>

      <div className="football-weekly-nfl-team-season__wildcard-quick-rules">
        <p><b>1</b><span>Choose the team you would cut, then rank only the Wildcards you would actually take.</span></p>
        <p><b>2</b><span>Each entry gives you one slice in Claim Order and one slice in the separate Risk Draw.</span></p>
        <p><b>3</b><span>0 entries is a safe pass. The Risk Draw lands on one entrant, who starts next week at $45.</span></p>
      </div>

      <button type="button" onClick={onStart}>SHOW THE FOUR WILDCARDS</button>
    </section>
  );
}

function NormalCard({
  card,
  bid,
  disabled,
  max,
  dragging,
  priorityCount,
  onAmount,
  onPriority,
  onDragStart,
  onDragMove,
  onDragEnd,
}: {
  card: FootballWeeklyNflTeamSeasonState["teams"][number];
  bid: FootballWeeklySuperteamBid;
  disabled: boolean;
  max: number;
  dragging: boolean;
  priorityCount: number;
  onAmount: (value: number) => void;
  onPriority: (value: number) => void;
  onDragStart: () => void;
  onDragMove: (clientY: number) => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      className={"football-weekly-nfl-team-season__card" + (dragging ? " is-dragging" : "")}
      data-nfl-team-season-slot={card.slot}
    >
      <div
        className="football-weekly-nfl-team-season__identity"
        onPointerDown={(event) => {
          if (disabled || (event.target as HTMLElement).closest("a,button,input,select")) return;
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
      >
        <span className="football-weekly-nfl-team-season__drag-grip" aria-hidden="true">⋮⋮</span>
        <TeamMark teamCode={card.team_code} label={card.team_name} />
        <div className="football-weekly-nfl-team-season__identity-copy">
          <TeamSeasonLink teamCode={card.team_code} teamName={card.team_name} seasonYear={card.season_year} />
          {card.card_tag ? <small>{card.card_tag}</small> : null}
        </div>
      </div>
      <div className="football-weekly-nfl-team-season__controls">
        <label className="football-weekly-nfl-team-season__priority">
          <span>CLAIM</span>
          <select
            value={bid.priority}
            disabled={disabled}
            onChange={(event) => onPriority(Number(event.currentTarget.value))}
            aria-label={card.team_name + " " + card.season_year + " claim priority"}
          >
            {Array.from({ length: priorityCount }, (_, index) => index + 1).map((priority) => (
              <option value={priority} key={priority}>P{priority}</option>
            ))}
          </select>
        </label>
        <div className="football-weekly-nfl-team-season__bid">
          <button type="button" disabled={disabled || bid.amount <= 0} onClick={() => onAmount(Math.max(0, bid.amount - 1))}>−</button>
          <label>
            <span>BID</span><b>$</b>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={max}
              step={1}
              disabled={disabled}
              value={bid.amount}
              onChange={(event) => {
                const next = Math.floor(Number(event.currentTarget.value));
                onAmount(Number.isFinite(next) ? Math.max(0, Math.min(max, next)) : 0);
              }}
              aria-label={"Bid on " + card.team_name + " " + card.season_year}
            />
          </label>
          <button type="button" disabled={disabled || bid.amount >= max} onClick={() => onAmount(Math.min(max, bid.amount + 1))}>+</button>
        </div>
      </div>
      <em>$0 = PASS</em>
    </article>
  );
}

function PriorResults({ state }: { state: FootballWeeklyNflTeamSeasonState }) {
  if (!state.prior_results.length) return null;
  return (
    <section className="football-weekly-nfl-team-season__prior surface-card">
      <p className="eyebrow">PREVIOUS DAY · RESOLVED</p>
      {state.prior_results.map((result) => (
        <details key={result.item_reference}>
          <summary>
            <span>
              <TeamSeasonLink teamCode={result.team_code} teamName={result.team_name} seasonYear={result.season_year} />
            </span>
            <strong>{(result.winner_display_name ?? "Unclaimed") + " · " + (result.winning_bid ? "$" + result.winning_bid : "Pass")}</strong>
          </summary>
          <div>
            {result.bids.map((bid) => (
              <span key={bid.profile_id}><b>{bid.display_name}</b><strong>{bid.amount ? "$" + bid.amount + (bid.priority ? " · P" + bid.priority : "") : "Pass"}</strong></span>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}

function NormalAuction({
  state,
  busy,
  error,
  tableMode,
  tableSeatIndex,
  onSubmit,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  tableMode: "live" | "lab";
  tableSeatIndex: number;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onContinue: () => void;
}) {
  const initial = useMemo<BidMap>(() => Object.fromEntries(
    state.teams.map((team) => {
      const stored = state.bids[String(team.slot)];
      return [team.slot, typeof stored === "number"
        ? { amount: stored, priority: team.slot }
        : stored ?? { amount: 0, priority: team.slot }];
    }),
  ) as BidMap, [state.bids, state.teams]);
  const [bids, setBids] = useState<BidMap>(initial);
  const [editing, setEditing] = useState(!state.submitted_today);
  const [tableOpen, setTableOpen] = useState(false);
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);

  useEffect(() => {
    setBids(initial);
    setEditing(!state.submitted_today);
  }, [initial, state.submitted_today]);

  const maxWins = Math.min(2, Math.max(5 - state.owned_count, 0));
  const highestBid = Math.max(0, ...Object.values(bids).map((bid) => bid.amount));
  const legal = highestBid <= state.bankroll;
  const submitted = state.submitted_today && !editing;
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
    const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-nfl-team-season-slot]"));
    const target = rows
      .map((row) => ({
        row,
        distance: Math.abs((row.getBoundingClientRect().top + row.getBoundingClientRect().bottom) / 2 - clientY),
      }))
      .sort((left, right) => left.distance - right.distance)[0]?.row;
    const targetSlot = Number(target?.dataset.nflTeamSeasonSlot ?? 0);
    if (!targetSlot || targetSlot === draggingSlot) return;
    const targetPriority = bids[targetSlot]?.priority;
    if (targetPriority != null) changePriority(draggingSlot, targetPriority);
  }

  return (
    <div className="football-weekly-nfl-team-season">
      {tableOpen ? (
        <FootballWeeklyAuctionTableDialog
          mode={tableMode}
          seatIndex={tableSeatIndex}
          onClose={() => setTableOpen(false)}
        />
      ) : null}

      <div className="football-weekly-nfl-team-season__status">
        <button type="button" onClick={() => setTableOpen(true)} aria-haspopup="dialog" aria-label="Open Auction Table">
          <small>AUCTION TABLE</small><strong>VIEW ›</strong><span>TEAMS + BANKROLLS</span>
        </button>
        <div><small>BANKROLL</small><strong>{"$"}{state.bankroll}</strong><span>STARTED {"$"}{state.starting_bankroll}</span></div>
        <div><small>MAX SPEND TODAY</small><strong>{"$"}{state.max_commit}</strong><span>UP TO {maxWins} WINS</span></div>
      </div>

      <PriorResults state={state} />

      <section className="football-weekly-nfl-team-season__board surface-card">
        <header className="football-weekly-nfl-team-season__board-head">
          <div><p className="eyebrow">NFL WEEKLY AUCTION</p><h1>DAY {state.day_index} OF 7</h1></div>
          <span>DAYS 1–6 · SEALED BIDS</span>
        </header>

        <div className="football-weekly-nfl-team-season__theme">
          <small>TODAY’S THEME</small>
          <strong>{state.theme}</strong>
          <span>Future themes stay hidden. Today’s board never rerolls.</span>
        </div>

        <div className="football-weekly-nfl-team-season__cards">
          {orderedCards.map((card) => (
            <NormalCard
              key={card.item_reference}
              card={card}
              bid={bids[card.slot]!}
              disabled={submitted || busy || maxWins === 0}
              max={state.bankroll}
              dragging={draggingSlot === card.slot}
              priorityCount={state.teams.length}
              onAmount={(amount) => changeAmount(card.slot, amount)}
              onPriority={(priority) => changePriority(card.slot, priority)}
              onDragStart={() => setDraggingSlot(card.slot)}
              onDragMove={moveDraggedClaim}
              onDragEnd={() => setDraggingSlot(null)}
            />
          ))}
        </div>

        <div className="football-weekly-nfl-team-season__priority-note">
          <strong>CLAIM PRIORITY</strong>
          <span>Hold + drag a team card to reorder claims. Your bids may total more than your bankroll; P1 is tried first, then P2, and so on. Claims that no longer fit are skipped.</span>
        </div>

        <div className="football-weekly-nfl-team-season__normal-note">
          <span>Highest bid wins. Losing bids cost $0.</span>
          <span>You can win at most 2 today and 5 normal teams this week.</span>
        </div>

        {!legal ? (
          <p className="football-weekly-nfl-team-season__error">
            Any single bid can be at most {"$"}{state.bankroll}, your current bankroll.
          </p>
        ) : null}
        {error ? <p className="football-weekly-nfl-team-season__error">{error}</p> : null}

        {submitted ? (
          <div className="football-weekly-nfl-team-season__submitted">
            <div><strong>BIDS IN</strong><span>Edit until midnight CT.</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT BIDS</button>
            <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy} onClick={onContinue}>CONTINUE</button>
          </div>
        ) : (
          <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy || !legal} onClick={() => void onSubmit(bids)}>
            {state.submitted_today ? "SAVE BID CHANGES" : "SUBMIT TODAY’S BIDS"}
          </button>
        )}
      </section>
    </div>
  );
}

function RankingBoard({
  wildcard,
  rankings,
  disabled,
  onChange,
}: {
  wildcard: FootballWeeklyNflWildcardState;
  rankings: string[];
  disabled: boolean;
  onChange: (next: string[]) => void;
}) {
  function toggle(ref: string) {
    if (disabled) return;
    onChange(rankings.includes(ref) ? rankings.filter((value) => value !== ref) : [...rankings, ref]);
  }

  function move(ref: string, delta: number) {
    const index = rankings.indexOf(ref);
    if (index < 0) return;
    const target = Math.max(0, Math.min(rankings.length - 1, index + delta));
    if (target === index) return;
    const next = [...rankings];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <>
      <div className="football-weekly-nfl-team-season__wildcards">
        {wildcard.teams.map((team) => {
          const rank = rankings.indexOf(team.item_reference);
          return (
            <article className={rank >= 0 ? "is-selected" : ""} key={team.item_reference}>
              <a
                className="football-weekly-nfl-team-season__wildcard-link"
                href={nflTeamSeasonUrl(team.team_code, team.season_year)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={team.primary_name + " " + team.season_year + " season"}
              >
                <TeamMark teamCode={team.team_code} label={team.primary_name} />
                <span className="football-weekly-nfl-team-season__wildcard-name">
                  <strong>{team.primary_name}</strong>
                  <b className="football-weekly-nfl-team-season__year">{team.season_year}</b>
                </span>
              </a>
              <button
                type="button"
                className={rank >= 0 ? "is-selected" : ""}
                disabled={disabled}
                onClick={() => toggle(team.item_reference)}
              >
                {rank >= 0 ? "P" + (rank + 1) : "ADD"}
              </button>
            </article>
          );
        })}
      </div>

      {rankings.length ? (
        <div className="football-weekly-nfl-team-season__ranking">
          <small>YOUR WILDCARD ORDER</small>
          {rankings.map((ref, index) => {
            const team = wildcard.teams.find((candidate) => candidate.item_reference === ref);
            if (!team) return null;
            return (
              <div key={ref}>
                <b>P{index + 1}</b>
                <span>{team.primary_name} <strong>{team.season_year}</strong></span>
                <button type="button" disabled={disabled || index === 0} onClick={() => move(ref, -1)}>↑</button>
                <button type="button" disabled={disabled || index === rankings.length - 1} onClick={() => move(ref, 1)}>↓</button>
                <button type="button" disabled={disabled} onClick={() => toggle(ref)}>×</button>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

function CutSelector({
  collection,
  selected,
  disabled,
  onChange,
}: {
  collection: FootballWeeklyNflTeamSeasonState["collection"];
  selected: string | null;
  disabled: boolean;
  onChange: (itemReference: string) => void;
}) {
  const normalTeams = collection.filter((team) => team.source === "normal");
  return (
    <section className="football-weekly-nfl-team-season__cut">
      <div>
        <small>YOUR CUT</small>
        <strong>Which team comes out if you win a Wildcard?</strong>
      </div>
      <div className="football-weekly-nfl-team-season__cut-options">
        {normalTeams.map((team) => (
          <article className={selected === team.item_reference ? "is-selected" : ""} key={team.item_reference}>
            <a
              href={nflTeamSeasonUrl(team.team_code, team.season_year)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={team.team_name + " " + team.season_year + " season"}
            >
              <TeamMark teamCode={team.team_code} label={team.team_name} />
              <span><strong>{team.team_name}</strong><b>{team.season_year}</b></span>
            </a>
            <button
              type="button"
              className={selected === team.item_reference ? "is-selected" : ""}
              disabled={disabled}
              onClick={() => onChange(team.item_reference)}
            >
              {selected === team.item_reference ? "CUT" : "CHOOSE"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

const wheelPalette = ["#20b486", "#f7b84b", "#68a4ff", "#eb6f92", "#9d7bf0", "#f38c5d", "#50c7d9", "#d2d95a"];

function wheelTickets(draws: FootballWeeklyNflWildcardState["priority_draws"]) {
  const remaining = draws.map((draw) => draw.entry_count);
  const tickets: FootballWeeklyNflWildcardState["priority_draws"] = [];
  while (remaining.some((count) => count > 0)) {
    draws.forEach((draw, index) => {
      if (remaining[index] > 0) {
        tickets.push(draw);
        remaining[index] -= 1;
      }
    });
  }
  return tickets;
}

function wheelBackground(draws: FootballWeeklyNflWildcardState["priority_draws"]) {
  const tickets = wheelTickets(draws);
  if (!tickets.length) return "#24313b";
  const size = 360 / tickets.length;
  const colorByProfile = new Map(draws.map((draw, index) => [draw.profile_id, wheelPalette[index % wheelPalette.length]]));
  return "conic-gradient(" + tickets.map((ticket, index) => {
    const start = index * size;
    const end = (index + 1) * size;
    return (colorByProfile.get(ticket.profile_id) ?? wheelPalette[0]) + " " + start + "deg " + end + "deg";
  }).join(",") + ")";
}

function wheelStopRotation(
  draws: FootballWeeklyNflWildcardState["priority_draws"],
  selectedProfileId: string | null,
) {
  const tickets = wheelTickets(draws);
  if (!selectedProfileId || !tickets.length) return 0;
  const ownedIndexes = tickets
    .map((ticket, index) => ticket.profile_id === selectedProfileId ? index : -1)
    .filter((index) => index >= 0);
  if (!ownedIndexes.length) return 0;
  const selectedIndex = ownedIndexes[Math.floor(ownedIndexes.length / 2)];
  const midpoint = ((selectedIndex + .5) / tickets.length) * 360;
  return -midpoint;
}

function WheelGraphic({
  title,
  centerLabel,
  draws,
  selectedProfileId,
  spinning,
}: {
  title: string;
  centerLabel: string;
  draws: FootballWeeklyNflWildcardState["priority_draws"];
  selectedProfileId: string | null;
  spinning: boolean;
}) {
  const total = draws.reduce((sum, draw) => sum + draw.entry_count, 0);
  const style = {
    "--wheel-fill": wheelBackground(draws),
    "--wheel-stop": wheelStopRotation(draws, selectedProfileId) + "deg",
  } as CSSProperties;
  return (
    <div className="football-weekly-nfl-team-season__draw-stage">
      <small>{title}</small>
      <div className="football-weekly-nfl-team-season__wheel-shell">
        <span className="football-weekly-nfl-team-season__wheel-pointer" aria-hidden="true">▼</span>
        <div className={"football-weekly-nfl-team-season__wheel" + (spinning ? " is-spinning" : "")} style={style}>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="football-weekly-nfl-team-season__ticket-legend">
        {draws.map((draw, index) => (
          <span key={draw.profile_id}>
            <i style={{ background: wheelPalette[index % wheelPalette.length] }} />
            <b>{draw.display_name}</b>
            <em>{draw.entry_count}/{total}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function ClaimSummary({ wildcard }: { wildcard: FootballWeeklyNflWildcardState }) {
  return (
    <>
      <div className="football-weekly-nfl-team-season__draw-order">
        <small>CLAIM ORDER</small>
        <strong>{wildcard.priority_draws.map((draw) => draw.display_name).join(" → ")}</strong>
      </div>

      <div className="football-weekly-nfl-team-season__claims">
        <small>WILDCARD SWAPS</small>
        {wildcard.claims.length ? wildcard.claims.map((claim) => {
          const team = wildcard.teams.find((candidate) => candidate.item_reference === claim.item_reference);
          const replacement = claim.replaced_team_name
            ? claim.replaced_team_name + " " + claim.replaced_season_year
            : claim.replaced_item_reference;
          return (
            <div key={claim.profile_id}>
              <b>#{claim.priority_order}</b>
              <strong>{claim.display_name}</strong>
              <span>{team ? team.primary_name + " " + team.season_year : claim.item_reference}<small> for {replacement}</small></span>
            </div>
          );
        }) : <p>No Wildcard was claimed.</p>}
      </div>
    </>
  );
}

function WheelResult({ wildcard }: { wildcard: FootballWeeklyNflWildcardState }) {
  const [phase, setPhase] = useState<"claim" | "risk" | "done">("claim");
  const risk = wildcard.reaping;

  useEffect(() => {
    if (!wildcard.priority_draws.length) return;
    const reduceMotion = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const spinTime = reduceMotion ? 20 : 5000;
    const riskTimer = window.setTimeout(() => setPhase("risk"), spinTime);
    const doneTimer = window.setTimeout(() => setPhase("done"), spinTime * 2);
    return () => {
      window.clearTimeout(riskTimer);
      window.clearTimeout(doneTimer);
    };
  }, [wildcard.week_start, wildcard.priority_draws.length]);

  if (!wildcard.priority_draws.length) {
    return (
      <section className="football-weekly-nfl-team-season__resolution">
        <div className="football-weekly-nfl-team-season__no-entry-result">
          <small>DAY 7 RESULT</small>
          <strong>EVERYONE PASSED</strong>
          <span>No one entered, so there was no Claim Order draw, no Wildcard swap, and no Risk Draw.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="football-weekly-nfl-team-season__resolution">
      {phase === "claim" ? (
        <WheelGraphic
          title="CLAIM ORDER"
          centerLabel="CLAIM"
          draws={wildcard.priority_draws}
          selectedProfileId={wildcard.priority_draws[0]?.profile_id ?? null}
          spinning
        />
      ) : null}

      {phase !== "claim" ? <ClaimSummary wildcard={wildcard} /> : null}

      {phase === "risk" ? (
        <WheelGraphic
          title="RISK DRAW"
          centerLabel="RISK"
          draws={wildcard.priority_draws}
          selectedProfileId={risk?.profile_id ?? null}
          spinning
        />
      ) : null}

      {phase === "done" ? (
        <div className={"football-weekly-nfl-team-season__risk-result" + (risk ? " is-hit" : "")}>
          <small>RISK DRAW</small>
          <strong>{risk ? risk.display_name : "NO DRAW"}</strong>
          <span>{risk ? "Starts next week at $45. This week’s score is unchanged." : "No one entered."}</span>
        </div>
      ) : null}
    </section>
  );
}

function WildcardDay({
  state,
  busy,
  error,
  onSubmitWildcard,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  onSubmitWildcard: (entries: number, rankings: string[], cutItemReference: string | null) => Promise<void>;
  onContinue: () => void;
}) {
  const wildcard = state.wildcard;
  if (!wildcard) return null;

  const [entries, setEntries] = useState(wildcard.my_entries);
  const [rankings, setRankings] = useState<string[]>(wildcard.my_rankings);
  const [cutItemReference, setCutItemReference] = useState<string | null>(wildcard.my_cut_item_reference);
  const [editing, setEditing] = useState(!wildcard.submitted);

  useEffect(() => {
    setEntries(wildcard.my_entries);
    setRankings(wildcard.my_rankings);
    setCutItemReference(wildcard.my_cut_item_reference);
    setEditing(!wildcard.submitted);
  }, [wildcard.my_entries, wildcard.my_rankings, wildcard.my_cut_item_reference, wildcard.submitted]);

  if (wildcard.resolved) {
    return (
      <div className="football-weekly-nfl-team-season">
        <section className="football-weekly-nfl-team-season__wildcard-board surface-card">
          <header className="football-weekly-nfl-team-season__board-head">
            <div><p className="eyebrow">DAY 7 · FINALE</p><h1>WILDCARD ROUND</h1></div>
            <span>RESOLVED</span>
          </header>
          <WheelResult wildcard={wildcard} />
          <button className="football-weekly-nfl-team-season__primary" type="button" onClick={onContinue}>CONTINUE</button>
        </section>
      </div>
    );
  }

  const cannotEnter = state.owned_count < 4;
  const submitted = wildcard.submitted && !editing;
  const legal = entries === 0 || (!cannotEnter && rankings.length > 0 && Boolean(cutItemReference));
  const cutTeam = state.collection.find((team) => team.item_reference === cutItemReference);

  return (
    <div className="football-weekly-nfl-team-season">
      <section className="football-weekly-nfl-team-season__wildcard-board surface-card">
        <header className="football-weekly-nfl-team-season__board-head">
          <div><p className="eyebrow">DAY 7 · FINALE</p><h1>WILDCARD ROUND</h1></div>
        </header>

        <div className="football-weekly-nfl-team-season__wildcard-copy">
          <strong>Choose your cut. Rank what you’d take. Choose your risk.</strong>
          <span>Your entries determine your slices in both the Claim Order draw and the separate Risk Draw.</span>
        </div>

        <CutSelector
          collection={state.collection}
          selected={cutItemReference}
          disabled={submitted || busy || cannotEnter}
          onChange={setCutItemReference}
        />

        <section className="football-weekly-nfl-team-season__wildcard-picks">
          <div><small>YOUR WILDCARDS</small><strong>Rank only teams you would take for your selected cut.</strong></div>
          <RankingBoard
            wildcard={wildcard}
            rankings={rankings}
            disabled={submitted || busy || cannotEnter}
            onChange={setRankings}
          />
        </section>

        <div className="football-weekly-nfl-team-season__tickets">
          <div><small>YOUR ENTRIES</small><strong>{entries}</strong><span>Each entry = 1 Claim Order slice + 1 Risk Draw slice.</span></div>
          <div className="football-weekly-nfl-team-season__ticket-buttons">
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                className={entries === value ? "is-active" : ""}
                key={value}
                disabled={submitted || busy || (cannotEnter && value > 0)}
                onClick={() => {
                  setEntries(value);
                  if (value === 0) {
                    setRankings([]);
                    setCutItemReference(null);
                  }
                }}
              >{value}</button>
            ))}
          </div>
          <p><b>0 entries:</b> pass safely. No Wildcard chance and no Risk Draw chance.</p>
        </div>

        {cannotEnter ? <p className="football-weekly-nfl-team-season__error">You need at least four normal teams to enter. This seat can pass safely with 0 entries.</p> : null}
        {entries > 0 && !cutItemReference ? <p className="football-weekly-nfl-team-season__error">Choose the team you would cut.</p> : null}
        {entries > 0 && rankings.length === 0 ? <p className="football-weekly-nfl-team-season__error">Add at least one Wildcard you would take.</p> : null}
        {error ? <p className="football-weekly-nfl-team-season__error">{error}</p> : null}

        {submitted ? (
          <div className="football-weekly-nfl-team-season__submitted">
            <div>
              <strong>{entries === 0 ? "SAFE PASS IN" : "WILDCARD CHOICE IN"}</strong>
              <span>{entries === 0 ? "0 entries · no Risk Draw chance." : entries + " entries · cut " + (cutTeam ? cutTeam.team_name + " " + cutTeam.season_year : "selected team") + "."}</span>
            </div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT CHOICE</button>
            <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy} onClick={onContinue}>CONTINUE</button>
          </div>
        ) : (
          <button
            className="football-weekly-nfl-team-season__primary"
            type="button"
            disabled={busy || !legal}
            onClick={() => void onSubmitWildcard(entries, rankings, cutItemReference)}
          >
            {wildcard.submitted
              ? "SAVE WILDCARD CHANGES"
              : entries === 0
                ? "PASS SAFELY · 0 ENTRIES"
                : "SUBMIT " + entries + " " + (entries === 1 ? "ENTRY" : "ENTRIES")}
          </button>
        )}
      </section>
    </div>
  );
}

export function FootballWeeklyNflTeamSeasonFinalResult({
  result,
  busy,
  onAcknowledge,
  showNewWeekAction = true,
  playerLabel,
}: {
  result: FootballWeeklyNflTeamSeasonFinal;
  busy: boolean;
  onAcknowledge: () => void;
  showNewWeekAction?: boolean;
  playerLabel?: string;
}) {
  const [tab, setTab] = useState<FinalTab>("standings");
  const me = result.my_result;
  const ownerLabel = playerLabel ? playerLabel.toUpperCase() + "’S" : "YOUR";
  const currentStanding = result.standings.find((entry) => entry.is_current_user) ?? result.standings[0] ?? null;
  const [selectedProfileId, setSelectedProfileId] = useState(currentStanding?.profile_id ?? "");
  const selectedStanding = result.standings.find((entry) => entry.profile_id === selectedProfileId) ?? currentStanding;
  const selectedCollection = selectedStanding
    ? result.final_collections.filter((team) => team.profile_id === selectedStanding.profile_id)
    : [];

  useEffect(() => {
    setSelectedProfileId(currentStanding?.profile_id ?? "");
  }, [currentStanding?.profile_id, result.week_start]);

  return (
    <section className="football-weekly-nfl-team-season__final surface-card">
      <header className="football-weekly-nfl-team-season__final-head">
        <p className="eyebrow">NFL WEEKLY AUCTION</p>
        <h1>FINAL RESULTS</h1>
        <span>Every grade is revealed. Best four team-season grades decide the week.</span>
      </header>

      <div className="football-weekly-nfl-team-season__finish">
        <small>{me.is_winner ? "WEEKLY CHAMPION" : ownerLabel + " FINISH"}</small>
        <strong>{me.final_rank ? "#" + me.final_rank : "—"}</strong>
        <b>{me.final_score == null ? "—" : me.final_score.toFixed(1)}</b>
      </div>

      <nav className="football-weekly-nfl-team-season__final-tabs" aria-label="NFL Team-Seasons final views">
        <button className={tab === "standings" ? "is-active" : ""} type="button" onClick={() => setTab("standings")}>Standings</button>
        <button className={tab === "collections" ? "is-active" : ""} type="button" onClick={() => setTab("collections")}>Collections</button>
        <button className={tab === "grades" ? "is-active" : ""} type="button" onClick={() => setTab("grades")}>All Grades</button>
      </nav>

      {tab === "standings" ? (
        <div className="football-weekly-nfl-team-season__standings">
          {result.standings.map((entry) => (
            <div className={entry.is_current_user ? "is-current" : ""} key={entry.profile_id}>
              <b>#{entry.rank ?? "—"}</b>
              <strong>{entry.display_name}</strong>
              <span>{entry.final_score?.toFixed(1) ?? "—"}</span>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "collections" ? (
        <div className="football-weekly-nfl-team-season__collections">
          <div className="football-weekly-nfl-team-season__player-picker" aria-label="Select player collection">
            {result.standings.map((entry) => (
              <button
                className={selectedStanding?.profile_id === entry.profile_id ? "is-active" : ""}
                type="button"
                key={entry.profile_id}
                onClick={() => setSelectedProfileId(entry.profile_id)}
              >
                <strong>{entry.display_name}</strong>
                <span>{entry.final_score == null ? "—" : entry.final_score.toFixed(1)}</span>
              </button>
            ))}
          </div>

          {selectedStanding ? (
            <>
              <div className="football-weekly-nfl-team-season__collection-summary">
                <div>
                  <small>COLLECTION</small>
                  <strong>{selectedStanding.display_name}</strong>
                </div>
                <span>{selectedStanding.owned_count} teams · {selectedStanding.final_score?.toFixed(1) ?? "—"} best-4</span>
              </div>

              <div className="football-weekly-nfl-team-season__final-collection">
                {selectedCollection.map((team) => (
                  <article className={team.counts ? "is-counting" : ""} key={team.item_reference}>
                    <TeamMark teamCode={team.team_code} label={team.team_name} />
                    <div className="football-weekly-nfl-team-season__final-name">
                      <TeamSeasonLink teamCode={team.team_code} teamName={team.team_name} seasonYear={team.season_year} />
                    </div>
                    <em>{team.source === "wildcard" ? "WILDCARD" : team.source === "autofill" ? "AUTOFILL" : team.winning_bid ? "$" + team.winning_bid : "WON"}</em>
                    <span>{team.grade.toFixed(1)}</span>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {tab === "grades" ? (
        <div className="football-weekly-nfl-team-season__all-grades">
          {result.all_teams.map((team) => (
            <article key={team.day_index + "-" + team.slot}>
              <div>
                <small>DAY {team.day_index}</small>
                <TeamSeasonLink teamCode={team.team_code} teamName={team.team_name} seasonYear={team.season_year} />
                <span>{team.winner_display_name ? team.winner_display_name + (team.winning_bid ? " · $" + team.winning_bid : "") : "UNCLAIMED"}</span>
              </div>
              <b>{team.grade.toFixed(1)}</b>
            </article>
          ))}
        </div>
      ) : null}

      <details className="football-weekly-nfl-team-season__final-wildcard">
        <summary>DAY 7 · WILDCARD RESULT</summary>
        <WheelResult wildcard={result.wildcard} />
      </details>

      {showNewWeekAction ? <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy} onClick={onAcknowledge}>START THE NEW WEEK</button> : null}
    </section>
  );
}

export function FootballWeeklyNflTeamSeasonGate({
  state,
  busy,
  error,
  forceBoard = false,
  tableMode = "live",
  tableSeatIndex = 1,
  onSubmit,
  onSubmitWildcard,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  tableMode?: "live" | "lab";
  tableSeatIndex?: number;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onSubmitWildcard: (entries: number, rankings: string[], cutItemReference: string | null) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [wildcardIntroDismissed, setWildcardIntroDismissed] = useState(false);

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <RulesCover onStart={() => setIntroDismissed(true)} />;
  }

  if (
    state.day_index === 7
    && state.wildcard
    && !state.wildcard.submitted
    && !state.wildcard.resolved
    && !wildcardIntroDismissed
  ) {
    return <WildcardRulesCover onStart={() => setWildcardIntroDismissed(true)} />;
  }

  return state.day_index === 7
    ? <WildcardDay state={state} busy={busy} error={error} onSubmitWildcard={onSubmitWildcard} onContinue={onContinue} />
    : <NormalAuction
        state={state}
        busy={busy}
        error={error}
        tableMode={tableMode}
        tableSeatIndex={tableSeatIndex}
        onSubmit={onSubmit}
        onContinue={onContinue}
      />;
}
