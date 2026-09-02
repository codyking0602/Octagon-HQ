import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../styles/football-futures.css";
import {
  FOOTBALL_FUTURES_MAX_POINTS,
  FOOTBALL_FUTURES_RULES,
  type FootballFuturesPicks,
} from "./footballPicksScoring";
import {
  EMPTY_FOOTBALL_FUTURES_PICKS,
  normalizeFootballFuturesPicks,
  validateFootballFuturesPicks,
} from "./footballFuturesDraft";
import {
  CFB_FUTURES_TEAMS,
  CFB_POWER4_CONFERENCES,
  NFL_CONFERENCES,
  NFL_DIVISION_GROUPS,
  NFL_FUTURES_TEAMS,
  getCfbPower4Conference,
  getNflConference,
  getNflTeamGroup,
  isCfbPower4Team,
  type NflConference,
} from "./footballFuturesTeams";
import { footballDateTimeLabel } from "./footballTime";
import { usePicks } from "./PicksProvider";

const AUTOSAVE_DELAY_MS = 250;
const POWER4_PICKER_GROUPS = CFB_POWER4_CONFERENCES.map((label) => ({ label, limit: 1 }));
const NFL_DIVISION_PICKER_GROUPS = NFL_DIVISION_GROUPS.map((group) => ({ label: group.label, limit: 1 }));
const NFL_PLAYOFF_PICKER_GROUPS = NFL_CONFERENCES.map((label) => ({ label, limit: 7 }));
const NFL_TITLE_PICKER_GROUPS = NFL_CONFERENCES.map((label) => ({ label, limit: 2 }));

interface FuturesPickerGroup {
  label: string;
  limit: number;
}

function listValue(value: readonly string[]) {
  return value.join(", ");
}

function selectedValues(value: readonly string[]) {
  return value.filter((item) => item.trim());
}

function normalizedTeamSet(value: readonly string[]) {
  return new Set(selectedValues(value).map((team) => team.toLowerCase()));
}

