import { useState } from "react";
import type {
  TodayChallengeStandings,
  TodayChallengeStandingsEntry,
} from "./todayChallengeRepository";

const GAME_AVERAGES = [
  ["findLeader", "Find the Leader"], ["wavelength", "Wavelength"],
  ["blindResume", "Blind Resume"], ["blindRank5", "Blind Rank 5"],
  ["keep4Cut4", "Keep 4, Cut 4"],
] as const satisfies ReadonlyArray<[keyof TodayChallengeStandingsEntry["gameAverages"], string]>;

function score(value: number | null) {
  return value === null ? "—" : value.toFixed(1);
}

function weekLabel(start: string, end: string) {
  const date = (value: string) => new Date(`${value}T12:00:00Z`);
  const startDate = date(start);
  const endDate = date(end);
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = month.format(startDate).toUpperCase();
  const endMonth = month.format(endDate).toUpperCase();
  return startMonth === endMonth
    ? `${startMonth} ${startDate.getUTCDate()}–${endDate.getUTCDate()}`
    : `${startMonth} ${startDate.getUTCDate()}–${endMonth} ${endDate.getUTCDate()}`;
}

function MemberAvatar({ entry }: { entry: TodayChallengeStandingsEntry }) {
  return entry.avatarPhotoData ? <img src={entry.avatarPhotoData} alt="" />
    : <span aria-hidden="true">{entry.initials}</span>;
}

export function DailyChallengeStandings({ standings, loading, error, onRefresh }: {
  standings: TodayChallengeStandings | null;
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}) {
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const current = standings?.entries.find((entry) => entry.isCurrentUser) ?? null;
  const ordered = [...(standings?.entries ?? [])].sort((a, b) =>
    b.weeklyTitles - a.weeklyTitles || b.wins - a.wins || b.averageScore - a.averageScore
      || b.played - a.played || a.displayName.localeCompare(b.displayName));
  const championshipRanks = new Map<string, number>();
  let previousTitles: number | null = null;
  let rank = 0;
  ordered.forEach((entry, index) => {
    if (entry.weeklyTitles !== previousTitles) rank = index + 1;
    championshipRanks.set(entry.profileId, rank);
    previousTitles = entry.weeklyTitles;
  });
  const active = ordered.filter((entry) => entry.played > 0 || entry.weeklyTitles > 0);
  const inactive = ordered.filter((entry) => entry.played === 0 && entry.weeklyTitles === 0);
  const visible = showInactive ? ordered : active;
  const weekly = (standings?.entries ?? []).filter((entry) => entry.weeklyPlayed > 0)
    .sort((a, b) => a.weeklyRank - b.weeklyRank || a.displayName.localeCompare(b.displayName));

  return (
    <details className="daily-standings">
      <summary>
        <div><p className="eyebrow">DAILY CHALLENGE</p><strong>Championship Standings</strong></div>
        <span>{loading && !standings ? "LOADING STANDINGS" : current
          ? <>YOUR RANK <b>#{championshipRanks.get(current.profileId)}</b> · <b>{current.weeklyTitles}</b> WEEKLY {current.weeklyTitles === 1 ? "TITLE" : "TITLES"}</>
          : `${active.length} CONTENDERS`}</span>
      </summary>

      <div className="daily-standings__body">
        {standings ? (
          <section className="daily-standings__week" aria-label="Current week race">
            <div className="daily-standings__section-title">
              <div><p className="eyebrow">CURRENT WEEK RACE</p><strong>THIS WEEK · {weekLabel(standings.currentWeekStart, standings.currentWeekEnd)}</strong></div>
              <small>WINS</small>
            </div>
            {weekly.length ? weekly.map((entry) => (
              <div className="daily-standings__weekly-row" key={entry.profileId}>
                <b>#{entry.weeklyRank}</b><span className="daily-standings__identity"><MemberAvatar entry={entry} /><strong>{entry.displayName}</strong></span>
                <strong>{entry.weeklyWins} {entry.weeklyWins === 1 ? "win" : "wins"}</strong>
              </div>
            )) : <p className="today-hub-empty">No results yet this week.</p>}
          </section>
        ) : null}

        <div className="daily-standings__career-title"><p className="eyebrow">CAREER</p><strong>CHAMPIONSHIP STANDINGS</strong></div>
        <div className="daily-standings__header" aria-hidden="true">
          <span>Rank</span><span>Member</span><span>Weekly<br />Titles</span><span>Wins</span><span>Avg<br />Score</span><span>Current<br />Streak</span><span>Longest<br />Streak</span>
        </div>

        {visible.length ? visible.map((entry) => {
          const expanded = expandedProfileId === entry.profileId;
          return <article className={`daily-standings__member${entry.isCurrentUser ? " is-current" : ""}`} key={entry.profileId}>
            <button className="daily-standings__row" type="button" aria-expanded={expanded} onClick={() => setExpandedProfileId(expanded ? null : entry.profileId)}>
              <b>#{championshipRanks.get(entry.profileId)}</b>
              <span className="daily-standings__identity"><MemberAvatar entry={entry} /><strong>{entry.displayName}</strong></span>
              <strong className="daily-standings__titles">{entry.weeklyTitles}</strong><span>{entry.wins}</span>
              <span>{entry.played ? entry.averageScore.toFixed(1) : "—"}</span><span>{entry.currentStreak}d</span><span>{entry.bestStreak}d</span>
            </button>
            {expanded ? <div className="daily-standings__games"><strong>Average Score by Game</strong><div>{GAME_AVERAGES.map(([key, label]) => <span key={key}><small>{label}</small><b>{score(entry.gameAverages[key])}</b></span>)}</div></div> : null}
          </article>;
        }) : <p className="today-hub-empty">{loading ? "Loading Championship Standings…" : "No contenders are available yet."}</p>}

        {inactive.length ? <button className="daily-standings__inactive" type="button" aria-expanded={showInactive} onClick={() => setShowInactive(!showInactive)}>{showInactive ? "HIDE INACTIVE" : `SHOW ${inactive.length} INACTIVE`}</button> : null}
        {error ? <button className="daily-standings__refresh" type="button" onClick={onRefresh}>REFRESH STANDINGS</button> : null}
      </div>
    </details>
  );
}
