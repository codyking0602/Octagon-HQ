import { useEffect, useMemo, useState } from "react";
import "../../styles/football-futures.css";
import {
  FOOTBALL_FUTURES_MAX_POINTS,
  FOOTBALL_FUTURES_RULES,
  type FootballFuturesPicks,
} from "./footballPicksScoring";
import {
  EMPTY_FOOTBALL_FUTURES_PICKS,
  validateFootballFuturesPicks,
} from "./footballFuturesDraft";
import { usePicks } from "./PicksProvider";

function splitList(value: string) {
  return value.split(",").map((item) => item.trimStart());
}

function listValue(value: readonly string[]) {
  return value.join(", ");
}

function selectedCount(value: readonly string[]) {
  return value.filter((item) => item.trim()).length;
}

function lockLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(value));
}

function FuturesListField({ label, points, limit, value, disabled, onChange }: {
  label: string; points: string; limit: number; value: readonly string[]; disabled: boolean; onChange: (value: string[]) => void;
}) {
  return (
    <label className="football-futures-field">
      <span><b>{label}</b><small>{points} · {selectedCount(value)}/{limit}</small></span>
      <input type="text" value={listValue(value)} disabled={disabled} placeholder="Team, Team, Team" onChange={(event) => onChange(splitList(event.target.value))} />
    </label>
  );
}

