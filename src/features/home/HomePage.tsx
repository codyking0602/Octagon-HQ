import { Link, useNavigate } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  eventPicksLocked,
  groupRankLabel,
  pickProgress,
  pickRecord,
} from "../picks/picksModel";
import { picksSeasonStandings } from "../picks/picksSeasonStandings";
import { usePicks } from "../picks/PicksProvider";
import {
  TodayChallengeRepositoryError,
  type TodayChallengeLeaderboard,
  type TodayChallengeProjection,
} from "../play/todayChallengeRepository";
import { todayChallengeAdapter } from "../play/todaysChallengeAdapters";
import {
  useHqDailyChallengeStreak,
  useTodayChallengeOverview,
} from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { currentDailyChallengeChampionship } from "../play/dailyChallengeChampionship";
import { allTime } from "../rankings/rankingModel";
import { FootballHq } from "./FootballHq";
import { useFootballHomeSpotlightPhotos } from "./homeFeatureMedia";
import { dailyRankingSpotlight } from "./homeSpotlightModel";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
import { WeeklyGamesStandingLink } from "./WeeklyGamesStandingLink";
import "../../styles/home-football-hq.css";
import "../../styles/home-ufc-hq.css";

function readableError(error: unknown) {
  return error instanceof Error && error.message ? error.message : "";
}

function todayRank(leaderboard: TodayChallengeLeaderboard | null) {
  if (!leaderboard?.unlocked) return null;
  return leaderboard.entries.find((entry) => entry.isCurrentUser)?.rank ?? null;
}

function isFootballSeason(now = new Date()) {
  const month = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "numeric",
  }).format(now));
  return month >= 8 || month <= 2;
}

