import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import { FootballFuturesCard } from "./FootballFuturesCard";
import { FootballMatchupBreakdowns } from "./FootballMatchupBreakdowns";
import { FOOTBALL_FUTURES_MAX_POINTS, FOOTBALL_FUTURES_RULES, footballLockAllowance, gradeFootballAts, type AtsOutcome } from "./footballPicksScoring";
import { footballMatchupBreakdownsForEvent } from "./footballMatchupBreakdowns";
import { footballDateTimeLabel } from "./footballTime";
import { GroupPickProgress } from "./GroupPickProgress";
import { GroupPickReveal } from "./GroupPickReveal";
import { pickBoutLocked, pickProgress, type PickBout } from "./picksModel";
import { PicksSeasonHub } from "./PicksSeasonHub";
import { usePicks } from "./PicksProvider";
import { pickEventPosters } from "./picksEventAssets";

function gameLineLabel(bout: PickBout) {
  const spread = bout.frozenSpreadHome;
  if (spread == null) return "LINE TBD";
  if (spread === 0) return "PICK’EM";
  const favorite = spread < 0 ? bout.redFighterName : bout.blueFighterName;
  return `${favorite} -${Math.abs(spread)}`;
}

function spreadSourceLabel(value: string) {
  if (value.toLowerCase() === "the-odds-api") return "THE ODDS API";
  return value.replace(/[-_]+/g, " ").toUpperCase();
}

function leagueLabel(weightClass: string) {
  const value = weightClass.replace(/\s*ATS$/i, "").toUpperCase();
  return value.includes("COLLEGE") || value === "CFB" ? "CFB" : "NFL";
}

function gameStatus(bout: PickBout, locked: boolean) {
  if (bout.resultStatus === "cancelled") return "CANCELLED";
  if (bout.resultStatus && bout.resultStatus !== "pending") return "FINAL";
  return locked ? "LOCKED" : "OPEN";
}

function atsOutcomeLabel(outcome: AtsOutcome) {
  if (outcome === "win") return "✓ COVERED";
  if (outcome === "loss") return "✕ MISSED";
  if (outcome === "push") return "PUSH";
  return null;
}

function TeamLogo({ logoUrl }: { logoUrl?: string | null }) {
  return (
    <span className={`football-pick-team-mark${logoUrl ? "" : " is-empty"}`} aria-hidden="true">
      {logoUrl ? <img src={logoUrl} alt="" loading="lazy" onError={(event) => event.currentTarget.remove()} /> : null}
    </span>
  );
}

