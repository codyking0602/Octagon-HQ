import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shareCanonicalDestination } from "../../app/nativeShare";
import { gradeFootballAts } from "./footballPicksScoring";
import {
  groupRankLabel,
  pickWinPercentage,
  type PickGroupPick,
  type PickHistoryBout,
  type PickHistoryEvent,
} from "./picksModel";

interface GameAnalysis {
  game: PickHistoryBout;
  league: "NFL" | "CFB";
  submitted: PickGroupPick[];
  coveredSlug: string | null;
  correct: PickGroupPick[];
  correctPercentage: number;
  underdogSlug: string | null;
  underdogSpread: number | null;
}

interface WeekAward {
  label: "BEST CALL" | "ROOM TRAP" | "CONSENSUS CASH" | "BIGGEST DOG HIT";
  title: string;
  detail: string;
}

function completedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function leagueLabel(weightClass: string): "NFL" | "CFB" {
  const value = weightClass.replace(/\s*ATS$/i, "").toUpperCase();
  return value.includes("COLLEGE") || value === "CFB" ? "CFB" : "NFL";
}

function homeSlug(game: PickHistoryBout) {
  return game.homeTeamSlug ?? game.redFighterSlug;
}

function awaySlug(game: PickHistoryBout) {
  return game.awayTeamSlug ?? game.blueFighterSlug;
}

function teamName(game: PickHistoryBout, slug: string | null) {
  if (!slug) return "No pick";
  if (slug === homeSlug(game)) return game.redFighterName;
  if (slug === awaySlug(game)) return game.blueFighterName;
  return "Unknown team";
}

function signedLine(value: number) {
  if (value === 0) return "PK";
  return value > 0 ? `+${value}` : `${value}`;
}

function frozenLineLabel(game: PickHistoryBout) {
  if (game.frozenSpreadHome == null) return "LINE NOT AVAILABLE";
  if (game.frozenSpreadHome === 0) return "PICK’EM";
  const home = game.frozenSpreadHome;
  const favorite = home < 0 ? game.redFighterName : game.blueFighterName;
  return `${favorite} -${Math.abs(home)}`;
}

function finalScoreLabel(game: PickHistoryBout) {
  if (game.homeFinalScore == null || game.awayFinalScore == null) return "FINAL SCORE NOT AVAILABLE";
  return `${game.blueFighterName} ${game.awayFinalScore}, ${game.redFighterName} ${game.homeFinalScore}`;
}

function verdictLabel(game: PickHistoryBout) {
  if (game.includedInPicks === false || game.verdict === "excluded") return "Excluded";
  if (game.verdict === "correct") return "Covered";
  if (game.verdict === "incorrect") return "Missed";
  if (game.verdict === "push") return "Push";
  if (game.verdict === "missing") return "No pick";
  return "Pending";
}

function joinNames(names: readonly string[]) {
  if (!names.length) return "Nobody";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}

function gameAnalysis(game: PickHistoryBout): GameAnalysis | null {
  if (
    game.includedInPicks === false
    || game.resultStatus === "cancelled"
    || game.frozenSpreadHome == null
    || game.homeFinalScore == null
    || game.awayFinalScore == null
  ) return null;

  const home = homeSlug(game);
  const away = awaySlug(game);
  const homeGrade = gradeFootballAts({
    pickedTeam: "home",
    homeScore: game.homeFinalScore,
    awayScore: game.awayFinalScore,
    frozenSpreadHome: game.frozenSpreadHome,
    isFinal: true,
  });
  const coveredSlug = homeGrade.outcome === "win"
    ? home
    : homeGrade.outcome === "loss" ? away : null;
  const submitted = (game.groupPicks ?? []).filter((pick) => (
    pick.pickedFighterSlug === home || pick.pickedFighterSlug === away
  ));
  const correct = coveredSlug
    ? submitted.filter((pick) => pick.pickedFighterSlug === coveredSlug)
    : [];
  const correctPercentage = submitted.length && coveredSlug
    ? (correct.length / submitted.length) * 100
    : 0;
  const underdogSlug = game.frozenSpreadHome > 0
    ? home
    : game.frozenSpreadHome < 0 ? away : null;
  const underdogSpread = game.frozenSpreadHome > 0
    ? game.frozenSpreadHome
    : game.frozenSpreadHome < 0 ? Math.abs(game.frozenSpreadHome) : null;

  return {
    game,
    league: leagueLabel(game.weightClass),
    submitted,
    coveredSlug,
    correct,
    correctPercentage,
    underdogSlug,
    underdogSpread,
  };
}

