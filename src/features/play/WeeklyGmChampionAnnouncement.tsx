import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createFootballWeeklyGmRepository, type WeeklyGmArchivedWeek } from "../back-room/footballWeeklyGmRepository";

const SEEN_PREFIX = "octagon:gm-week-winner:v1:";

/** One announcement per closed NFL GM week, never an invented or in-progress winner. */
export function WeeklyGmChampionAnnouncement({ profileId }: { profileId: string }) {
  const repository = useMemo(() => createFootballWeeklyGmRepository(), []);
  const [week, setWeek] = useState<WeeklyGmArchivedWeek | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    if (!repository) return;
    void repository.history().then((history) => {
      if (!active) return;
      const latest = history[0];
      if (!latest || latest.champions.length === 0) return;
      // Do not announce very old winners whenever a member returns.
      if (Date.now() - Date.parse(latest.closes_at) > 14 * 86400000) return;
      setWeek(latest);
      try {
        setVisible(window.localStorage.getItem(SEEN_PREFIX + profileId + ":" + latest.week_start) !== "seen");
      } catch { setVisible(true); }
    }).catch(() => { /* Champion archive must never block Play. */ });
    return () => { active = false; };
  }, [repository, profileId]);

  if (!week || !visible) return null;
  function dismiss() {
    try { window.localStorage.setItem(SEEN_PREFIX + profileId + ":" + week!.week_start, "seen"); }
    catch { /* Session dismissal still succeeds. */ }
    setVisible(false);
  }
  return (
    <section className="play-v2__gm-champion" role="status" aria-label="Last week's NFL GM champion">
      <span aria-hidden="true" className="play-v2__gm-champion-icon">🏆</span>
      <div>
        <small>LAST WEEK'S NFL GM CHAMPION · {week.week_start}</small>
        <strong>{week.champions.map((entry) => entry.display_name).join(" & ")}</strong>
        <small>{week.champions[0].total_score.toFixed(1)} / 200 POINTS</small>
        <Link to={`/football/weekly-gm?history=${week.week_start}`} onClick={dismiss}>VIEW CHAMPIONSHIP RESULTS →</Link>
      </div>
      <button className="play-v2__gm-champion-dismiss" type="button" onClick={dismiss} aria-label="Dismiss weekly GM announcement">×</button>
    </section>
  );
}