export default function FootballPicksPage() {
  const identity = useIdentity();
  const picks = usePicks();
  const event = picks.event?.sport === "football" ? picks.event : null;
  const games = useMemo(() => event?.bouts
    .filter((game) => game.includedInPicks !== false)
    .slice()
    .sort((a, b) => Date.parse(a.locksAt ?? event.startsAt) - Date.parse(b.locksAt ?? event.startsAt)) ?? [], [event]);
  const progress = pickProgress(event, picks.selections);
  const percentage = progress.total ? Math.round(progress.completed / progress.total * 100) : 0;
  const lockGameCount = games.filter((game) => game.resultStatus !== "cancelled").length;
  const lockAllowance = footballLockAllowance(lockGameCount);
  const usedLocks = games.filter((game) => game.resultStatus !== "cancelled" && picks.footballLocks[game.boutId] === true).length;
  const liveAts = useMemo(() => {
    const outcomes: Record<string, AtsOutcome> = {};
    let wins = 0;
    let losses = 0;
    let pushes = 0;

    for (const game of games) {
      const selected = picks.selections[game.boutId] ?? null;
      const pickedTeam = selected === game.redFighterSlug ? "home" : selected === game.blueFighterSlug ? "away" : null;
      if (!pickedTeam || game.frozenSpreadHome == null) continue;
      const grade = gradeFootballAts({
        pickedTeam,
        homeScore: game.homeFinalScore ?? null,
        awayScore: game.awayFinalScore ?? null,
        frozenSpreadHome: game.frozenSpreadHome,
        isFinal: game.resultStatus !== "pending" && game.resultStatus !== "cancelled",
        isCancelled: game.resultStatus === "cancelled",
        isLock: picks.footballLocks[game.boutId] === true,
      });
      outcomes[game.boutId] = grade.outcome;
      if (grade.outcome === "win") wins += 1;
      if (grade.outcome === "loss") losses += 1;
      if (grade.outcome === "push") pushes += 1;
    }

    return { outcomes, wins, losses, pushes, settled: wins + losses + pushes };
  }, [games, picks.selections, picks.footballLocks]);
  const futuresLocked = picks.footballFutures?.locked === true;
  const posters = useMemo(() => pickEventPosters(event), [event]);
  const matchupBreakdowns = useMemo(() => footballMatchupBreakdownsForEvent(event), [event]);
  const poster = posters[0] ?? null;
  const [activePosterIndex, setActivePosterIndex] = useState(0);
  const spreadSources = Array.from(new Set(games
    .map((game) => game.spreadSource?.trim())
    .filter((source): source is string => Boolean(source))));
  const spreadProvider = spreadSources.length === 1
    ? spreadSourceLabel(spreadSources[0])
    : spreadSources.length > 1 ? "MULTIPLE SOURCES" : "SOURCE TBD";
  const spreadFrozenAt = games.reduce<string | null>((latest, game) => {
    const value = game.spreadFrozenAt;
    if (!value || !Number.isFinite(Date.parse(value))) return latest;
    return !latest || Date.parse(value) > Date.parse(latest) ? value : latest;
  }, null);

  useEffect(() => {
    setActivePosterIndex(0);
  }, [event?.eventId, event?.headerStoragePath]);

  useEffect(() => {
    if (posters.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setActivePosterIndex((index) => (index + 1) % posters.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [posters.length]);

  const visualStyle = poster ? ({
    "--picks-event-poster": `url("${poster.src}")`,
    "--picks-event-poster-aspect": poster.aspectRatio,
  } as CSSProperties) : undefined;
  const seasonHub = picks.history.events.length ? (
    <PicksSeasonHub history={picks.history} loading={picks.loading} sport="football" />
  ) : null;

  return (
    <div className={`page football-picks-page${poster ? " has-event-atmosphere" : ""}`} style={visualStyle}>
      {picks.loading && !event ? <section className="surface-card football-picks-state">Loading this week’s slate…</section> : null}
      {!picks.loading && !event ? (
        <section className="surface-card football-picks-state">
          <p className="eyebrow">FOOTBALL PICKS</p>
          <h1>This week’s slate is being set.</h1>
          <p>{picks.error || "Check back when the frozen ATS lines are published."}</p>
        </section>
      ) : null}
      {!event ? seasonHub : null}
      {!event && identity.profile ? <FootballFuturesCard /> : null}

      {event ? (
        <>
          <section className={`football-picks-hero${poster ? " has-poster" : ""}`} aria-label={`${event.name} event artwork`}>
            {posters.map((image, index) => (
              <div
                key={image.src}
                className={`football-picks-hero__image${index === activePosterIndex ? " is-active" : ""}`}
                style={{ backgroundImage: `url("${image.src}")` }}
                aria-hidden="true"
              />
            ))}
          </section>

          {matchupBreakdowns.length || event.canControl ? (
            <div className="football-picks-owner-tools">
              <FootballMatchupBreakdowns breakdowns={matchupBreakdowns} />
              {event.canControl ? (
                <Link
                  className="picks-control-entry"
                  to={`/picks/control?sport=football&event=${encodeURIComponent(event.eventId)}#header`}
                >
                  <span aria-hidden="true">⚙</span> MANAGE EVENT / HEADERS
                </Link>
              ) : null}
            </div>
          ) : null}

          <section className="surface-card football-picks-progress" aria-label={`${progress.completed} of ${progress.total} picks completed`}>
            <div><span>YOUR WEEK</span><strong>{progress.completed} / {progress.total} PICKED{lockAllowance ? ` · LOCKS ${usedLocks} / ${lockAllowance}` : ""}</strong></div>
            {liveAts.settled ? <p><b>LIVE ATS</b> {liveAts.wins}-{liveAts.losses}{liveAts.pushes ? ` · ${liveAts.pushes} PUSH${liveAts.pushes === 1 ? "" : "ES"}` : ""} · {liveAts.settled} FINAL</p> : null}
            <div className="football-picks-progress__track" aria-hidden="true"><span style={{ width: `${percentage}%` }} /></div>
            {!identity.profile ? <p>Sign in to make your weekly picks.</p> : null}
            {!identity.profile ? <button type="button" className="primary-action" onClick={identity.openDialog}>SIGN IN TO PICK</button> : null}
          </section>

          <details className="surface-card football-picks-grading">
            <summary><span>SCORING &amp; GRADING</span><strong>HOW IT WORKS</strong></summary>
            <div>
              <p><b>ATS win</b> 1 point · <b>Lock win</b> 3 points total · <b>Push</b> 0.5 · <b>Loss</b> 0.</p>
              <p>Lines are frozen when the slate is published and every result grades against that frozen line. {lockAllowance ? `This slate allows ${lockAllowance} Locks.` : "Locks unlock on larger slates."} Your lowest-scoring week is dropped from the championship total.</p>
              <p><b>Season Futures</b> {FOOTBALL_FUTURES_MAX_POINTS.total} points total · CFB {FOOTBALL_FUTURES_MAX_POINTS.cfb} · NFL {FOOTBALL_FUTURES_MAX_POINTS.nfl}.</p>
              <p><b>CFB:</b> Power 4 champions {FOOTBALL_FUTURES_RULES.cfb.power4Champions.pointsEach} each · CFP teams {FOOTBALL_FUTURES_RULES.cfb.playoffTeams.pointsEach} each · semifinalists {FOOTBALL_FUTURES_RULES.cfb.semifinalists.pointsEach} each · Heisman {FOOTBALL_FUTURES_RULES.cfb.heisman.pointsEach} · national champion {FOOTBALL_FUTURES_RULES.cfb.nationalChampion.pointsEach}.</p>
              <p><b>NFL:</b> division champions {FOOTBALL_FUTURES_RULES.nfl.divisionChampions.pointsEach} each · playoff teams {FOOTBALL_FUTURES_RULES.nfl.playoffTeams.pointsEach} each · conference title teams {FOOTBALL_FUTURES_RULES.nfl.conferenceChampionshipTeams.pointsEach} each · MVP {FOOTBALL_FUTURES_RULES.nfl.mvp.pointsEach} · Super Bowl champion {FOOTBALL_FUTURES_RULES.nfl.superBowlChampion.pointsEach}.</p>
              <p>Futures stay private until the listed lock time. Champions must also appear in the playoff rounds you picked.</p>
            </div>
          </details>

          <p className="football-picks-provenance">
            ATS ODDS · {spreadProvider}{spreadFrozenAt ? ` · FROZEN ${footballDateTimeLabel(spreadFrozenAt, false)}` : ""}
          </p>

          {identity.profile && !futuresLocked ? <FootballFuturesCard /> : null}

          {identity.profile ? (
            <section className="football-picks-slate" aria-label={`${event.name} football games`}>
              <header><p className="eyebrow">WEEKLY SLATE · ALL TIMES CT</p><h2>Pick every game against the spread (ATS)</h2></header>
              {games.map((game) => {
                const selected = picks.selections[game.boutId] ?? null;
                const isLock = picks.footballLocks[game.boutId] === true;
                const locked = pickBoutLocked(event, game);
                const cancelled = game.resultStatus === "cancelled";
                const readOnly = locked || cancelled;
                const lockLimitReached = usedLocks >= lockAllowance && !isLock;
                const kickoff = game.locksAt ?? event.startsAt;
                const away = { slug: game.blueFighterSlug, name: game.blueFighterName, side: "AWAY", logoUrl: game.awayTeamLogoUrl };
                const home = { slug: game.redFighterSlug, name: game.redFighterName, side: "HOME", logoUrl: game.homeTeamLogoUrl };
                const selectedName = selected === away.slug ? away.name : selected === home.slug ? home.name : null;
                const outcome = liveAts.outcomes[game.boutId] ?? "unresolved";
                const resultLabel = atsOutcomeLabel(outcome);
                const statusLabel = resultLabel ?? gameStatus(game, locked);
                const statusClass = resultLabel ? `is-${outcome}` : `is-${gameStatus(game, locked).toLowerCase()}`;
                const hasFinalScore = game.homeFinalScore != null && game.awayFinalScore != null && game.resultStatus !== "pending";
                return (
                  <article className={`football-pick-game${locked ? " is-locked" : ""}${isLock ? " is-lock" : ""}`} key={game.boutId}>
                    <header>
                      <strong>{leagueLabel(game.weightClass)}</strong>
                      <b className={`football-pick-game__status ${statusClass}`}>{statusLabel}</b>
                    </header>
                    <div className="football-pick-game__matchup">
                      {[away, home].map((team) => {
                        const isSelected = selected === team.slug;
                        return (
                          <button
                            type="button"
                            key={team.slug}
                            aria-pressed={isSelected}
                            aria-label={`${team.name} ${team.side}`}
                            className={`football-pick-team is-${team.side.toLowerCase()}${isSelected ? " is-selected" : ""}`}
                            disabled={readOnly || Boolean(picks.savingBoutId)}
                            onClick={() => void picks.setPick(game.boutId, team.slug)}
                          >
                            <TeamLogo logoUrl={team.logoUrl} />
                            <span className="football-pick-team-copy"><strong>{team.name}</strong><small>{isSelected ? "✓ YOUR PICK" : team.side}</small></span>
                          </button>
                        );
                      })}
                      <div className="football-pick-game__line" aria-label={`Frozen ATS line ${gameLineLabel(game)}`}>
                        <small>FROZEN LINE</small><strong>{gameLineLabel(game)}</strong>
                      </div>
                    </div>
                    <footer>
                      <span>{hasFinalScore ? `FINAL · ${away.name} ${game.awayFinalScore}, ${home.name} ${game.homeFinalScore}` : locked ? "KICKED OFF · PICK LOCKED" : footballDateTimeLabel(kickoff)}</span>
                      {lockAllowance > 0 && !cancelled ? (
                        <button
                          type="button"
                          className="football-pick-game__lock"
                          aria-pressed={isLock}
                          aria-label={selectedName ? `${isLock ? "Remove Lock from" : "Make Lock"} ${selectedName}` : "Pick a team before making a Lock"}
                          disabled={readOnly || Boolean(picks.savingBoutId) || !selected || lockLimitReached}
                          onClick={() => void picks.setFootballLock(game.boutId, !isLock)}
                        >{isLock ? "★ LOCK" : "☆ LOCK"}</button>
                      ) : null}
                      {picks.savingBoutId === game.boutId ? <strong role="status">SAVING…</strong> : null}
                    </footer>
                    {locked ? <GroupPickReveal redFighterSlug={game.redFighterSlug} redFighterName={game.redFighterName} blueFighterSlug={game.blueFighterSlug} blueFighterName={game.blueFighterName} picks={game.groupPicks ?? []} /> : null}
                  </article>
                );
              })}
            </section>
          ) : null}

          {identity.profile && futuresLocked ? <FootballFuturesCard /> : null}

          {identity.profile ? <div className="football-picks-group"><GroupPickProgress event={event} locked={event.status !== "upcoming"} mySelections={picks.selections} /></div> : null}
          {seasonHub}
          {picks.error ? <p className="picks-error" role="status">{picks.error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
