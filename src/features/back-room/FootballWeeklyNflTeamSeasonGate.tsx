import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "../../styles/football-weekly-nfl-team-season.css";
import type {
  FootballWeeklyAuctionBidInput,
  FootballWeeklyNflTeamSeasonFinal,
  FootballWeeklyNflTeamSeasonState,
  FootballWeeklyNflWildcardState,
} from "../play/footballWeeklyAuctionRepository";
import { footballNflTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import { FootballWeeklyAuctionTableDialog } from "./FootballWeeklyAuctionTableDialog";

type BidMap = Record<number, number>;

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
      <strong>Six auction days. One Wildcard finale. Best four count.</strong>
      <div className="football-weekly-nfl-team-season__rules">
        <p><b>$50 bankroll</b> for Days 1–6. Win at most <b>2 teams per day</b> and <b>5 normal teams</b> for the week.</p>
        <p>Every card is an exact <b>franchise + season year</b>. Hidden grades measure that specific season, not franchise reputation.</p>
        <p><b>Day 7:</b> see four Wildcards first, rank only the ones you would accept, then choose 0–5 entries.</p>
        <p>Each entry is one <b>Priority ticket</b> and one <b>Reaping ticket</b>. <b>0 entries is completely safe.</b></p>
        <p>The Reaped player keeps this week’s score, but starts the next Weekly Auction with <b>$5 less</b>.</p>
      </div>
      <button type="button" onClick={onStart}>START WEEKLY AUCTION</button>
    </section>
  );
}

