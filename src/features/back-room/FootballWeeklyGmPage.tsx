import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import FootballGmModePage from "./FootballGmModePage";
import { FootballGmFranchiseReport } from "./FootballGmFranchiseReport";
import { createFootballWeeklyGmRepository, type WeeklyGmResult, type WeeklyGmScenario, type WeeklyGmState } from "./footballWeeklyGmRepository";
import type { PersistedRun } from "./FootballGmModePage";
import "../../styles/football-gm-mode.css";

const scenarios: { id: WeeklyGmScenario; title: string; quarterback: string; development: string }[] = [
  { id: "elite", title: "ELITE FRANCHISE", quarterback: "Josh Allen", development: "Steady development" },
  { id: "young", title: "YOUNG FRANCHISE", quarterback: "Jaxson Dart", development: "Guaranteed breakout" },
];

export default function FootballWeeklyGmPage({ preview = false }: { preview?: boolean } = {}) {
  const identity = useIdentity();
  const isOwner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const repository = useMemo(() => createFootballWeeklyGmRepository(preview), [preview]);
  const [state, setState] = useState<WeeklyGmState | null>(null);
  const [playing, setPlaying] = useState<WeeklyGmScenario | null>(null);
  const [detail, setDetail] = useState<WeeklyGmResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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

  async function inspect(profileId: string | null, scenario: WeeklyGmScenario) {
    if (!repository) return;
    setError("");
    try {
      setDetail(await repository.result(profileId, scenario));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "That result is not available.");
    }
  }

  if (preview && !identity.ready) return <div className="page football-gm-page"><section className="surface-card">Loading owner GM preview…</section></div>;
  if (preview && !isOwner) return <div className="page football-gm-page"><section className="surface-card"><h1>OWNER-ONLY PLAYTEST</h1><p>This production test is reserved for the Octagon HQ owner.</p><Link to="/football/weekly-gm">Weekly GM Championship</Link></section></div>;

  const attempt = playing ? state?.attempts[playing] : null;
  if (playing && state && attempt && state.status === "active") {
    return (
      <>
        <div className="page football-gm-page">
          <section className="surface-card" style={{ padding: 16, marginBottom: 12 }}>
            <button type="button" onClick={() => { setPlaying(null); void refresh().catch(() => {}); }}>← WEEKLY CHAMPIONSHIP</button>
            <h2>{playing === "elite" ? "JOSH ALLEN" : "JAXSON DART"} · {preview ? "LIVE OWNER TEST" : "OFFICIAL RUN"}</h2>
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
  return (
    <div className="page football-gm-page">
      <section className="surface-card" style={{ padding: 18, marginBottom: 12 }}>
        <Link to={preview ? "/football/weekly-gm" : "/football"}>← {preview ? "OFFICIAL GM WEEK" : "FOOTBALL HQ"}</Link>
        <p className="eyebrow">{preview ? "OWNER PLAYTEST · REAL PRODUCTION ENGINE" : "WEEKLY FEATURED · CHAMPIONSHIP 10%"}</p>
        <h1>{preview ? "TEST THE FULL WEEKLY GM" : "NFL GM CHAMPIONSHIP"}</h1>
        <p>{preview ? "This is the real Josh Allen and Jaxson Dart competition with genuine spins, trading, free agency, development, server saves, scores, and clickable results. Test entries are completely separate from Tuesday’s official championship." : "October 13–19 · Two franchises, each with a starting QB and six random spins. Build your best seven-player core. One official attempt per franchise."}</p>
        {!preview && isOwner && state.status === "upcoming" ? <p><Link to="/football/weekly-gm-test">OWNER-ONLY: PLAY THE REAL COMPETITION NOW ↗</Link></p> : null}
        <p><strong>{myTotal.toFixed(1)} / 200</strong> · {Number(state.attempts.elite?.completed ?? false) + Number(state.attempts.young?.completed ?? false)} of 2 completed</p>
        <small>{preview ? "Owner-only production playtest · Test data never enters championship standings · Closes Tuesday at 12:00 AM Central" :
          state.status === "upcoming" ? "Opens Tuesday, October 13 at midnight Central" :
          state.status === "closed" ? "Competition closed · Final results" : "Closes Monday, October 19 at 11:59 PM Central"}</small>
        {preview ? <p><button type="button" disabled={busy} onClick={() => {
          if (!window.confirm("Reset both owner test franchises? This permanently clears only your test attempts. Official Weekly GM is unaffected.")) return;
          setBusy(true);
          void repository?.resetPreview().then(() => { setDetail(null); return refresh(); })
            .catch((failure: unknown) => setError(failure instanceof Error ? failure.message : "Test reset failed."))
            .finally(() => setBusy(false));
        }}>RESET OWNER TEST ATTEMPTS</button></p> : null}
      </section>

      <div style={{ display: "grid", gap: 12, marginBottom: 12 }}>
        {scenarios.map((scenario) => {
          const item = state.attempts[scenario.id];
          return (
            <section className="surface-card" style={{ padding: 16 }} key={scenario.id}>
              <p className="eyebrow">{scenario.title} · 100 POINTS</p>
              <h2>{scenario.quarterback}</h2>
              <p>{scenario.development} · $150M cap · Three seasons</p>
              <p><strong>{item?.completed ? item.score?.toFixed(1) + " / 100" : item ? "IN PROGRESS" : "NOT STARTED"}</strong></p>
              {item?.completed ? (
                <button type="button" onClick={() => void inspect(null, scenario.id)}>VIEW YOUR FRANCHISE RESULT</button>
              ) : state.status === "active" ? (
                <button className="primary-action" disabled={busy} type="button" onClick={() => void open(scenario.id)}>
                  {item ? "RESUME OFFICIAL FRANCHISE" : "START OFFICIAL FRANCHISE"}
                </button>
              ) : null}
            </section>
          );
        })}
      </div>
      <section className="surface-card" style={{ padding: 16 }}>
        <p className="eyebrow">{preview ? "ISOLATED TEST RESULTS" : "LIVE STANDINGS"}</p>
        <h2>{preview ? "OWNER PLAYTEST RESULTS" : "WEEKLY GM LEADERBOARD"}</h2>
        <p>{preview ? "These are genuine scored production runs, never counted toward the official Championship." : "Each completed run counts. Most combined points out of 200 wins."}</p>
        {state.leaderboard.length ? (
          <div style={{ display: "grid", gap: 12 }}>
            {state.leaderboard.map((entry) => (
              <div key={entry.profile_id} style={{ borderTop: "1px solid var(--border, #9994)", paddingTop: 12 }}>
                <strong>#{entry.rank} · {entry.display_name} — {entry.total_score.toFixed(1)} / 200</strong>
                <p>{entry.completed_runs} of 2 runs completed</p>
                {scenarios.map(({ id, quarterback }) => {
                  const score = id === "elite" ? entry.elite_score : entry.young_score;
                  return score == null ? null : (
                    <button type="button" key={id} style={{ marginRight: 10 }}
                      onClick={() => void inspect(entry.profile_id, id)}>
                      {quarterback}: {score.toFixed(1)} ↗
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : <p>No official runs completed yet. Be the first GM on the board.</p>}
      </section>
      {detail ? (
        <section style={{ marginTop: 16 }}>
          <button type="button" onClick={() => setDetail(null)}>← CLOSE FRANCHISE RESULTS</button>
          <FootballGmFranchiseReport name={detail.display_name} run={detail.state} />
        </section>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      <section className="surface-card" style={{ padding: 16, marginTop: 12 }}>
        <p>Want more spins? <Link to="/football/gm-mode">Play unlimited Casual GM</Link> without affecting your official standings.</p>
      </section>
    </div>
  );
}