function FuturesSingleField({ label, points, value, disabled, placeholder, onChange }: {
  label: string; points: string; value: string; disabled: boolean; placeholder: string; onChange: (value: string) => void;
}) {
  return (
    <label className="football-futures-field">
      <span><b>{label}</b><small>{points}</small></span>
      <input type="text" value={value} disabled={disabled} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function GroupFuture({ name, picks }: { name: string; picks: FootballFuturesPicks }) {
  return (
    <details className="football-futures-group-entry">
      <summary><strong>{name}</strong><span>VIEW PICKS</span></summary>
      <div>
        <p><b>CFB:</b> P4 {listValue(picks.cfbPower4Champions) || "—"} · CFP {listValue(picks.cfbPlayoffTeams) || "—"} · Semis {listValue(picks.cfbSemifinalists) || "—"} · Heisman {picks.cfbHeisman || "—"} · Champ {picks.cfbNationalChampion || "—"}</p>
        <p><b>NFL:</b> Divisions {listValue(picks.nflDivisionChampions) || "—"} · Playoffs {listValue(picks.nflPlayoffTeams) || "—"} · Final 4 {listValue(picks.nflConferenceChampionshipTeams) || "—"} · MVP {picks.nflMvp || "—"} · Champ {picks.nflSuperBowlChampion || "—"}</p>
      </div>
    </details>
  );
}

export function FootballFuturesCard() {
  const picks = usePicks();
  const snapshot = picks.footballFutures;
  const [draft, setDraft] = useState<FootballFuturesPicks>(snapshot?.ownPicks ?? EMPTY_FOOTBALL_FUTURES_PICKS);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(snapshot?.ownPicks ?? EMPTY_FOOTBALL_FUTURES_PICKS);
  }, [snapshot?.season, snapshot?.ownPicks]);

  const validation = useMemo(() => validateFootballFuturesPicks(draft), [draft]);
  const locked = snapshot?.locked === true;
  const loading = picks.loading && !snapshot;

  async function save() {
    if (locked || picks.savingFootballFutures) return;
    if (validation.errors.length) {
      setError(validation.errors[0]);
      return;
    }
    setError("");
    await picks.saveFootballFutures(validation.normalized);
  }

  const update = <K extends keyof FootballFuturesPicks,>(key: K, value: FootballFuturesPicks[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className={`surface-card football-futures${locked ? " is-locked" : ""}`} aria-labelledby="football-futures-title">
      <header className="football-futures__header">
        <div><p className="eyebrow">SEASON FUTURES</p><h2 id="football-futures-title">Pick the season before it starts</h2></div>
        <strong>{FOOTBALL_FUTURES_MAX_POINTS.total} PTS</strong>
      </header>
      <div className="football-futures__status">
        <span>{locked ? "LOCKED · GROUP REVEALED" : "PRIVATE UNTIL LOCK"}</span>
        <b>{snapshot ? lockLabel(snapshot.lockAt) : "FRI · 11:59 PM ET"}</b>
      </div>
      {loading ? <p className="football-futures__message">Loading Futures…</p> : null}
      {!loading ? (
        <div className="football-futures__leagues">
          <section>
            <header><div><span>CFB</span><small>COLLEGE FUTURES</small></div><strong>{FOOTBALL_FUTURES_MAX_POINTS.cfb} PTS</strong></header>
            <div className="football-futures__fields">
              <FuturesListField label="Power 4 champions" points="2 each" limit={FOOTBALL_FUTURES_RULES.cfb.power4Champions.selections} value={draft.cfbPower4Champions} disabled={locked} onChange={(value) => update("cfbPower4Champions", value)} />
              <FuturesListField label="12-team CFP" points="1 each" limit={FOOTBALL_FUTURES_RULES.cfb.playoffTeams.selections} value={draft.cfbPlayoffTeams} disabled={locked} onChange={(value) => update("cfbPlayoffTeams", value)} />
              <FuturesListField label="CFP semifinalists" points="2 each" limit={FOOTBALL_FUTURES_RULES.cfb.semifinalists.selections} value={draft.cfbSemifinalists} disabled={locked} onChange={(value) => update("cfbSemifinalists", value)} />
              <FuturesSingleField label="Heisman Trophy" points="3 pts" value={draft.cfbHeisman} disabled={locked} placeholder="Player" onChange={(value) => update("cfbHeisman", value)} />
              <FuturesSingleField label="National champion" points="7 pts" value={draft.cfbNationalChampion} disabled={locked} placeholder="Team" onChange={(value) => update("cfbNationalChampion", value)} />
            </div>
          </section>
          <section>
            <header><div><span>NFL</span><small>PRO FUTURES</small></div><strong>{FOOTBALL_FUTURES_MAX_POINTS.nfl} PTS</strong></header>
            <div className="football-futures__fields">
              <FuturesListField label="Division champions" points="1 each" limit={FOOTBALL_FUTURES_RULES.nfl.divisionChampions.selections} value={draft.nflDivisionChampions} disabled={locked} onChange={(value) => update("nflDivisionChampions", value)} />
              <FuturesListField label="14-team playoffs" points="1 each" limit={FOOTBALL_FUTURES_RULES.nfl.playoffTeams.selections} value={draft.nflPlayoffTeams} disabled={locked} onChange={(value) => update("nflPlayoffTeams", value)} />
              <FuturesListField label="Conference title teams" points="2 each" limit={FOOTBALL_FUTURES_RULES.nfl.conferenceChampionshipTeams.selections} value={draft.nflConferenceChampionshipTeams} disabled={locked} onChange={(value) => update("nflConferenceChampionshipTeams", value)} />
              <FuturesSingleField label="AP NFL MVP" points="3 pts" value={draft.nflMvp} disabled={locked} placeholder="Player" onChange={(value) => update("nflMvp", value)} />
              <FuturesSingleField label="Super Bowl champion" points="7 pts" value={draft.nflSuperBowlChampion} disabled={locked} placeholder="Team" onChange={(value) => update("nflSuperBowlChampion", value)} />
            </div>
          </section>
        </div>
      ) : null}
      {!locked && !loading ? (
        <footer className="football-futures__footer">
          <p>Champions must advance through the playoff rounds you picked.</p>
          <button type="button" className="primary-action" disabled={picks.savingFootballFutures} onClick={() => void save()}>{picks.savingFootballFutures ? "SAVING…" : "SAVE FUTURES"}</button>
        </footer>
      ) : null}
      {locked && snapshot ? (
        <div className="football-futures__group">
          <header><span>GROUP FUTURES</span><strong>{snapshot.groupPicks.length} REVEALED</strong></header>
          {snapshot.groupPicks.map((entry) => <GroupFuture key={entry.profileId} name={entry.displayName} picks={entry.picks} />)}
          {!snapshot.groupPicks.length ? <p>No other locked Futures are available in your groups yet.</p> : null}
        </div>
      ) : null}
      {error ? <p className="football-futures__error" role="status">{error}</p> : null}
    </section>
  );
}
