import { useEffect, useMemo } from "react";
import { useIdentity } from "../identity/IdentityProvider";
import { useFindLeaderHistory } from "./FindLeaderHistoryProvider";

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

export function FindLeaderDailyLeaderboard({ day }: { day: string }) {
  const identity = useIdentity();
  const {
    profileBacked,
    dailyLeaderboard,
    dailyLeaderboardDay,
    dailyLeaderboardLoading,
    dailyLeaderboardError,
    loadDailyLeaderboard,
  } = useFindLeaderHistory();

  useEffect(() => {
    void loadDailyLeaderboard(day);
  }, [day, loadDailyLeaderboard]);

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
          <h2>Find the Leader<br />Leaderboard</h2>
        </div>
        {leaderboard?.unlocked ? <span>{leaderboard.playerCount} PLAYED</span> : null}
      </div>

      {!profileBacked ? (
        <div className="play-daily__leaderboard-lock">
          <span aria-hidden="true">🔒</span>
          <strong>Sign in to unlock the global board</strong>
          <p>Your device result stays local. A profile is required to appear with the rest of HQ.</p>
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
          <button type="button" onClick={() => void loadDailyLeaderboard(day)}>TRY AGAIN</button>
        </div>
      ) : !leaderboard?.unlocked ? (
        <div className="play-daily__leaderboard-lock">
          <span aria-hidden="true">🔒</span>
          <strong>Complete today’s challenge to unlock</strong>
          <p>No member scores are revealed until your first official run is recorded.</p>
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
              <b>{currentEntry.officialScore}<small>/10</small></b>
            </div>
          ) : null}

          <div className="play-daily__leaderboard-list" aria-label={`Find the Leader leaderboard for ${dateLabel(day)}`}>
            {leaderboard.entries.map((entry) => {
              const rankLabel = (tiedRanks.get(entry.rank) ?? 0) > 1 ? `T-${entry.rank}` : `#${entry.rank}`;
              return (
                <div
                  className={`play-daily__leaderboard-row${entry.isCurrentUser ? " is-current" : ""}`}
                  key={entry.displayName}
                >
                  <span className="play-daily__leaderboard-rank">{rankLabel}</span>
                  <LeaderboardAvatar
                    avatarPhotoData={entry.avatarPhotoData}
                    displayName={entry.displayName}
                    initials={entry.initials}
                  />
                  <strong>{entry.displayName}</strong>
                  <b>{entry.officialScore}<small>/10</small></b>
                </div>
              );
            })}
          </div>
        </>
      )}

      <small>Official first attempts only. Replays never change leaderboard position.</small>
    </article>
  );
}
