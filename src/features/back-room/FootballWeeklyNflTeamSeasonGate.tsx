import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "../../styles/football-weekly-nfl-team-seasons.css";
import type {
  FootballWeeklyAuctionBidInput,
  FootballWeeklyNflTeamSeasonCard,
  FootballWeeklyNflTeamSeasonFinal,
  FootballWeeklyNflTeamSeasonPriorResult,
  FootballWeeklyNflTeamSeasonState,
  FootballWeeklyNflTeamSeasonWildcard,
} from "../play/footballWeeklyAuctionRepository";
import { buildQbTeamVisualIdentity } from "./buildQbVisualIdentity";

type BidMap = Record<number, number>;
type FinalTab = "standings" | "collections" | "grades";
type WheelKind = "priority" | "reaping";

function teamStyle(teamCode: string): CSSProperties {
  const identity = buildQbTeamVisualIdentity(teamCode);
  return {
    "--nfl-ts-team": identity?.primary ?? "#7ec7f2",
    "--nfl-ts-team-rgb": identity?.primaryRgb ?? "126, 199, 242",
    "--nfl-ts-team-secondary": identity?.secondary ?? "#ffffff",
  } as CSSProperties;
}

function TeamLogo({ teamCode, teamName }: { teamCode: string; teamName: string }) {
  const identity = buildQbTeamVisualIdentity(teamCode);
  const [failed, setFailed] = useState(false);
  return (
    <span className="nfl-ts__logo" aria-label={teamName}>
      {identity?.logoSrc && !failed
        ? <img src={identity.logoSrc} alt="" onError={() => setFailed(true)} />
        : <b>{teamCode.slice(0, 3)}</b>}
    </span>
  );
}

function TeamIdentity({
  teamCode,
  teamName,
  seasonYear,
  record,
  postseason,
}: {
  teamCode: string;
  teamName: string;
  seasonYear: number;
  record?: string | null;
  postseason?: string | null;
}) {
  return (
    <div className="nfl-ts__identity">
      <TeamLogo teamCode={teamCode} teamName={teamName} />
      <div className="nfl-ts__identity-copy">
        <div className="nfl-ts__name-line">
          <strong>{teamName}</strong>
          <b className="nfl-ts__season">{seasonYear}</b>
        </div>
        {record || postseason ? <span>{[record, postseason].filter(Boolean).join(" · ")}</span> : null}
      </div>
    </div>
  );
}

function normalCommitment(ownedCount: number, bids: BidMap) {
  const possibleWins = Math.min(2, Math.max(5 - ownedCount, 0));
  return Object.values(bids)
    .map((value) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0)
    .sort((a, b) => b - a)
    .slice(0, possibleWins)
    .reduce((sum, value) => sum + value, 0);
}

function RulesCover({ onStart }: { onStart: () => void }) {
  return (
    <section className="nfl-ts__cover surface-card">
      <p className="eyebrow">WEEKLY AUCTION · NFL</p>
      <h1>BEST TEAM-SEASONS<br />SINCE 2000</h1>
      <strong className="nfl-ts__lede">6 auction days. $50. Best 4 count.</strong>
      <div className="nfl-ts__rules">
        <div><b>01</b><span>Bid on the team-seasons you want. Losing bids cost nothing.</span></div>
        <div><b>02</b><span>You can win at most 2 teams per day and 5 normal teams for the week.</span></div>
        <div><b>03</b><span>Day 7 is Wildcard Day. See all 4 Wildcards before choosing 0–5 entries.</span></div>
        <div><b>04</b><span>More entries mean more Priority tickets and more Reaping tickets. 0 means no upside and no Reaping risk.</span></div>
        <div><b>05</b><span>Your best 4 hidden team-season grades determine the final standings.</span></div>
      </div>
      <button className="nfl-ts__primary" type="button" onClick={onStart}>ENTER THIS WEEK’S AUCTION</button>
    </section>
  );
}

