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
import { pickEventPosters } from "./picksEventAssets";
import "../../styles/football-week-recap.css";

interface GameAnalysis {
  game: PickHistoryBout;
  league: "NFL" | "CFB";
  submitted: PickGroupPick[];
  coveredSlug: string | null;
  correct: PickGroupPick[];
  correctPercentage: number;
}

interface LockWeekResult {
  displayName: string;
  attempted: number;
  correct: number;
  lockBonus: number;
}

interface WeekAward {
  label: "BEST CALL" | "ROOM TRAP" | "CONSENSUS CASH" | "LOCKED IN";
  title: string;
  detail: string;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
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
  if (!slug) return "NO PICK";
  if (slug === homeSlug(game)) return game.redFighterName;
  if (slug === awaySlug(game)) return game.blueFighterName;
  return "UNKNOWN TEAM";
}

function frozenLineLabel(game: PickHistoryBout) {
  if (game.frozenSpreadHome == null) return "LINE NOT AVAILABLE";
  if (game.frozenSpreadHome === 0) return "PICK’EM";
  const favorite = game.frozenSpreadHome < 0 ? game.redFighterName : game.blueFighterName;
  return `${favorite} -${Math.abs(game.frozenSpreadHome)}`;
}

function finalScoreLabel(game: PickHistoryBout) {
  if (game.homeFinalScore == null || game.awayFinalScore == null) return "FINAL SCORE NOT AVAILABLE";
  return `${game.blueFighterName} ${game.awayFinalScore}, ${game.redFighterName} ${game.homeFinalScore}`;
}

function compactFinalScore(game: PickHistoryBout) {
  if (game.homeFinalScore == null || game.awayFinalScore == null) return "FINAL";
  return `FINAL ${game.awayFinalScore}–${game.homeFinalScore}`;
}

function verdictLabel(game: PickHistoryBout) {
  if (game.includedInPicks === false || game.verdict === "excluded") return "EXCLUDED";
  if (game.verdict === "correct") return "✓";
  if (game.verdict === "incorrect") return "✕";
  if (game.verdict === "push") return "PUSH";
  if (game.verdict === "missing") return "—";
  return "PENDING";
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

  return {
    game,
    league: leagueLabel(game.weightClass),
    submitted,
    coveredSlug,
    correct,
    correctPercentage,
  };
}

function accuracyLabel(correct: number, incorrect: number) {
  const decided = correct + incorrect;
  return decided ? `${Math.round((correct / decided) * 100)}%` : "—";
}

function weekIdentity(event: PickHistoryEvent) {
  const source = `${event.name} ${event.subtitle}`;
  const weekOf = source.match(/\bweek\s+of\s+([A-Za-z]{3,9})\s+(\d{1,2})\b/i);
  if (weekOf) return `WEEK OF ${weekOf[1].slice(0, 3).toUpperCase()} ${Number(weekOf[2])}`;
  const weekNumber = source.match(/\bweek\s*(\d+)\b/i);
  return weekNumber ? `WEEK ${weekNumber[1]}` : event.name.toUpperCase();
}

function slateScope(games: readonly PickHistoryBout[]) {
  const leagues = new Set(games.map((game) => leagueLabel(game.weightClass)));
  if (leagues.has("NFL") && leagues.has("CFB")) return "NFL + COLLEGE FOOTBALL";
  if (leagues.has("CFB")) return "COLLEGE FOOTBALL";
  return "NFL";
}

function groupPickResult(pick: PickGroupPick, analysis: GameAnalysis | null) {
  if (!pick.pickedFighterSlug || !analysis) return "—";
  if (!analysis.coveredSlug) return "—";
  return pick.pickedFighterSlug === analysis.coveredSlug ? "✓" : "✕";
}

