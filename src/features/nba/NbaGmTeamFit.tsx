import { nbaGmDevFitSignals, type NbaGmDevPlayer, type NbaGmDevRun } from "./nbaGmDevModel";

/** Six roster-composition signals, not additional simulation points. */
const labels = ["Shot creation", "Floor spacing", "Secondary playmaking", "Perimeter defense", "Rim protection", "Rebounding"] as const;
type Tier = "ELITE" | "GREAT" | "GOOD" | "NEUTRAL" | "POOR" | "DYSFUNCTIONAL";
const tierFromIndex = (score: number): Tier => score >= 90 ? "ELITE" : score >= 80 ? "GREAT" : score >= 70 ? "GOOD" : score >= 60 ? "NEUTRAL" : score >= 45 ? "POOR" : "DYSFUNCTIONAL";
const tierClass = (tier: Tier) => tier.toLowerCase();
function tierForSignal(status: "STRONG" | "FAIR" | "NEEDS WORK", strength: number): Tier {
  if (status === "STRONG") return strength >= 90 ? "ELITE" : "GREAT";
  if (status === "FAIR") return strength >= 78 ? "GOOD" : "NEUTRAL";
  return strength >= 65 ? "POOR" : "DYSFUNCTIONAL";
}
function fitForSeason(run: NbaGmDevRun, catalog: readonly NbaGmDevPlayer[], year: number) {
  const picks = year === 1 ? run.yearOnePicks : run.picks;
  const byId = new Map(catalog.map(player => [player.id, player]));
  const players = picks.map(pick => byId.get(pick.playerId)).filter((player): player is NbaGmDevPlayer => Boolean(player));
  if (players.length !== 7) return null;
  // Development grades are server-owned. Translate their per-season overall
  // movement into the same six scouting skill scales without inventing new
  // attribute development outcomes.
  const adjusted = catalog.map(player => {
    const development = run.development?.[player.id];
    const grade = year === 2 ? development?.year2Grade : year === 3 ? development?.year3Grade : undefined;
    const delta = grade == null ? 0 : grade - player.currentGrade;
    return delta === 0 ? player : {
      ...player,
      skills: Object.fromEntries(Object.entries(player.skills).map(([key, value]) =>
        [key, Math.max(0, Math.min(100, Number(value) + delta))])) as NbaGmDevPlayer["skills"],
    };
  });
  const signals = nbaGmDevFitSignals(picks, adjusted);
  if (signals.length !== 6) return null;
  const adjustedById = new Map(adjusted.map(player => [player.id, player]));
  const rotation = picks.map(pick => ({ slot: pick.slot, player: adjustedById.get(pick.playerId)! }));
  const starters = rotation.filter(row => row.slot !== "GUARD" && row.slot !== "BIG").map(row => row.player);
  const mean = (group: NbaGmDevPlayer[], key: keyof NbaGmDevPlayer["skills"]) =>
    group.reduce((total, player) => total + player.skills[key], 0) / Math.max(1, group.length);
  const ranked = (key: keyof NbaGmDevPlayer["skills"]) => starters.map(player => player.skills[key]).sort((a, b) => b - a);
  const scores = [
    ranked("scoring")[0]! * .6 + ranked("scoring")[1]! * .4,
    mean(starters, "shooting"),
    ranked("playmaking")[1]!,
    mean(rotation.filter(row => ["PG", "SG", "SF", "GUARD"].includes(row.slot)).map(row => row.player), "perimeterDefense"),
    rotation.find(row => row.slot === "C")?.player.skills.interiorDefense ?? 0,
    mean(rotation.filter(row => ["PF", "C", "BIG"].includes(row.slot)).map(row => row.player), "rebounding"),
  ];
  const tiers = signals.map((signal, index) => tierForSignal(signal.status, scores[index]!));
  // The simulation owns the overall fit. Do not average display-only scouting categories.
  const actualFit = run.results.find(result => result.season === year)?.positionalFit;
  if (actualFit == null || !Number.isFinite(actualFit)) return null;
  const index = Math.max(0, Math.min(100, Math.round(actualFit)));
  const overall = tierFromIndex(index);
  return { tiers, overall, index };
}

export function NbaGmTeamFit({ run, catalog, season }: {
  run: NbaGmDevRun; catalog: readonly NbaGmDevPlayer[]; season: 1 | 3;
}) {
  const years = season === 1 ? [1] : [1, 2, 3];
  const data = years.map(year => ({ year, fit: fitForSeason(run, catalog, year) }));
  if (data.some(item => !item.fit) || (season === 3 && run.results.length !== 3)) return null;
  return <section className="nba-gm-team-fit surface-card" aria-label="NBA GM team fit by season">
    <header className="nba-gm-team-fit__header">
      <div><small>{season === 1 ? "AFTER SEASON 1" : "THREE-SEASON RECAP"}</small><h2>TEAM FIT</h2></div>
    </header>
    <div className="nba-gm-team-fit__compact">
      <div className="nba-gm-team-fit__primary">
        <small>OVERALL TEAM FIT</small>
        <strong>{data[data.length-1]!.fit!.index}</strong>
        <b className={`nba-gm-team-fit__tier is-${tierClass(data[data.length-1]!.fit!.overall)}`}>{data[data.length-1]!.fit!.overall}</b>
      </div>
      <div className="nba-gm-team-fit__year-values">
        {data.map(item => <div key={item.year}><small>Y{item.year}</small><strong>{item.fit!.index}</strong></div>)}
      </div>
    </div>
    <div className="nba-gm-team-fit__meter" aria-label="Overall roster composition index">
      <div className="nba-gm-team-fit__meter-track">
        {[...new Set(data.map(item => item.fit!.index))].map(index =>
          <span key={index} className="nba-gm-team-fit__marker" style={{left: `${index}%`}} title={`Team fit ${index}`}>
            <i/>
          </span>)}
      </div>
      <div className="nba-gm-team-fit__meter-ends"><span>DYSFUNCTIONAL</span><span>ELITE</span></div>
    </div>
    <div className="nba-gm-team-fit__table" role="table" aria-label="Six basketball fit categories">
      <div className="nba-gm-team-fit__row nba-gm-team-fit__column-head" role="row">
        <span role="columnheader">CATEGORY</span>
        {data.map(item => <span role="columnheader" key={item.year}>YR {item.year}</span>)}
      </div>
      {labels.map((label, index) => <div className="nba-gm-team-fit__row" role="row" key={label}>
        <span role="rowheader">{label}</span>
        {data.map(item => {
          const tier = item.fit!.tiers[index]!;
          return <strong role="cell" key={item.year} className={`nba-gm-team-fit__tier is-${tierClass(tier)}`}>{tier}</strong>;
        })}
      </div>)}
    </div>
  </section>;
}