function NormalCard({
  card,
  value,
  disabled,
  max,
  onChange,
}: {
  card: FootballWeeklyNflTeamSeasonState["teams"][number];
  value: number;
  disabled: boolean;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <article className="football-weekly-nfl-team-season__card">
      <div className="football-weekly-nfl-team-season__identity">
        <TeamMark teamCode={card.team_code} label={card.team_name} />
        <div className="football-weekly-nfl-team-season__identity-copy">
          <span className="football-weekly-nfl-team-season__name-row">
            <strong>{card.team_name}</strong>
            <b className="football-weekly-nfl-team-season__year">{card.season_year}</b>
          </span>
          {card.card_tag ? <small>{card.card_tag}</small> : null}
        </div>
      </div>
      <div className="football-weekly-nfl-team-season__bid">
        <button type="button" disabled={disabled || value <= 0} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <label>
          <span>BID</span><b>$</b>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={max}
            step={1}
            disabled={disabled}
            value={value}
            onChange={(event) => {
              const next = Math.floor(Number(event.currentTarget.value));
              onChange(Number.isFinite(next) ? Math.max(0, Math.min(max, next)) : 0);
            }}
            aria-label={"Bid on " + card.team_name + " " + card.season_year}
          />
        </label>
        <button type="button" disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
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
            <span>{result.team_name} <b>{result.season_year}</b></span>
            <strong>{(result.winner_display_name ?? "Unclaimed") + " · " + (result.winning_bid ? "$" + result.winning_bid : "Pass")}</strong>
          </summary>
          <div>
            {result.bids.map((bid) => (
              <span key={bid.profile_id}><b>{bid.display_name}</b><strong>{bid.amount ? "$" + bid.amount : "Pass"}</strong></span>
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
  onSubmit,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onContinue: () => void;
}) {
  const initial = useMemo<BidMap>(() => Object.fromEntries(
    state.teams.map((team) => [team.slot, state.bids[String(team.slot)] ?? 0]),
  ), [state.bids, state.teams]);
  const [bids, setBids] = useState<BidMap>(initial);
  const [editing, setEditing] = useState(!state.submitted_today);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    setBids(initial);
    setEditing(!state.submitted_today);
  }, [initial, state.submitted_today]);

  const maxWins = Math.min(2, Math.max(5 - state.owned_count, 0));
  const spendRisk = Object.values(bids)
    .sort((left, right) => right - left)
    .slice(0, maxWins)
    .reduce((sum, amount) => sum + amount, 0);
  const legal = spendRisk <= state.bankroll;
  const submitted = state.submitted_today && !editing;

  return (
    <div className="football-weekly-nfl-team-season">
      {tableOpen ? <FootballWeeklyAuctionTableDialog onClose={() => setTableOpen(false)} /> : null}

      <div className="football-weekly-nfl-team-season__status">
        <button type="button" onClick={() => setTableOpen(true)}>
          <small>AUCTION TABLE</small><strong>{state.owned_count}</strong><span>YOUR TEAMS · VIEW ›</span>
        </button>
        <div><small>BANKROLL</small><strong>{"$"}{state.bankroll}</strong><span>STARTED {"$"}{state.starting_bankroll}</span></div>
        <div><small>MAX SPEND RISK</small><strong>{"$"}{spendRisk}</strong><span>TOP {maxWins} BIDS</span></div>
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
          {state.teams.map((card) => (
            <NormalCard
              key={card.item_reference}
              card={card}
              value={bids[card.slot] ?? 0}
              disabled={submitted || busy || maxWins === 0}
              max={state.bankroll}
              onChange={(value) => setBids((current) => ({ ...current, [card.slot]: value }))}
            />
          ))}
        </div>

        <div className="football-weekly-nfl-team-season__normal-note">
          <span>Highest bid wins. Losing bids cost $0.</span>
          <span>You can win at most 2 today and 5 normal teams this week.</span>
        </div>

        {!legal ? (
          <p className="football-weekly-nfl-team-season__error">
            Your top {maxWins} bids could cost {"$"}{spendRisk}. Keep that at or below your {"$"}{state.bankroll} bankroll.
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
            <button type="button" className={rank >= 0 ? "is-selected" : ""} key={team.item_reference} disabled={disabled} onClick={() => toggle(team.item_reference)}>
              <TeamMark teamCode={team.team_code} label={team.primary_name} />
              <span className="football-weekly-nfl-team-season__wildcard-name">
                <strong>{team.primary_name}</strong>
                <b className="football-weekly-nfl-team-season__year">{team.season_year}</b>
              </span>
              <em>{rank >= 0 ? "PRIORITY #" + (rank + 1) : "TAP TO ACCEPT"}</em>
            </button>
          );
        })}
      </div>

      {rankings.length ? (
        <div className="football-weekly-nfl-team-season__ranking">
          <small>YOUR ACCEPTABLE WILDCARDS · IN ORDER</small>
          {rankings.map((ref, index) => {
            const team = wildcard.teams.find((candidate) => candidate.item_reference === ref);
            if (!team) return null;
            return (
              <div key={ref}>
                <b>#{index + 1}</b>
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

const wheelPalette = ["#20b486", "#f7b84b", "#68a4ff", "#eb6f92", "#9d7bf0", "#f38c5d", "#50c7d9", "#d2d95a"];

function wheelBackground(draws: FootballWeeklyNflWildcardState["priority_draws"]) {
  const total = draws.reduce((sum, draw) => sum + draw.entry_count, 0);
  if (!total) return "#24313b";
  let cursor = 0;
  const segments: string[] = [];
  draws.forEach((draw, index) => {
    const start = (cursor / total) * 360;
    cursor += draw.entry_count;
    const end = (cursor / total) * 360;
    segments.push(wheelPalette[index % wheelPalette.length] + " " + start + "deg " + end + "deg");
  });
  return "conic-gradient(" + segments.join(",") + ")";
}

function wheelStopRotation(
  draws: FootballWeeklyNflWildcardState["priority_draws"],
  selectedProfileId: string | null,
) {
  if (!selectedProfileId) return 0;
  const total = draws.reduce((sum, draw) => sum + draw.entry_count, 0);
  if (!total) return 0;

  let cursor = 0;
  for (const draw of draws) {
    const start = cursor;
    cursor += draw.entry_count;
    if (draw.profile_id === selectedProfileId) {
      const midpoint = ((start + draw.entry_count / 2) / total) * 360;
      return -midpoint;
    }
  }
  return 0;
}

function WheelGraphic({
  title,
  mode,
  draws,
  selectedProfileId,
  selectedName,
}: {
  title: string;
  mode: "priority" | "reaping";
  draws: FootballWeeklyNflWildcardState["priority_draws"];
  selectedProfileId: string | null;
  selectedName: string | null;
}) {
  const total = draws.reduce((sum, draw) => sum + draw.entry_count, 0);
  const style = {
    "--wheel-fill": wheelBackground(draws),
    "--wheel-stop": wheelStopRotation(draws, selectedProfileId) + "deg",
  } as CSSProperties;
  return (
    <div className={"football-weekly-nfl-team-season__wheel-card is-" + mode}>
      <div className="football-weekly-nfl-team-season__wheel-shell">
        <span className="football-weekly-nfl-team-season__wheel-pointer" aria-hidden="true">▼</span>
        <div className="football-weekly-nfl-team-season__wheel" style={style}><span>{mode === "priority" ? "PRIORITY" : "REAPING"}</span></div>
      </div>
      <small>{title}</small>
      <strong>{selectedName ?? "No entrants"}</strong>
      {total ? (
        <div className="football-weekly-nfl-team-season__wheel-odds">
          {draws.map((draw) => (
            <span key={draw.profile_id}><b>{draw.display_name}</b><em>{draw.entry_count}/{total} tickets</em></span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WheelResult({ wildcard }: { wildcard: FootballWeeklyNflWildcardState }) {
  const reaped = wildcard.reaping;
  return (
    <section className="football-weekly-nfl-team-season__resolution">
      <div className="football-weekly-nfl-team-season__wheel-grid">
        <WheelGraphic
          title="PRIORITY WHEEL"
          mode="priority"
          draws={wildcard.priority_draws}
          selectedProfileId={wildcard.priority_draws[0]?.profile_id ?? null}
          selectedName={wildcard.priority_draws[0]?.display_name ?? null}
        />
        <WheelGraphic
          title="REAPING WHEEL"
          mode="reaping"
          draws={wildcard.priority_draws}
          selectedProfileId={reaped?.profile_id ?? null}
          selectedName={reaped?.display_name ?? null}
        />
      </div>

      <div className="football-weekly-nfl-team-season__draw-order">
        <small>PERSISTED PRIORITY ORDER</small>
        <strong>{wildcard.priority_draws.length ? wildcard.priority_draws.map((draw) => draw.display_name).join(" → ") : "No entrants"}</strong>
      </div>

      <div className="football-weekly-nfl-team-season__claims">
        <small>WILDCARD CLAIMS</small>
        {wildcard.claims.length ? wildcard.claims.map((claim) => {
          const team = wildcard.teams.find((candidate) => candidate.item_reference === claim.item_reference);
          return (
            <div key={claim.profile_id}>
              <b>#{claim.priority_order}</b><strong>{claim.display_name}</strong><span>{team ? team.primary_name + " " + team.season_year : claim.item_reference}</span>
            </div>
          );
        }) : <p>No Wildcard improved an entered player’s fourth scoring team.</p>}
      </div>

      <div className={"football-weekly-nfl-team-season__reaping-result" + (reaped ? " is-reaped" : "")}>
        <small>THE REAPING</small>
        <strong>{reaped ? reaped.display_name : "Nobody Reaped"}</strong>
        <span>{reaped ? reaped.entry_count + " ticket" + (reaped.entry_count === 1 ? "" : "s") + " · next Weekly Auction starts $5 lower" : "Nobody entered, so the Reaping wheel stayed empty."}</span>
      </div>
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
  onSubmitWildcard: (entries: number, rankings: string[]) => Promise<void>;
  onContinue: () => void;
}) {
  const wildcard = state.wildcard;
  if (!wildcard) return null;

  const [entries, setEntries] = useState(wildcard.my_entries);
  const [rankings, setRankings] = useState<string[]>(wildcard.my_rankings);
  const [editing, setEditing] = useState(!wildcard.submitted);

  useEffect(() => {
    setEntries(wildcard.my_entries);
    setRankings(wildcard.my_rankings);
    setEditing(!wildcard.submitted);
  }, [wildcard.my_entries, wildcard.my_rankings, wildcard.submitted]);

  if (wildcard.resolved) {
    return (
      <div className="football-weekly-nfl-team-season">
        <section className="football-weekly-nfl-team-season__wildcard-board surface-card">
          <header className="football-weekly-nfl-team-season__board-head"><div><p className="eyebrow">DAY 7 · FINALE</p><h1>WILDCARD / REAPING</h1></div><span>RESOLVED</span></header>
          <RankingBoard wildcard={wildcard} rankings={wildcard.my_rankings} disabled onChange={() => undefined} />
          <WheelResult wildcard={wildcard} />
          <button className="football-weekly-nfl-team-season__primary" type="button" onClick={onContinue}>CONTINUE</button>
        </section>
      </div>
    );
  }

  const cannotEnter = state.owned_count < 4;
  const submitted = wildcard.submitted && !editing;
  const legal = entries === 0 || (!cannotEnter && rankings.length > 0);

  return (
    <div className="football-weekly-nfl-team-season">
      <section className="football-weekly-nfl-team-season__wildcard-board surface-card">
        <header className="football-weekly-nfl-team-season__board-head"><div><p className="eyebrow">DAY 7 · FINALE</p><h1>WILDCARD / REAPING</h1></div><span>NO BANKROLL BIDDING</span></header>

        <div className="football-weekly-nfl-team-season__wildcard-copy">
          <strong>See all four first. Then decide whether the upside is worth the risk.</strong>
          <span>Rank only cards you would actually accept. A Wildcard is awarded only if it improves your current fourth scoring team.</span>
        </div>

        <RankingBoard wildcard={wildcard} rankings={rankings} disabled={submitted || busy || cannotEnter} onChange={setRankings} />

        <div className="football-weekly-nfl-team-season__tickets">
          <div><small>YOUR ENTRIES</small><strong>{entries}</strong><span>Each entry = 1 Priority ticket + 1 Reaping ticket.</span></div>
          <div className="football-weekly-nfl-team-season__ticket-buttons">
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                className={entries === value ? "is-active" : ""}
                key={value}
                disabled={submitted || busy || (cannotEnter && value > 0)}
                onClick={() => { setEntries(value); if (value === 0) setRankings([]); }}
              >{value}</button>
            ))}
          </div>
          <p><b>0 entries:</b> no Wildcard chance and no Reaping risk. Passing is a legitimate strategy.</p>
          <p><b>Literal tickets:</b> four players at 4 entries means 16 tickets; each owns 25%. Five entries never automatically beats one.</p>
        </div>

        {cannotEnter ? <p className="football-weekly-nfl-team-season__error">Wildcard is an upgrade only. You need at least four normal teams to enter; this seat can safely pass with 0 entries.</p> : null}
        {!legal ? <p className="football-weekly-nfl-team-season__error">Choose at least one acceptable Wildcard before buying entries.</p> : null}
        {error ? <p className="football-weekly-nfl-team-season__error">{error}</p> : null}

        {submitted ? (
          <div className="football-weekly-nfl-team-season__submitted">
            <div><strong>WILDCARD CHOICE IN</strong><span>Other players’ ticket counts remain sealed until resolution.</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT CHOICE</button>
            <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy} onClick={onContinue}>CONTINUE</button>
          </div>
        ) : (
          <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy || !legal} onClick={() => void onSubmitWildcard(entries, rankings)}>
            {wildcard.submitted ? "SAVE WILDCARD CHANGES" : entries === 0 ? "PASS SAFELY · 0 ENTRIES" : "SUBMIT " + entries + " " + (entries === 1 ? "ENTRY" : "ENTRIES")}
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
}: {
  result: FootballWeeklyNflTeamSeasonFinal;
  busy: boolean;
  onAcknowledge: () => void;
  showNewWeekAction?: boolean;
}) {
  const me = result.my_result;
  return (
    <section className="football-weekly-nfl-team-season__final surface-card">
      <header className="football-weekly-nfl-team-season__final-head"><p className="eyebrow">NFL WEEKLY AUCTION</p><h1>FINAL RESULTS</h1><span>Best four team-season grades decide the week.</span></header>

      <div className="football-weekly-nfl-team-season__finish">
        <small>{me.is_winner ? "WEEKLY CHAMPION" : "YOUR FINISH"}</small>
        <strong>{me.final_rank ? "#" + me.final_rank : "—"}</strong>
        <b>{me.final_score == null ? "—" : me.final_score.toFixed(1)}</b>
      </div>

      <div className="football-weekly-nfl-team-season__standings">
        {result.standings.map((entry) => (
          <div className={entry.is_current_user ? "is-current" : ""} key={entry.profile_id}>
            <b>#{entry.rank ?? "—"}</b><strong>{entry.display_name}</strong><span>{entry.final_score?.toFixed(1) ?? "—"}</span>
          </div>
        ))}
      </div>

      <div className="football-weekly-nfl-team-season__final-collection">
        <small>YOUR FINAL COLLECTION</small>
        {result.collection.map((team) => (
          <article className={team.counts ? "is-counting" : ""} key={team.item_reference}>
            <TeamMark teamCode={team.team_code} label={team.team_name} />
            <div className="football-weekly-nfl-team-season__final-name"><strong>{team.team_name}</strong><b className="football-weekly-nfl-team-season__year">{team.season_year}</b></div>
            <em>{team.source === "wildcard" ? "WILDCARD" : team.source === "autofill" ? "AUTOFILL" : team.winning_bid ? "$" + team.winning_bid : "WON"}</em>
            <span>{team.grade.toFixed(1)}</span>
          </article>
        ))}
      </div>

      <WheelResult wildcard={result.wildcard} />

      {showNewWeekAction ? <button className="football-weekly-nfl-team-season__primary" type="button" disabled={busy} onClick={onAcknowledge}>START THE NEW WEEK</button> : null}
    </section>
  );
}

export function FootballWeeklyNflTeamSeasonGate({
  state,
  busy,
  error,
  forceBoard = false,
  onSubmit,
  onSubmitWildcard,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onSubmitWildcard: (entries: number, rankings: string[]) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <RulesCover onStart={() => setIntroDismissed(true)} />;
  }

  return state.day_index === 7
    ? <WildcardDay state={state} busy={busy} error={error} onSubmitWildcard={onSubmitWildcard} onContinue={onContinue} />
    : <NormalAuction state={state} busy={busy} error={error} onSubmit={onSubmit} onContinue={onContinue} />;
}
