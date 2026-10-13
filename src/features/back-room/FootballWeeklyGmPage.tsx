import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { isFootballWeeklyBuildQbPreviewOwner } from "../play/footballWeeklyBuildQbPreviewAccess";
import FootballGmModePage from "./FootballGmModePage";
import { FootballGmFranchiseReport } from "./FootballGmFranchiseReport";
import { FootballWeeklyNflTeamSeasonFinalResult } from "./FootballWeeklyNflTeamSeasonGate";
import { createFootballWeeklyAuctionRepository, type FootballWeeklyNflTeamSeasonFinal } from "../play/footballWeeklyAuctionRepository";
import { createFootballWeeklyGmRepository, type WeeklyGmResult, type WeeklyGmScenario, type WeeklyGmState } from "./footballWeeklyGmRepository";
import type { PersistedRun } from "./FootballGmModePage";
import { canViewWeeklyGmScenario, canViewWeeklyGmTotal } from "./footballWeeklyGmVisibility";
import "../../styles/football-gm-mode.css";
import "../../styles/football-weekly-gm.css";

const LAST_AUCTION_WEEK = "2026-10-06";
const LAST_AUCTION_REVEAL_KEY = "football-weekly-gm-2026-10-13-auction-reveal-seen";

function auctionRevealAlreadySeen() {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(LAST_AUCTION_REVEAL_KEY) === "1";
  } catch {
    return false;
  }
}

const scenarios: { id: WeeklyGmScenario; title: string; quarterback: string; development: string }[] = [
  { id: "elite", title: "ELITE FRANCHISE", quarterback: "Josh Allen", development: "Steady development" },
  { id: "young", title: "YOUNG FRANCHISE", quarterback: "Jaxson Dart", development: "Guaranteed breakout" },
];