function PriorResults({ results }: { results: FootballWeeklyNflTeamSeasonPriorResult[] }) {
  if (!results.length) return null;
  return (
    <section className="nfl-ts__prior surface-card">
      <header><p className="eyebrow">YESTERDAY’S RESULTS</p><strong>Resolved board</strong></header>
      {results.map((result) => (
        <article key={result.slot} style={teamStyle(result.team_code)}>
          <TeamIdentity
            teamCode={result.team_code}
            teamName={result.team_name}
            seasonYear={result.season_year}
            record={result.record}
            postseason={result.postseason_finish}
          />
          <div className="nfl-ts__prior-result">
            <strong>{result.winner_display_name ?? "No winner"}</strong>
            <span>{result.winning_bid ? "$" + result.winning_bid : "Pass"}</span>
          </div>
          <details>
            <summary>ALL BIDS</summary>
            <div className="nfl-ts__bid-history">
              {result.bids.length ? result.bids.map((bid) => (
                <div key={bid.profile_id}>
                  <span>{bid.display_name}</span>
                  <b>{bid.amount ? "$" + bid.amount : "Pass"}</b>
                </div>
              )) : <span>No submitted bids.</span>}
            </div>
          </details>
        </article>
      ))}
    </section>
  );
}

function NormalCard({
  team,
  value,
  disabled,
  onChange,
}: {
  team: FootballWeeklyNflTeamSeasonCard;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <article className="nfl-ts__card" style={teamStyle(team.team_code)}>
      <TeamIdentity
        teamCode={team.team_code}
        teamName={team.team_name}
        seasonYear={team.season_year}
        record={team.record}
        postseason={team.postseason_finish}
      />
      <label className="nfl-ts__bid">
        <span>SEALED BID</span>
        <div>
          <b>$</b>
          <input
            aria-label={"Bid for " + team.team_name + " " + team.season_year}
            type="number"
            inputMode="numeric"
            min={0}
            max={50}
            step={1}
            value={value}
            disabled={disabled}
            onChange={(event) => {
              const next = Math.max(0, Math.min(50, Math.floor(Number(event.target.value) || 0)));
              onChange(next);
            }}
          />
        </div>
      </label>
    </article>
  );
}

function CollectionStrip({ state }: { state: FootballWeeklyNflTeamSeasonState }) {
  return (
    <section className="nfl-ts__collection surface-card">
      <header>
        <div><p className="eyebrow">YOUR COLLECTION</p><strong>{state.owned_count}/5 normal wins</strong></div>
        <span>BEST 4 SCORE</span>
      </header>
      {state.collection.length ? (
        <div>
          {state.collection.map((team) => (
            <article key={team.item_reference} style={teamStyle(team.team_code)}>
              <TeamLogo teamCode={team.team_code} teamName={team.team_name} />
              <span><strong>{team.team_name}</strong><b className="nfl-ts__season">{team.season_year}</b></span>
              <em>{team.winning_bid ? "$" + team.winning_bid : "—"}</em>
            </article>
          ))}
        </div>
      ) : <p>No team-seasons won yet.</p>}
    </section>
  );
}

