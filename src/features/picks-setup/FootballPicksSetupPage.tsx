import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import type { PickSetupDraft, PickSetupFootballLeague } from "./pickSetupModel";
import { createPickSetupRepository, type PickSetupRepository } from "./pickSetupRepository";

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Football setup could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) return "Football setup is available only to the Picks owner.";
  return message;
}

function displayTime(value: string | null | undefined) {
  if (!value) return "NOT SET";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

function displaySpread(value: number | null | undefined) {
  if (value === null || value === undefined) return "NO LINE";
  if (value === 0) return "PK";
  return value > 0 ? `+${value}` : String(value);
}

function gameLeague(weightClass: string) {
  return weightClass.replace(/\s+ATS$/i, "").replace("COLLEGE-FOOTBALL", "COLLEGE FOOTBALL");
}

interface FootballPicksSetupPageProps {
  repository?: PickSetupRepository | null;
}

export default function FootballPicksSetupPage({ repository: suppliedRepository }: FootballPicksSetupPageProps) {
  const identity = useIdentity();
  const navigate = useNavigate();
  const [repository] = useState<PickSetupRepository | null>(() => (
    suppliedRepository === undefined ? createPickSetupRepository() : suppliedRepository
  ));
  const [draft, setDraft] = useState<PickSetupDraft | null>(null);
  const [league, setLeague] = useState<PickSetupFootballLeague>("nfl");
  const [espnEventId, setEspnEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const loadDraft = useCallback(async () => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      setDraft(await repository.loadDraft("football"));
      setError("");
    } catch (nextError) {
      setDraft(null);
      setError(readableError(nextError));
    } finally {
      setLoading(false);
    }
  }, [identity.profile, repository]);

  useEffect(() => {
    if (!identity.ready) return;
    if (!identity.profile || !repository) {
      setLoading(false);
      return;
    }
    void loadDraft();
  }, [identity.profile, identity.ready, loadDraft, repository]);

  const games = useMemo(() => draft?.bouts.slice().sort((a, b) => a.position - b.position) ?? [], [draft]);

  async function runAction(key: string, action: () => Promise<void>, reload = true) {
    setBusy(key);
    setError("");
    try {
      await action();
      if (reload) await loadDraft();
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusy("");
    }
  }

  function syncGame() {
    const eventId = espnEventId.trim();
    if (!repository?.syncFootballGame || !eventId) return;
    void runAction("sync", async () => {
      await repository.syncFootballGame!(league, eventId);
      setEspnEventId("");
    });
  }

  function removeGame(boutId: string, matchup: string) {
    if (!draft || !window.confirm(`Remove ${matchup} from this staged Football slate?`)) return;
    void runAction(`remove:${boutId}`, () => repository!.removeBout(draft.draftId, boutId));
  }

  function publishDraft() {
    if (!draft?.canPublish || !window.confirm("Publish this reviewed Football slate? ATS spreads freeze at publication.")) return;
    void runAction("publish", async () => {
      await repository!.publishDraft(draft.draftId);
      navigate("/football/picks");
    }, false);
  }

  function discardDraft() {
    if (!draft || !window.confirm("Discard this staged Football slate? This does not change published Picks.")) return;
    void runAction("discard", () => repository!.discardDraft(draft.draftId));
  }

  return (
    <div className="page picks-setup-page">
      <section className="page-heading picks-setup-heading">
        <p className="eyebrow">PRIVATE PICKS OWNER · FOOTBALL</p>
        <h1>Weekly Slate Setup</h1>
        <p>Add real ESPN games one at a time. The existing Football sync owner supplies identity, kickoff, and ATS lines; spreads freeze only when you publish.</p>
        <div className="picks-setup-heading__links">
          <Link to="/football/picks">PLAYER FOOTBALL PICKS</Link>
        </div>
      </section>

      {!identity.ready || loading ? <section className="surface-card picks-setup-state"><strong>Loading Football setup…</strong></section> : null}
      {identity.ready && !identity.profile ? (
        <section className="surface-card picks-setup-state">
          <p className="eyebrow">OWNER SIGN-IN REQUIRED</p>
          <h2>Sign in to open Football setup.</h2>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      ) : null}
      {error ? <section className="surface-card picks-setup-state" role="alert">{error}</section> : null}

      {identity.profile && !loading ? (
        <>
          <section className="surface-card picks-setup-scope" aria-label="Add Football game">
            <div>
              <p className="eyebrow">ADD / REFRESH REAL GAME</p>
              <h2>Existing Football sync</h2>
              <p>Syncing the same ESPN game refreshes its staged line. Syncing another game in the same Tuesday–Monday week adds it to this slate.</p>
            </div>
            <label>
              LEAGUE
              <select aria-label="Football league" value={league} disabled={Boolean(busy)} onChange={(event) => setLeague(event.target.value as PickSetupFootballLeague)}>
                <option value="nfl">NFL</option>
                <option value="college-football">College Football</option>
              </select>
            </label>
            <label>
              ESPN EVENT ID
              <input aria-label="ESPN event ID" inputMode="numeric" value={espnEventId} disabled={Boolean(busy)} onChange={(event) => setEspnEventId(event.target.value)} placeholder="e.g. 401772000" />
            </label>
            <button className="primary-action" type="button" disabled={Boolean(busy) || !espnEventId.trim() || !repository?.syncFootballGame} onClick={syncGame}>
              {busy === "sync" ? "SYNCING…" : "ADD / REFRESH GAME"}
            </button>
          </section>

          {draft ? (
            <section className="picks-setup-review" aria-label="Football slate review">
              <div className="surface-card picks-setup-state">
                <p className="eyebrow">STAGED WEEKLY SLATE</p>
                <h2>{draft.name}</h2>
                <p>{games.length} game{games.length === 1 ? "" : "s"} · {draft.league === "mixed" ? "NFL + College Football" : draft.league?.toUpperCase()}</p>
                <small>First kickoff: {displayTime(draft.startsAt)} · ATS spreads are not frozen yet.</small>
              </div>

              {games.map((game) => {
                const matchup = `${game.blueFighterName} at ${game.redFighterName}`;
                return (
                  <article className="surface-card pick-setup-bout" key={game.boutId}>
                    <div className="pick-setup-bout__heading">
                      <div><span>{gameLeague(game.weightClass)}</span><small>{displayTime(game.kickoffAt)}</small></div>
                    </div>
                    <h3>{game.blueFighterName} <span aria-hidden="true">@</span> {game.redFighterName}</h3>
                    <p><strong>HOME ATS:</strong> {displaySpread(game.spreadHome)}</p>
                    <p><strong>SOURCE:</strong> {game.spreadSource ?? "NOT SET"} · updated {displayTime(game.spreadUpdatedAt)}</p>
                    <button className="pick-setup-danger" type="button" disabled={Boolean(busy)} onClick={() => removeGame(game.boutId, matchup)}>REMOVE GAME</button>
                  </article>
                );
              })}

              {draft.warnings.length ? (
                <div className="surface-card picks-setup-state" role="status">
                  {draft.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                </div>
              ) : null}

              <div className="surface-card picks-setup-state">
                <button className="primary-action" type="button" disabled={Boolean(busy) || !draft.canPublish} onClick={publishDraft}>
                  {busy === "publish" ? "PUBLISHING…" : "PUBLISH FOOTBALL SLATE"}
                </button>
                <button className="pick-setup-danger" type="button" disabled={Boolean(busy)} onClick={discardDraft}>DISCARD STAGED SLATE</button>
              </div>
            </section>
          ) : (
            <section className="surface-card picks-setup-state">
              <p className="eyebrow">NO FOOTBALL SLATE STAGED</p>
              <h2>Add the first real game.</h2>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