function fieldId(label: string) {
  return `football-futures-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

function cfbPlayoffPickerTeams(picks: FootballFuturesPicks) {
  const selected = selectedValues(picks.cfbPlayoffTeams);
  const selectedSet = normalizedTeamSet(selected);
  const missingChampions = selectedValues(picks.cfbPower4Champions).filter(
    (team) => !selectedSet.has(team.toLowerCase()),
  );
  const needsNonPower4 = !selected.some((team) => !isCfbPower4Team(team));
  const remainingSlots = FOOTBALL_FUTURES_RULES.cfb.playoffTeams.selections - selected.length;
  const requiredSlots = missingChampions.length + (needsNonPower4 ? 1 : 0);

  if (remainingSlots > 0 && remainingSlots <= requiredSlots) {
    const missingSet = normalizedTeamSet(missingChampions);
    return CFB_FUTURES_TEAMS.filter(
      (team) => missingSet.has(team.toLowerCase()) || (needsNonPower4 && !isCfbPower4Team(team)),
    );
  }
  return CFB_FUTURES_TEAMS;
}

function nflPlayoffPickerTeams(picks: FootballFuturesPicks) {
  const selected = selectedValues(picks.nflPlayoffTeams);
  const selectedSet = normalizedTeamSet(selected);
  const afcCount = selected.filter((team) => getNflConference(team) === "AFC").length;
  const activeConference: NflConference = afcCount < 7 ? "AFC" : "NFC";
  const selectedConferenceCount = selected.filter((team) => getNflConference(team) === activeConference).length;
  const missingDivisionChampions = selectedValues(picks.nflDivisionChampions).filter(
    (team) => getNflConference(team) === activeConference && !selectedSet.has(team.toLowerCase()),
  );
  const remainingConferenceSlots = 7 - selectedConferenceCount;

  if (remainingConferenceSlots > 0 && remainingConferenceSlots <= missingDivisionChampions.length) {
    const missingSet = normalizedTeamSet(missingDivisionChampions);
    return NFL_FUTURES_TEAMS.filter((team) => missingSet.has(team.toLowerCase()));
  }
  return NFL_FUTURES_TEAMS;
}

function FuturesTeamField({ label, points, limit, value, disabled, teams, groups, groupForTeam, onChange }: {
  label: string;
  points: string;
  limit: number;
  value: readonly string[];
  disabled: boolean;
  teams: readonly string[];
  groups?: readonly FuturesPickerGroup[];
  groupForTeam?: (team: string) => string | null;
  onChange: (value: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const selected = selectedValues(value);
  const inputId = fieldId(label);
  const listId = `${inputId}-options`;
  const atLimit = selected.length >= limit;
  const normalizedQuery = query.trim().toLowerCase();
  const activeGroup = groups?.find((group) => (
    selected.filter((team) => groupForTeam?.(team) === group.label).length < group.limit
  ));
  const options = teams
    .filter((team) => !activeGroup || groupForTeam?.(team) === activeGroup.label)
    .filter((team) => !selected.some((item) => item.toLowerCase() === team.toLowerCase()))
    .filter((team) => !normalizedQuery || team.toLowerCase().includes(normalizedQuery))
    .slice(0, 18);

  function selectTeam(team: string) {
    const next = limit === 1 ? [team] : [...selected, team].slice(0, limit);
    onChange(next);
    setQuery("");
  }

  function removeTeam(team: string) {
    onChange(selected.filter((item) => item !== team));
  }

  return (
    <div className="football-futures-field">
      <span><b>{label}</b><small>{points} · {selected.length}/{limit} PICKS</small></span>
      <div
        className="football-futures-team-picker"
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        {selected.length ? (
          <div className="football-futures-team-picker__selected">
            {selected.map((team) => {
              const group = groupForTeam?.(team);
              const text = group ? `${group} · ${team}` : team;
              return disabled ? (
                <span key={team} className="football-futures-team-chip">{text}</span>
              ) : (
                <button key={team} type="button" className="football-futures-team-chip" aria-label={`Remove ${team}`} onClick={() => removeTeam(team)}>
                  <span>{text}</span><b aria-hidden="true">×</b>
                </button>
              );
            })}
          </div>
        ) : null}
        {!disabled && !atLimit ? (
          <input
            id={inputId}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={focused}
            autoComplete="off"
            value={query}
            placeholder={activeGroup ? `Search ${activeGroup.label} teams` : "Search teams"}
            onChange={(event) => setQuery(event.target.value)}
          />
        ) : null}
        {focused && !disabled && !atLimit ? (
          <div id={listId} className="football-futures-team-picker__options" role="listbox">
            {options.map((team) => (
              <button
                key={team}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => selectTeam(team)}
              >{team}</button>
            ))}
            {!options.length ? <p>No matching teams</p> : null}
          </div>
        ) : null}
        {disabled && !selected.length ? <span className="football-futures-team-picker__empty">—</span> : null}
      </div>
    </div>
  );
}

function FuturesSingleField({ label, points, value, disabled, onChange }: {
  label: string; points: string; value: string; disabled: boolean; onChange: (value: string) => void;
}) {
  return (
    <label className="football-futures-field">
      <span><b>{label}</b><small>{points}</small></span>
      <input type="text" value={value} disabled={disabled} placeholder="Type player name" onChange={(event) => onChange(event.target.value)} />
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
  const draftRef = useRef(draft);
  const hydratedSeasonRef = useRef<number | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queuedAutosaveRef = useRef<FootballFuturesPicks | null>(null);
  const autosaveInFlightRef = useRef(false);
  const saveFootballFuturesRef = useRef(picks.saveFootballFutures);
  const flushAutosaveRef = useRef<() => Promise<void>>(async () => {});

  const locked = snapshot?.locked === true;
  const loading = picks.loading && !snapshot;
  const validation = useMemo(() => validateFootballFuturesPicks(draft), [draft]);
  const cfbPlayoffOptions = selectedValues(draft.cfbPlayoffTeams);
  const cfbSemifinalOptions = selectedValues(draft.cfbSemifinalists);
  const nflPlayoffOptions = selectedValues(draft.nflPlayoffTeams);
  const nflConferenceOptions = selectedValues(draft.nflConferenceChampionshipTeams);

  saveFootballFuturesRef.current = picks.saveFootballFutures;
  const lockedRef = useRef(locked);
  lockedRef.current = locked;

  const flushAutosave = useCallback(async () => {
    if (lockedRef.current || autosaveInFlightRef.current) return;
    const next = queuedAutosaveRef.current;
    if (!next) return;

    queuedAutosaveRef.current = null;
    autosaveInFlightRef.current = true;
    try {
      await saveFootballFuturesRef.current(next);
      setError("");
    } catch (autosaveError) {
      setError(autosaveError instanceof Error ? autosaveError.message : "Could not autosave Futures picks.");
    } finally {
      autosaveInFlightRef.current = false;
      if (queuedAutosaveRef.current) {
        autosaveTimerRef.current = setTimeout(() => {
          autosaveTimerRef.current = null;
          void flushAutosaveRef.current();
        }, 0);
      }
    }
  }, []);
  flushAutosaveRef.current = flushAutosave;

  const queueAutosave = useCallback((next: FootballFuturesPicks) => {
    queuedAutosaveRef.current = normalizeFootballFuturesPicks(next);
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      void flushAutosaveRef.current();
    }, AUTOSAVE_DELAY_MS);
  }, []);

  useEffect(() => {
    if (!snapshot) {
      hydratedSeasonRef.current = null;
      draftRef.current = EMPTY_FOOTBALL_FUTURES_PICKS;
      setDraft(EMPTY_FOOTBALL_FUTURES_PICKS);
      return;
    }
    if (hydratedSeasonRef.current === snapshot.season) return;

    hydratedSeasonRef.current = snapshot.season;
    draftRef.current = snapshot.ownPicks;
    setDraft(snapshot.ownPicks);
    queuedAutosaveRef.current = null;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
  }, [snapshot]);

  useEffect(() => {
    const flushPending = () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
      if (queuedAutosaveRef.current) void flushAutosaveRef.current();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPending();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flushPending);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flushPending);
      flushPending();
    };
  }, []);

  async function save() {
    if (locked || picks.savingFootballFutures) return;
    if (validation.errors.length) {
      setError(validation.errors[0]);
      return;
    }
    setError("");
    queuedAutosaveRef.current = null;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
    try {
      await picks.saveFootballFutures(validation.normalized);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save Futures picks.");
    }
  }

  const update = <K extends keyof FootballFuturesPicks,>(key: K, value: FootballFuturesPicks[K]) => {
    const next = { ...draftRef.current, [key]: value };
    draftRef.current = next;
    setDraft(next);
    setError("");
    queueAutosave(next);
  };

  return (
    <details className={`surface-card football-futures${locked ? " is-locked" : ""}`} aria-labelledby="football-futures-title">
      <summary className="football-futures__summary">
        <div className="football-futures__summary-copy">
          <header className="football-futures__header">
            <div><p className="eyebrow">SEASON FUTURES</p><h2 id="football-futures-title">Pick the season before it starts</h2></div>
            <strong>{FOOTBALL_FUTURES_MAX_POINTS.total} PTS</strong>
          </header>
          <div className="football-futures__status">
            <span>{locked ? "LOCKED · GROUP REVEALED" : "PRIVATE UNTIL LOCK"}</span>
            <b>{snapshot ? footballDateTimeLabel(snapshot.lockAt) : "FRI · 11:59 PM CT"}</b>
          </div>
        </div>
        <span className="football-futures__chevron" aria-hidden="true">⌄</span>
      </summary>

      <div className="football-futures__body">
        {loading ? <p className="football-futures__message">Loading Futures…</p> : null}
        {!loading ? (
          <div className="football-futures__leagues">
            <section>
              <header><div><span>CFB</span><small>COLLEGE FUTURES</small></div><strong>{FOOTBALL_FUTURES_MAX_POINTS.cfb} PTS</strong></header>
              <div className="football-futures__fields">
                <FuturesTeamField label="Power 4 champions" points="2 PTS EACH" limit={FOOTBALL_FUTURES_RULES.cfb.power4Champions.selections} value={draft.cfbPower4Champions} disabled={locked} teams={CFB_FUTURES_TEAMS} groups={POWER4_PICKER_GROUPS} groupForTeam={getCfbPower4Conference} onChange={(value) => update("cfbPower4Champions", value)} />
                <FuturesTeamField label="12-team CFP" points="1 PT EACH" limit={FOOTBALL_FUTURES_RULES.cfb.playoffTeams.selections} value={draft.cfbPlayoffTeams} disabled={locked} teams={cfbPlayoffPickerTeams(draft)} onChange={(value) => update("cfbPlayoffTeams", value)} />
                <FuturesTeamField label="CFP semifinalists" points="2 PTS EACH" limit={FOOTBALL_FUTURES_RULES.cfb.semifinalists.selections} value={draft.cfbSemifinalists} disabled={locked} teams={cfbPlayoffOptions.length ? cfbPlayoffOptions : CFB_FUTURES_TEAMS} onChange={(value) => update("cfbSemifinalists", value)} />
                <FuturesSingleField label="Heisman Trophy" points="3 PTS" value={draft.cfbHeisman} disabled={locked} onChange={(value) => update("cfbHeisman", value)} />
                <FuturesTeamField label="National champion" points="7 PTS" limit={1} value={draft.cfbNationalChampion ? [draft.cfbNationalChampion] : []} disabled={locked} teams={cfbSemifinalOptions.length ? cfbSemifinalOptions : CFB_FUTURES_TEAMS} onChange={(value) => update("cfbNationalChampion", value[0] ?? "")} />
              </div>
            </section>
            <section>
              <header><div><span>NFL</span><small>PRO FUTURES</small></div><strong>{FOOTBALL_FUTURES_MAX_POINTS.nfl} PTS</strong></header>
              <div className="football-futures__fields">
                <FuturesTeamField label="Division champions" points="1 PT EACH" limit={FOOTBALL_FUTURES_RULES.nfl.divisionChampions.selections} value={draft.nflDivisionChampions} disabled={locked} teams={NFL_FUTURES_TEAMS} groups={NFL_DIVISION_PICKER_GROUPS} groupForTeam={(team) => getNflTeamGroup(team)?.label ?? null} onChange={(value) => update("nflDivisionChampions", value)} />
                <FuturesTeamField label="14-team playoffs" points="1 PT EACH" limit={FOOTBALL_FUTURES_RULES.nfl.playoffTeams.selections} value={draft.nflPlayoffTeams} disabled={locked} teams={nflPlayoffPickerTeams(draft)} groups={NFL_PLAYOFF_PICKER_GROUPS} groupForTeam={getNflConference} onChange={(value) => update("nflPlayoffTeams", value)} />
                <FuturesTeamField label="Conference title teams" points="2 PTS EACH" limit={FOOTBALL_FUTURES_RULES.nfl.conferenceChampionshipTeams.selections} value={draft.nflConferenceChampionshipTeams} disabled={locked} teams={nflPlayoffOptions.length ? nflPlayoffOptions : NFL_FUTURES_TEAMS} groups={NFL_TITLE_PICKER_GROUPS} groupForTeam={getNflConference} onChange={(value) => update("nflConferenceChampionshipTeams", value)} />
                <FuturesSingleField label="AP NFL MVP" points="3 PTS" value={draft.nflMvp} disabled={locked} onChange={(value) => update("nflMvp", value)} />
                <FuturesTeamField label="Super Bowl champion" points="7 PTS" limit={1} value={draft.nflSuperBowlChampion ? [draft.nflSuperBowlChampion] : []} disabled={locked} teams={nflConferenceOptions.length ? nflConferenceOptions : NFL_FUTURES_TEAMS} onChange={(value) => update("nflSuperBowlChampion", value[0] ?? "")} />
              </div>
            </section>
          </div>
        ) : null}
        {!locked && !loading ? (
          <footer className="football-futures__footer">
            <p>Autosaves while you pick. Champions must advance through the playoff rounds you picked.</p>
            <button type="button" className="primary-action" disabled={picks.savingFootballFutures} onClick={() => void save()}>{picks.savingFootballFutures ? "SAVING…" : "SAVE FUTURES PICKS"}</button>
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
      </div>
    </details>
  );
}
