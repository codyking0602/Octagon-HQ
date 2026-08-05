import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChallengeCenter } from "../challenges/ChallengeCenter";
import { FindLeaderDailyLeaderboard } from "./FindLeaderDailyLeaderboard";
import { useFindLeaderHistory } from "./FindLeaderHistoryProvider";
import { centralDay } from "./findLeaderEngine";
import { findLeaderStreaks, recentCalendarDays } from "./findLeaderStorage";
import { playGames, type PlayGameId } from "./playRegistry";
import {
  todayChallengeAdapter,
  type DailyGameType,
  type OfficialAttempt,
} from "./todaysChallengeAdapters";
import type {
  TodayChallengeHistoryRow,
  TodayChallengeProjection,
} from "./todayChallengeRepository";

const LIVE_GAME_ROUTES: Partial<Record<PlayGameId, string>> = {
  "find-leader": "/play/find-leader?mode=replayable",
  wavelength: "/play/wavelength",
  "blind-resume": "/play/blind-resume",
  "blind-rank": "/play/blind-rank",
  "keep-cut": "/play/keep-cut",
  "better-than": "/play/better-than",
  auction: "/play/auction",
};

function dateLabel(day: string, includeWeekday = true) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: includeWeekday ? "short" : undefined,
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

function setupLabel(projection: TodayChallengeProjection | null) {
  if (!projection) return "Find today’s verified UFC stat leader";
  const setup = projection.publicSetup;
  const pack = setup.pack && typeof setup.pack === "object" && !Array.isArray(setup.pack)
    ? setup.pack as Record<string, unknown>
    : null;
  switch (projection.gameType) {
    case "find_leader": return String(setup.stat_label ?? "Verified UFC category");
    case "blind_resume": return "Five hidden UFC résumé matchups";
    case "wavelength": return "Four adaptive clues · hidden 1–100 target";
    case "blind_rank_5": return String(pack?.prompt ?? pack?.name ?? "Five locked blind placements");
    case "keep_4_cut_4": return String(pack?.prompt ?? pack?.name ?? "Eight locked Keep/Cut decisions");
  }
}

function nativeDisplay(gameType: DailyGameType, attempt: OfficialAttempt) {
  return todayChallengeAdapter(gameType)!.nativeDisplay(attempt);
}

function TodayChallengeHero({
  today,
  projection,
  loading,
  onOpen,
}: {
  today: string;
  projection: TodayChallengeProjection | null;
  loading: boolean;
  onOpen: () => void;
}) {
  const gameType = projection?.gameType ?? "find_leader";
  const adapter = todayChallengeAdapter(gameType)!;
  const completed = projection?.officialAttempt ?? null;
  const inProgress = Boolean(
    projection
    && !completed
    && (projection.progressRevision > 0 || Object.keys(projection.publicState).length > 0)
  );

  return (
    <button className="play-daily__challenge" type="button" onClick={onOpen}>
      <div className="play-daily__topline">
        <span>TODAY’S CHALLENGE</span>
        <b>{dateLabel(projection?.centralDay ?? today).toUpperCase()}</b>
      </div>
      <h2>{loading && !projection ? "LOADING DAILY…" : adapter.title.toUpperCase()}</h2>
      <p>{adapter.instructions}</p>
      <div className="play-daily__category">
        <span>{completed ? "OFFICIAL RESULT" : inProgress ? "PROGRESS SAVED" : "TODAY’S SETUP"}</span>
        <strong>
          {completed
            ? `${nativeDisplay(gameType, completed)} · DAILY SCORE ${completed.normalizedScore}`
            : setupLabel(projection)}
        </strong>
      </div>
      <div className="play-daily__graphic">
        <b>{completed ? completed.normalizedScore : gameType === "find_leader" ? 10 : 100}</b>
        <span>{completed ? "✓" : inProgress ? "↗" : "→"}</span>
        <b>{completed ? "OFFICIAL" : inProgress ? "SAVED" : gameType === "find_leader" ? 1 : 0}</b>
        <small>{completed ? "REPLAY WON’T REPLACE" : inProgress ? "CONTINUE ON ANY DEVICE" : adapter.cta.toUpperCase()}</small>
      </div>
      <em>
        {completed
          ? "VIEW RESULT · SWIPE FOR LEADERBOARD →"
          : `${inProgress ? "CONTINUE" : adapter.cta.toUpperCase()} · SWIPE FOR LEADERBOARD →`}
      </em>
    </button>
  );
}

