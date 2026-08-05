import { useEffect, useMemo } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { useFindLeaderHistory } from "./FindLeaderHistoryProvider";
import { todayChallengeAdapter, type DailyGameType } from "./todaysChallengeAdapters";

function dateLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${day}T12:00:00Z`));
}

function LeaderboardAvatar({
  avatarPhotoData,
  displayName,
  initials,
}: {
  avatarPhotoData: string | null;
  displayName: string;
  initials: string;
}) {
  return (
    <span className="play-daily__leaderboard-avatar">
      {avatarPhotoData ? <img src={avatarPhotoData} alt={`${displayName} avatar`} /> : <b>{initials}</b>}
    </span>
  );
}

function nativeResult(gameType: DailyGameType, nativeScore: number) {
  const adapter = todayChallengeAdapter(gameType)!;
  return adapter.nativeDisplay({ nativeScore, publicResult: {} });
}

export function FindLeaderDailyLeaderboard({
  day,
  scheduleVersion,
  gameType,
}: {
  day: string;
  scheduleVersion?: string;
  gameType?: DailyGameType;
}) {
  const identity = useIdentity();
  const {
    profileBacked,
    todayChallenge,
    dailyLeaderboard,
    dailyLeaderboardDay,
    dailyLeaderboardLoading,
    dailyLeaderboardError,
    loadDailyLeaderboard,
  } = useFindLeaderHistory();
  const resolvedGameType = gameType ?? todayChallenge?.gameType ?? "find_leader";
  const adapter = todayChallengeAdapter(resolvedGameType)!;

  useEffect(() => {
    void loadDailyLeaderboard(day, scheduleVersion);
  }, [day, loadDailyLeaderboard, scheduleVersion]);

  const leaderboard = dailyLeaderboardDay === day ? dailyLeaderboard : null;
  const currentEntry = leaderboard?.entries.find((entry) => entry.isCurrentUser) ?? null;
  const tiedRanks = useMemo(() => {
    const counts = new Map<number, number>();
    leaderboard?.entries.forEach((entry) => counts.set(entry.rank, (counts.get(entry.rank) ?? 0) + 1));
    return counts;
  }, [leaderboard]);

  return (
    <article className="play-daily__leaderboard">
      <div className="play-daily__leaderboard-heading">
        <div>
          <p className="eyebrow">{dateLabel(day).toUpperCase()}</p>
          <h2>{adapter.title}<br />Leaderboard</h2>
        </div>
        {leaderboard?.unlocked ? <span>{leaderboard.playerCount} PLAYED</span> : null}
      </div>

      {!profileBacked ? (
        <div className="play-daily__leaderboard-lock">
          <span aria-hidden="true">🔒</span>
          <strong>Sign in to unlock the global board</strong>
          <p>A profile is required for an official first attempt and leaderboard position.</p>
          <button type="button" onClick={identity.openDialog}>SIGN IN</button>
        </div>
      ) : dailyLeaderboardLoading ? (
        <div className="play-daily__leaderboard-lock" aria-live="polite">
          <span aria-hidden="true">…</span>
          <strong>Loading today’s board</strong>
          <p>Checking your official result and the latest HQ scores.</p>
        </div>
      ) : dailyLeaderboardError ? (
        <div className="play-daily__leaderboard-lock" role="status">
          <span aria-hidden="true">!</span>
          <strong>Leaderboard unavailable</strong>
          <p>{dailyLeaderboardError}</p>
          <button type="button" onClick={() => void loadDailyLeaderboard(day, scheduleVersion)}>TRY AGAIN</button>
        </div>
      ) : !leaderboard?.unlocked ? (
        <div className="play-daily__leaderboard-lock">
          <span aria-hidden="true">🔒</span>
          <strong>Complete today’s challenge to unlock</strong>
          <p>No member scores are revealed until your immutable first official attempt is recorded.</p>
        </div>
      ) : (
        <>
          {currentEntry ? (
            <div className="play-daily__leaderboard-you">
              <LeaderboardAvatar
                avatarPhotoData={currentEntry.avatarPhotoData}
                displayName={currentEntry.displayName}
                initials={currentEntry.initials}
              />
              <span>
                <small>YOUR OFFICIAL RESULT</small>
                <strong>{currentEntry.displayName}</strong>
                <em>{(tiedRanks.get(currentEntry.rank) ?? 0) > 1 ? `T-${currentEntry.rank}` : `#${currentEntry.rank}`}</em>
              </span>
              <b>{currentEntry.normalizedScore}<small>/100</small></b>
            </div>
          ) : null}

          <div className="play-daily__leaderboard-list" aria-label={`${adapter.title} leaderboard for ${dateLabel(day)}`}>
            {leaderboard.entries.map((entry) => {
              const rankLabel = (tiedRanks.get(entry.rank) ?? 0) > 1 ? `T-${entry.rank}` : `#${entry.rank}`;
              return (
                <div
                  className={`play-daily__leaderboard-row${entry.isCurrentUser ? " is-current" : ""}`}
                  key={`${entry.rank}:${entry.displayName}`}
                >
                  <span className="play-daily__leaderboard-rank">{rankLabel}</span>
                  <LeaderboardAvatar
                    avatarPhotoData={entry.avatarPhotoData}
                    displayName={entry.displayName}
                    initials={entry.initials}
                  />
                  <strong>{entry.displayName}</strong>
                  <b>
                    {entry.normalizedScore}<small>/100</small>
                    <em>{nativeResult(entry.gameType, entry.nativeScore)}</em>
                  </b>
                </div>
              );
            })}
          </div>
        </>
      )}

      <small>Official first attempts only. Ties share rank; completion time never breaks a tie.</small>
    </article>
  );
}
