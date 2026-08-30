import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/football-picks-setup.css";
import { useIdentity } from "../identity/IdentityProvider";
import type { PickSetupDraft, PickSetupFootballWeekGame, PickSetupFootballWeekPreview } from "./pickSetupModel";
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

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function defaultFootballSetupWeek(date = new Date()) {
  const cursor = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = cursor.getUTCDay();
  const offset = day === 0 ? 2 : day === 1 ? 1 : -(day - 2);
  cursor.setUTCDate(cursor.getUTCDate() + offset);
  return isoDate(cursor);
}

function shiftWeek(weekStart: string, amount: number) {
  const date = new Date(`${weekStart}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount * 7);
  return isoDate(date);
}

function weekLabel(preview: PickSetupFootballWeekPreview) {
  const start = new Date(`${preview.weekStart}T12:00:00.000Z`);
  const end = new Date(`${preview.weekEnd}T12:00:00.000Z`);
  const startLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(start);
  const endLabel = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(end);
  return `${startLabel}–${endLabel}`;
}

function rankedTeam(name: string, rank: number | null) {
  return rank ? `#${rank} ${name}` : name;
}

function previewMatchup(game: PickSetupFootballWeekGame) {
  return `${rankedTeam(game.awayTeamName, game.awayRank)} @ ${rankedTeam(game.homeTeamName, game.homeRank)}`;
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
  const [selectedWeek, setSelectedWeek] = useState(() => defaultFootballSetupWeek());
  const [weekPreview, setWeekPreview] = useState<PickSetupFootballWeekPreview | null>(null);
  const [selectedCollegeIds, setSelectedCollegeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  const loadWeekPreview = useCallback(async (weekStart: string) => {
    if (!repository?.previewFootballWeek) return;
    setPreviewLoading(true);
    setError("");
    try {
      const preview = await repository.previewFootballWeek(weekStart);
      setWeekPreview(preview);
      setSelectedCollegeIds([]);
    } catch (nextError) {
      setWeekPreview(null);
      setError(readableError(nextError));
    } finally {
      setPreviewLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    if (!identity.ready) return;
    if (!identity.profile || !repository) {
      setLoading(false);
      return;
    }
    void loadDraft();
  }, [identity.profile, identity.ready, loadDraft, repository]);

  useEffect(() => {
    if (!identity.profile || loading || draft || !repository?.previewFootballWeek) return;
    void loadWeekPreview(selectedWeek);
  }, [draft, identity.profile, loadWeekPreview, loading, repository, selectedWeek]);

  const games = useMemo(() => draft?.bouts.slice().sort((a, b) => a.position - b.position) ?? [], [draft]);
  const selectedCollege = useMemo(() => new Set(selectedCollegeIds), [selectedCollegeIds]);
  const requiredCollegeCount = weekPreview?.requiredCollegeCount ?? 0;
  const stageReady = Boolean(
    weekPreview
    && repository?.stageFootballWeek
    && selectedCollegeIds.length === requiredCollegeCount
    && weekPreview.nflGames.length + selectedCollegeIds.length > 0
  );

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

  function moveWeek(amount: number) {
    if (busy || previewLoading) return;
    setWeekPreview(null);
    setSelectedCollegeIds([]);
    setSelectedWeek((current) => shiftWeek(current, amount));
  }

  function toggleCollegeGame(eventId: string) {
    if (!weekPreview || busy) return;
    setSelectedCollegeIds((current) => {
      if (current.includes(eventId)) return current.filter((value) => value !== eventId);
      if (current.length >= weekPreview.requiredCollegeCount) return current;
      return [...current, eventId];
    });
  }

  function stageWeek() {
    if (!weekPreview || !repository?.stageFootballWeek || !stageReady) return;
    void runAction("stage-week", () => repository.stageFootballWeek!(weekPreview.weekStart, selectedCollegeIds));
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
        <p>Pick the Tuesday–Monday week. Every NFL game is automatic. Choose the college slate, stage once, then review the real ATS lines before publishing.</p>
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
          {!draft ? (
            <section className="surface-card football-week-builder" aria-label="Football weekly builder">
              <div className="football-week-builder__heading">
                <div>
                  <p className="eyebrow">AUTO-STAGE WEEK</p>
                  <h2>{weekPreview ? weekLabel(weekPreview) : "Choose week"}</h2>
                  <p>NFL is automatic. College candidates are ranked from the real ESPN week; ATS lines still come only from The Odds API when you stage.</p>
                </div>
                <div className="football-week-builder__nav" aria-label="Football setup week">
                  <button type="button" disabled={Boolean(busy) || previewLoading} onClick={() => moveWeek(-1)}>←</button>
                  <button type="button" disabled={Boolean(busy) || previewLoading} onClick={() => moveWeek(1)}>→</button>
                </div>
              </div>

              {previewLoading ? <strong>Loading real Football week…</strong> : null}

              {weekPreview && !previewLoading ? (
                <>
                  <div className="football-week-builder__section">
                    <div className="football-week-builder__section-heading">
                      <div><p className="eyebrow">NFL · AUTOMATIC</p><h3>Every game is in.</h3></div>
                      <strong>{weekPreview.nflGames.length}/{weekPreview.nflGames.length}</strong>
                    </div>
                    <div className="football-week-games">
                      {weekPreview.nflGames.map((game) => (
                        <article className="football-week-game is-automatic" key={game.espnEventId}>
                          <strong>{previewMatchup(game)}</strong>
                          <small>{displayTime(game.kickoffAt)}</small>
                        </article>
                      ))}
                      {!weekPreview.nflGames.length ? <p>No NFL games this Tuesday–Monday week.</p> : null}
                    </div>
                  </div>

                  <div className="football-week-builder__section">
                    <div className="football-week-builder__section-heading">
                      <div><p className="eyebrow">COLLEGE · CHOOSE {requiredCollegeCount}</p><h3>Ranked candidate pool</h3></div>
                      <strong>{selectedCollegeIds.length}/{requiredCollegeCount}</strong>
                    </div>
                    <div className="football-week-candidates">
                      {weekPreview.collegeCandidates.map((game) => {
                        const selected = selectedCollege.has(game.espnEventId);
                        return (
                          <button
                            className={selected ? "football-week-candidate is-selected" : "football-week-candidate"}
                            type="button"
                            aria-pressed={selected}
                            disabled={Boolean(busy)}
                            key={game.espnEventId}
                            onClick={() => toggleCollegeGame(game.espnEventId)}
                          >
                            <span>#{game.candidateRank}</span>
                            <strong>{previewMatchup(game)}</strong>
                            <small>{displayTime(game.kickoffAt)}</small>
                          </button>
                        );
                      })}
                      {!weekPreview.collegeCandidates.length ? <p>No college candidates found for this week.</p> : null}
                    </div>
                  </div>

                  <button className="primary-action" type="button" disabled={Boolean(busy) || !stageReady} onClick={stageWeek}>
                    {busy === "stage-week" ? "STAGING WEEK…" : `STAGE ${weekPreview.nflGames.length + requiredCollegeCount}-GAME SLATE`}
                  </button>
                  <small className="football-week-builder__note">One stage action loads the selected games through the existing Football sync owner. Spreads do not freeze until publication.</small>
                </>
              ) : null}
            </section>
          ) : (
            <section className="picks-setup-review" aria-label="Football slate review">
              <div className="surface-card picks-setup-state">
                <p className="eyebrow">STAGED WEEKLY SLATE</p>
                <h2>{draft.name}</h2>
                <p>{games.length} game{games.length === 1 ? "" : "s"} · {draft.league === "mixed" ? "NFL + College Football" : draft.league?.toUpperCase()}</p>
                <small>First kickoff: {displayTime(draft.startsAt)} · ATS spreads are not frozen yet.</small>
              </div>

              {games.map((game) => (
                <article className="surface-card pick-setup-bout" key={game.boutId}>
                  <div className="pick-setup-bout__heading">
                    <div><span>{gameLeague(game.weightClass)}</span><small>{displayTime(game.kickoffAt)}</small></div>
                  </div>
                  <h3>{game.blueFighterName} <span aria-hidden="true">@</span> {game.redFighterName}</h3>
                  <p><strong>HOME ATS:</strong> {displaySpread(game.spreadHome)}</p>
                  <p><strong>SOURCE:</strong> {game.spreadSource ?? "NOT SET"} · updated {displayTime(game.spreadUpdatedAt)}</p>
                </article>
              ))}

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
          )}
        </>
      ) : null}
    </div>
  );
}
