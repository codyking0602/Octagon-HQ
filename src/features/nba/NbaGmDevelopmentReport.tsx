import { footballGmDevelopmentResult } from "../back-room/footballGmScouting";
import { NBA_GM_ROSTER_SLOTS } from "./nbaGmFoundation";
import { NBA_GM_DEV_SLOT_LABELS, type NbaGmDevPlayer, type NbaGmDevRun } from "./nbaGmDevModel";

const money = (value: number) => "$" + (value / 1_000_000).toFixed(1) + "M";

function outcomeFor(delta: number) {
  const label = footballGmDevelopmentResult(delta);
  return {
    label: label === "HELD STEADY" ? "STEADY" : label,
    tone: label === "BREAKOUT" ? "breakout" : label === "IMPROVED"
      ? "improved" : label === "HELD STEADY" ? "steady" : "decline",
  };
}

/** Football's approved offseason development layout, with NBA roster/contract data.
 * Every movement comes from the authenticated, seeded server run.
 */
export function NbaGmDevelopmentReport({
  run, catalog,
}: { run: NbaGmDevRun; catalog: readonly NbaGmDevPlayer[] }) {
  const byId = new Map(catalog.map(player => [player.id, player]));
  return <section className="football-gm__development-report surface-card" aria-label="NBA offseason development report">
    <header>
      <div><p className="eyebrow">YEAR 1 → YEAR 2</p><h2>OFFSEASON DEVELOPMENT</h2></div>
      <span>SCOUTING REPORT</span>
    </header>
    <p>Some players took a leap. Others stalled or regressed. Each franchise run has its own outcomes. Year 2 salary changes are now set.</p>
    <div className="football-gm__development-list">
      {NBA_GM_ROSTER_SLOTS.map(slot => {
        const pick = run.yearOnePicks.find(entry => entry.slot === slot);
        const player = pick && byId.get(pick.playerId);
        const report = player && run.development?.[player.id];
        if (!player || !report) return null;
        const outcome = outcomeFor(report.year2Grade - report.startingGrade);
        return <div className="football-gm__development-player" key={player.id}>
          <b>{NBA_GM_DEV_SLOT_LABELS[slot]}</b>
          <span className="football-gm__development-name">
            <strong>{player.name}</strong><small>{player.teamCode} · {player.positions.join("/")}</small>
          </span>
          <strong className={`football-gm__development-status is-${outcome.tone}`}>{outcome.label}</strong>
          <span className="football-gm__development-salary">
            <strong>{money(report.year2Salary)}</strong>
            <small>{player.gameContract === "3YR" ? "3YR LOCKED" : "1YR REPRICE"}</small>
          </span>
        </div>;
      })}
    </div>
    <small className="football-gm__development-footnote">Development categories reflect simulated changes in ability. Exact HQ grades stay hidden. A 3YR player's salary is locked, not his ability.</small>
  </section>;
}
