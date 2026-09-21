import { useEffect } from "react";
import type { DailyChallengeWeeklyRecap, DailyChallengeWeeklyRecapEntry } from "./todayChallengeRepository";
import type { PlaySport } from "./playRegistry";

function weekLabel(start: string, end: string) {
  const date = (value: string) => new Date(`${value}T12:00:00Z`);
  const startDate = date(start);
  const endDate = date(end);
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = month.format(startDate);
  const endMonth = month.format(endDate);
  return startMonth === endMonth
    ? `${startMonth} ${startDate.getUTCDate()}–${endDate.getUTCDate()}`
    : `${startMonth} ${startDate.getUTCDate()}–${endMonth} ${endDate.getUTCDate()}`;
}

function Avatar({ entry }: { entry: DailyChallengeWeeklyRecapEntry }) {
  return entry.avatarPhotoData ? <img src={entry.avatarPhotoData} alt="" /> : <span aria-hidden="true">{entry.initials}</span>;
}

export function WeeklyChampionshipRecap({
  recap, sport, busy, error, onAcknowledge,
}: {
  recap: Extract<DailyChallengeWeeklyRecap, { available: true }>;
  sport: PlaySport;
  busy: boolean;
  error: string | null;
  onAcknowledge: () => void;
}) {
  const championLabel = recap.entries.filter((entry) => entry.isChampion).map((entry) => entry.displayName).join(" & ");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return (
    <div className="weekly-championship-recap" data-sport={sport}>
      <section className="weekly-championship-recap__card" role="dialog" aria-modal="true" aria-labelledby={`weekly-championship-${sport}`}>
        <header className="weekly-championship-recap__header">
          <p>WEEKLY PLAY CHAMPIONSHIP</p>
          <h2 id={`weekly-championship-${sport}`}>{sport === "football" ? "FOOTBALL" : "UFC"} WEEKLY CHAMPION</h2>
          <div className="weekly-championship-recap__winner">
            <span className="weekly-championship-recap__trophy" aria-hidden="true">🏆</span>
            <div><strong>{championLabel}</strong><small>Week of {weekLabel(recap.weekStart, recap.weekEnd)}</small></div>
          </div>
        </header>
        <section className="weekly-championship-recap__standings" aria-label="Final standings">
          <h3>FINAL STANDINGS</h3>
          <div className="weekly-championship-recap__columns" aria-hidden="true"><span>PLAYER</span><span>WINS</span><span>AVG SCORE</span></div>
          <div className="weekly-championship-recap__rows">
            {recap.entries.map((entry) => (
              <div className={`weekly-championship-recap__row${entry.isChampion ? " is-champion" : ""}${entry.isCurrentUser ? " is-current" : ""}`} key={entry.profileId}>
                <span className="weekly-championship-recap__player">
                  <b>#{entry.rank}</b><span className="weekly-championship-recap__avatar"><Avatar entry={entry} /></span>
                  <strong>{entry.displayName}</strong>{entry.isCurrentUser ? <em>YOU</em> : null}
                </span>
                <strong>{entry.wins}</strong><strong>{entry.averageScore.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </section>
        {sport === "football" && recap.auctionBonus ? (
          <section className="weekly-championship-recap__bonus" aria-label="Weekly Auction bonus">
            <span aria-hidden="true">🏆</span>
            <div><small>WEEKLY AUCTION BONUS</small><strong>{recap.auctionBonus.displayName} +{recap.auctionBonus.wins} win</strong><p>{recap.auctionBonus.label}</p></div>
          </section>
        ) : null}
        {error ? <p className="weekly-championship-recap__error" role="alert">{error}</p> : null}
        <button className="weekly-championship-recap__ok" type="button" disabled={busy} onClick={onAcknowledge}>{busy ? "SAVING…" : "OK"}</button>
      </section>
    </div>
  );
}