function NormalDay({
  state,
  busy,
  error,
  forceBoard,
  showContinueAction,
  submittedNote,
  onSubmit,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  forceBoard: boolean;
  showContinueAction: boolean;
  submittedNote?: string;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onContinue: () => void;
}) {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [editing, setEditing] = useState(!state.submitted_today);
  const initialBids = useMemo<BidMap>(() => Object.fromEntries(
    state.teams.map((team) => [team.slot, state.bids[String(team.slot)] ?? 0]),
  ), [state.bids, state.teams]);
  const [bids, setBids] = useState<BidMap>(initialBids);

  useEffect(() => {
    setBids(initialBids);
    setEditing(!state.submitted_today);
  }, [initialBids, state.submitted_today]);

  if (state.show_intro && !introDismissed && !forceBoard) {
    return <RulesCover onStart={() => setIntroDismissed(true)} />;
  }

  const committed = normalCommitment(state.owned_count, bids);
  const legal = committed <= state.max_commit && Object.values(bids).every((value) => value >= 0 && value <= 50);
  const submitted = state.submitted_today && !editing;

  return (
    <div className="nfl-ts">
      <div className="nfl-ts__status">
        <div><small>NORMAL TEAMS</small><strong>{state.owned_count}<span>/5</span></strong></div>
        <div><small>AT RISK TODAY</small><strong>{"$"}{committed}</strong></div>
        <div><small>BANKROLL</small><strong>{"$"}{state.bankroll}</strong></div>
      </div>
      <PriorResults results={state.prior_results} />
      <section className="nfl-ts__board surface-card">
        <header className="nfl-ts__board-head">
          <div><p className="eyebrow">NFL WEEKLY AUCTION</p><h1>DAY {state.day_index} <span>OF 7</span></h1></div>
          <div><small>STARTED</small><strong>{"$"}{state.starting_bankroll}</strong></div>
        </header>
        <div className="nfl-ts__theme">
          <small>TODAY’S THEME</small>
          <strong>{state.theme}</strong>
          <span>SEALED BIDS · LOCK AT MIDNIGHT CT</span>
        </div>
        <div className="nfl-ts__stack">
          {state.teams.map((team) => (
            <NormalCard
              key={team.item_reference}
              team={team}
              value={bids[team.slot] ?? 0}
              disabled={submitted || busy}
              onChange={(value) => setBids((current) => ({ ...current, [team.slot]: value }))}
            />
          ))}
        </div>
        <p className="nfl-ts__commit-note">Only your two highest possible wins count against today’s commitment. You never pay a losing bid.</p>
        {!legal ? <p className="nfl-ts__error">Your two highest possible wins cannot exceed the available bankroll of {"$"}{state.max_commit}.</p> : null}
        {error ? <p className="nfl-ts__error" role="status">{error}</p> : null}
        {submitted ? (
          <div className="nfl-ts__submitted">
            <div><strong>BIDS IN ✓</strong><span>{submittedNote ?? "You can edit until midnight CT."}</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT BIDS</button>
            {showContinueAction
              ? <button className="nfl-ts__primary" type="button" disabled={busy} onClick={onContinue}>CONTINUE TO DAILY CHALLENGE</button>
              : null}
          </div>
        ) : (
          <button className="nfl-ts__primary" type="button" disabled={busy || !legal} onClick={() => void onSubmit(bids)}>
            {state.submitted_today ? "SAVE BID CHANGES" : "SUBMIT SEALED BIDS"}
          </button>
        )}
      </section>
      <CollectionStrip state={state} />
    </div>
  );
}

