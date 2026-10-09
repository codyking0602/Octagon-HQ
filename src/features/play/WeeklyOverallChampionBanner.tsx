import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  loadSportChampionshipWeekly,
  type SportChampionshipWeek,
} from "./sportChampionshipRepository";
import "../../styles/weekly-overall-champion.css";

type Sport = "ufc" | "football";
const STORAGE_PREFIX = "the-hq:overall-week-champion:v1:";

export function WeeklyOverallChampionBanner({ sport }: { sport: Sport }) {
  const identity = useIdentity();
  const [week, setWeek] = useState<SportChampionshipWeek | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    setWeek(null); setVisible(false);
    if (!identity.profile?.id) return () => { active = false; };
    loadSportChampionshipWeekly(sport, 2026)
      .then((result) => {
        if (!active || !result.latest) return;
        setWeek(result.latest);
        try {
          setVisible(window.localStorage.getItem(
            STORAGE_PREFIX + sport + ":" + result.latest.week_start + ":" + identity.profile?.id
          ) !== "seen");
        } catch {
          setVisible(true);
        }
      }).catch(() => { /* An unavailable banner must never block Play. */ });
    return () => { active = false; };
  }, [identity.profile?.id, sport]);

  if (!visible || !week) return null;
  const dismiss = () => {
    try {
      window.localStorage.setItem(
        STORAGE_PREFIX + sport + ":" + week.week_start + ":" + identity.profile?.id, "seen"
      );
    } catch { /* Dismiss for this session regardless. */ }
    setVisible(false);
  };
  return (
    <div className="weekly-overall__backdrop" data-sport={sport}>
      <section className="weekly-overall__dialog" role="dialog" aria-modal="true"
        aria-labelledby="weekly-overall-title">
        <header>
          <span>🏆 CHAMPION OF THE WEEK</span>
          <h2 id="weekly-overall-title">{sport === "football" ? "FOOTBALL" : "UFC"} CHAMPION</h2>
          <strong>{week.winner.display_name}</strong>
          <small>{week.week_start} – {week.week_end}</small>
          <b>{week.winner.rating?.toFixed(1) ?? "—"} WEEKLY SCORE</b>
        </header>
        <div className="weekly-overall__standings">
          <div className="weekly-overall__heading"><span>PLAYER</span><span>WEEK SCORE</span></div>
          {week.entries.map((entry) => (
            <div className="weekly-overall__row" key={entry.profile_id}>
              <span><b>#{entry.rank}</b> {entry.display_name}{entry.is_current_user ? " · YOU" : ""}</span>
              <strong>{entry.rating?.toFixed(1) ?? "—"}</strong>
            </div>
          ))}
        </div>
        <p>Whole-week results: Picks and Play count together. This does not add bonus season points.</p>
        <div className="weekly-overall__actions">
          <Link to={`/championship/${sport}?tab=overall#weekly-champions`} onClick={dismiss}>VIEW CHAMPIONSHIP</Link>
          <button type="button" onClick={dismiss}>CONTINUE</button>
        </div>
      </section>
    </div>
  );
}
