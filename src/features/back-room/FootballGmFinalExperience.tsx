import { useEffect, useState } from "react";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmMoney,
  footballGmPlayerById,
  footballGmPlayoffFinishLabel,
  footballGmProjectedGradeForPlayer,
  footballGmReflowRoster,
  footballGmSlotLabel,
  type FootballGmPlayer,
  type FootballGmRosterEntry,
  type FootballGmRosterSlot,
} from "./footballGmEngine";
import {
  footballGmAdjustedRosterCap,
  footballGmAdjustedSalaryForPlayer,
  footballGmFinalResultV2,
  footballGmSeasonRecordLabel,
} from "./footballGmStrategy";
import { footballGmDevelopmentProfile } from "./wheelFootballGmEconomy";
import { footballGmDevelopmentResult } from "./footballGmScouting";
import { loadWheelFootballRoster, wheelFootballTeam } from "./wheelFootballModel";
import type { FootballGmReportRun } from "./FootballGmFranchiseReport";

function slotEntry(roster: readonly FootballGmRosterEntry[], slot: FootballGmRosterSlot) {
  return roster.find((entry) => entry.slot === slot) ?? null;
}

function scoutingTier(grade: number) {
  return grade >= 94 ? "ELITE" : grade >= 89 ? "IMPACT" : grade >= 83 ? "STARTER" : "DEPTH";
}

/**
 * Final movement deliberately uses five categorical, FIXED positions.
 * Never derive a marker position from absolute grade, floor, ceiling,
 * player-specific bounds, or the size of a change within a category.
 * The progression should reveal a meaningful direction, not hidden OVR.
 */
export function footballGmResultMovementPosition(delta: number) {
  const result = footballGmDevelopmentResult(delta);
  switch (result) {
    case "MAJOR REGRESSION": return 12;
    case "REGRESSED": return 32;
    case "HELD STEADY": return 50;
    case "IMPROVED": return 68;
    case "BREAKOUT": return 88;
  }
}

export function footballGmResultDevelopmentBand(player: FootballGmPlayer, seed: string) {
  const start = footballGmProjectedGradeForPlayer(player, 1, seed);
  const final = footballGmProjectedGradeForPlayer(player, 3, seed);
  const delta = final - start;
  const movement = footballGmDevelopmentResult(delta);
  const label = movement === "HELD STEADY" ? "Held steady"
    : movement === "MAJOR REGRESSION" ? "Major regression"
      : movement === "REGRESSED" ? "Regressed"
        : movement === "IMPROVED" ? "Improved" : "Breakout";
  return {
    start,
    final,
    delta,
    startPercent: 50,
    finalPercent: footballGmResultMovementPosition(delta),
    label,
    tone: movement === "MAJOR REGRESSION" || movement === "REGRESSED" ? "down"
      : movement === "BREAKOUT" || movement === "IMPROVED" ? "up" : "steady",
    calibrated: Boolean(footballGmDevelopmentProfile(player.id)),
  };
}

const headshotCache = new Map<string, string | null>();
const teamHeadshots = new Map<string, Promise<Map<string, string | null>>>();