function WildcardTeamCard({
  team,
  rank,
  disabled,
  onToggle,
}: {
  team: FootballWeeklyNflTeamSeasonWildcard["teams"][number];
  rank: number | null;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={"nfl-ts__wild-card" + (rank ? " is-ranked" : "")}
      style={teamStyle(team.team_code)}
      disabled={disabled}
      onClick={onToggle}
    >
      <TeamIdentity teamCode={team.team_code} teamName={team.primary_name} seasonYear={team.season_year} />
      <span className="nfl-ts__accept">{rank ? <>PRIORITY <b>#{rank}</b></> : "ADD TO MY RANKING"}</span>
    </button>
  );
}

function Wheel({
  entries,
  title,
  outcome,
  kind,
}: {
  entries: Array<{ profile_id: string; display_name: string; entry_count: number }>;
  title: string;
  outcome: string;
  kind: WheelKind;
}) {
  const tickets = entries.flatMap((entry, ownerIndex) => Array.from(
    { length: entry.entry_count },
    (_, ticketIndex) => ({ ...entry, ownerIndex, ticketIndex }),
  ));
  const total = tickets.length || 1;
  const center = 50;
  const radius = 44;

  function point(angle: number) {
    const radians = (angle - 90) * Math.PI / 180;
    return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) };
  }

  function slicePath(index: number) {
    const start = point(index * 360 / total);
    const end = point((index + 1) * 360 / total);
    const large = 360 / total > 180 ? 1 : 0;
    return "M " + center + " " + center + " L " + start.x + " " + start.y
      + " A " + radius + " " + radius + " 0 " + large + " 1 " + end.x + " " + end.y + " Z";
  }

  return (
    <section className={"nfl-ts__wheel-card is-" + kind}>
      <div className="nfl-ts__wheel-wrap">
        <svg className="nfl-ts__wheel" viewBox="0 0 100 100" role="img" aria-label={title + ": " + tickets.length + " literal tickets"}>
          {tickets.map((ticket, index) => (
            <path
              key={ticket.profile_id + "-" + ticket.ticketIndex}
              d={slicePath(index)}
              style={{ fill: "hsl(" + ((ticket.ownerIndex * 79 + (kind === "reaping" ? 22 : 0)) % 360) + " 66% 48%)" }}
            />
          ))}
          <circle cx="50" cy="50" r="18" className="nfl-ts__wheel-hub" />
          <text x="50" y="48" textAnchor="middle">{kind === "priority" ? "PRIORITY" : "REAPING"}</text>
          <text x="50" y="57" textAnchor="middle">{tickets.length} TICKETS</text>
        </svg>
        <i className="nfl-ts__wheel-pointer" aria-hidden="true" />
      </div>
      <div>
        <small>{title}</small>
        <strong>{outcome}</strong>
        <ul>
          {entries.map((entry) => (
            <li key={entry.profile_id}>
              <span>{entry.display_name}</span>
              <b>{entry.entry_count} {entry.entry_count === 1 ? "ticket" : "tickets"}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ResolvedWildcard({ wildcard }: { wildcard: FootballWeeklyNflTeamSeasonWildcard }) {
  const lookup = new Map(wildcard.teams.map((team) => [team.item_reference, team]));
  const entrants = wildcard.priority_draws.map((draw) => ({
    profile_id: draw.profile_id,
    display_name: draw.display_name,
    entry_count: draw.entry_count,
  }));
  const first = wildcard.priority_draws[0]?.display_name ?? "No entrant";
  const reaped = wildcard.reaping?.display_name ?? "No Reaping";

  return (
    <div className="nfl-ts__resolution">
      <Wheel entries={entrants} kind="priority" title="PRIORITY WHEEL" outcome={"Priority #1 · " + first} />
      <Wheel entries={entrants} kind="reaping" title="REAPING WHEEL" outcome={wildcard.reaping ? reaped + " was Reaped" : reaped} />
      <section className="nfl-ts__claims surface-card">
        <header><p className="eyebrow">WILDCARD CLAIMS</p><strong>Persisted final outcome</strong></header>
        {wildcard.claims.length ? wildcard.claims.map((claim) => {
          const team = lookup.get(claim.item_reference);
          return (
            <article key={claim.profile_id}>
              <span><b>#{claim.priority_order}</b>{claim.display_name}</span>
              <strong>{team ? <>{team.primary_name} <em>{team.season_year}</em></> : claim.item_reference}</strong>
            </article>
          );
        }) : <p>No Wildcard improved an eligible scoring four.</p>}
      </section>
      {wildcard.reaping ? (
        <section className="nfl-ts__reaped surface-card">
          <small>THE REAPING</small>
          <h2>{wildcard.reaping.display_name}</h2>
          <p>Starts the next calendar Weekly Auction with <strong>$5 less bankroll.</strong></p>
          <span>This week’s score is unchanged.</span>
        </section>
      ) : null}
    </div>
  );
}

function WildcardDay({
  state,
  busy,
  error,
  showContinueAction,
  submittedNote,
  onSubmitWildcard,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  showContinueAction: boolean;
  submittedNote?: string;
  onSubmitWildcard: (entries: number, rankings: string[]) => Promise<void>;
  onContinue: () => void;
}) {
  const wildcard = state.wildcard;
  const [entries, setEntries] = useState(wildcard?.my_entries ?? 0);
  const [rankings, setRankings] = useState<string[]>(wildcard?.my_rankings ?? []);
  const [editing, setEditing] = useState(!(wildcard?.submitted ?? false));

  useEffect(() => {
    setEntries(wildcard?.my_entries ?? 0);
    setRankings(wildcard?.my_rankings ?? []);
    setEditing(!(wildcard?.submitted ?? false));
  }, [wildcard?.my_entries, wildcard?.my_rankings, wildcard?.submitted]);

  if (!wildcard) {
    return <section className="nfl-ts__board surface-card"><p>Wildcard board is being prepared.</p></section>;
  }
  if (wildcard.resolved) {
    return <div className="nfl-ts"><ResolvedWildcard wildcard={wildcard} /><CollectionStrip state={state} /></div>;
  }

  const canEnter = state.owned_count >= 4;
  const submitted = wildcard.submitted && !editing;
  const effectiveRankings = entries === 0 ? [] : rankings;
  const legal = entries === 0 || (canEnter && rankings.length > 0);

  function toggle(itemReference: string) {
    setRankings((current) => current.includes(itemReference)
      ? current.filter((value) => value !== itemReference)
      : current.length < 4 ? [...current, itemReference] : current);
  }

  function move(itemReference: string, direction: -1 | 1) {
    setRankings((current) => {
      const from = current.indexOf(itemReference);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  return (
    <div className="nfl-ts nfl-ts--wildcard">
      <section className="nfl-ts__wild-hero surface-card">
        <p className="eyebrow">DAY 7 · WILDCARD</p>
        <h1>SEE THE CARDS.<br />CHOOSE YOUR RISK.</h1>
        <p>Every entry is one literal <strong>Priority ticket</strong> and one literal <strong>Reaping ticket</strong>. More entries increase both. Pass with 0 and you are on neither wheel.</p>
      </section>
      <section className="nfl-ts__wild-board surface-card">
        <header>
          <div><small>STEP 1</small><strong>Rank only Wildcards you would actually accept</strong></div>
          <span>Grades stay hidden.</span>
        </header>
        <div className="nfl-ts__wild-grid">
          {wildcard.teams.map((team) => (
            <WildcardTeamCard
              key={team.item_reference}
              team={team}
              rank={rankings.includes(team.item_reference) ? rankings.indexOf(team.item_reference) + 1 : null}
              disabled={submitted || busy || !canEnter}
              onToggle={() => toggle(team.item_reference)}
            />
          ))}
        </div>
        {rankings.length ? (
          <div className="nfl-ts__ranking">
            {rankings.map((itemReference, index) => {
              const team = wildcard.teams.find((candidate) => candidate.item_reference === itemReference);
              if (!team) return null;
              return (
                <div key={itemReference}>
                  <b>#{index + 1}</b>
                  <span>{team.primary_name}<em>{team.season_year}</em></span>
                  <button type="button" disabled={submitted || busy || index === 0} onClick={() => move(itemReference, -1)} aria-label={"Move " + team.display_label + " up"}>↑</button>
                  <button type="button" disabled={submitted || busy || index === rankings.length - 1} onClick={() => move(itemReference, 1)} aria-label={"Move " + team.display_label + " down"}>↓</button>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="nfl-ts__entries">
          <div><small>STEP 2</small><strong>How many entries?</strong></div>
          <div className="nfl-ts__entry-buttons">
            {[0,1,2,3,4,5].map((value) => (
              <button
                type="button"
                key={value}
                className={entries === value ? "is-active" : ""}
                disabled={submitted || busy || (!canEnter && value > 0)}
                onClick={() => setEntries(value)}
              >
                <b>{value}</b><span>{value === 0 ? "PASS" : value === 1 ? "ENTRY" : "ENTRIES"}</span>
              </button>
            ))}
          </div>
          <div className={"nfl-ts__risk " + (entries === 0 ? "is-pass" : "")}>
            {entries === 0
              ? <><strong>PASS IS SAFE</strong><span>No Priority wheel. No Wildcard. No Reaping wheel.</span></>
              : <><strong>{entries} PRIORITY {entries === 1 ? "TICKET" : "TICKETS"} · {entries} REAPING {entries === 1 ? "TICKET" : "TICKETS"}</strong><span>A bigger slice of one wheel is also a bigger slice of the other.</span></>}
          </div>
        </div>
        {!canEnter ? <p className="nfl-ts__notice">Wildcard is an upgrade only. You need four normal teams to enter, so your only option is a safe 0-entry pass.</p> : null}
        {!legal ? <p className="nfl-ts__error">Choose at least one acceptable Wildcard before buying entries.</p> : null}
        {error ? <p className="nfl-ts__error" role="status">{error}</p> : null}
        {submitted ? (
          <div className="nfl-ts__submitted">
            <div><strong>WILDCARD DECISION IN ✓</strong><span>{submittedNote ?? "You can edit until the Day 7 lock."}</span></div>
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>EDIT DECISION</button>
            {showContinueAction ? <button className="nfl-ts__primary" type="button" onClick={onContinue}>CONTINUE TO DAILY CHALLENGE</button> : null}
          </div>
        ) : (
          <button
            className="nfl-ts__primary"
            type="button"
            disabled={busy || !legal}
            onClick={() => void onSubmitWildcard(entries, effectiveRankings)}
          >
            {wildcard.submitted ? "SAVE WILDCARD CHANGES" : entries === 0 ? "LOCK SAFE PASS" : "SUBMIT " + entries + " " + (entries === 1 ? "ENTRY" : "ENTRIES")}
          </button>
        )}
      </section>
      <CollectionStrip state={state} />
    </div>
  );
}

export function FootballWeeklyNflTeamSeasonGate({
  state,
  busy,
  error,
  forceBoard = false,
  showContinueAction = true,
  submittedNote,
  onSubmit,
  onSubmitWildcard,
  onContinue,
}: {
  state: FootballWeeklyNflTeamSeasonState;
  busy: boolean;
  error: string | null;
  forceBoard?: boolean;
  showContinueAction?: boolean;
  submittedNote?: string;
  onSubmit: (bids: Record<number, FootballWeeklyAuctionBidInput>) => Promise<void>;
  onSubmitWildcard: (entries: number, rankings: string[]) => Promise<void>;
  onContinue: () => void;
}) {
  return state.phase === "wildcard" ? (
    <WildcardDay
      state={state}
      busy={busy}
      error={error}
      showContinueAction={showContinueAction}
      submittedNote={submittedNote}
      onSubmitWildcard={onSubmitWildcard}
      onContinue={onContinue}
    />
  ) : (
    <NormalDay
      state={state}
      busy={busy}
      error={error}
      forceBoard={forceBoard}
      showContinueAction={showContinueAction}
      submittedNote={submittedNote}
      onSubmit={onSubmit}
      onContinue={onContinue}
    />
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
  const [tab, setTab] = useState<FinalTab>("standings");
  const reaped = result.wildcard.reaping;

  return (
    <section className="nfl-ts__final surface-card">
      <header>
        <p className="eyebrow">WEEKLY AUCTION · FINAL</p>
        <h1>BEST NFL TEAM-SEASONS</h1>
        <span>Best four hidden grades decide the week.</span>
      </header>
      <nav>
        {(["standings","collections","grades"] as FinalTab[]).map((next) => (
          <button type="button" key={next} className={tab === next ? "is-active" : ""} onClick={() => setTab(next)}>
            {next.toUpperCase()}
          </button>
        ))}
      </nav>
      {tab === "standings" ? (
        <div className="nfl-ts__final-standings">
          {result.standings.map((standing) => (
            <article key={standing.profile_id} className={standing.is_current_user ? "is-me" : ""}>
              <b>#{standing.rank ?? "—"}</b>
              <span>
                <strong>{standing.display_name}</strong>
                <small>{standing.owned_count} TEAMS · {"$"}{standing.scoring_cost ?? 0} COUNTING COST</small>
              </span>
              <em>{standing.final_score?.toFixed(2) ?? "—"}</em>
            </article>
          ))}
          {reaped ? (
            <div className="nfl-ts__final-reaping">
              <small>REAPED</small><strong>{reaped.display_name}</strong>
              <span>Next Weekly Auction starts $5 lower. This final score was not reduced.</span>
            </div>
          ) : null}
        </div>
      ) : null}
      {tab === "collections" ? (
        <div className="nfl-ts__final-collections">
          {result.collections.map((group) => (
            <section key={group.profile_id}>
              <header><strong>{group.display_name}</strong><span>BEST 4 MARKED</span></header>
              {group.items.map((item) => (
                <article key={item.item_reference} className={item.counts ? "is-counting" : ""} style={teamStyle(item.team_code)}>
                  <TeamLogo teamCode={item.team_code} teamName={item.team_name} />
                  <span>
                    <strong>{item.team_name}</strong><b className="nfl-ts__season">{item.season_year}</b>
                    <small>{item.acquisition === "wildcard" ? "WILDCARD" : item.acquisition === "autofill" ? "AUTOFILL" : item.winning_bid ? "WON · $" + item.winning_bid : "WON"}</small>
                  </span>
                  <em>{item.grade.toFixed(1)}</em>
                </article>
              ))}
            </section>
          ))}
        </div>
      ) : null}
      {tab === "grades" ? (
        <div className="nfl-ts__final-grades">
          {result.all_teams.map((item) => (
            <article key={item.day_index + "-" + item.item_reference} style={teamStyle(item.team_code)}>
              <span><small>DAY {item.day_index}</small><strong>{item.team_name}</strong><b className="nfl-ts__season">{item.season_year}</b></span>
              <span>{item.final_owner_display_name ?? (item.was_replaced ? "Replaced" : "Unclaimed")}</span>
              <em>{item.grade.toFixed(1)}</em>
            </article>
          ))}
        </div>
      ) : null}
      {showNewWeekAction ? (
        <button className="nfl-ts__primary" type="button" disabled={busy} onClick={onAcknowledge}>START THE NEW WEEK</button>
      ) : null}
    </section>
  );
}