export default function FootballWeeklyGmPage({ preview = false }: { preview?: boolean } = {}) {
  const identity = useIdentity();
  const isOwner = isFootballWeeklyBuildQbPreviewOwner(identity.profile);
  const repository = useMemo(() => createFootballWeeklyGmRepository(preview), [preview]);
  const auctionRepository = useMemo(() => createFootballWeeklyAuctionRepository(), []);
  const [state, setState] = useState<WeeklyGmState | null>(null);
  const [playing, setPlaying] = useState<WeeklyGmScenario | null>(null);
  const [detail, setDetail] = useState<WeeklyGmResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastAuction, setLastAuction] = useState<FootballWeeklyNflTeamSeasonFinal | null>(null);
  const [showAuctionReveal, setShowAuctionReveal] = useState(() => !auctionRevealAlreadySeen());

  useEffect(() => {
    if (preview || !identity.ready || !auctionRepository) return;
    let active = true;
    void auctionRepository.loadHistory().then((history) => {
      if (!active) return;
      const final = history.find((entry) =>
        entry.week_start === LAST_AUCTION_WEEK
        && entry.subject_key === "nfl-best-team-seasons-since-2000");
      setLastAuction(final && final.subject_key === "nfl-best-team-seasons-since-2000" ? final : null);
    }).catch(() => {
      // The standalone Auction Center remains available if its history request fails.
    });
    return () => { active = false; };
  }, [preview, identity.ready, auctionRepository]);

  function continueToGm() {
    setShowAuctionReveal(false);
    try { window.localStorage.setItem(LAST_AUCTION_REVEAL_KEY, "1"); } catch { /* private browsing */ }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
    if (!repository || (profileId && !canViewWeeklyGmScenario(state?.attempts ?? {}, scenario, preview))) return;
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
  if (!preview && showAuctionReveal && lastAuction) {
    const winner = lastAuction.standings.find((entry) => entry.is_winner)
      ?? lastAuction.standings.find((entry) => entry.rank === 1);
    return (
      <div className="page football-gm-page">
        <section className="surface-card" style={{ padding: 16, marginBottom: 12 }}>
          <Link to="/football">← FOOTBALL HQ</Link>
          <p className="eyebrow">OCT 6–12 · LAST WEEK'S NFL AUCTION</p>
          <h1>FINAL AUCTION RESULTS</h1>
          <p><strong>{winner?.display_name ?? "Weekly winner"}</strong> finished first{winner?.final_score != null ? ` with ${winner.final_score.toFixed(1)} points` : ""}.</p>
          <p>Explore the final standings, every collection, all 32 team grades and the Day 7 Wildcard wheel before starting this week's GM.</p>
          <button className="primary-action" type="button" onClick={continueToGm}>CONTINUE TO THIS WEEK'S GM →</button>
        </section>
        <FootballWeeklyNflTeamSeasonFinalResult
          result={lastAuction}
          busy={false}
          onAcknowledge={continueToGm}
          showNewWeekAction={false}
        />
        <section className="surface-card" style={{ padding: 12, marginTop: 12 }}>
          <button type="button" className="primary-action" onClick={continueToGm}>CONTINUE TO THIS WEEK'S GM →</button>
        </section>
      </div>
    );
  }

  const myTotal = (state.attempts.elite?.score ?? 0) + (state.attempts.young?.score ?? 0);
  const canViewTotal = canViewWeeklyGmTotal(state.attempts, preview);
  return (
    <div className="page football-gm-page">
      <section className="surface-card football-weekly-gm__intro">
        <Link to={preview ? "/football/weekly-gm" : "/football"}>← {preview ? "OFFICIAL GM WEEK" : "FOOTBALL HQ"}</Link>
        <p className="eyebrow">{preview ? "OWNER PLAYTEST · REAL PRODUCTION ENGINE" : "WEEKLY FEATURED · CHAMPIONSHIP 10%"}</p>
        <h1>{preview ? "TEST THE FULL WEEKLY GM" : "NFL GM CHAMPIONSHIP"}</h1>
        <p className="football-weekly-gm__summary">{preview ? "Real GM mechanics and saves · test entries do not count." : "October 13–19 · Two official three-season runs · $150M cap · Six random spins per franchise."}</p>
        {!preview && isOwner && state.status === "upcoming" ? <p><Link to="/football/weekly-gm-test">OWNER-ONLY: PLAY THE REAL COMPETITION NOW ↗</Link></p> : null}
        {!preview ? (
          <p>
            {lastAuction ? (
              <button type="button" onClick={() => { setShowAuctionReveal(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                VIEW OCT 6–12 AUCTION RESULTS · WHEEL · COLLECTIONS · ALL GRADES ↗
              </button>
            ) : <Link to="/football/weekly-auction">VIEW PRIOR AUCTION RESULTS ↗</Link>}
          </p>
        ) : null}
        <p className="football-weekly-gm__progress"><strong>{myTotal.toFixed(1)} / 200</strong><span>{Number(state.attempts.elite?.completed ?? false) + Number(state.attempts.young?.completed ?? false)} of 2 completed</span></p>
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

      <div className="football-weekly-gm__scenarios">
        {scenarios.map((scenario) => {
          const item = state.attempts[scenario.id];
          return (
            <section className="surface-card football-weekly-gm__franchise" key={scenario.id}>
              <p className="eyebrow">{scenario.title} · 100 POINTS</p>
              <h2>{scenario.quarterback}</h2>
              <p>{scenario.development} · 6 random spins</p>
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
      <section className="surface-card football-weekly-gm__standings">
        <p className="eyebrow">{preview ? "ISOLATED TEST RESULTS" : "LIVE STANDINGS"}</p>
        <h2>{preview ? "OWNER PLAYTEST RESULTS" : "WEEKLY GM LEADERBOARD"}</h2>
        <p>{preview ? "Test standings never count toward the Championship." : "Standings are ranked by combined score. Opponent scores unlock only after you complete the matching franchise."}</p>
        {state.leaderboard.length ? (
          <div style={{ display: "grid", gap: 12 }}>
            {state.leaderboard.map((entry) => (
              <div key={entry.profile_id} className="football-weekly-gm__entry">
                <strong>#{entry.rank} · {entry.display_name}{canViewTotal ? ` — ${entry.total_score.toFixed(1)} / 200` : ""}</strong>
                <small>{entry.completed_runs} of 2 runs completed{!canViewTotal ? " · SCORES HIDDEN" : ""}</small>
                <div className="football-weekly-gm__entry-scores">
                  {scenarios.map(({ id, quarterback }) => {
                    const score = id === "elite" ? entry.elite_score : entry.young_score;
                    if (score == null) return null;
                    return canViewWeeklyGmScenario(state.attempts, id, preview) ? (
                      <button type="button" key={id} onClick={() => void inspect(entry.profile_id, id)}>
                        {quarterback}: {score.toFixed(1)} ↗
                      </button>
                    ) : <span key={id}>{quarterback}: LOCKED</span>;
                  })}
                </div>
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
