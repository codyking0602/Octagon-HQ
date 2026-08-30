import { useMemo, type CSSProperties } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { footballLockAllowance } from "./footballPicksScoring";
import { GroupPickProgress } from "./GroupPickProgress";
import { GroupPickReveal } from "./GroupPickReveal";
import { pickBoutLocked, pickProgress, type PickBout } from "./picksModel";
import { usePicks } from "./PicksProvider";
import { pickEventPoster } from "./picksEventAssets";

function atsPercent(wins: number, losses: number) {
  return wins + losses ? `${(wins / (wins + losses) * 100).toFixed(1)}%` : "—";
}

function kickoffLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

function spreadLabel(value: number) {
  if (value === 0) return "PK";
  return value > 0 ? `+${value}` : String(value);
}

function teamSpread(bout: PickBout, slug: string) {
  if (bout.frozenSpreadHome == null || !bout.homeTeamSlug) return "LINE TBD";
  const line = slug === bout.homeTeamSlug ? bout.frozenSpreadHome : -bout.frozenSpreadHome;
  return spreadLabel(line);
}

function teamMark(name: string) {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? `${words[0][0]}${words.at(-1)?.[0] ?? ""}` : name.slice(0, 2);
}

function gameStatus(bout: PickBout, locked: boolean) {
  if (bout.resultStatus === "cancelled") return "CANCELLED";
  if (bout.resultStatus && bout.resultStatus !== "pending") return "FINAL";
  return locked ? "LOCKED" : "OPEN";
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
  const poster = pickEventPoster(event);
  const visualStyle = poster ? ({
    "--picks-event-poster": `url("${poster.src}")`,
    "--picks-event-poster-aspect": poster.aspectRatio,
  } as CSSProperties) : undefined;

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

      {event ? (
        <>
          <section className={`football-picks-hero${poster ? " has-poster" : ""}`} aria-labelledby="football-week-title">
            <div className="football-picks-hero__image" aria-hidden="true" />
            <div className="football-picks-hero__content">
              <p className="eyebrow">FOOTBALL PICKS · WEEKLY ATS</p>
              <h1 id="football-week-title">{event.name}</h1>
              <p>{event.subtitle}</p>
              <div className="football-picks-hero__meta">
                <span>{games.length} GAMES</span><span>NFL + COLLEGE</span><span>LINES FROZEN</span>
              </div>
            </div>
          </section>

          <section className="surface-card football-picks-progress" aria-label={`${progress.completed} of ${progress.total} picks completed`}>
            <div><span>YOUR WEEK</span><strong>{progress.completed} / {progress.total} PICKED{lockAllowance ? ` · LOCKS ${usedLocks} / ${lockAllowance}` : ""}</strong></div>
            <div className="football-picks-progress__track" aria-hidden="true"><span style={{ width: `${percentage}%` }} /></div>
            <p>{identity.profile ? "Picks save automatically. Each game closes at kickoff." : "Sign in to make your weekly picks."}</p>
            {!identity.profile ? <button type="button" className="primary-action" onClick={identity.openDialog}>SIGN IN TO PICK</button> : null}
          </section>

          {identity.profile ? (
            <section className="football-picks-slate" aria-label={`${event.name} football games`}>
              <header><p className="eyebrow">WEEKLY SLATE</p><h2>Pick every game ATS</h2></header>
              {games.map((game) => {
                const selected = picks.selections[game.boutId] ?? null;
                const isLock = picks.footballLocks[game.boutId] === true;
                const locked = pickBoutLocked(event, game);
                const cancelled = game.resultStatus === "cancelled";
                const readOnly = locked || cancelled;
                const lockLimitReached = usedLocks >= lockAllowance && !isLock;
                const kickoff = game.locksAt ?? event.startsAt;
                const choices = [
                  { slug: game.blueFighterSlug, name: game.blueFighterName, side: "AWAY" },
                  { slug: game.redFighterSlug, name: game.redFighterName, side: "HOME" },
                ];
                const selectedName = choices.find((team) => team.slug === selected)?.name ?? null;
                return (
                  <article className={`football-pick-game${locked ? " is-locked" : ""}${isLock ? " is-lock" : ""}`} key={game.boutId}>
                    <header>
                      <div><strong>{game.weightClass.replace(/\s*ATS$/i, "")}</strong><span>{kickoffLabel(kickoff)}</span></div>
                      <b className={`football-pick-game__status is-${gameStatus(game, locked).toLowerCase()}`}>{gameStatus(game, locked)}</b>
                    </header>
                    <div className="football-pick-game__teams">
                      {choices.map((team) => {
                        const isSelected = selected === team.slug;
                        return (
                          <button
                            type="button" key={team.slug} aria-pressed={isSelected}
                            className={isSelected ? "is-selected" : ""}
                            disabled={readOnly || Boolean(picks.savingBoutId)}
                            onClick={() => void picks.setPick(game.boutId, team.slug)}
                          >
                            <span className="football-pick-team-mark" aria-hidden="true">{teamMark(team.name)}</span>
                            <span className="football-pick-team-copy"><small>{team.side}</small><strong>{team.name}</strong></span>
                            <span className="football-pick-line"><small>SPREAD</small><strong>{teamSpread(game, team.slug)}</strong></span>
                            {isSelected ? <em>YOUR PICK</em> : null}
                          </button>
                        );
                      })}
                    </div>
                    {lockAllowance > 0 && !cancelled ? (
                      <div className="football-pick-game__lock">
                        <button
                          type="button"
                          aria-pressed={isLock}
                          aria-label={selectedName ? `${isLock ? "Remove Lock from" : "Make Lock"} ${selectedName}` : "Pick a team before making a Lock"}
                          disabled={readOnly || Boolean(picks.savingBoutId) || !selected || lockLimitReached}
                          onClick={() => void picks.setFootballLock(game.boutId, !isLock)}
                        >{isLock ? "★ LOCK" : "★ MAKE LOCK"}</button>
                        <span>{!selected ? "PICK A TEAM FIRST" : lockLimitReached ? "LOCK LIMIT REACHED" : isLock ? "3 PTS FOR ATS WIN · TAP TO REMOVE" : "3 PTS FOR ATS WIN"}</span>
                      </div>
                    ) : null}
                    <footer><span>{locked ? "KICKED OFF · PICK LOCKED" : `LOCKS ${kickoffLabel(kickoff)}`}</span>{picks.savingBoutId === game.boutId ? <strong role="status">SAVING…</strong> : null}</footer>
                    {locked ? <GroupPickReveal redFighterSlug={game.redFighterSlug} redFighterName={game.redFighterName} blueFighterSlug={game.blueFighterSlug} blueFighterName={game.blueFighterName} picks={game.groupPicks ?? []} /> : null}
                  </article>
                );
              })}
            </section>
          ) : null}

          {identity.profile ? <div className="football-picks-group"><GroupPickProgress event={event} locked={event.status !== "upcoming"} mySelections={picks.selections} /></div> : null}
          {identity.profile ? (
            <section className="surface-card football-picks-standings" aria-labelledby="football-championship-title">
              <header><p className="eyebrow">OPENING WEEK → SUPER BOWL</p><h2 id="football-championship-title">Championship standings</h2></header>
              <p>Points after each player’s automatic lowest-week drop. ATS record is supporting context.</p>
              <div role="table" aria-label="Football championship standings">
                <div role="row"><span>RK</span><span>PLAYER</span><span>PTS</span><span>ATS</span><span>DROP</span></div>
                {(picks.history.seasonStandings ?? []).map((standing) => (
                  <div role="row" key={standing.profileId ?? standing.displayName} className={standing.isCurrentUser ? "is-current" : ""}>
                    <strong>{standing.rank}</strong><span>{standing.displayName}</span><b>{standing.adjustedPoints ?? standing.totalPoints}</b>
                    <span>{standing.correct}-{standing.incorrect}{standing.pushes ? `-${standing.pushes}` : ""} <small>{atsPercent(standing.correct, standing.incorrect)}</small></span>
                    <span>{standing.droppedWeekLabel ?? "—"}</span>
                  </div>
                ))}
                {!(picks.history.seasonStandings?.length) ? <p>Standings post after the first graded Football week.</p> : null}
              </div>
            </section>
          ) : null}
          {picks.error ? <p className="picks-error" role="status">{picks.error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
