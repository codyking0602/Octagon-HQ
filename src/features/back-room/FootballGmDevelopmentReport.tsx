import {
  footballGmMoney,
  footballGmPlayerById,
  footballGmProjectedGradeForPlayer,
  type FootballGmRosterEntry,
} from "./footballGmEngine";
import { footballGmAdjustedSalaryForPlayer } from "./footballGmStrategy";

function developmentLabel(change: number) {
  if (change >= 3) return { label: "BREAKOUT", tone: "breakout" };
  if (change >= 0.85) return { label: "IMPROVED", tone: "improved" };
  if (change <= -2.5) return { label: "MAJOR REGRESSION", tone: "decline" };
  if (change <= -0.85) return { label: "REGRESSED", tone: "decline" };
  return { label: "STEADY", tone: "steady" };
}

export function FootballGmDevelopmentReport({
  roster,
  seed,
}: {
  roster: readonly FootballGmRosterEntry[];
  seed: string;
}) {
  return (
    <section className="football-gm__development-report surface-card" aria-label="Offseason development report">
      <header>
        <div>
          <p className="eyebrow">YEAR 1 → YEAR 2</p>
          <h2>OFFSEASON DEVELOPMENT</h2>
        </div>
        <span>SCOUTING REPORT</span>
      </header>
      <p>Some players took a leap. Others stalled or regressed. Each franchise run has its own outcomes. Year 2 extension offers are now set.</p>
      <div className="football-gm__development-list">
        {roster.map((entry) => {
          const player = footballGmPlayerById(entry.playerId);
          if (!player) return null;
          const change = footballGmProjectedGradeForPlayer(player, 2, seed) - player.currentGrade;
          const outcome = developmentLabel(change);
          const salary = footballGmAdjustedSalaryForPlayer(player, 2, seed, {});
          return (
            <div className="football-gm__development-player" key={entry.playerId}>
              <b>{entry.slot}</b>
              <span className="football-gm__development-name">
                <strong>{player.name}</strong>
                <small>{player.team} · {player.position}</small>
              </span>
              <strong className={`football-gm__development-status is-${outcome.tone}`}>{outcome.label}</strong>
              <span className="football-gm__development-salary">
                <strong>{footballGmMoney(salary)}</strong>
                <small>{player.gameContract === "3YR" ? "3YR LOCKED" : "1YR REPRICE"}</small>
              </span>
            </div>
          );
        })}
      </div>
      <small className="football-gm__development-footnote">Development categories reflect the simulated change in ability. Exact HQ grades remain hidden. A 3YR player's salary is locked, not his ability.</small>
    </section>
  );
}