function normalizedName(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function PlayerPortrait({ player }: { player: FootballGmPlayer }) {
  const key = player.team + ":" + normalizedName(player.name);
  const [src, setSrc] = useState<string | null | undefined>(() => headshotCache.get(key));
  const logo = wheelFootballTeam(player.team)?.logoSrc;

  useEffect(() => {
    const cached = headshotCache.get(key);
    if (cached !== undefined) {
      setSrc(cached);
      return;
    }
    let active = true;
    let request = teamHeadshots.get(player.team);
    if (!request) {
      request = loadWheelFootballRoster(player.team)
        .then((players) => new Map(players.map((candidate) => [normalizedName(candidate.name), candidate.headshotUrl])))
        .catch(() => new Map<string, string | null>());
      teamHeadshots.set(player.team, request);
    }
    void request.then((players) => {
      const value = players.get(normalizedName(player.name)) ?? null;
      headshotCache.set(key, value);
      if (active) setSrc(value);
    });
    return () => { active = false; };
  }, [key, player.name, player.team]);

  return <span className="gm-final__portrait" aria-hidden="true">
    {src ? <img src={src} alt="" loading="lazy" onError={() => { headshotCache.set(key, null); setSrc(null); }} />
      : logo ? <img src={logo} alt="" loading="lazy" /> : <b>{player.team}</b>}
  </span>;
}

function TeamLogo({ team }: { team: string }) {
  const logo = wheelFootballTeam(team)?.logoSrc;
  return logo ? <img className="gm-final__team-logo" src={logo} alt="" loading="lazy" />
    : <span className="gm-final__team-code">{team}</span>;
}

type RosterRow = {
  slot: FootballGmRosterSlot;
  player: FootballGmPlayer;
  entry: FootballGmRosterEntry;
  before: FootballGmPlayer | null;
  salary: number;
  band: ReturnType<typeof footballGmResultDevelopmentBand>;
};

function OutcomeBand({ band, name }: { band: RosterRow["band"]; name: string }) {
  if (!band.calibrated) {
    return <div className="gm-final__band-unavailable">DEVELOPMENT UNAVAILABLE</div>;
  }
  return (
    <div className="gm-final__band" role="img" aria-label={name + ": " + band.label.toLowerCase() + " across Years 1 through 3. Start is always centered; final movement is categorical. Exact grades remain hidden."}>
      <div className="gm-final__band-track">
        <span className="gm-final__band-start" style={{ left: band.startPercent + "%" }} />
        <span className={"gm-final__band-finish is-" + band.tone} style={{ left: band.finalPercent + "%" }} />
      </div>
      <div className="gm-final__band-legend"><small>DECLINED</small><small className="gm-final__band-start-label">START</small><small>IMPROVED</small></div>
    </div>
  );
}

export function FootballGmFinalExperience({
  name,
  run,
  opponentName,
  opponentRun,
}: {
  name: string;
  run: FootballGmReportRun;
  opponentName?: string | null;
  opponentRun?: FootballGmReportRun | null;
}) {
  const [selected, setSelected] = useState<"mine" | "opponent">("mine");
  const ownResult = footballGmFinalResultV2({
    seed: run.seed,
    yearOneRoster: run.roster,
    finalRoster: run.finalRoster.length ? run.finalRoster : run.roster,
    resolvedSeasons: run.resolvedSeasons,
  });
  const opponentResult = opponentRun ? footballGmFinalResultV2({
    seed: opponentRun.seed,
    yearOneRoster: opponentRun.roster,
    finalRoster: opponentRun.finalRoster.length ? opponentRun.finalRoster : opponentRun.roster,
    resolvedSeasons: opponentRun.resolvedSeasons,
  }) : null;
  const selectedRun = selected === "opponent" && opponentRun ? opponentRun : run;
  const selectedName = selected === "opponent" && opponentRun ? opponentName ?? "Opponent" : name;
  const originallyFinal = selectedRun.finalRoster.length ? selectedRun.finalRoster : selectedRun.roster;
  const end = footballGmReflowRoster(originallyFinal, 3, selectedRun.seed) ?? originallyFinal;
  const openingRoster = footballGmReflowRoster(selectedRun.roster, 1, selectedRun.seed) ?? selectedRun.roster;
  const retainedIds = new Set(openingRoster.map(entry => entry.playerId));
  const result = footballGmFinalResultV2({
    seed: selectedRun.seed,
    yearOneRoster: selectedRun.roster,
    finalRoster: end,
    resolvedSeasons: selectedRun.resolvedSeasons,
  });
  const rows: RosterRow[] = FOOTBALL_GM_ROSTER_SLOTS.flatMap((slot) => {
    const entry = slotEntry(end, slot);
    const player = entry ? footballGmPlayerById(entry.playerId) : null;
    if (!entry || !player) return [];
    const prior = slotEntry(openingRoster, slot);
    return [{
      slot,
      entry,
      player,
      before: prior ? footballGmPlayerById(prior.playerId) ?? null : null,
      salary: footballGmAdjustedSalaryForPlayer(player, 3, selectedRun.seed, selectedRun.negotiationConsequences),
      band: footballGmResultDevelopmentBand(player, selectedRun.seed),
    }];
  });
  // Assignment swaps alone are not offseason transactions.
  const retained = rows.filter((row) => retainedIds.has(row.player.id));
  const changes = rows.filter((row) => !retainedIds.has(row.player.id));
  const trades = changes.filter((row) => row.entry.acquired === "trade").length;
  const freeAgents = changes.length - trades;
  const payroll = footballGmAdjustedRosterCap(end, 3, selectedRun.seed, selectedRun.negotiationConsequences);
  const moved = [...changes].sort((a, b) => {
    const impact = (row: RosterRow) => row.band.final - (row.before ? footballGmProjectedGradeForPlayer(row.before, 3, selectedRun.seed) : row.band.start);
    return impact(b) - impact(a);
  });
  const bestMove = moved[0] ?? null;
  const bestMoveImproved = bestMove && bestMove.before && bestMove.band.final > footballGmProjectedGradeForPlayer(bestMove.before, 3, selectedRun.seed) + 0.85;
  const coreAnchor = [...retained].sort((a, b) => b.band.final - a.band.final)[0] ?? rows[0];
  const breakout = [...rows].sort((a, b) => b.band.delta - a.band.delta)[0] ?? null;
  const regression = [...rows].sort((a, b) => a.band.delta - b.band.delta)[0] ?? null;
  const greatLeap = breakout && breakout.band.delta > 0.85;
  const toughRegression = regression && regression.band.delta < -0.85;
  const opening = result.teamOveralls[0] ?? 0;
  const closing = result.teamOveralls[2] ?? opening;
  const verdict = result.score >= 92 ? "ELITE RUN"
    : result.score >= 85 ? "STRONG BUILD"
      : result.score >= 78 ? "SOLID FOUNDATION"
        : result.score >= 70 ? "MIXED RESULTS" : "REBUILD NEEDED";
  const subtitle = closing <= opening - 5 ? "STRONG START, TOUGH FINISH"
    : result.resumeScore + 4 < result.rosterManagementScore ? "GOOD ROSTER, TOUGH FINISH"
      : closing > opening + 4 ? "YOUR TEAM GOT STRONGER"
        : result.resumeScore > result.rosterManagementScore + 4 ? "PLAYOFFS LIFTED YOUR RUN"
          : "THREE SEASONS. YOUR DECISIONS.";
  const record = (season: (typeof result.seasons)[number]) => footballGmSeasonRecordLabel(season) ?? "—";

  return (
    <div className="football-gm-final gm-final" aria-label="Three-year NFL GM final result">
      <section className="gm-final__hero surface-card">
        {opponentResult ? (
          <>
            <div className="gm-final__eyebrow">HEAD-TO-HEAD FINAL <span>3-YEAR GM MATCH</span></div>
            <div className="gm-final__match-scoreboard">
              <div className={ownResult.score >= opponentResult.score ? "is-leading" : ""}>
                <small>{name.toUpperCase()}</small>
                <strong>{ownResult.score.toFixed(1)}</strong>
                <span>GM SCORE</span>
              </div>
              <b>VS</b>
              <div className={opponentResult.score >= ownResult.score ? "is-leading" : ""}>
                <small>{(opponentName ?? "OPPONENT").toUpperCase()}</small>
                <strong>{opponentResult.score.toFixed(1)}</strong>
                <span>GM SCORE</span>
              </div>
            </div>
            <div className="gm-final__match-verdict">
              {ownResult.score === opponentResult.score ? "DEAD EVEN"
                : (ownResult.score > opponentResult.score ? name : opponentName ?? "Opponent").toUpperCase() + " WINS"}
            </div>
          </>
        ) : (
          <>
            <div className="gm-final__eyebrow">YOUR FINAL RESULT <span>{name.toUpperCase()}</span></div>
            <div className="gm-final__hero-main">
              <div className="gm-final__score"><strong>{result.score.toFixed(1)}</strong><span>GM SCORE</span></div>
              <div className="gm-final__verdict"><small>BOTTOM LINE</small><b>{verdict}</b><span>{subtitle}</span></div>
            </div>
          </>
        )}
        <div className="gm-final__stats">
          <div><b>{result.rosterManagementScore.toFixed(1)}</b><small>AVG TEAM OVR</small></div>
          <div><b>{result.resumeScore.toFixed(1)}</b><small>PLAYOFF RÉSUMÉ</small></div>
          <div><b>{retained.length}/7</b><small>CORE RETAINED</small></div>
          <div><b>{changes.length}</b><small>OFFSEASON CHANGES</small></div>
        </div>
      </section>

      <section className="gm-final__section surface-card" aria-label="Three-year franchise results">
        <header className="gm-final__heading"><h2>THREE-YEAR RESULTS</h2><small>OVR · RECORD · PLAYOFF FINISH</small></header>
        {opponentResult ? (
          <div className="gm-final__seasons is-match">
            {ownResult.seasons.map((season, index) => {
              const rival = opponentResult.seasons[index]!;
              return (
                <div className="gm-final__match-year" key={season.year}>
                  <small>YEAR {season.year}</small>
                  <div className="gm-final__match-side">
                    <span>{name.toUpperCase()}</span>
                    <strong>{ownResult.teamOveralls[index]} <small>OVR</small></strong>
                    <b>{record(season)}</b>
                    <em>{footballGmPlayoffFinishLabel(season.finish)}</em>
                  </div>
                  <div className="gm-final__match-side is-opponent">
                    <span>{(opponentName ?? "OPPONENT").toUpperCase()}</span>
                    <strong>{opponentResult.teamOveralls[index]} <small>OVR</small></strong>
                    <b>{record(rival)}</b>
                    <em>{footballGmPlayoffFinishLabel(rival.finish)}</em>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="gm-final__seasons">
            {result.seasons.map((season, index) => (
              <div className="gm-final__season" key={season.year}>
                <small>YEAR {season.year}</small>
                <div><strong>{result.teamOveralls[index]}</strong><span>OVR</span></div>
                <b>{record(season)}</b>
                <em>{footballGmPlayoffFinishLabel(season.finish)}</em>
              </div>
            ))}
          </div>
        )}
      </section>

      {opponentResult ? (
        <div className="gm-final__franchise-tabs" role="group" aria-label="Choose GM franchise results">
          <button type="button" aria-pressed={selected === "mine"} className={selected === "mine" ? "is-active" : ""} onClick={() => setSelected("mine")}>{name.toUpperCase()}</button>
          <button type="button" aria-pressed={selected === "opponent"} className={selected === "opponent" ? "is-active" : ""} onClick={() => setSelected("opponent")}>{(opponentName ?? "OPPONENT").toUpperCase()}</button>
        </div>
      ) : null}
      
      <section className="gm-final__section surface-card" aria-label="Run highlights">
        <header className="gm-final__heading"><h2>RUN HIGHLIGHTS</h2></header>
        <div className="gm-final__highlights">
          <article className="is-positive"><span aria-hidden="true">↗</span><div>
            <small>{bestMove ? bestMoveImproved ? "BEST UPGRADE" : "KEY MOVE" : "CORE KEPT"}</small>
            <strong>{bestMove?.player.name ?? "The original core"}</strong>
            <p>{bestMove ? bestMove.entry.acquired === "trade" ? "Trade · " + footballGmSlotLabel(bestMove.slot) : "Free agency · " + footballGmSlotLabel(bestMove.slot) : "No offseason changes"}</p>
          </div></article>
          <article className="is-gold"><span aria-hidden="true">★</span><div>
            <small>{greatLeap ? "BIGGEST LEAP" : "CORE ANCHOR"}</small>
            <strong>{greatLeap ? breakout?.player.name : coreAnchor?.player.name ?? "Your roster"}</strong>
            <p>{greatLeap ? breakout?.band.label : "Helped hold the core together"}</p>
          </div></article>
          <article className="is-negative"><span aria-hidden="true">↘</span><div>
            <small>{toughRegression ? "BIGGEST SETBACK" : "DEVELOPMENT CHECK"}</small>
            <strong>{regression?.player.name ?? "No major setbacks"}</strong>
            <p>{toughRegression ? regression?.band.label : "No notable regression"}</p>
          </div></article>
        </div>
      </section>

      <section className="gm-final__section gm-final__roster surface-card" aria-label="Final roster development outcomes">
        <header className="gm-final__heading"><h2>{opponentResult ? selectedName.toUpperCase() + " · FINAL ROSTER" : "YOUR FINAL ROSTER"}</h2><small>YEAR 1 → YEAR 3</small></header>
        <p className="gm-final__hint">The white tick always marks START in the center. The colored dot shows improvement or decline in five fixed categories. Exact grades stay hidden.</p>
        <div className="gm-final__roster-list">
          {rows.map((row) => {
            const acquisition = retainedIds.has(row.player.id) ? "RETAINED"
              : row.entry.acquired === "trade" ? "TRADE" : "FREE AGENT";
            const tier = scoutingTier(row.band.final);
            return (
              <article className="gm-final__player" key={row.slot}>
                <div className="gm-final__player-identity">
                  <b className="gm-final__position">{footballGmSlotLabel(row.slot)}</b>
                  <PlayerPortrait player={row.player} />
                  <TeamLogo team={row.player.team} />
                  <div className="gm-final__player-name"><strong>{row.player.name}</strong><small>{row.player.team} · {footballGmMoney(row.salary)}</small></div>
                  <span className={"gm-final__acquired" + (acquisition === "RETAINED" ? "" : " is-new")}>{acquisition}</span>
                  <b className={"gm-final__tier is-" + tier.toLowerCase()}>{tier}</b>
                </div>
                <div className="gm-final__player-outcome">
                  <OutcomeBand band={row.band} name={row.player.name} />
                  <span className={"gm-final__outcome-text is-" + row.band.tone}>{row.band.label}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="gm-final__section surface-card" aria-label="Offseason transactions">
        <header className="gm-final__heading"><h2>OFFSEASON MOVES</h2><small>{changes.length} CHANGED · {trades} TRADES · {freeAgents} FA</small></header>
        {changes.length ? <div className="gm-final__transactions">
          {changes.map((row) => <div className="gm-final__transaction" key={row.slot}>
            <b>{footballGmSlotLabel(row.slot)}</b>
            <span><strong>{row.before?.name}</strong><small>→</small><strong>{row.player.name}</strong></span>
            <em>{row.entry.acquired === "trade" ? "TRADE" : "FREE AGENT"}</em>
          </div>)}
        </div> : <p className="gm-final__hint">You kept the entire original roster.</p>}
        <details className="gm-final__disclosure" id="gm-full-roster">
          <summary>VIEW FULL ROSTER EVOLUTION <span>Y1 → Y3</span></summary>
          <div className="gm-final__evolution">
            {rows.map((row) => <div key={row.slot}>
              <b>{footballGmSlotLabel(row.slot)}</b>
              <span><small>YEAR 1</small><strong>{row.before?.name ?? "—"}</strong><small>{row.before ? scoutingTier(row.before.currentGrade) : "—"}</small></span>
              <span aria-hidden="true">→</span>
              <span><small>YEAR 3</small><strong>{row.player.name}</strong><small>{scoutingTier(row.band.final)}</small></span>
            </div>)}
          </div>
        </details>
      </section>

      <div className="gm-final__bottom">
        <section className="gm-final__section surface-card" aria-label="GM score breakdown">
          <header className="gm-final__heading"><h2>GM SCORE BREAKDOWN</h2></header>
          <div className="gm-final__math"><span>Roster (90%)</span><i><b style={{ width: result.rosterManagementScore + "%" }} /></i><strong>{result.rosterManagementScore.toFixed(1)}</strong></div>
          <div className="gm-final__math is-playoff"><span>Playoffs (10%)</span><i><b style={{ width: result.resumeScore + "%" }} /></i><strong>{result.resumeScore.toFixed(1)}</strong></div>
        </section>
        <section className="gm-final__section surface-card" aria-label="Year 3 finances">
          <header className="gm-final__heading"><h2>FINANCIALS · YEAR 3</h2></header>
          <div className="gm-final__money"><span>Payroll</span><strong>{footballGmMoney(payroll)}</strong></div>
          <div className="gm-final__money"><span>Cap remaining</span><strong>{footballGmMoney(FOOTBALL_GM_CAP - payroll)}</strong></div>
        </section>
      </div>
    </div>
  );
}