function accuracyLabel(correct: number, incorrect: number) {
  const decided = correct + incorrect;
  return decided ? `${Math.round((correct / decided) * 100)}%` : "—";
}

function groupPickLabel(game: PickHistoryBout, pick: PickGroupPick) {
  return `${pick.displayName}${pick.isCurrentUser ? " (YOU)" : ""} — ${teamName(game, pick.pickedFighterSlug)}`;
}

export function FootballWeekRecap({
  event,
  requestedOpen = false,
}: {
  event: PickHistoryEvent;
  requestedOpen?: boolean;
}) {
  const [open, setOpen] = useState(requestedOpen);
  const [shareLabel, setShareLabel] = useState("SHARE");
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLElement | null>(null);

  const recap = useMemo(() => {
    const games = event.bouts.slice().sort((left, right) => left.position - right.position);
    const analyses = games.map(gameAnalysis).filter((value): value is GameAnalysis => Boolean(value));
    const standings = event.groupResults.slice().sort((left, right) => (
      left.rank - right.rank || right.totalPoints - left.totalPoints || left.displayName.localeCompare(right.displayName)
    ));
    const winningPoints = standings.reduce((high, result) => Math.max(high, result.totalPoints), 0);
    const champions = standings.filter((result) => result.totalPoints === winningPoints);
    const current = standings.find((result) => result.isCurrentUser) ?? null;
    const correctPicks = standings.reduce((total, result) => total + result.correct, 0);
    const incorrectPicks = standings.reduce((total, result) => total + result.incorrect, 0);
    const groupAccuracy = accuracyLabel(correctPicks, incorrectPicks);

    const leagueSplits = (["NFL", "CFB"] as const).map((league) => {
      const rows = analyses.filter((analysis) => analysis.league === league && analysis.coveredSlug);
      const submitted = rows.reduce((total, analysis) => total + analysis.submitted.length, 0);
      const correct = rows.reduce((total, analysis) => total + analysis.correct.length, 0);
      return { league, submitted, correct, accuracy: submitted ? Math.round((correct / submitted) * 100) : null };
    }).filter((split) => split.submitted > 0);

    const bestCall = analyses
      .filter((analysis) => analysis.coveredSlug && analysis.correct.length > 0)
      .slice()
      .sort((left, right) => (
        left.correctPercentage - right.correctPercentage
        || right.submitted.length - left.submitted.length
        || left.game.position - right.game.position
      ))[0] ?? null;
    const roomTrap = analyses
      .filter((analysis) => analysis.coveredSlug && analysis.submitted.length > 0 && analysis.correctPercentage < 50)
      .slice()
      .sort((left, right) => (
        left.correctPercentage - right.correctPercentage
        || right.submitted.length - left.submitted.length
        || left.game.position - right.game.position
      ))[0] ?? null;
    const consensusCash = analyses
      .filter((analysis) => analysis.coveredSlug && analysis.correctPercentage >= 75)
      .slice()
      .sort((left, right) => (
        right.correctPercentage - left.correctPercentage
        || right.submitted.length - left.submitted.length
        || left.game.position - right.game.position
      ))[0] ?? null;
    const biggestDogHit = analyses
      .filter((analysis) => (
        analysis.underdogSlug
        && analysis.coveredSlug === analysis.underdogSlug
        && analysis.submitted.some((pick) => pick.pickedFighterSlug === analysis.underdogSlug)
      ))
      .slice()
      .sort((left, right) => (
        (right.underdogSpread ?? 0) - (left.underdogSpread ?? 0)
        || left.game.position - right.game.position
      ))[0] ?? null;

    const awards: WeekAward[] = [];
    if (bestCall?.coveredSlug) {
      awards.push({
        label: "BEST CALL",
        title: teamName(bestCall.game, bestCall.coveredSlug),
        detail: `${joinNames(bestCall.correct.map((pick) => pick.displayName))} hit it · ${bestCall.correct.length}/${bestCall.submitted.length} on the covering side`,
      });
    }
    if (roomTrap?.coveredSlug) {
      awards.push({
        label: "ROOM TRAP",
        title: `${roomTrap.game.blueFighterName} at ${roomTrap.game.redFighterName}`,
        detail: roomTrap.correct.length
          ? `Only ${roomTrap.correct.length}/${roomTrap.submitted.length} had ${teamName(roomTrap.game, roomTrap.coveredSlug)}`
          : `Nobody had ${teamName(roomTrap.game, roomTrap.coveredSlug)}`,
      });
    }
    if (consensusCash?.coveredSlug) {
      awards.push({
        label: "CONSENSUS CASH",
        title: teamName(consensusCash.game, consensusCash.coveredSlug),
        detail: `${consensusCash.correct.length}/${consensusCash.submitted.length} covered · ${Math.round(consensusCash.correctPercentage)}%`,
      });
    }
    if (biggestDogHit?.underdogSlug && biggestDogHit.underdogSpread != null) {
      const dogBackers = biggestDogHit.submitted.filter((pick) => pick.pickedFighterSlug === biggestDogHit.underdogSlug);
      awards.push({
        label: "BIGGEST DOG HIT",
        title: `${teamName(biggestDogHit.game, biggestDogHit.underdogSlug)} +${biggestDogHit.underdogSpread}`,
        detail: `${joinNames(dogBackers.map((pick) => pick.displayName))} backed the dog`,
      });
    }

    return {
      games,
      analyses,
      standings,
      winningPoints,
      champions,
      current,
      correctPicks,
      incorrectPicks,
      groupAccuracy,
      leagueSplits,
      awards,
    };
  }, [event]);

  useEffect(() => {
    setOpen(requestedOpen);
  }, [event.eventId, requestedOpen]);

  useEffect(() => {
    if (!open) return undefined;
    document.documentElement.classList.add("picks-recap-open");
    document.body.classList.add("picks-recap-open");
    const frame = window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0 });
      closeRef.current?.focus();
    });
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("picks-recap-open");
      document.body.classList.remove("picks-recap-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const championNames = recap.champions.map((result) => result.displayName);
  const championLabel = recap.champions.length > 1 ? "CO-CHAMPIONS" : "WEEK CHAMPION";
  const championCopy = joinNames(championNames);
  const userFinish = recap.current
    ? groupRankLabel(recap.current.rank, event.groupResults)
    : null;

  async function shareRecap() {
    setShareLabel("PREPARING…");
    const copy = [
      `${event.name} recap — ${championLabel}: ${championCopy} with ${recap.winningPoints} points.`,
      `Room ATS: ${recap.correctPicks}-${recap.incorrectPicks} (${recap.groupAccuracy}).`,
      "View the week recap in Octagon HQ:",
    ].join("\n");
    const outcome = await shareCanonicalDestination({
      destination: { kind: "picks-recap", eventId: event.eventId, sport: "football" },
      title: `${event.name} recap · Octagon HQ`,
      text: copy,
      fallbackText: copy,
    });
    setShareLabel(outcome === "copied" ? "COPIED" : outcome === "unavailable" ? "TRY AGAIN" : "SHARE");
  }

  const overlay = open ? (
    <div
      className="picks-event-recap-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${event.name} Week Recap`}
      data-pull-refresh-ignore
    >
      <div className="picks-event-recap">
        <header className="picks-event-recap__header">
          <button ref={closeRef} type="button" aria-label="Close week recap" onClick={() => setOpen(false)}>×</button>
          <span>WEEK RECAP</span>
          <button type="button" disabled={shareLabel === "PREPARING…"} onClick={() => void shareRecap()}>{shareLabel}</button>
        </header>

        <main ref={scrollRef} className="picks-event-recap__scroll" data-testid="football-week-recap-scroll">
          <section className="picks-event-recap__hero">
            <div className="picks-event-recap__hero-copy">
              <span>FINAL RESULTS</span>
              <h2 id={titleId}>{event.name}</h2>
              {event.subtitle ? <strong>{event.subtitle}</strong> : null}
              <p>{completedDate(event.completedAt)}</p>
              <div className="picks-event-recap__champion">
                <div><span>{championLabel}</span><strong>{championCopy}</strong></div>
                <b>{recap.winningPoints}<small>PTS</small></b>
              </div>
              <div className="picks-event-recap__quickline" aria-label="Week recap totals">
                <span>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</span>
                <span>{recap.groupAccuracy} GROUP ATS</span>
                {recap.current ? (
                  <span>YOU: {userFinish} · {recap.current.correct}-{recap.current.incorrect} · {recap.current.totalPoints} PTS</span>
                ) : <span>DID NOT ENTER</span>}
              </div>
              {recap.leagueSplits.length ? (
                <div className="picks-event-recap__quickline" aria-label="League ATS split">
                  {recap.leagueSplits.map((split) => (
                    <span key={split.league}>{split.league}: {split.correct}-{split.submitted - split.correct} · {split.accuracy}%</span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {recap.awards.length ? (
            <section className="picks-event-recap__stories" aria-label="Week awards">
              <div className="picks-event-recap__compact-heading"><span>WEEK AWARDS</span><small>{recap.awards.length}</small></div>
              <div className="picks-event-recap__story-strip">
                {recap.awards.map((award) => (
                  <article key={award.label}>
                    <span>{award.label}</span>
                    <strong>{award.title}</strong>
                    <p>{award.detail}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="picks-event-recap__standings" aria-labelledby={`${titleId}-standings`}>
            <div className="picks-event-recap__compact-heading">
              <h3 id={`${titleId}-standings`}>Week Standings</h3>
              <small>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</small>
            </div>
            <div className="picks-event-recap__standing-list">
              {recap.standings.map((result) => (
                <article className={result.isCurrentUser ? "is-current-user" : ""} key={result.profileId ?? result.displayName}>
                  <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                  <div>
                    <strong>{result.displayName}{result.isCurrentUser ? <em>YOU</em> : null}</strong>
                    <small>{result.correct}-{result.incorrect} · {pickWinPercentage(result.correct, result.incorrect).toFixed(1)}% ATS{result.lockBonus ? ` · +${result.lockBonus} LOCK` : ""}</small>
                  </div>
                  <b>{result.totalPoints}<small>PTS</small></b>
                </article>
              ))}
            </div>
          </section>

          <details className="picks-event-recap__fights">
            <summary>
              <div><span>GAME RESULTS</span><h3>Game by Game</h3></div>
              <small>{recap.games.length} {recap.games.length === 1 ? "GAME" : "GAMES"} · VIEW GAMES ›</small>
            </summary>
            <div className="picks-event-recap__fight-list" id={`${titleId}-games`}>
              {recap.games.map((game) => {
                const analysis = recap.analyses.find((item) => item.game.boutId === game.boutId) ?? null;
                return (
                  <article key={game.boutId}>
                    <div className="picks-event-recap__fight-meta"><span>{leagueLabel(game.weightClass)}</span><small>FROZEN ATS · {frozenLineLabel(game)}</small></div>
                    <div className="picks-event-recap__matchup"><strong>{game.blueFighterName}</strong><span>AT</span><strong>{game.redFighterName}</strong></div>
                    <div className="picks-event-recap__fight-result">
                      <div><span>FINAL</span><strong>{finalScoreLabel(game)}</strong></div>
                      <div><span>COVERED</span><strong>{analysis?.coveredSlug ? teamName(game, analysis.coveredSlug) : analysis ? "PUSH" : "NOT GRADED"}</strong></div>
                      <div><span>YOUR PICK</span><strong>{teamName(game, game.pickedFighterSlug)}</strong></div>
                      <em className={`picks-verdict picks-verdict--${game.verdict}`}>{verdictLabel(game)}</em>
                    </div>
                    {(game.groupPicks ?? []).length ? (
                      <div className="picks-group-reveal">
                        <strong>EVERYONE’S PICKS</strong>
                        <div>
                          {(game.groupPicks ?? []).map((pick) => (
                            <span key={`${pick.displayName}:${pick.pickedFighterSlug ?? "none"}`}>{groupPickLabel(game, pick)}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </details>
        </main>
      </div>
    </div>
  ) : null;

  return (
    <>
      <article className="picks-latest-recap-card">
        <div>
          <span>FINAL RESULTS</span>
          <h3>{event.name} Recap</h3>
          <p>{event.subtitle}</p>
        </div>
        <div className="picks-latest-recap-card__result">
          <small>{championLabel}</small>
          <strong>{championCopy}</strong>
          <b>{recap.winningPoints} PTS</b>
          <small>ROOM ATS · {recap.groupAccuracy}</small>
          {recap.current ? <small>YOU · {userFinish} · {recap.current.correct}-{recap.current.incorrect} · {recap.current.totalPoints} PTS</small> : null}
        </div>
        <button type="button" aria-label="OPEN WEEK RECAP" onClick={() => setOpen(true)}>VIEW WEEK RECAP <span aria-hidden="true">›</span></button>
      </article>

      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}