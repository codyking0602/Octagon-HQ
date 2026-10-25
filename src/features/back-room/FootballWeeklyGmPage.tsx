import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import FootballGmModePage from "./FootballGmModePage";
import { FootballGmFranchiseReport } from "./FootballGmFranchiseReport";
import { createFootballWeeklyGmRepository, type WeeklyGmArchivedWeek, type WeeklyGmResult, type WeeklyGmScenario, type WeeklyGmState } from "./footballWeeklyGmRepository";
import type { PersistedRun } from "./FootballGmModePage";
import { canViewWeeklyGmScenario, canViewWeeklyGmTotal } from "./footballWeeklyGmVisibility";
import "../../styles/football-gm-mode.css";
import "../../styles/football-weekly-gm.css";

function formatWeek(week: string) {
  const date = new Date(week + "T12:00:00Z");
  const end = new Date(date.getTime() + 6 * 86400000);
  const format = (value: Date) => value.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return format(date) + "–" + format(end);
}

const OCT13_SCENARIOS: { id: WeeklyGmScenario; title: string; quarterback: string; development: string }[] = [
  { id: "elite", title: "ELITE FRANCHISE", quarterback: "Josh Allen", development: "Steady development" },
  { id: "young", title: "YOUNG FRANCHISE", quarterback: "Jaxson Dart", development: "Guaranteed breakout" },
];

const OCT20_SCENARIOS: typeof OCT13_SCENARIOS = [
  { id: "elite", title: "VETERAN CHALLENGE", quarterback: "Dak Prescott", development: "Guaranteed 92 → 89 OVR · regression" },
  { id: "young", title: "RISING FRANCHISE", quarterback: "Michael Penix Jr.", development: "Guaranteed 78 → 83 OVR · progression" },
];

