import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  FOOTBALL_FUTURES_TOTAL_POINTS,
  type FootballFutureTeamOption,
  type FootballFuturesPicks,
} from "./footballPicksScoring";
import { usePicks } from "./PicksProvider";

type FuturesDraft = {
  acc: string;
  bigTen: string;
  big12: string;
  sec: string;
  cfbPlayoffTeams: string[];
  cfbHeisman: string;
  cfbNationalChampion: string;
  nflPlayoffTeams: string[];
  nflConferenceChampionshipTeams: string[];
  nflMvp: string;
  nflSuperBowlChampion: string;
};

const emptyDraft: FuturesDraft = {
  acc: "",
  bigTen: "",
  big12: "",
  sec: "",
  cfbPlayoffTeams: [],
  cfbHeisman: "",
  cfbNationalChampion: "",
  nflPlayoffTeams: [],
  nflConferenceChampionshipTeams: [],
  nflMvp: "",
  nflSuperBowlChampion: "",
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function teamLabel(slugOrName: string, options: readonly FootballFutureTeamOption[]) {
  const slug = slugify(slugOrName);
  return options.find((team) => team.slug === slug)?.name ?? slugOrName.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveTeam(value: string, options: readonly FootballFutureTeamOption[]) {
  const normalized = slugify(value);
  const match = options.find((team) => team.slug === normalized || team.name.trim().toLowerCase() === value.trim().toLowerCase());
  return match?.slug ?? normalized;
}

function draftFromPicks(picks: FootballFuturesPicks | null): FuturesDraft {
  if (!picks) return emptyDraft;
  return {
    acc: picks.cfbPower4Champions.acc,
    bigTen: picks.cfbPower4Champions.bigTen,
    big12: picks.cfbPower4Champions.big12,
    sec: picks.cfbPower4Champions.sec,
    cfbPlayoffTeams: [...picks.cfbPlayoffTeams],
    cfbHeisman: picks.cfbHeisman,
    cfbNationalChampion: picks.cfbNationalChampion,
    nflPlayoffTeams: [...picks.nflPlayoffTeams],
    nflConferenceChampionshipTeams: [...picks.nflConferenceChampionshipTeams],
    nflMvp: picks.nflMvp,
    nflSuperBowlChampion: picks.nflSuperBowlChampion,
  };
}

function lockLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value)).toUpperCase();
}

