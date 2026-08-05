import { useState } from "react";
import type {
  TodayChallengeStandings,
  TodayChallengeStandingsEntry,
} from "./todayChallengeRepository";

const GAME_AVERAGES = [
  ["findLeader", "Find the Leader"],
  ["wavelength", "Wavelength"],
  ["blindResume", "Blind Resume"],
  ["blindRank5", "Blind Rank 5"],
  ["keep4Cut4", "Keep 4, Cut 4"],
] as const satisfies ReadonlyArray<[
  keyof TodayChallengeStandingsEntry["gameAverages"],
  string,
]>;

function score(value: number | null) {
  return value === null ? "—" : value.toFixed(1);
}

function MemberAvatar({ entry }: { entry: TodayChallengeStandingsEntry }) {
  return entry.avatarPhotoData ? (
    <img src={entry.avatarPhotoData} alt="" />
  ) : (
    <span aria-hidden="true">{entry.initials}</span>
  );
}

export function DailyChallengeStandings({
  standings,
  loading,
  error,
  onRefresh,
}: {
  standings: TodayChallengeStandings | null;
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}) {
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const current = standings?.entries.find((entry) => entry.isCurrentUser) ?? null;

  return (
    <details className="daily-standings">
      <summary>
        <div>
          <p className="eyebrow">DAILY CHALLENGE</p>
          <strong>Daily Challenge Standings</strong>
        </div>
        <span>
          {loading && !standings
            ? "LOADING STANDINGS"
            : current
              ? <>YOUR RANK <b>#{current.rank}</b> · <b>{current.wins}</b> WINS</>
              : `${standings?.playerCount ?? 0} MEMBERS`}
        </span>
      </summary>

      <div className="daily-standings__body">
        <div className="daily-standings__header" aria-hidden="true">
          <span>Rank</span>
          <span>Member</span>
          <span>Wins</span>
          <span>Played</span>
          <span>Avg.<br />Score</span>
          <span>Current<br />Streak</span>
          <span>Longest<br />Streak</span>
        </div>

        {standings?.entries.length ? standings.entries.map((entry) => {
          const expanded = expandedProfileId === entry.profileId;
          return (
            <article
              className={`daily-standings__member${entry.isCurrentUser ? " is-current" : ""}`}
              key={entry.profileId}
            >
              <button
                className="daily-standings__row"
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpandedProfileId(expanded ? null : entry.profileId)}
              >
                <b>#{entry.rank}</b>
                <span className="daily-standings__identity">
                  <MemberAvatar entry={entry} />
                  <strong>{entry.displayName}</strong>
                </span>
                <strong>{entry.wins}</strong>
                <span>{entry.played}</span>
                <span>{entry.played ? entry.averageScore.toFixed(1) : "—"}</span>
                <span>{entry.currentStreak} days</span>
                <span>{entry.bestStreak} days</span>
              </button>

              {expanded ? (
                <div className="daily-standings__games">
                  <strong>Average Score by Game</strong>
                  <div>
                    {GAME_AVERAGES.map(([key, label]) => (
                      <span key={key}>
                        <small>{label}</small>
                        <b>{score(entry.gameAverages[key])}</b>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        }) : (
          <p className="today-hub-empty">
            {loading ? "Loading Daily Challenge Standings…" : "No members are available yet."}
          </p>
        )}

        {error ? (
          <button className="daily-standings__refresh" type="button" onClick={onRefresh}>
            REFRESH STANDINGS
          </button>
        ) : null}
      </div>
    </details>
  );
}