function lockHitRate(result: LockWeekResult) {
  return result.attempted ? result.correct / result.attempted : 0;
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
  const [expandedGameIds, setExpandedGameIds] = useState<string[]>([]);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLElement | null>(null);
  const poster = useMemo(() => pickEventPosters(event)[0] ?? null, [event]);

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

    const lockResults = new Map<string, LockWeekResult>();
    for (const analysis of analyses) {
      for (const pick of analysis.submitted) {
        if (!pick.isLock) continue;
        const key = pick.displayName.trim().toLowerCase();
        const existing = lockResults.get(key) ?? {
          displayName: pick.displayName,
          attempted: 0,
          correct: 0,
          lockBonus: 0,
        };
        existing.attempted += 1;
        if (analysis.coveredSlug && pick.pickedFighterSlug === analysis.coveredSlug) existing.correct += 1;
        lockResults.set(key, existing);
      }
    }
    for (const standing of standings) {
      const key = standing.displayName.trim().toLowerCase();
      const existing = lockResults.get(key);
      if (existing) existing.lockBonus = standing.lockBonus;
    }
    const lockCandidates = Array.from(lockResults.values())
      .filter((result) => result.correct > 0)
      .sort((left, right) => (
        right.correct - left.correct
        || lockHitRate(right) - lockHitRate(left)
        || right.lockBonus - left.lockBonus
        || left.displayName.localeCompare(right.displayName)
      ));
    const lockLeader = lockCandidates[0] ?? null;
    const lockedIn = lockLeader
      ? lockCandidates.filter((result) => (
        result.correct === lockLeader.correct && lockHitRate(result) === lockHitRate(lockLeader)
      ))
      : [];

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
    if (lockLeader && lockedIn.length) {
      const sameBonus = lockedIn.every((result) => result.lockBonus === lockLeader.lockBonus);
      const bonusCopy = sameBonus && lockLeader.lockBonus > 0
        ? ` · +${lockLeader.lockBonus} BONUS PTS${lockedIn.length > 1 ? " EACH" : ""}`
        : "";
      awards.push({
        label: "LOCKED IN",
        title: joinNames(lockedIn.map((result) => result.displayName)),
        detail: `${lockLeader.correct}/${lockLeader.attempted} LOCKS HIT${bonusCopy}`,
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
    setExpandedGameIds([]);
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
  const championResult = recap.champions[0] ?? null;
  const userFinish = recap.current
    ? groupRankLabel(recap.current.rank, event.groupResults)
    : null;
  const weekLabel = weekIdentity(event);
  const weekLabelHasDate = weekLabel.startsWith("WEEK OF ");
  const allExpanded = recap.games.length > 0 && expandedGameIds.length === recap.games.length;

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

  function toggleGame(gameId: string) {
    setExpandedGameIds((current) => (
      current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [...current, gameId]
    ));
  }

  const overlay = open ? (
    <div
      className="picks-event-recap-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${event.name} Week Recap`}
      data-pull-refresh-ignore
    >
      <div className="picks-event-recap football-week-recap">
        <header className="picks-event-recap__header">
          <button ref={closeRef} type="button" aria-label="Close week recap" onClick={() => setOpen(false)}>×</button>
          <span>WEEK RECAP</span>
          <button type="button" disabled={shareLabel === "PREPARING…"} onClick={() => void shareRecap()}>{shareLabel}</button>
        </header>

        <main ref={scrollRef} className="picks-event-recap__scroll" data-testid="football-week-recap-scroll">
          <section className={`football-week-recap__event-card${poster ? " has-poster" : ""}`} aria-labelledby={titleId}>
            {poster ? (
              <div className="football-week-recap__poster" style={{ aspectRatio: poster.aspectRatio }}>
                <img src={poster.src} alt={`${weekLabel} Football Picks header`} loading="eager" />
              </div>
            ) : null}
            <div className="football-week-recap__hero">
              <div className="football-week-recap__weekline">
                <span>{weekLabel} · FINAL</span>
                <strong>{slateScope(recap.games)}</strong>
                {!weekLabelHasDate ? <small>{dateLabel(event.startsAt).toUpperCase()}</small> : null}
              </div>
              <div className="football-week-recap__winner">
                <small>{championLabel}</small>
                <h2 id={titleId}>
                  {recap.champions.length === 1
                    ? `${championCopy.toUpperCase()} WINS THE WEEK`
                    : `${championCopy.toUpperCase()} SHARE THE WEEK`}
                </h2>
                <strong>
                  {recap.winningPoints} PTS
                  {championResult && recap.champions.length === 1 ? ` · ${championResult.correct}-${championResult.incorrect} ATS` : ""}
                </strong>
              </div>
              <div className="football-week-recap__quickline" aria-label="Week recap totals">
                <span>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</span>
                <span>ROOM {recap.groupAccuracy} ATS</span>
                <span>{recap.games.length} {recap.games.length === 1 ? "GAME" : "GAMES"}</span>
              </div>
              {recap.current ? (
                <div className="football-week-recap__you">
                  YOU · {userFinish} · {recap.current.correct}-{recap.current.incorrect} ATS · {recap.current.totalPoints} PTS
                </div>
              ) : null}
              {recap.leagueSplits.length > 1 ? (
                <div className="football-week-recap__league-splits" aria-label="League ATS split">
                  {recap.leagueSplits.map((split) => (
                    <span key={split.league}>{split.league} {split.correct}-{split.submitted - split.correct} · {split.accuracy}%</span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {recap.awards.length ? (
            <section className="football-week-recap__section" aria-label="Week awards">
              <div className="football-week-recap__section-heading"><h3>WEEK AWARDS</h3><small>{recap.awards.length}</small></div>
              <div className="football-week-recap__awards">
                {recap.awards.map((award) => (
                  <article key={award.label}>
                    <span>{award.label}</span>
                    <div><strong>{award.title}</strong><p>{award.detail}</p></div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="picks-event-recap__standings football-week-recap__section" aria-labelledby={`${titleId}-standings`}>
            <div className="football-week-recap__section-heading">
              <h3 id={`${titleId}-standings`}>WEEK STANDINGS</h3>
              <small>{event.groupResults.length} {event.groupResults.length === 1 ? "PLAYER" : "PLAYERS"}</small>
            </div>
            <div className="picks-event-recap__standing-list">
              {recap.standings.map((result) => (
                <article className={result.isCurrentUser ? "is-current-user" : ""} key={result.profileId ?? result.displayName}>
                  <span>{groupRankLabel(result.rank, event.groupResults)}</span>
                  <div>
                    <strong>{result.displayName}{result.isCurrentUser ? <em>YOU</em> : null}</strong>
                    <small>{result.correct}-{result.incorrect} · {pickWinPercentage(result.correct, result.incorrect).toFixed(1)}% ATS{result.lockBonus ? ` · ${result.lockBonus > 0 ? "+" : ""}${result.lockBonus} LOCK` : ""}</small>
                  </div>
                  <b>{result.totalPoints}<small>PTS</small></b>
                </article>
              ))}
            </div>
          </section>

          <section className="football-week-recap__section football-week-recap__games" aria-labelledby={`${titleId}-games-heading`}>
            <div className="football-week-recap__section-heading">
              <h3 id={`${titleId}-games-heading`}>GAME RESULTS</h3>
              <button
                type="button"
                onClick={() => setExpandedGameIds(allExpanded ? [] : recap.games.map((game) => game.boutId))}
              >
                {allExpanded ? "COLLAPSE ALL" : "EXPAND ALL"}
              </button>
            </div>
            <div className="football-week-recap__game-list" id={`${titleId}-games`}>
              {recap.games.map((game) => {
                const analysis = recap.analyses.find((item) => item.game.boutId === game.boutId) ?? null;
                const expanded = expandedGameIds.includes(game.boutId);
                const currentGroupPick = (game.groupPicks ?? []).find((pick) => pick.isCurrentUser) ?? null;
                return (
                  <article className={`football-week-recap__game${expanded ? " is-expanded" : ""}`} key={game.boutId}>
                    <button
                      type="button"
                      className="football-week-recap__game-summary"
                      aria-expanded={expanded}
                      aria-controls={`${titleId}-${game.boutId}-details`}
                      onClick={() => toggleGame(game.boutId)}
                    >
                      <span className="football-week-recap__game-league">{leagueLabel(game.weightClass)}</span>
                      <div className="football-week-recap__matchup">
                        <strong>{game.blueFighterName} <small>AT</small> {game.redFighterName}</strong>
                        <b>{frozenLineLabel(game)} · FROZEN ATS</b>
                      </div>
                      <div className="football-week-recap__game-outcome">
                        <span>{compactFinalScore(game)}</span>
                        <strong>{analysis?.coveredSlug ? `${teamName(game, analysis.coveredSlug)} COVERED` : analysis ? "PUSH" : "NOT GRADED"}</strong>
                        <small className={game.verdict === "incorrect" || game.verdict === "missing" ? "is-missed" : ""}>
                          YOUR PICK: {currentGroupPick?.isLock ? "🔒 " : ""}{teamName(game, game.pickedFighterSlug)} {verdictLabel(game)}
                        </small>
                      </div>
                      <span className="football-week-recap__chevron" aria-hidden="true">⌄</span>
                    </button>

                    {expanded ? (
                      <div className="football-week-recap__game-details" id={`${titleId}-${game.boutId}-details`}>
                        <div className="football-week-recap__score-detail">
                          <span>FINAL SCORE</span><strong>{finalScoreLabel(game)}</strong>
                        </div>
                        {(game.groupPicks ?? []).length ? (
                          <div className="football-week-recap__everyone">
                            <strong>EVERYONE’S PICKS</strong>
                            <div>
                              {(game.groupPicks ?? []).map((pick) => {
                                const result = groupPickResult(pick, analysis);
                                return (
                                  <div className="football-week-recap__pick-row" key={`${pick.displayName}:${pick.pickedFighterSlug ?? "none"}`}>
                                    <span>{pick.displayName.toUpperCase()}{pick.isCurrentUser ? " (YOU)" : ""}</span>
                                    <strong>{pick.isLock ? <b aria-label="Lock pick">🔒</b> : null}{teamName(game, pick.pickedFighterSlug)}</strong>
                                    <em className={result === "✕" ? "is-missed" : ""}>{result}</em>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  ) : null;

  return (
    <>
      <article className="picks-latest-recap-card football-week-archive-card">
        <div>
          <span>{weekLabel} · FINAL</span>
          <h3>{championCopy}</h3>
          <p>{championLabel} · {recap.winningPoints} PTS · ROOM {recap.groupAccuracy} ATS</p>
        </div>
        <div className="picks-latest-recap-card__result">
          {recap.current ? <small>YOU · {userFinish} · {recap.current.correct}-{recap.current.incorrect} ATS · {recap.current.totalPoints} PTS</small> : <small>DID NOT ENTER</small>}
        </div>
        <button type="button" aria-label="OPEN WEEK RECAP" onClick={() => setOpen(true)}>VIEW WEEK RECAP <span aria-hidden="true">›</span></button>
      </article>

      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