export default function FootballWeeklyGmPage({ preview = false }: { preview?: boolean } = {}) {
  const identity = useIdentity();
  const [params] = useSearchParams();
  const isOwner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const repository = useMemo(() => createFootballWeeklyGmRepository(preview), [preview]);
  const [state, setState] = useState<WeeklyGmState | null>(null);
  const [playing, setPlaying] = useState<WeeklyGmScenario | null>(null);
  const [detail, setDetail] = useState<WeeklyGmResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<WeeklyGmArchivedWeek[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    if (!identity.ready || preview || !repository) return;
    void repository.history().then((weeks) => { if (active) setHistory(weeks); })
      .catch(() => { /* The live game stays playable if history is unavailable. */ });
    return () => { active = false; };
  }, [identity.ready, preview, repository]);
  useEffect(() => {
    if (detail) document.getElementById("weekly-gm-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [detail]);

  async function refresh() {
    if (!repository) throw new Error("Sign in to play the Weekly GM Championship.");
    setState(await repository.load());
  }
  useEffect(() => {
    let active = true;
    if (!identity.ready || (preview && !isOwner)) return;
    if (!repository) {
      setError("Sign in to play the Weekly GM Championship.");
      return;
    }
    void repository.load().then((next) => {
      if (active) setState(next);
    }).catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : "Weekly GM could not load.");
    });
    return () => { active = false; };
  }, [repository, identity.ready, preview, isOwner]);

  async function open(scenario: WeeklyGmScenario) {
    if (!repository || !state || busy) return;
    if (state.status === "closed") return;
    setError("");
    setBusy(true);
    try {
      const attempt = state.attempts[scenario] ?? await repository.start(scenario);
      setState((current) => current ? { ...current, attempts: { ...current.attempts, [scenario]: attempt } } : current);
      setPlaying(scenario);
      setDetail(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to begin the franchise.");
    } finally {
      setBusy(false);
    }
  }

  const archive = !preview ? history.find((week) => week.week_start === params.get("history")) : null;
  const latestChampion = history[0];
  async function inspect(profileId: string | null, scenario: WeeklyGmScenario) {
    if (!repository || (!archive && profileId && !canViewWeeklyGmScenario(state?.attempts ?? {}, scenario, preview))) return;
    setError("");
    try {
      setDetail(archive
        ? await repository.archivedResult(archive.week_start, profileId ?? identity.profile!.id, scenario)
        : await repository.result(profileId, scenario));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "That result is not available.");
    }
  }

  if (preview && !identity.ready) return <div className="page football-gm-page"><section className="surface-card">Loading owner GM preview…</section></div>;
  if (preview && !isOwner) return <div className="page football-gm-page"><section className="surface-card"><h1>OWNER-ONLY PLAYTEST</h1><p>This production test is reserved for the Octagon HQ owner.</p><Link to="/football/weekly-gm">Weekly GM Championship</Link></section></div>;

  const isOct20Week = !preview && state?.week_start === "2026-10-20";
  const scenarios = isOct20Week ? OCT20_SCENARIOS : OCT13_SCENARIOS;
  const attempt = playing ? state?.attempts[playing] : null;
  if (playing && state && attempt && state.status === "active") {
    return (
      <>
        <div className="page football-gm-page">
          <section className="surface-card" style={{ padding: 16, marginBottom: 12 }}>
            <button type="button" onClick={() => { setPlaying(null); void refresh().catch(() => {}); }}>← WEEKLY CHAMPIONSHIP</button>
            <h2>{scenarios.find((scenario) => scenario.id === playing)?.quarterback.toUpperCase()} · {preview ? "LIVE OWNER TEST" : "OFFICIAL RUN"}</h2>
            <p>{preview ? "Real production gameplay, scoring, saves, and result screens. Test attempts stay outside the official standings." : "One official attempt · Six random wheel spins · The usual three-year franchise."}</p>
            {error ? <p role="alert">{error}</p> : null}
          </section>
        </div>
        <FootballGmModePage
          key={playing + ":" + attempt.seed}
          weeklyRun={{
            scenario: playing,
            seed: attempt.seed,
            savedState: attempt.state,
            // Keep the already-started October 13 championship on its original rules.
            legacyFreeAgency: state.week_start < "2026-10-20",
            onBack: () => { setPlaying(null); void refresh().catch(() => {}); },
            save: async (run: PersistedRun, score: number | null) => {
              if (!repository) throw new Error("Weekly GM is not connected.");
              await repository.save(playing, attempt.seed, run, score);
              if (score !== null) {
                void refresh().catch((failure: unknown) =>
                  setError(failure instanceof Error ? failure.message : "Standings could not refresh."));
              }
            },
          }}
        />
      </>
    );
  }

  if (!state) return (
    <div className="page football-gm-page"><section className="surface-card">
      <h1>WEEKLY NFL GM</h1><p>{error || "Loading official competition…"}</p>
      {error ? <button type="button" onClick={() => void refresh().catch((failure: unknown) => setError(String(failure)))}>RETRY</button> : null}
    </section></div>
  );

  const myTotal = (state.attempts.elite?.score ?? 0) + (state.attempts.young?.score ?? 0);
  const canViewTotal = canViewWeeklyGmTotal(state.attempts, preview);
  const standingRows = archive?.standings ?? state.leaderboard;
  const standingScenarios = archive?.week_start === "2026-10-13" ? OCT13_SCENARIOS : scenarios;
  const winners = archive?.champions ?? [];
  const leaderList = (showAll || archive ? standingRows : standingRows.slice(0, 3));
  return (
    <div className="page football-gm-page football-weekly-gm">
      {archive ? (
        <section className="surface-card football-weekly-gm__intro">
          <Link to="/football/weekly-gm" onClick={() => setDetail(null)}>← CURRENT WEEK</Link>
          <p className="eyebrow">FINAL RESULTS · {formatWeek(archive.week_start).toUpperCase()}</p>
          <h1>WEEKLY GM CHAMPIONSHIP</h1>
          <div className="football-weekly-gm__champion">
            <span aria-hidden="true">🏆</span>
            <div><small>{winners.length > 1 ? "CO-CHAMPIONS" : "WEEKLY CHAMPION"}</small>
              <strong>{winners.map((entry) => entry.display_name).join(" & ")}</strong>
              <span>{winners[0]?.total_score.toFixed(1)} / 200</span></div>
          </div>
        </section>
      ) : (
        <>
          {latestChampion && !preview ? (
            <Link className="football-weekly-gm__last-champion"
              to={`/football/weekly-gm?history=${latestChampion.week_start}`}>
              <span aria-hidden="true">🏆</span>
              <span><small>LAST WEEK'S GM CHAMPION · {formatWeek(latestChampion.week_start)}</small>
                <strong>{latestChampion.champions.map((entry) => entry.display_name).join(" & ")}</strong>
                <small>{latestChampion.champions[0]?.total_score.toFixed(1)} / 200 · VIEW RESULTS →</small>
              </span>
            </Link>
          ) : null}
          <section className="surface-card football-weekly-gm__intro">
            <Link to={preview ? "/football/weekly-gm" : "/football"}>← {preview ? "OFFICIAL GM WEEK" : "FOOTBALL PLAY"}</Link>
            <p className="eyebrow">{preview ? "OWNER PLAYTEST" : "WEEKLY FEATURED · CHAMPIONSHIP 10%"}</p>
            <h1>{preview ? "TEST WEEKLY GM" : "NFL GM CHAMPIONSHIP"}</h1>
            <p className="football-weekly-gm__summary">{formatWeek(state.week_start)} · Two official franchises · $150M cap · Six spins each</p>
            <p className="football-weekly-gm__progress">
              <strong>{myTotal.toFixed(1)} / 200</strong>
              <span>{Number(state.attempts.elite?.completed ?? false) + Number(state.attempts.young?.completed ?? false)} of 2 completed</span>
            </p>
            <small>{preview ? "Owner test entries never enter official standings" :
              state.status === "closed" ? "Competition closed · Final results" :
              state.status === "upcoming" ? "Competition opens soon" :
              `Closes ${new Date(state.closes_at).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} Central`}</small>
            {!preview ? <button type="button" className="football-weekly-gm__history-link"
              onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
              {historyOpen ? "HIDE" : "VIEW"} PAST WEEKLY GM CHAMPIONSHIPS →
            </button> : null}
            {preview ? <button type="button" disabled={busy} onClick={() => {
              if (!window.confirm("Reset both owner test franchises? Official Weekly GM is unaffected.")) return;
              setBusy(true);
              void repository?.resetPreview().then(() => { setDetail(null); return refresh(); })
                .catch((failure: unknown) => setError(String(failure))).finally(() => setBusy(false));
            }}>RESET OWNER TEST ATTEMPTS</button> : null}
          </section>
          {historyOpen ? <section className="surface-card football-weekly-gm__archive">
            <h2>PAST GM CHAMPIONSHIPS</h2>
            {history.length ? history.map((week) => (
              <Link key={week.week_start} to={`/football/weekly-gm?history=${week.week_start}`}
                onClick={() => setDetail(null)} className="football-weekly-gm__archive-row">
                <span><small>{formatWeek(week.week_start)}</small>
                  <strong>🏆 {week.champions.map((entry) => entry.display_name).join(" & ")}</strong></span>
                <b>{week.champions[0]?.total_score.toFixed(1)} / 200 →</b>
              </Link>
            )) : <p>No finished two-franchise GM championships are on record yet.</p>}
          </section> : null}
          <div className="football-weekly-gm__scenarios">
            {scenarios.map((scenario) => {
              const item = state.attempts[scenario.id];
              return (
                <section className="surface-card football-weekly-gm__franchise" key={scenario.id}>
                  <p className="eyebrow">{scenario.title}</p>
                  <h2>{scenario.quarterback}</h2>
                  <p>{scenario.development}</p>
                  <strong>{item?.completed ? item.score?.toFixed(1) + " / 100" : item ? "IN PROGRESS" : "NOT STARTED"}</strong>
                  {item?.completed ? <button type="button" onClick={() => void inspect(null, scenario.id)}>VIEW RESULT →</button>
                    : state.status === "active" ? (
                      <button className="primary-action" disabled={busy} type="button" onClick={() => void open(scenario.id)}>
                        {item ? "RESUME" : "START"} FRANCHISE →
                      </button>
                    ) : null}
                </section>
              );
            })}
          </div>
        </>
      )}
      <section className="surface-card football-weekly-gm__standings">
        <div className="football-weekly-gm__standings-title">
          <span className="eyebrow">{archive ? "FINAL" : preview ? "OWNER TEST" : "LIVE"} STANDINGS</span>
          <span>{standingRows.length} GMs</span>
        </div>
        <h2>{archive ? "CHAMPIONSHIP RESULTS" : "WEEKLY GM LEADERBOARD"}</h2>
        {standingRows.length ? (
          <div className="football-weekly-gm__leader-list">
            {leaderList.map((entry) => (
              <div key={entry.profile_id} className="football-weekly-gm__entry">
                <div className="football-weekly-gm__entry-main">
                  <strong>#{entry.rank} · {entry.display_name}{entry.profile_id === identity.profile?.id ? " · YOU" : ""}</strong>
                  <b>{archive || canViewTotal ? entry.total_score.toFixed(1) + " / 200" : "LOCKED"}</b>
                </div>
                {archive || showAll ? (
                  <div className="football-weekly-gm__entry-scores">
                    {standingScenarios.map(({ id, quarterback }) => {
                      const score = id === "elite" ? entry.elite_score : entry.young_score;
                      if (score == null) return null;
                      return archive || canViewWeeklyGmScenario(state.attempts, id, preview) ? (
                        <button type="button" key={id} onClick={() => void inspect(entry.profile_id, id)}>
                          {quarterback}: {score.toFixed(1)} ↗
                        </button>
                      ) : <span key={id}>{quarterback}: LOCKED</span>;
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : <p>No official results yet.</p>}
        {!archive && standingRows.length > 3 ? <button className="football-weekly-gm__history-link"
          type="button" onClick={() => setShowAll((open) => !open)}>
          {showAll ? "SHOW TOP THREE" : `VIEW ALL ${standingRows.length} STANDINGS`} →
        </button> : null}
      </section>
      {detail ? <section id="weekly-gm-result" className="football-weekly-gm__detail">
        <button type="button" onClick={() => setDetail(null)}>← CLOSE FRANCHISE RESULTS</button>
        <FootballGmFranchiseReport name={detail.display_name} run={detail.state} />
      </section> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!archive ? <p className="football-weekly-gm__casual">Want more spins? <Link to="/football/gm-mode">Play unlimited Casual GM →</Link></p> : null}
    </div>
  );
}
