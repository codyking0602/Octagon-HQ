import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  loadSportChampionshipWeekly,
  loadUfcMonthlyChampionship,
  type SportChampionshipEntry,
} from "./sportChampionshipRepository";
import "../../styles/weekly-overall-champion.css";

type Sport = "ufc" | "football";
type ChampionPeriod = {
  start: string;
  end: string;
  winner: SportChampionshipEntry;
  entries: SportChampionshipEntry[];
  monthly: boolean;
};
const STORAGE_PREFIX = "the-hq:overall-champion:v2:";
// The UFC monthly redesign changed the storage prefix for both sports. Honor
// previously acknowledged Football weekly titles so a deployed upgrade never
// reannounces an award already dismissed under the original key.
const LEGACY_WEEKLY_STORAGE_PREFIX = "the-hq:overall-week-champion:v1:";
// Only announce recently finalized awards. An old title must not suddenly
// interrupt Play after a browser data reset, reinstall, or device change.
const ANNOUNCEMENT_WINDOW_MS = 72 * 60 * 60 * 1000;

function isRecentFinalizedPeriod(endDay: string, now = Date.now()) {
  const end = Date.parse(`${endDay}T23:59:59Z`);
  return Number.isFinite(end) && now >= end && now - end <= ANNOUNCEMENT_WINDOW_MS;
}

export function WeeklyOverallChampionBanner({ sport }: { sport: Sport }) {
  const identity = useIdentity();
  const [period, setPeriod] = useState<ChampionPeriod | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setPeriod(null);
    setVisible(false);
    if (!identity.profile?.id) return () => { active = false; };

    const load = sport === "ufc"
      ? loadUfcMonthlyChampionship(2026).then(result => result.latest ? ({
          start: result.latest.month_start,
          end: result.latest.month_end,
          winner: result.latest.winner,
          entries: result.latest.entries,
          monthly: true,
        }) : null)
      : loadSportChampionshipWeekly("football", 2026).then(result => result.latest ? ({
          start: result.latest.week_start,
          end: result.latest.week_end,
          winner: result.latest.winner,
          entries: result.latest.entries,
          monthly: false,
        }) : null);

    load.then(next => {
      if (!active || !next || !isRecentFinalizedPeriod(next.end)) return;
      setPeriod(next);
      try {
        const periodKey = sport + ":" + next.start + ":" + identity.profile?.id;
        const acknowledged = window.localStorage.getItem(STORAGE_PREFIX + periodKey) === "seen"
          || (!next.monthly && window.localStorage.getItem(LEGACY_WEEKLY_STORAGE_PREFIX + periodKey) === "seen");
        setVisible(!acknowledged);
      } catch {
        setVisible(true);
      }
    }).catch(() => { /* An unavailable announcement must never block Play. */ });

    return () => { active = false; };
  }, [identity.profile?.id, sport]);

  if (!visible || !period) return null;
  const dismiss = () => {
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + sport + ":" + period.start + ":" + identity.profile?.id, "seen"
      );
    } catch { /* Dismiss for this session regardless. */ }
    setVisible(false);
  };
  const anchor = period.monthly ? "monthly-champions" : "weekly-champions";
  return (
    <div className="weekly-overall__backdrop" data-sport={sport}>
      <section className="weekly-overall__dialog" role="dialog" aria-modal="true"
        aria-labelledby="weekly-overall-title">
        <header>
          <span>🏆 CHAMPION OF THE {period.monthly ? "MONTH" : "WEEK"}</span>
          <h2 id="weekly-overall-title">{sport === "football" ? "FOOTBALL" : "UFC"} CHAMPION</h2>
          <strong>{period.winner.display_name}</strong>
          <small>{period.start} – {period.end}</small>
          <b>{period.winner.rating?.toFixed(1) ?? "—"} {period.monthly ? "MONTHLY" : "WEEKLY"} SCORE</b>
        </header>
        <div className="weekly-overall__standings">
          <div className="weekly-overall__heading"><span>PLAYER</span><span>{period.monthly ? "MONTH" : "WEEK"} SCORE</span></div>
          {period.entries.map(entry => (
            <div className="weekly-overall__row" key={entry.profile_id}>
              <span><b>#{entry.rank}</b> {entry.display_name}{entry.is_current_user ? " · YOU" : ""}</span>
              <strong>{entry.rating?.toFixed(1) ?? "—"}</strong>
            </div>
          ))}
        </div>
        <p>{period.monthly ? "Full-month" : "Whole-week"} results: Picks and Play count together. This does not add bonus season points.</p>
        <div className="weekly-overall__actions">
          <Link to={`/championship/${sport}?tab=overall#${anchor}`} onClick={dismiss}>VIEW CHAMPIONSHIP</Link>
          <button type="button" onClick={dismiss}>CONTINUE</button>
        </div>
      </section>
    </div>
  );
}
