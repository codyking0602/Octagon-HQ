import { useEffect, useMemo, useState } from "react";
import type { PlaySport } from "./playRegistry";
import {
  createWeeklyChampionshipRecapRepository,
  type WeeklyChampionshipRecap as Recap,
  type WeeklyChampionshipRecapEntry,
  type WeeklyChampionshipRecapRepository,
} from "./weeklyChampionshipRecapRepository";

function weekLabel(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00Z`);
  const endDate = new Date(`${end}T12:00:00Z`);
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = month.format(startDate);
  const endMonth = month.format(endDate);

  return startMonth === endMonth
    ? `${startMonth} ${startDate.getUTCDate()}–${endDate.getUTCDate()}`
    : `${startMonth} ${startDate.getUTCDate()}–${endMonth} ${endDate.getUTCDate()}`;
}

function MemberAvatar({ entry }: { entry: WeeklyChampionshipRecapEntry }) {
  return entry.avatarPhotoData
    ? <img src={entry.avatarPhotoData} alt="" />
    : <span aria-hidden="true">{entry.initials}</span>;
}

function championNames(recap: Recap) {
  const names = recap.entries.filter((entry) => entry.rank === 1).map((entry) => entry.displayName);
  if (names.length <= 2) return names.join(" & ");
  return `${names[0]} + ${names.length - 1} more`;
}

export function WeeklyChampionshipRecap({
  sport,
  repository: suppliedRepository,
}: {
  sport: PlaySport;
  repository?: WeeklyChampionshipRecapRepository | null;
}) {
  const repository = useMemo(
    () => suppliedRepository === undefined
      ? createWeeklyChampionshipRecapRepository()
      : suppliedRepository,
    [suppliedRepository],
  );
  const [recap, setRecap] = useState<Recap | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setRecap(null);
    setError("");

    if (!repository) return () => { active = false; };

    repository.load(sport)
      .then((next) => {
        if (active) setRecap(next);
      })
      .catch(() => {
        if (active) setRecap(null);
      });

    return () => { active = false; };
  }, [repository, sport]);

  if (!recap) return null;

  const winners = recap.entries.filter((entry) => entry.rank === 1);
  const pluralChampion = winners.length > 1;
  const sportLabel = sport === "football" ? "FOOTBALL" : "UFC";

  const acknowledge = async () => {
    if (!repository || busy) return;
    setBusy(true);
    setError("");
    try {
      await repository.acknowledge(sport, recap.weekStart);
      setRecap(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not close this recap. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="weekly-championship-recap__backdrop" data-sport={sport}>
      <section
        className="weekly-championship-recap"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`weekly-championship-recap-title-${sport}`}
      >
        <header className="weekly-championship-recap__hero">
          <p>WEEKLY PLAY CHAMPIONSHIP</p>
          <h2 id={`weekly-championship-recap-title-${sport}`}>
            {sportLabel} WEEKLY {pluralChampion ? "CHAMPIONS" : "CHAMPION"}
          </h2>
          <div className="weekly-championship-recap__winner">
            <span className="weekly-championship-recap__trophy" aria-hidden="true">🏆</span>
            <div>
              <strong>{championNames(recap)}</strong>
              <small>Week of {weekLabel(recap.weekStart, recap.weekEnd)}</small>
            </div>
          </div>
        </header>

        <div className="weekly-championship-recap__standings">
          <h3>FINAL STANDINGS</h3>
          <div className="weekly-championship-recap__columns" aria-hidden="true">
            <span>PLAYER</span><span>WINS</span><span>AVG SCORE</span>
          </div>
          <div className="weekly-championship-recap__rows">
            {recap.entries.map((entry) => (
              <div
                className={`weekly-championship-recap__row${entry.rank === 1 ? " is-champion" : ""}${entry.isCurrentUser ? " is-current" : ""}`}
                key={entry.profileId}
              >
                <b>#{entry.rank}</b>
                <span className="weekly-championship-recap__identity">
                  <MemberAvatar entry={entry} />
                  <strong>{entry.displayName}</strong>
                  {entry.isCurrentUser ? <em>YOU</em> : null}
                </span>
                <strong>{entry.wins}</strong>
                <span>{entry.averageScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {sport === "football" && recap.auctionBonus ? (
          <aside className="weekly-championship-recap__bonus">
            <span aria-hidden="true">🏆</span>
            <div>
              <small>WEEKLY AUCTION BONUS</small>
              <strong>{recap.auctionBonus.displayName} <b>+1 win</b></strong>
              <p>{recap.auctionBonus.subjectLabel} Champion</p>
            </div>
          </aside>
        ) : null}

        {error ? <p className="weekly-championship-recap__error" role="alert">{error}</p> : null}
        <button
          className="weekly-championship-recap__ok"
          type="button"
          disabled={busy}
          onClick={() => void acknowledge()}
        >
          {busy ? "SAVING…" : "OK"}
        </button>
      </section>
    </div>
  );
}