function DailyHistory({
  today,
  dailyRows,
  legacyRows,
  currentStreak,
  bestStreak,
  loading,
  profileBacked,
  error,
}: {
  today: string;
  dailyRows: TodayChallengeHistoryRow[];
  legacyRows: ReturnType<typeof useFindLeaderHistory>["rows"];
  currentStreak: number;
  bestStreak: number;
  loading: boolean;
  profileBacked: boolean;
  error: string;
}) {
  const dailyByDay = new Map(dailyRows.map((row) => [row.day, row]));
  const legacyByDay = new Map(legacyRows.map((row) => [row.day, row]));
  const perfect = dailyRows.length
    ? dailyRows.filter((row) => row.normalizedScore === 100).length
    : legacyRows.filter((row) => row.officialScore === 10).length;
  const total = dailyRows.length || legacyRows.length;

  return (
    <details className="find-history surface-card">
      <summary>
        <div>
          <p className="eyebrow">DAILY HISTORY</p>
          <strong>Today’s Challenge streak</strong>
        </div>
        <span><b>{currentStreak}</b>-day current · <b>{bestStreak}</b>-day best</span>
      </summary>
      <div className="find-history__body">
        <div className="find-history__metrics">
          <div><span>CURRENT</span><strong>{currentStreak}</strong><small>Consecutive days</small></div>
          <div><span>BEST</span><strong>{bestStreak}</strong><small>Longest streak</small></div>
          <div><span>PERFECT 100s</span><strong>{perfect}</strong><small>Official runs</small></div>
          <div><span>DAILY PLAYS</span><strong>{total}</strong><small>Recorded days</small></div>
        </div>
        <div className="find-history__calendar" aria-label="Recent Today’s Challenge history">
          {recentCalendarDays(today).map((day) => {
            const daily = dailyByDay.get(day);
            const legacy = legacyByDay.get(day);
            const score = daily?.normalizedScore ?? (legacy ? legacy.officialScore * 10 : null);
            return (
              <div className={`find-history__day${score !== null ? " is-complete" : ""}${score === 100 ? " is-perfect" : ""}`} key={day}>
                <b>{day.slice(-2)}</b>
                <span>{score !== null ? score : "—"}</span>
              </div>
            );
          })}
        </div>
        <div className="find-history__recent">
          {dailyRows.length ? dailyRows.slice(0, 6).map((row) => {
            const adapter = todayChallengeAdapter(row.gameType)!;
            return (
              <div className="find-history__row" key={`${row.day}:${row.scheduleVersion}`}>
                <span>
                  <strong>{dateLabel(row.day)}</strong>
                  <small>{adapter.title} · {adapter.nativeDisplay({ nativeScore: row.nativeScore, publicResult: row.publicResult })}</small>
                </span>
                <b>{row.normalizedScore}<small>/100</small></b>
              </div>
            );
          }) : legacyRows.length ? legacyRows.slice(0, 6).map((row) => (
            <div className="find-history__row" key={row.day}>
              <span>
                <strong>{dateLabel(row.day)}</strong>
                <small>Find the Leader · {row.officialScore}/10</small>
              </span>
              <b>{row.officialScore * 10}<small>/100</small></b>
            </div>
          )) : (
            <p className="find-history__empty">
              {loading
                ? "Syncing Today’s Challenge history…"
                : profileBacked
                  ? "Play today’s challenge to begin your profile history."
                  : "Sign in and play today’s official challenge to begin your streak."}
            </p>
          )}
          {error ? <p className="find-history__error" role="status">{error}</p> : null}
        </div>
      </div>
    </details>
  );
}

export default function PlayHubPage() {
  const navigate = useNavigate();
  const history = useFindLeaderHistory();
  const today = useMemo(() => centralDay(), []);
  const legacyStreak = findLeaderStreaks(history.rows, today);
  const currentStreak = history.dailyStreak?.currentStreak ?? legacyStreak.current;
  const bestStreak = history.dailyStreak?.bestStreak ?? legacyStreak.best;
  const projection = history.todayChallenge;
  const adapter = todayChallengeAdapter(projection?.gameType ?? "find_leader")!;
  const [carousel, setCarousel] = useState<0 | 1>(0);
  const touchStartX = useRef<number | null>(null);

  function finishSwipe(clientX: number) {
    if (touchStartX.current === null) return;
    const distance = clientX - touchStartX.current;
    touchStartX.current = null;
    if (distance <= -45) setCarousel(1);
    if (distance >= 45) setCarousel(0);
  }

  return (
    <div className="page play-page">
      <section className="page-heading">
        <p className="eyebrow">GAMES &amp; CHALLENGES</p>
        <h1>Play</h1>
        <p>Daily challenges, blind debates, and UFC rankings built to argue about.</p>
      </section>

      <section
        className="play-daily"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        {carousel === 0 ? (
          <TodayChallengeHero
            today={today}
            projection={projection}
            loading={history.loading}
            onOpen={() => navigate(adapter.dailyRoute)}
          />
        ) : (
          <FindLeaderDailyLeaderboard
            day={projection?.centralDay ?? today}
            scheduleVersion={projection?.scheduleVersion}
            gameType={projection?.gameType}
          />
        )}
        <div className="play-daily__dots" aria-label="Daily challenge carousel">
          <button aria-label="Show today’s challenge" className={carousel === 0 ? "is-active" : ""} type="button" onClick={() => setCarousel(0)} />
          <button aria-label="Show today’s leaderboard" className={carousel === 1 ? "is-active" : ""} type="button" onClick={() => setCarousel(1)} />
        </div>
      </section>

      <DailyHistory
        today={today}
        dailyRows={history.dailyRows}
        legacyRows={history.rows}
        currentStreak={currentStreak}
        bestStreak={bestStreak}
        loading={history.loading}
        profileBacked={history.profileBacked}
        error={history.error}
      />

      <ChallengeCenter />

      <section className="play-games">
        <header>
          <p className="eyebrow">ALL GAMES</p>
          <h2>Pick your debate</h2>
          <p>Quick games, blind tests, and rankings built to argue about.</p>
        </header>
        <div className="play-games__grid">
          {playGames.map((game) => {
            const route = LIVE_GAME_ROUTES[game.id];
            return route ? (
              <button className="play-game-card" type="button" key={game.id} onClick={() => navigate(route)}>
                <span className="play-game-card__icon">{game.icon}</span>
                <span className={`play-game-card__status${game.availability === "preview" ? " is-preview" : ""}`}>
                  {game.availability === "preview" ? "PREVIEW" : "PLAY NOW"}
                </span>
                <strong>{game.title}</strong>
                <small>{game.description}</small>
                <em>OPEN GAME →</em>
              </button>
            ) : (
              <article className="play-game-card" key={game.id}>
                <span className="play-game-card__icon">{game.icon}</span>
                <strong>{game.title}</strong>
                <small>{game.description}</small>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