function TodayChallengeCard({
  sport,
  title,
  to,
  signedIn,
  loading,
  error,
  projection,
  leaderboard,
  gatedPreview = false,
}: {
  sport: "ufc" | "football";
  title: string;
  to: string;
  signedIn: boolean;
  loading: boolean;
  error: string;
  projection: TodayChallengeProjection | null;
  leaderboard: TodayChallengeLeaderboard | null;
  gatedPreview?: boolean;
}) {
  const attempt = projection?.officialAttempt ?? null;
  const rank = todayRank(leaderboard);
  const status = !signedIn
    ? "SIGN IN"
    : gatedPreview
      ? "READY"
      : loading && !projection
        ? "LOADING"
        : error && !projection
          ? "UNAVAILABLE"
          : attempt
            ? "COMPLETED"
            : (projection?.progressRevision ?? 0) > 0
              ? "IN PROGRESS"
              : projection
                ? "NOT PLAYED"
                : "UNAVAILABLE";
  const sportLabel = sport === "ufc" ? "UFC" : "FOOTBALL";

  return (
    <Link
      className="home-challenge-card"
      data-sport={sport}
      to={to}
      aria-label={`Open ${sportLabel} Today’s Challenge`}
    >
      <div className="home-challenge-card__copy">
        <div className="home-challenge-card__topline">
          <span>{sportLabel} DAILY CHALLENGE</span>
          <small>{status}</small>
        </div>
        <h3>{title}</h3>
        {!signedIn ? (
          <p>Sign in to track today’s score and standing.</p>
        ) : attempt ? (
          <p>{rank ? `#${rank} today` : "Official score locked"}</p>
        ) : gatedPreview ? (
          <p>Ready when you are.</p>
        ) : status === "IN PROGRESS" ? (
          <p>Pick up where you left off.</p>
        ) : status === "NOT PLAYED" ? (
          <p>Ready when you are.</p>
        ) : status === "LOADING" ? (
          <p>Checking today’s game.</p>
        ) : (
          <p>{error || "Today’s challenge is unavailable."}</p>
        )}
      </div>
      <div className="home-challenge-card__result">
        {attempt ? (
          <strong>{attempt.normalizedScore}<small>/100</small></strong>
        ) : gatedPreview ? (
          <strong>PLAY NOW</strong>
        ) : (
          <strong>{status}</strong>
        )}
        <span>{gatedPreview ? "" : "OPEN "}<b aria-hidden="true">→</b></span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const picks = usePicks();
  const footballPlayerPhotos = useFootballHomeSpotlightPhotos();
  const profileId = identity.profile?.id ?? "signed-out";
  const signedIn = Boolean(identity.profile?.id);
  const hqDailyStreak = useHqDailyChallengeStreak({ profileId, enabled: signedIn });
  const ufcDailyRuntime = useTodayChallengeRuntime({ profileId, enabled: signedIn, sport: "ufc" });
  const ufcDailyOverview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: ufcDailyRuntime.projection,
    sport: "ufc",
  });
  const footballDailyRuntime = useTodayChallengeRuntime({
    profileId,
    enabled: signedIn,
    sport: "football",
  });
  const footballDailyOverview = useTodayChallengeOverview({
    profileId,
    enabled: signedIn,
    projection: footballDailyRuntime.projection,
    sport: "football",
  });
  const ufcDailyAdapter = todayChallengeAdapter(ufcDailyRuntime.projection?.gameType);
  const footballWeeklyAuctionGate = footballDailyRuntime.error instanceof TodayChallengeRepositoryError
    && footballDailyRuntime.error.code === "WEEKLY_AUCTION_REQUIRED"
    ? footballDailyRuntime.error
    : null;
  const footballDailyAdapter = todayChallengeAdapter(
    footballDailyRuntime.projection?.gameType ?? footballWeeklyAuctionGate?.previewGameType ?? undefined,
  );
  const footballDailyGatedPreview = Boolean(
    footballWeeklyAuctionGate?.previewGameType
      && footballWeeklyAuctionGate.previewCentralDay,
  );
  const spotlight = dailyRankingSpotlight(allTime, new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()));
  const ufcDailyLoading = ufcDailyRuntime.loading || ufcDailyOverview.loading;
  const footballDailyLoading = footballDailyRuntime.loading || footballDailyOverview.loading;
  const ufcDailyError = readableError(ufcDailyRuntime.error) || readableError(ufcDailyOverview.error);
  const footballDailyError = readableError(footballDailyRuntime.error) || readableError(footballDailyOverview.error);
  const hqStreakError = readableError(hqDailyStreak.error);
  const currentEvent = picks.event;
  const recordSeason = currentEvent?.season ?? picks.history?.season ?? new Date().getFullYear();
  const picksProgress = pickProgress(currentEvent, picks.selections);
  const picksPercent = picksProgress.total
    ? Math.round((picksProgress.completed / picksProgress.total) * 100)
    : 0;
  const picksLocked = currentEvent ? eventPicksLocked(currentEvent) : false;
  const picksRemaining = Math.max(0, picksProgress.total - picksProgress.completed);
  const picksStatus = !signedIn
    ? "SIGN IN TO PLAY"
    : picks.loading && !currentEvent
      ? "LOADING"
      : picks.error && !currentEvent
        ? "UNAVAILABLE"
        : picksLocked
          ? "PICKS LOCKED"
          : picksProgress.total > 0 && picksRemaining === 0
            ? "PICKS READY"
            : picksProgress.total > 0
              ? `${picksRemaining} PICK${picksRemaining === 1 ? "" : "S"} LEFT`
              : "WAITING FOR CARD";
  const ufcStandings = picksSeasonStandings(picks.history, "mma");
  const currentUfcStanding = ufcStandings.find((standing) => standing.isCurrentUser) ?? null;
  const currentUfcRank = currentUfcStanding
    ? groupRankLabel(currentUfcStanding.rank, ufcStandings)
    : "";
  const currentUfcRankLabel = currentUfcRank
    ? currentUfcRank.startsWith("T-") ? currentUfcRank : `#${currentUfcRank}`
    : "";
  const footballStandings = picksSeasonStandings(picks.footballHistory, "football");
  const currentFootballStanding = footballStandings.find((standing) => standing.isCurrentUser) ?? null;
  const currentFootballRank = currentFootballStanding
    ? groupRankLabel(currentFootballStanding.rank, footballStandings)
    : "";
  const currentFootballRankLabel = currentFootballRank
    ? currentFootballRank.startsWith("T-") ? currentFootballRank : `#${currentFootballRank}`
    : "";
  const ufcChampionship = currentDailyChallengeChampionship(ufcDailyOverview.standings);
  const footballChampionship = currentDailyChallengeChampionship(footballDailyOverview.standings);

  const ufcDailyChallenge = (
    <TodayChallengeCard
      sport="ufc"
      title={ufcDailyAdapter?.title ?? "Today’s Challenge"}
      to={ufcDailyAdapter?.dailyRoute ?? "/play"}
      signedIn={signedIn}
      loading={ufcDailyLoading}
      error={ufcDailyError}
      projection={ufcDailyRuntime.projection}
      leaderboard={ufcDailyOverview.leaderboard}
    />
  );

  const footballDailyChallenge = (
    <TodayChallengeCard
      sport="football"
      title={footballDailyAdapter?.title ?? "Today’s Challenge"}
      to="/football/today"
      signedIn={signedIn}
      loading={footballDailyLoading}
      error={footballDailyError}
      projection={footballDailyRuntime.projection}
      leaderboard={footballDailyOverview.leaderboard}
      gatedPreview={footballDailyGatedPreview}
    />
  );

  const footballHq = (
    <FootballHq
      event={picks.footballEvent}
      selections={picks.footballSelections}
      history={picks.footballHistory}
      summary={picks.footballSummary}
      loading={picks.loading}
      error={picks.footballHomeError}
      signedIn={signedIn}
      dailyChallenge={footballDailyChallenge}
      weeklyGames={footballChampionship}
      weeklyGamesLoading={footballDailyOverview.standingsLoading}
      playerPhotoSources={footballPlayerPhotos}
      canManagePlayerPhoto={identity.profile?.canControlPicks === true}
      onManagePlayerPhoto={() => navigate("/picks/control?sport=football#home-spotlight")}
    />
  );

  const ufcHq = (
    <section
      className="home-section home-sport-hq home-sport-hq--ufc home-section--ufc-hq"
      data-testid="home-section"
      data-home-section="ufc-hq"
      aria-label="UFC HQ"
    >
      <header className="home-sport-hq__heading">
        <div>
          <p className="eyebrow">UFC HQ</p>
          <h2>Fight week</h2>
        </div>
        <small>PICKS · RANKINGS · CONTENDERS</small>
      </header>

      <section className="surface-card home-event-card home-event-card--compact" aria-label="UFC Picks and standing">
        <div className="home-event-card__topline">
          <p className="eyebrow">UFC PICKS</p>
          <span>
            {currentEvent
              ? picksLocked ? "LOCKED" : "ACTIVE"
              : picks.loading ? "LOADING" : picks.error ? "UNAVAILABLE" : "WAITING"}
          </span>
        </div>
        <div className="home-event-card__picks-grid">
          <div className="picks-progress" aria-label={`${picksProgress.completed} of ${picksProgress.total} picks completed`}>
            <div>
              <span>YOUR PICKS</span>
              <b>{signedIn && currentEvent ? `${picksProgress.completed} OF ${picksProgress.total}` : "—"}</b>
            </div>
            <div className="picks-progress__track" aria-hidden="true"><span style={{ width: `${picksPercent}%` }} /></div>
            <small className="home-event-card__picks-status">{picksStatus}</small>
          </div>
          <Link
            className="home-event-card__standing"
            to="/picks?view=standings#picks-season-standings"
            aria-label="Open UFC Picks season standings"
          >
            <span>{recordSeason} PICKS STANDING</span>
            <b>{signedIn && currentUfcRankLabel ? `${currentUfcRankLabel} OF ${ufcStandings.length}` : "—"}</b>
            <small>
              {!signedIn
                ? "SIGN IN TO TRACK"
                : currentUfcStanding
                  ? `${currentUfcStanding.totalPoints} PTS`
                  : "NO STANDING YET"}
            </small>
          </Link>
        </div>
        {currentEvent ? (
          identity.profile ? (
            <Link className="secondary-action" to="/picks">
              {picksProgress.completed === picksProgress.total ? "REVIEW PICKS" : "MAKE PICKS"} →
            </Link>
          ) : (
            <button className="secondary-action" type="button" onClick={identity.openDialog}>SIGN IN TO MAKE PICKS →</button>
          )
        ) : null}
      </section>

      <WeeklyGamesStandingLink
        sport="ufc"
        standing={ufcChampionship}
        loading={ufcDailyOverview.standingsLoading}
        signedIn={signedIn}
      />

      {ufcDailyChallenge}
      {spotlight ? <RankingSpotlightCard fighter={spotlight} /> : null}
      <ShanesWatchlistCard />
    </section>
  );

  return (
    <div className="page home-page">
      <section
        className="home-section home-section--your-hq"
        data-testid="home-section"
        data-home-section="your-hq"
        aria-label="Your HQ"
      >
        <section className="surface-card hq-card" aria-labelledby="your-hq-title">
          <div className="section-heading hq-card__heading">
            <h2 id="your-hq-title">Your HQ</h2>
          </div>

          {!identity.profile ? (
            <div className="hq-card__grid" aria-label="Your HQ profile stats">
              <article className="hq-stat"><strong>—</strong><span>HQ Daily streak</span><small>UFC OR FOOTBALL CHALLENGE</small></article>
              <article className="hq-stat"><strong>—</strong><span>Football Picks</span><small>SIGN IN TO TRACK</small></article>
              <article className="hq-stat"><strong>—</strong><span>UFC Picks</span><small>SIGN IN TO TRACK</small></article>
            </div>
          ) : (
            <div className="hq-card__grid">
              <article className={`hq-stat${hqStreakError ? " is-unavailable" : ""}`}>
                <strong>{hqDailyStreak.loading ? "…" : hqStreakError ? "—" : hqDailyStreak.streak.currentStreak}</strong>
                <span>HQ Daily streak</span>
                <small>{hqStreakError ? "UNAVAILABLE" : "UFC OR FOOTBALL CHALLENGE"}</small>
              </article>

              <article className={`hq-stat${picks.footballSummaryError ? " is-unavailable" : ""}`}>
                <strong>{picks.loading ? "…" : picks.footballSummaryError ? "—" : pickRecord(picks.footballSummary)}</strong>
                <span>Football Picks</span>
                <div className="hq-stat__standings">
                  <small>
                    {picks.footballSummaryError
                      ? "UNAVAILABLE"
                      : currentFootballRankLabel
                        ? `${currentFootballRankLabel} OF ${footballStandings.length} · PICKS STANDING`
                        : "NO PICKS STANDING"}
                  </small>
                  <small>
                    {footballDailyOverview.standingsLoading && !footballChampionship
                      ? "WEEKLY GAMES · LOADING"
                      : footballChampionship
                        ? `#${footballChampionship.rank} · WEEKLY GAMES`
                        : "NO WEEKLY GAMES RANK"}
                  </small>
                </div>
              </article>

              <article className={`hq-stat${picks.error ? " is-unavailable" : ""}`}>
                <strong>{picks.loading ? "…" : picks.error ? "—" : pickRecord(picks.summary)}</strong>
                <span>UFC Picks</span>
                <div className="hq-stat__standings">
                  <small>
                    {picks.error
                      ? "UNAVAILABLE"
                      : currentUfcRankLabel
                        ? `${currentUfcRankLabel} OF ${ufcStandings.length} · PICKS STANDING`
                        : "NO PICKS STANDING"}
                  </small>
                  <small>
                    {ufcDailyOverview.standingsLoading && !ufcChampionship
                      ? "WEEKLY GAMES · LOADING"
                      : ufcChampionship
                        ? `#${ufcChampionship.rank} · WEEKLY GAMES`
                        : "NO WEEKLY GAMES RANK"}
                  </small>
                </div>
              </article>
            </div>
          )}
        </section>
      </section>

      {isFootballSeason() ? (
        <>
          {footballHq}
          {ufcHq}
        </>
      ) : (
        <>
          {ufcHq}
          {footballHq}
        </>
      )}
    </div>
  );
}