function TeamListPicker({
  id,
  label,
  points,
  max,
  values,
  options,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  points: string;
  max: number;
  values: string[];
  options: readonly FootballFutureTeamOption[];
  disabled: boolean;
  onChange: (values: string[]) => void;
}) {
  const [candidate, setCandidate] = useState("");
  const add = () => {
    const slug = resolveTeam(candidate, options);
    if (!slug || values.includes(slug) || values.length >= max) return;
    onChange([...values, slug]);
    setCandidate("");
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    add();
  };

  return (
    <div className="football-futures-list-field">
      <div className="football-futures-field-head"><strong>{label}</strong><span>{values.length}/{max} · {points}</span></div>
      <div className="football-futures-chips">
        {values.map((value) => (
          <button type="button" disabled={disabled} onClick={() => onChange(values.filter((team) => team !== value))} key={value}>
            {teamLabel(value, options)}{disabled ? "" : " ×"}
          </button>
        ))}
      </div>
      {!disabled && values.length < max ? (
        <div className="football-futures-add-row">
          <input
            value={candidate}
            list={id}
            placeholder="Type a team"
            onChange={(event) => setCandidate(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" onClick={add} disabled={!candidate.trim()}>ADD</button>
        </div>
      ) : null}
      <datalist id={id}>{options.map((team) => <option value={team.name} key={team.slug} />)}</datalist>
    </div>
  );
}

function FuturesSummary({ picks, options }: { picks: FootballFuturesPicks; options: readonly FootballFutureTeamOption[] }) {
  const names = (values: readonly string[]) => values.map((value) => teamLabel(value, options)).join(" · ");
  return (
    <div className="football-futures-summary">
      <div><strong>CFB</strong><p>ACC {teamLabel(picks.cfbPower4Champions.acc, options)} · BIG TEN {teamLabel(picks.cfbPower4Champions.bigTen, options)} · BIG 12 {teamLabel(picks.cfbPower4Champions.big12, options)} · SEC {teamLabel(picks.cfbPower4Champions.sec, options)}</p><p><b>CFP:</b> {names(picks.cfbPlayoffTeams)}</p><p><b>Heisman:</b> {picks.cfbHeisman} · <b>Champion:</b> {teamLabel(picks.cfbNationalChampion, options)}</p></div>
      <div><strong>NFL</strong><p><b>Playoffs:</b> {names(picks.nflPlayoffTeams)}</p><p><b>Conference title games:</b> {names(picks.nflConferenceChampionshipTeams)}</p><p><b>AP MVP:</b> {picks.nflMvp} · <b>Super Bowl:</b> {teamLabel(picks.nflSuperBowlChampion, options)}</p></div>
    </div>
  );
}

export function FootballFuturesCard() {
  const picks = usePicks();
  const state = picks.footballFutures;
  const [draft, setDraft] = useState<FuturesDraft>(emptyDraft);

  useEffect(() => {
    setDraft(draftFromPicks(state?.ownPicks ?? null));
  }, [state?.ownPicks]);

  const cfbOptions = useMemo(() => state?.teamOptions.filter((team) => team.league === "college-football") ?? [], [state?.teamOptions]);
  const nflOptions = useMemo(() => state?.teamOptions.filter((team) => team.league === "nfl") ?? [], [state?.teamOptions]);

  if (!state) {
    return <section className="surface-card football-futures-card is-loading">Loading season Futures…</section>;
  }

  const resolveCfb = (value: string) => resolveTeam(value, cfbOptions);
  const resolveNfl = (value: string) => resolveTeam(value, nflOptions);
  const cfbChampion = resolveCfb(draft.cfbNationalChampion);
  const superBowlChampion = resolveNfl(draft.nflSuperBowlChampion);
  const power4 = [draft.acc, draft.bigTen, draft.big12, draft.sec].map(resolveCfb);
  const requiredComplete = power4.every(Boolean)
    && new Set(power4).size === 4
    && draft.cfbPlayoffTeams.length === 12
    && Boolean(draft.cfbHeisman.trim())
    && Boolean(cfbChampion)
    && draft.nflPlayoffTeams.length === 14
    && draft.nflConferenceChampionshipTeams.length === 4
    && Boolean(draft.nflMvp.trim())
    && Boolean(superBowlChampion);
  const nested = requiredComplete
    && draft.cfbPlayoffTeams.includes(cfbChampion)
    && draft.nflConferenceChampionshipTeams.every((team) => draft.nflPlayoffTeams.includes(team))
    && draft.nflConferenceChampionshipTeams.includes(superBowlChampion);

  const submit = () => {
    if (!nested || state.isLocked) return;
    void picks.saveFootballFutures({
      cfbPower4Champions: { acc: power4[0], bigTen: power4[1], big12: power4[2], sec: power4[3] },
      cfbPlayoffTeams: draft.cfbPlayoffTeams,
      cfbHeisman: draft.cfbHeisman.trim(),
      cfbNationalChampion: cfbChampion,
      nflPlayoffTeams: draft.nflPlayoffTeams,
      nflConferenceChampionshipTeams: draft.nflConferenceChampionshipTeams,
      nflMvp: draft.nflMvp.trim(),
      nflSuperBowlChampion: superBowlChampion,
    });
  };

  return (
    <section className={`surface-card football-futures-card${state.isLocked ? " is-locked" : ""}`} aria-labelledby="football-futures-title">
      <header className="football-futures-card__header">
        <div><p className="eyebrow">SEASON FUTURES</p><h2 id="football-futures-title">{FOOTBALL_FUTURES_TOTAL_POINTS} bonus points</h2></div>
        <div className="football-futures-card__deadline"><strong>{state.isLocked ? "LOCKED" : "LOCKS"}</strong><span>{lockLabel(state.lockAt)}</span></div>
      </header>
      <p className="football-futures-card__intro">30 CFB · 32 NFL · same championship. Group Futures stay private until the deadline.</p>

      {!state.isLocked ? (
        <div className="football-futures-form">
          <section>
            <header><strong>COLLEGE FOOTBALL</strong><span>30 PTS</span></header>
            <div className="football-futures-conferences">
              {([
                ["acc", "ACC", draft.acc],
                ["bigTen", "BIG TEN", draft.bigTen],
                ["big12", "BIG 12", draft.big12],
                ["sec", "SEC", draft.sec],
              ] as const).map(([key, label, value]) => (
                <label key={key}><span>{label} CHAMP · 2</span><input list="football-futures-cfb-single" value={teamLabel(value, cfbOptions)} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} placeholder="Team" /></label>
              ))}
            </div>
            <datalist id="football-futures-cfb-single">{cfbOptions.map((team) => <option value={team.name} key={team.slug} />)}</datalist>
            <TeamListPicker id="football-futures-cfp" label="12-TEAM CFP" points="1 PT EACH" max={12} values={draft.cfbPlayoffTeams} options={cfbOptions} disabled={false} onChange={(values) => setDraft((current) => ({ ...current, cfbPlayoffTeams: values }))} />
            <div className="football-futures-pair">
              <label><span>HEISMAN · 3</span><input value={draft.cfbHeisman} onChange={(event) => setDraft((current) => ({ ...current, cfbHeisman: event.target.value }))} placeholder="Player" /></label>
              <label><span>NATIONAL CHAMP · 7</span><input list="football-futures-cfb-single" value={teamLabel(draft.cfbNationalChampion, cfbOptions)} onChange={(event) => setDraft((current) => ({ ...current, cfbNationalChampion: event.target.value }))} placeholder="Team" /></label>
            </div>
          </section>

          <section>
            <header><strong>NFL</strong><span>32 PTS</span></header>
            <TeamListPicker id="football-futures-nfl-playoffs" label="14 PLAYOFF TEAMS" points="1 PT EACH" max={14} values={draft.nflPlayoffTeams} options={nflOptions} disabled={false} onChange={(values) => setDraft((current) => ({ ...current, nflPlayoffTeams: values }))} />
            <TeamListPicker id="football-futures-nfl-title" label="4 CONFERENCE TITLE-GAME TEAMS" points="2 PTS EACH" max={4} values={draft.nflConferenceChampionshipTeams} options={nflOptions} disabled={false} onChange={(values) => setDraft((current) => ({ ...current, nflConferenceChampionshipTeams: values }))} />
            <div className="football-futures-pair">
              <label><span>AP NFL MVP · 3</span><input value={draft.nflMvp} onChange={(event) => setDraft((current) => ({ ...current, nflMvp: event.target.value }))} placeholder="Player" /></label>
              <label><span>SUPER BOWL CHAMP · 7</span><input list="football-futures-nfl-single" value={teamLabel(draft.nflSuperBowlChampion, nflOptions)} onChange={(event) => setDraft((current) => ({ ...current, nflSuperBowlChampion: event.target.value }))} placeholder="Team" /></label>
            </div>
            <datalist id="football-futures-nfl-single">{nflOptions.map((team) => <option value={team.name} key={team.slug} />)}</datalist>
          </section>

          <div className="football-futures-submit">
            <span>{nested ? "READY TO LOCK IN" : requiredComplete ? "Keep champion picks inside your playoff fields." : "Complete every field to save."}</span>
            <button type="button" className="primary-action" disabled={!nested || picks.savingFutures} onClick={submit}>{picks.savingFutures ? "SAVING…" : state.ownPicks ? "UPDATE FUTURES" : "SAVE FUTURES"}</button>
          </div>
        </div>
      ) : (
        <div className="football-futures-locked-view">
          <div className="football-futures-own">
            <div className="football-futures-field-head"><strong>YOUR FUTURES</strong><span>{state.points} / {FOOTBALL_FUTURES_TOTAL_POINTS} PTS EARNED</span></div>
            {state.ownPicks ? <FuturesSummary picks={state.ownPicks} options={state.teamOptions} /> : <p>No Futures entry submitted.</p>}
          </div>
          <div className="football-futures-group-reveal">
            <div className="football-futures-field-head"><strong>GROUP FUTURES</strong><span>REVEALED AFTER LOCK</span></div>
            {state.groupEntries.map((entry) => (
              <details key={entry.displayName} className={entry.isCurrentUser ? "is-current" : ""}>
                <summary><strong>{entry.displayName}{entry.isCurrentUser ? " · YOU" : ""}</strong><span>{entry.points} PTS</span></summary>
                {entry.picks ? <FuturesSummary picks={entry.picks} options={state.teamOptions} /> : <p>No Futures entry submitted.</p>}
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
