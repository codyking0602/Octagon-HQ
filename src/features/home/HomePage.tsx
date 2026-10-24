import { useOptionalSport } from "../../app/SportProvider";
import { useOptionalPlayChallenges } from "../challenges/ChallengeProvider";
import { challengeIsHidden, type PlayChallenge } from "../challenges/challengeModel";
import { challengeSport } from "../challenges/challengeRuntime";
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
import { dailyTwoGameOfficialAverageScore } from "../play/DailyTwoGameStatus";
import { dailyUsesTwoGameAverage } from "../play/dailyTwoGameContract";
import { FootballSpecialDailyHubMark, footballSpecialDailyThemeForDay, footballSpecialDailyThemeForCentralToday, footballSpecialDailyStyle } from "../play/footballSpecialDailyTheme";
import {
  useHqDailyChallengeStreak,
  useTodayChallengeOverview,
} from "../play/useTodayChallengeOverview";
import { useTodayChallengeRuntime } from "../play/useTodayChallengeRuntime";
import { currentDailyChallengeChampionship } from "../play/dailyChallengeChampionship";
import { allTime } from "../rankings/rankingModel";
import { FootballHq } from "./FootballHq";
import { OwnerChampionshipHome, type SportFilter } from "./OwnerChampionshipHome";
import { MlbHomeHq } from "../mlb/MlbHomeHq";
import { NbaOwnerHomeHq } from "../nba/NbaOwnerHomeHq";
import { canPreviewNba } from "../nba/nbaPreviewAccess";
import { canViewMlbPlayoffs } from "../mlb/mlbPlayoffsConfig";
import { useFootballHomeSpotlightPhotos } from "./homeFeatureMedia";
import { dailyRankingSpotlight } from "./homeSpotlightModel";
import { RankingSpotlightCard } from "./RankingSpotlightCard";
import { ShanesWatchlistCard } from "./ShanesWatchlistCard";
import { HqImpostorHomeCard } from "../impostor/HqImpostorHomeCard";
import "../../styles/home-football-hq.css";
import "../../styles/football-special-daily.css";
import "../../styles/home-ufc-hq.css";
import "../../styles/home-sport-chooser.css";
import "../../styles/home-hq-border-consistency.css";

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
  const ownLeaderboardEntry = leaderboard?.entries.find((entry) => entry.isCurrentUser);
  const rank = todayRank(leaderboard);
  const isTwoGameDaily = projection
    ? dailyUsesTwoGameAverage(projection.gameType, projection.centralDay)
    : false;
  const displayedScore = attempt
    ? (isTwoGameDaily
      ? dailyTwoGameOfficialAverageScore(projection!)
        ?? ownLeaderboardEntry?.normalizedScore
      : null) ?? attempt.normalizedScore
    : null;
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
  const specialTheme = sport === "football"
    ? projection ? footballSpecialDailyThemeForDay(projection.centralDay) : footballSpecialDailyThemeForCentralToday()
    : null;

  return (
    <Link
      className="home-challenge-card"
      data-sport={sport}
      data-special-daily={specialTheme?.rivalryAccent ? "red-river" : specialTheme ? "team" : undefined}
      style={specialTheme ? footballSpecialDailyStyle(specialTheme) : undefined}
      to={to}
      aria-label={`Open ${sportLabel} Today’s Challenge`}
    >
      <div className="home-challenge-card__copy">
        <div className="home-challenge-card__topline">
          <span>{sportLabel} DAILY CHALLENGE</span>
          <small>{status}</small>
        </div>
        {specialTheme ? <FootballSpecialDailyHubMark theme={specialTheme} /> : null}
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
          <strong>{displayedScore}<small>/100</small></strong>
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

/** Received and unanswered UFC challenges, matching the locked Football header semantics. */
export function outstandingUfcChallengeCount(challenges: readonly PlayChallenge[], profileId: string, now = Date.now()) {
  if (!profileId) return 0;
  return challenges.filter((challenge) => (
    challenge.recipientId === profileId
    && challengeSport(challenge) === "ufc"
    && challenge.responderResult === null
    && !challenge.completedAt
    && !challenge.declinedAt
    && !challengeIsHidden(challenge, profileId)
    && new Date(challenge.expiresAt).getTime() > now
  )).length;
}

export default function HomePage() {
  const identity = useIdentity();
  const navigate = useNavigate();
  const picks = usePicks();
  const playChallenges = useOptionalPlayChallenges();
  const footballPlayerPhotos = useFootballHomeSpotlightPhotos();
  const profileId = identity.profile?.id ?? "signed-out";
  const signedIn = Boolean(identity.profile?.id);
  const incomingUfcChallenges = playChallenges?.activeProfile
    ? outstandingUfcChallengeCount(playChallenges.challenges, playChallenges.activeProfile.id)
    : 0;
  const mlbVisible = canViewMlbPlayoffs(identity.profile);
  const nbaVisible = canPreviewNba(identity.profile);
  const ownerPreview = signedIn;
  // Only the authenticated owner gets the in-progress Home density experiment.
  const compactFootballPreview = Boolean(identity.profile?.canControlPicks === true
    && identity.profile.displayName.trim().toUpperCase() === "CODY");
  // Keep Baseball's approved compact experiment on the existing owner identity only.
  const compactMlbPreview = Boolean(identity.profile?.canControlPicks === true
    && identity.profile.displayName.trim().toUpperCase() === "CODY");
  // Owner-only NBA daily game previews stay private; the polished Basketball HQ layout is shared.
  const nbaHqOwnerPreview = Boolean(identity.profile?.canControlPicks === true
    && identity.profile.displayName.trim().toUpperCase() === "CODY");
  const sportPreference = useOptionalSport();
  // Home has its own persisted view, independent of all sport navigation.
  const homeSport = sportPreference?.homeSport ?? "football";
  const ownerSport: SportFilter = (homeSport === "nba" && !nbaVisible) || (homeSport === "mlb" && !mlbVisible)
    ? "football" : homeSport;
  const setOwnerSport = (next: SportFilter) => sportPreference?.setHomeSport(next);
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
  const settledUfcPicks = picks.summary.correct + picks.summary.incorrect;
  const ufcWinPercentage = settledUfcPicks > 0
    ? Math.round(100 * picks.summary.correct / settledUfcPicks) : null;
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

  const footballDailyTheme = footballDailyRuntime.projection
    ? footballSpecialDailyThemeForDay(footballDailyRuntime.projection.centralDay)
    : footballSpecialDailyThemeForCentralToday();
  const footballDailyChallenge = (
    <>
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
    {footballDailyTheme?.videoUrl ? (
      <a className="home-red-river-video" href={footballDailyTheme.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={footballDailyTheme.rivalryAccent ? "Watch the Red River rivalry video on YouTube" : `Watch ${footballDailyTheme.eventLabel} video on YouTube`}>
        <span>{footballDailyTheme.eventLabel}</span><strong>{footballDailyTheme.rivalryAccent ? "WATCH RIVALRY VIDEO ↗" : "WATCH EVENT VIDEO ↗"}</strong>
      </a>
    ) : null}
    </>
  );

  const footballHq = (
    <FootballHq
      event={picks.footballEvent}
      compactPreview={compactFootballPreview}
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
      className="home-section home-sport-hq home-sport-hq--ufc home-section--ufc-hq ufc-hq--compact"
      data-testid="home-section"
      data-home-section="ufc-hq"
      aria-label="UFC HQ"
    >
      <header className="home-sport-hq__heading">
        <h2 className="ufc-hq__center-title">UFC HQ</h2>
        {incomingUfcChallenges > 0 ? (
          <Link className="ufc-hq__challenge-alert" to="/play#challenge-center"
            aria-label={`${incomingUfcChallenges} outstanding UFC challenge${incomingUfcChallenges === 1 ? "" : "s"}; open Challenge Center`}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 5.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"/><path d="M8 10h8m-8 4h5"/>
            </svg>
            <b>{incomingUfcChallenges > 9 ? "9+" : incomingUfcChallenges}</b>
          </Link>
        ) : null}
      </header>

      <section className="surface-card home-event-card home-event-card--compact" aria-label="UFC Picks and standing">
        <div className="home-event-card__topline"><p className="eyebrow">UFC PICKS</p></div>
        <div className="football-hq-compact-picks" aria-label="UFC picks summary">
          <div className="football-hq-compact-picks__completion">
            <small>YOUR PICKS</small>
            <strong>{signedIn && currentEvent ? `${picksProgress.completed} OF ${picksProgress.total}` : "—"}</strong>
            {picksStatus !== "PICKS LOCKED" && picksStatus !== "PICKS READY" ? <span>{picksStatus}</span> : null}
          </div>
          <Link className="football-hq-compact-picks__record" to="/championship/ufc?tab=picks"
            aria-label="Open UFC Championship Picks leaderboard">
            <small>{recordSeason} PICKS RECORD</small>
            <strong>{signedIn ? pickRecord(picks.summary) : "—"}</strong>
            <span>{!signedIn ? "SIGN IN TO TRACK" : ufcWinPercentage === null ? "NO RESULTS YET" : `${ufcWinPercentage}% WIN RATE`}</span>
          </Link>
          {currentEvent ? (
            identity.profile ? (
              <Link className="football-hq-compact-picks__action" to="/picks">{picksLocked ? "VIEW PICKS →" : "OPEN PICKS →"}</Link>
            ) : (
              <button className="football-hq-compact-picks__action" type="button" onClick={identity.openDialog}>SIGN IN →</button>
            )
          ) : null}
        </div>
      </section>

      {ufcDailyChallenge}
      {spotlight ? <RankingSpotlightCard fighter={spotlight} compact /> : null}
      <ShanesWatchlistCard compact />
    </section>
  );
  return (
    <div className={`page home-page${compactFootballPreview ? " home-page--compact-football-preview" : ""}`}>
      {ownerPreview ? (
        <header className="home-sport-chooser" data-home-sport={ownerSport} aria-label="Your HQ dashboard">
          <div className="home-sport-chooser__identity">
            <h2>Your HQ</h2>
            <small>{hqDailyStreak.loading ? "STREAK LOADING" : `${hqDailyStreak.streak.currentStreak} DAY DAILY STREAK`}</small>
          </div>
          <label className="home-champ-preview__filter home-sport-chooser__filter">
            <span className="sr-only">Home sport</span>
            <select aria-label="Home sport" value={ownerSport} onChange={(event) => setOwnerSport(event.target.value as SportFilter)}>
              <option value="all">All sports</option>
              <option value="football">Football</option>
              <option value="ufc">UFC</option>
              {mlbVisible ? <option value="mlb">MLB</option> : null}
              {nbaVisible ? <option value="nba">Basketball</option> : null}
            </select>
          </label>
        </header>
      ) : (
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
      )}

      {ownerPreview && ownerSport === "mlb" && !compactMlbPreview ? (
        <OwnerChampionshipHome
          streak={hqDailyStreak.streak.currentStreak}
          streakLoading={hqDailyStreak.loading}
          showMlb={mlbVisible} showNba={nbaVisible}
          sport={ownerSport}
          onSportChange={setOwnerSport}
          showSportSelector={false}
        />
      ) : null}

      {(!ownerPreview || ownerSport === "all") ? <HqImpostorHomeCard /> : null}

      {ownerPreview && ownerSport !== "all" ? (
        ownerSport === "football" ? footballHq
          : ownerSport === "ufc" ? ufcHq
            : ownerSport === "nba" && nbaVisible ? <NbaOwnerHomeHq profileId={profileId} allowOwnerDailyPreview={nbaHqOwnerPreview} />
            : mlbVisible ? (
              <MlbHomeHq
                enabled={mlbVisible}
                signedIn={signedIn}
                previewMode={true}
                compactPreview={compactMlbPreview}
              />
            ) : null
      ) : (
        <>
      {isFootballSeason() ? (
        <>
          {footballHq}
          {nbaVisible ? <NbaOwnerHomeHq profileId={profileId} allowOwnerDailyPreview={nbaHqOwnerPreview} hideChampionship /> : null}
          {mlbVisible ? (
            <MlbHomeHq
              enabled={mlbVisible}
              signedIn={signedIn}
              previewMode={identity.profile?.canControlPicks === true}
              compactPreview={compactMlbPreview}
            />
          ) : null}
          {ufcHq}
        </>
      ) : (
        <>
          {ufcHq}
          {footballHq}
          {nbaVisible ? <NbaOwnerHomeHq profileId={profileId} allowOwnerDailyPreview={nbaHqOwnerPreview} hideChampionship /> : null}
          {mlbVisible ? (
            <MlbHomeHq
              enabled={mlbVisible}
              signedIn={signedIn}
              previewMode={identity.profile?.canControlPicks === true}
            compactPreview={compactMlbPreview}
            />
          ) : null}
        </>
      )}
        </>
      )}
      {ownerPreview && ownerSport === "mlb" && compactMlbPreview ? (
        <OwnerChampionshipHome
          streak={hqDailyStreak.streak.currentStreak}
          streakLoading={hqDailyStreak.loading}
          showMlb={mlbVisible} showNba={nbaVisible}
          sport={ownerSport}
          onSportChange={setOwnerSport}
          showSportSelector={false}
          compactMlbPreview
        />
      ) : null}
      {ownerPreview && ownerSport !== "mlb" && ownerSport !== "nba" ? (
        <OwnerChampionshipHome
          streak={hqDailyStreak.streak.currentStreak}
          streakLoading={hqDailyStreak.loading}
          showMlb={mlbVisible} showNba={nbaVisible}
          sport={ownerSport}
          onSportChange={setOwnerSport}
          showSportSelector={false}
          compactFootballPreview={compactFootballPreview}
        />
      ) : null}
    </div>
  );
}
